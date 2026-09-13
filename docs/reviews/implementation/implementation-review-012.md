# Implementation Review 012

## 1. レビュー対象

- Task: `master` の稼働中挙動に合わせ、一括登録で名前先頭の FFXIV ゲーム用文字を除外する変更の独立 Implementation Review
- 確認日時: 2026-09-13 14:29 JST（Asia/Tokyo）
- Cycle: 012
- Base / HEAD: `7ee2a0a63736c7da57cb0ce8067551766c9303ec`
- 互換性基準 revision: `master` `2ef0a00413b273bfc47374850a95ae8798c2ec63`
- 対象版:
  - `apps/treasure-compass/src/utils/bulkParser.ts`: SHA-256 `c85e328e8e86eb97e3dae2797c1fcab716974f84747661c7cb17a358139d209c`
  - `apps/treasure-compass/tests/unit/bulkParser.test.ts`: SHA-256 `9268b33fb2cd2f313955e4123bba8867bdd18516837b410c8a24a3be6be68550`
  - 対象2ファイルの `git diff` fingerprint: SHA-256 `98c469476cefca9b5de2421ff4a84b832586c2951567b5ec9cca8ca83b3ac8df`
- レビュー範囲: 上記2ファイルの現 working tree 実装・テスト、および名前先頭のゲーム用文字、既存マーカー、通常文字、空名、`parseBulkInput` / `analyzeBulkInput` への影響。
- 除外範囲: 上記以外の未コミット実装・テスト差分、Mob Compass、UI、保存、経路、既存レビュー 008〜011 の再判定。
- 未確認範囲: 実ブラウザからコピーした全チャット種別、FFXIV が将来出力する文字集合、Supplementary Private Use Area。これらは PASS と扱わない。

## 2. 使用した根拠

- ユーザー要求: `master` の稼働中挙動に合わせ、例 `Nicola Verde` を `Nicola Verde` と解析すること。通常文字、既存マーカー、空名、他形式への影響も確認すること。
- `master:src/utils/bulkParser.ts:21-40`: ゲーム用プレフィックス1文字と、その直後の任意の既存マーカー1文字を名前から除外していた旧実装。
- `master:chat_test.txt:1-31`: Private Use Area のゲーム用文字を伴う実データ、およびゲーム用文字相当の先頭文字と `★` が連続する fixture。
- `docs/specification/specification.md` Revision 007 §4.1〜4.2: 前後空白除去、Unicode NFC、非空名、既存マーカーと入力形式の契約。最新のユーザー判断を優先し、FFXIV ゲーム用文字の互換性を追加の判定根拠とした。
- 対象 source / test: 実装適合性と回帰検出力の確認。
- `docs/reviews/implementation/implementation-review-008.md`〜`011.md`: 過去 Finding の識別と対象境界の確認。内容は変更せず、今回の限定差分へ持ち込んでいない。

## 3. レビュー結果

**REVISE IMPLEMENTATION**

例示されたゲーム用文字だけの入力、通常の `★` 入力、`?Question`、空名は意図どおり扱われる。一方、旧実装が受理していたゲーム用文字と既存マーカーの連続、およびゲーム用文字除去後に現れる前置空白では、正規化済みメンバー名が旧挙動と一致しない。IR-010（HIGH / New）のため READY としない。

## 4. 総評

対象実装は BMP Private Use Area `U+E000`〜`U+F8FF` の先頭1文字を共通 helper で除外し、`parseBulkInput` と `analyzeBulkInput` の双方から使用している。`Nicola Verde` は `Nicola Verde`、`?Question` は `?Question`、ゲーム用文字だけの名前は空名として拒否される。既存テスト、lint、全 unit test、build は成功した。

しかし、構文解析が既存マーカーをゲーム用文字より先に分離し、名前正規化が `trim → PUA除去 → NFC` の順である。このため `(★Nicola Verde)` は `★Nicola Verde`、`( Nicola Verde)` は先頭空白付きの名前になる。旧 `master` はプレフィックスの後に任意マーカーを消費し、その後で名前を trim していたため、どちらも `Nicola Verde` となる。追加テストはゲーム用文字単独だけであり、この回帰を検出しない。

## 5. 指摘事項

### IR-010: ゲーム用文字と後続マーカー／空白の組合せが旧解析結果を維持しない

- Severity: **HIGH**
- Status: **New**
- Classification: Implementation defect / Test validation defect
- Location: `apps/treasure-compass/src/utils/bulkParser.ts:27-41,55-69,127-145`、`apps/treasure-compass/tests/unit/bulkParser.test.ts:30-68,99-164`
- 事実:
  - `CHAT_LINE` は開き括弧直後にある場合だけ既存マーカーを別 capture にする。ゲーム用文字が先にある場合、後続の `★` 等は名前 capture に残る。
  - `normalizeMemberName` は先に `trim()` し、その後ゲーム用文字を除外するため、ゲーム用文字の直後にある空白を再度除去しない。
  - 対象式を同じ順序で評価した結果、`(Nicola Verde)` は `Nicola Verde`、`(★Nicola Verde)` は `★Nicola Verde`、`(★Nicola Verde)` は `Nicola Verde`、`(?Question)` は `?Question`、`()` は空名となった。
  - `master` の正規表現はゲーム用プレフィックス1文字の直後に既存マーカーを任意で消費し、残った名前を trim する。`master/chat_test.txt` にもこの二段プレフィックス形を示す fixture がある。
  - 回帰テストはゲーム用文字単独の `parseBulkInput` だけを確認し、ゲーム用文字＋既存マーカー、除去後の空白、および `analyzeBulkInput` の外部結果を確認しない。
- 根拠: 最新ユーザー要求、`master:src/utils/bulkParser.ts:21-40`、`master:chat_test.txt`、Specification §4.1〜4.2。
- 到達条件: FFXIV のゲーム用文字の直後に既存の指定マーカーまたは空白を伴うチャット行を一括入力する。
- 影響: 表示名とメンバー同一性に余分なマーカーまたは空白が残り、同じ利用者が別メンバーとして追加・更新される互換性回帰が起こり得る。最大8人制約や既存メンバー更新にも波及する。
- 最小修正: ゲーム用文字を含む旧来の有効プレフィックスを除外した後、既存マーカー除外、前後空白除去、NFC 正規化、非空判定が一貫して適用され、`parseBulkInput` と `analyzeBulkInput` が同じ正規化済み名を返すこと。通常の未指定先頭文字は除外しないこと。
- 再確認条件: 少なくともゲーム用文字単独、ゲーム用文字＋既存マーカー、既存マーカー＋ゲーム用文字、ゲーム用文字＋空白、通常文字 `?Question`、ゲーム用文字のみの空名について、両解析入口の結果と拒否理由を回帰テストで確認し、標準 validation が成功すること。

## 6. 解消済み指摘

なし。過去レビュー 008〜011 の Finding は今回の限定レビューでは再判定していない。

## 7. 上流へのフィードバック

なし。Specification §4.2 は未指定文字の暗黙除去を禁止するが、最新のユーザー判断が FFXIV ゲーム用文字の互換性を明示したため、今回の実装可否は判定可能である。

## 8. 保留した指摘

- 実ブラウザから取得した全種類の FFXIV ゲーム用文字と将来の文字集合は未確認。今回確認した `master` fixture と BMP Private Use Area の範囲を超える互換性は後続の実環境確認が必要。

## 9. 対象範囲と追跡

| 確認項目 | 根拠 | 結果 |
| --- | --- | --- |
| `Nicola Verde` → `Nicola Verde` | 最新要求、`master` fixture | PASS |
| `parseBulkInput` への適用 | 対象 source / test | PASS |
| `analyzeBulkInput` への適用 | 共通 helper の呼出し | Static PASS / 直接回帰テストなし |
| 既存 `★` 単独 | Specification §4.2、対象 test | PASS |
| ゲーム用文字＋既存マーカー | `master` parser / fixture | FAIL / IR-010 |
| 通常文字 `?Question` | 最新レビュー条件、対象 test | PASS |
| 空名 | Specification §4.2、対象 source / test | PASS |
| 前後空白・NFC | Specification §4.1〜4.2 | PARTIAL / IR-010 |
| 他の未コミット変更 | ユーザー指定 scope | Out of Scope |

## 10. 検証結果

- `pnpm test -- apps/treasure-compass/tests/unit/bulkParser.test.ts`: PASS。ただし現構成では全14 test files / 132 testsを実行した。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（14 files / 132 tests）。
- `pnpm run build`: PASS（Treasure / Mob）。
- `git diff --check`: PASS。
- 対象式の非変更 runtime probe: PASS。単独 PUA、PUA＋marker、marker＋PUA、通常文字、空名の実際の変換結果を確認し、IR-010 を再現した。
- `pnpm exec vite-node` による対象 module の直接 probe: Not validated。`vite-node` が未導入のため実行不能。source、type-aware lint、unit test、build、および対象式 probe で補助確認した。
- 実ブラウザ、実ゲームからのコピー＆ペースト: Not validated。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| User Requirement Conformance | FAIL | IR-010: `master` の有効な二段プレフィックス挙動を維持しない |
| Correctness | FAIL | PUA 除去後に marker / 空白が名前へ残る |
| Compatibility | FAIL | 稼働中 `master` parser と fixture に対する回帰 |
| Safety / Input Boundary | PASS | 通常文字を一律削除せず、空名を成功扱いしない |
| Test / Regression Detection | FAIL | 単独 PUA は確認するが、到達可能な組合せ回帰と `analyzeBulkInput` の外部結果を検出しない |
| Scope Discipline | PASS | 対象変更は parser と unit test に限定され、新規依存はない |
| Build / Static Validation | PASS | lint、132 tests、build、diff check が成功 |

Gate rationale: `master` 互換を要求された入力経路で、メンバー同一性を変え得る HIGH / New の IR-010 があるため **REVISE IMPLEMENTATION**。

## 12. 残存リスクと未決定事項

- FFXIV のゲーム用文字を BMP Private Use Area 全体として扱う実装判断は、今回確認した fixture には適合するが、将来の文字集合までは保証しない。
- 対象版は未コミット working tree のファイル hash で固定した。対象2ファイル以外の多数の未コミット変更は判定へ含めていない。
- IR-010 解消後も、実ブラウザからの貼り付け確認は別途必要である。

## 13. 自動変更

`docs/reviews/implementation/implementation-review-012.md` を新規作成した。レビュー対象コード、テスト、上流資料、既存レビュー 008〜011 は変更していない。コミットしていない。

## 14. 最終判定

**REVISE IMPLEMENTATION**

例示入力の単独ケースは修正済みだが、稼働中 `master` が扱っていたゲーム用文字と既存マーカー／空白の組合せで名前の正規化結果が一致しない。IR-010（HIGH / New）の解消と両解析入口の回帰検証が必要である。
