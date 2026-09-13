# Implementation Review 011

## 1. レビュー対象

- Task: Treasure Compass / Mob Compass Implementation Review cycle 011
- 担当: Sol / medium
- 確認日時: 2026-09-13 12:49 JST（Asia/Tokyo）
- Base / HEAD: `7ee2a0a63736c7da57cb0ce8067551766c9303ec`
- 指定 fingerprint: `cdcf5988ae7a25638be8eaa5d5d44870fd0d21d99f4d50250c4e60b7289b48`
- 確認した現 working tree の `git diff HEAD | sha256sum`: `cdcf5988ae7a25638be8eaa5a5d5d44870fd0d21d99f4d50250c4e60b7289b48`
- Cycle: 011。前回 cycle 010 の IR-006〜IR-009 を再確認した。
- レビュー範囲: HEAD からの tracked 実装・テスト差分 25 ファイル、未追跡の実装・テスト 4 ファイル、関連 package/build 設定、Specification / Design、前回レビュー。
- 対象の未追跡実装・テスト: `apps/mob-compass/src/mobCatalog.ts`、`apps/mob-compass/src/mobCoordinator.ts`、`apps/mob-compass/tests/unit/mobCoordinator.test.ts`、`apps/treasure-compass/tests/unit/unresolvedReferences.test.ts`。
- 除外範囲: 既存レビュー 008〜010、Specification、Design、README、画像、license、正式 Mob master の内容は変更対象外。Reviewer はこれらを変更していない。
- 未確認範囲: 実ブラウザ、実 localStorage quota / SecurityError、実配備 same-origin、320 CSS px の縦横表示、画像内容・出典・license、正式 Mob master の値・網羅性・出典。いずれも PASS と扱わない。
- 対象同一性注意: 指定 fingerprint と実測値が一致しない。また指定コマンドの fingerprint は未追跡の Mob coordinator/catalog/test 等を含まない。本レビューは上記の実測時点の現 working tree を直接確認した結果であり、指定 fingerprint の版に対する同一性は成立していない。

## 2. 使用した根拠

- `docs/specification/specification.md` Revision 007、SHA-256 `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46`: 外部契約、Mob 登録・経路・進行・保存、Treasure migration/tie の判定根拠。
- `docs/design/design.md` Revision 007、SHA-256 `8721af6bc53bd542b0792fc3b38df28c4c399cc15205dc49b690280ec3db46b4`: coordinator、三 root、write-before-publish、master reconcile、route planner、Map UI の設計根拠。
- `docs/reviews/implementation/implementation-review-010.md`、実測 SHA-256 `ee551b590c2231628b5da06b52a8b6adb0b96aa998d1432f418865e0490e7512`: IR-006〜IR-009 の前回状態と再確認条件。
- 現在の Treasure / Mob source、domain、persistence、UI、unit test、package manifest および build 設定: Author の報告だけに依存せず直接照合した。
- `.agents/skills/implement-review/SKILL.md` と指定された review-common playbook、reviewers、review gates、output format、security checklist: レビュー手順、分類、Gate 判定に使用した。

## 3. レビュー結果

**REVISE IMPLEMENTATION**

IR-006、IR-007、IR-008 は Resolved。IR-009 は主要 UI が追加された点では前進したが、正式データを入れても Specification の経路、地点選択、進行、復元を成立させないため HIGH / Open のままである。加えて、指定 fingerprint と実測 fingerprint の不一致、および fingerprint が未追跡対象を識別しないことは blocking review condition である。

## 4. 総評

Treasure の migration は v3 write、store state の生成・公開、legacy cleanup が callback 境界で分離された。route は Unicode code point 順の stable tuple、開始地点、tie 情報を result から UI まで保持する。v2 二 envelope、統合 v1 の `mob` object 制約、世代優先順位と fallback 禁止の decoder test も追加され、IR-006〜IR-008 の再確認条件を満たした。

Mob は mode、登録/巡回 tab、検索/filter、ソロ/パーティ root、mode preference、write-before-publish、完了/取消、B 操作、削除/全消去の UI と domain 境界を新設した。root key は Treasure と分離され、保存失敗時に coordinator state を publish しない点も確認できた。

しかし Mob の `auto` は最短経路計算ではなく map ID / X / Y の単純ソートである。一般モブ候補は経路全体と同時評価せず最小 X/Y を選び、保存済み現在地点を route 起点に使わず、tie も常に一候補だけである。完了は到達地点を現在地点に保存せず、手動順序の完了取消は元位置を復元できない。B Next の一段取消状態は保存 root から欠落し、master identity 変更時の個別 reconcile もない。UI の「地図」とパーティ地点選択は map/marker/pan/zoom を持たないテキスト一覧である。さらに実配布 catalog は `mobs: []` のため登録操作を実行できない。これらは build 成功では補えない。

## 5. 指摘事項

### IR-009: Mob Compass v1 の主要外部契約が部分実装のまま成立しない

- Severity: **HIGH**
- Status: **Open**
- Classification: Implementation defect
- Location: `packages/mob-domain/src/index.ts:161-212,267-302,324-371,412-431,457-504`、`apps/mob-compass/src/App.tsx:78-127`、`apps/mob-compass/src/mobCatalog.ts:7-31`、`apps/mob-compass/src/mobCoordinator.ts:63-78,88-99,134-175`、`packages/mob-domain/tests/mobDomain.test.ts:31-67`、`apps/mob-compass/tests/unit/mobCoordinator.test.ts:36-78`
- Evidence / 事実:
  - `buildTarget` は一般モブ候補を X/Y/ID ソートの先頭で固定する。`syncVisitOrder` と `calculateMobRoute` の auto は map ID / X / Y / ID ソートであり、マップ内の候補選択・開始地点・訪問順を一体で最短化しない。`mapCurrentLocations` は route 計算に参照されず、複数マップ、同率全体経路、一般モブ複数候補を評価しない。`tieCandidates` は成功時に常に採用順一件だけである。
  - `completeMobTarget` は対象を route から除くだけで、完了地点を map current location に保存しない。手動順序では訪問位置を捨て、`cancelMobTarget` が missing visit を末尾へ追加するため完了前位置を復元しない。完了直前 snapshot も保持しない。
  - B Next の `nextUndo` は runtime session にだけ存在し、`encodePersistedMobSession` の state に含まれない。さらに `withRevision` が publish ごとに `nextUndo: null` とするため、coordinator 経由で成功した B Next の直後でも取消権が失われる。UI は全 B 対象行に同じ引数なし `B Next` を表示し、選んだ行ではなく current visit または最初の B visit を進める。
  - Mob root の decode は構造検証後に保存 `masterIdentity` と現在 catalog を比較・個別再解決せず、そのまま復元する。次の成功操作では既存参照を reconcile しないまま identity だけ現 catalog 値へ置換する。unresolved visit が一件あると有効 visit を除外して継続するのではなく route 全体を failure にする。
  - 通常の「地図」は map selector とエーテライト文字列一覧、パーティ地点 dialog は座標付き button 一覧であり、共通 Map UI、地図、候補 marker の click/tap、pan/zoom、route/current/completion projection を提供しない。
  - 配布 catalog は正式 Mob master 不在を明示して `mobs: []` とするため、現アプリでは検索候補も登録可能対象も常にゼロである。未承認値を発明していない判断自体は正しいが、Mob v1 の操作可能性は未達である。
  - 追加 test は三 root 分離と基本 write failure、検索、単純 sort、B domain operation、exact envelope の一部を確認する。一方、最短経路、一般候補同時選択、current-location 起点、複数 aetheryte/map、tie、手動追加/完了取消位置、B Next の coordinator 経由取消と再訪復元、master identity reconcile、Map UI を確認しない。auto test は仕様外の map/座標ソートを期待値として固定している。
- Upstream basis: Specification §5.2〜5.3、§6.1〜6.4、§7.1〜7.3、§8.1〜8.3、§9.1〜9.3、Design §8.2、§9.1〜9.3、§10.5〜10.8、§11.1。
- 影響: 正式 master を後から接続しても、利用者へ誤った巡回順・候補地点・開始地点を提示し、完了/取消/B操作で現在地点・順序・取消権を失う。master 更新後の保存状態を誤って現行 identity として再保存し得る。パーティ地点選択と地図案内は仕様上の操作にならず、現在の配布物では Mob 対象を一件も登録できない。
- Required action / 最小修正: 承認済み Mob master は推測せず data-preparation 境界で供給する。その上で、Mob visit/candidate/current-location を入力に仕様 §6 の完全な最適経路と tie を計算し、手動追加・完了/取消・B Next/取消を仕様どおり snapshot と位置を含めて保存・復元する。master identity 差分を個別 reconcile し、unresolved だけを理由付きで正常 route から除外する。パーティ登録と通常表示を検証済み共通 map projection と候補 marker を用いる操作可能な Map UI に接続する。各状態変更は route 計算成功後の一 snapshot write 成功時だけ publish する。
- Validation basis / 再確認条件: 正式に承認された fixture または master を用い、ソロ一般/B、パーティ A/S/SS、複数候補・複数 map・複数 aetheryte・同率、auto/manual、current location、完了/取消、B Next/取消/再探索、master revision 差分、破損 root、全操作の write failure、再読み込み、三 root 非干渉を contract test と UI test で確認する。実アプリで map marker の click/tap による登録と route/current/completion 表示を確認する。

## 6. 解消済み指摘

### IR-006: migration write / publish / cleanup 順

- Severity: LOW
- Status: **Resolved**
- Evidence: `readPersistedTreasure` は migration write 成功後に snapshot と一回限りの `cleanupLegacy` callback を返し、旧 key をその場で削除しない。Zustand store の `create()` が復元 state を生成した後に callback を実行する。write failure では callback を返さず、cleanup failure 後も v3 marker が次回優先される。
- Validation basis: persistence test の write failure、cleanup failure、legacy resurrection 防止を確認し、`pnpm test` で PASS。

### IR-007: stable tie tuple と map 別 start projection

- Severity: MEDIUM
- Status: **Resolved**
- Evidence: Treasure route comparator は NFC 後の Unicode code point、数値 X/Y、stable target ID の tuple を用い、同率候補と map ごとの `startPoint` を route result/store projection に保持する。RouteProgress UI は同率の存在、候補順、開始地点を表示する。
- Validation basis: BMP private-use と supplementary code point の順序、同率候補、複数 aetheryte の開始地点、store/UI projection の test を確認し、`pnpm test` で PASS。

### IR-008: 世代別 exact decoder coverage

- Severity: MEDIUM
- Status: **Resolved**
- Evidence: v2 は三 field形と valid `masterIdentity` を持つ四 field形を区別し、統合 v1 の `mob` は省略または object のみを受理する。null/scalar/array、余分 field、不正な上位世代を拒否し、旧値を保持して下位候補へ fallback しない test が追加された。
- Validation basis: `apps/treasure-compass/tests/unit/persistence.test.ts` の table/priority/fallback/cleanup cases を直接確認し、`pnpm test` で PASS。

## 7. 上流へのフィードバック

なし。Mob master の具体値・画像・出典・license は Design §16 が明示する data-preparation 項目であり、Reviewer が補完する Specification / Design gap ではない。IR-009 の経路・状態・UI 欠陥は、既存の承認済み契約だけで判定できる。

## 8. 保留した指摘

- 実ブラウザにおける pointer/touch、focus、再読み込み、実 localStorage quota / SecurityError は後続の browser/integration validation が必要。
- 320 CSS px の縦横表示と操作可能性は実 viewport で未確認。
- 実配備が legacy Treasure と同一 origin かは deployment 設定で未確認。異なる origin で互換を主張できない。
- 画像内容・出典・license、正式 Mob master の値・出典・網羅性は未確認であり、PASS としない。

## 9. 対象範囲と追跡

| 対象 | 上流根拠 | 結果 |
| --- | --- | --- |
| IR-006 migration lifecycle | Spec §9.2、Design §8.3〜8.5 | PASS / Resolved |
| IR-007 Treasure tie/start | Spec §6.2〜6.3、Design §9 | PASS / Resolved |
| IR-008 exact legacy decode/priority | Spec §9.1.1〜9.2、Design §8.4 | PASS / Resolved |
| Mob mode/tab/search/filter | Spec §3、§5.1、Design §7.3、§10.5 | PARTIAL。UI/domain と独立 root は存在するが配布 master が空 |
| Mob registration/map | Spec §5.2〜5.3、Design §10.5〜10.6、§11 | FAIL / IR-009 |
| Mob route/tie/start/current location | Spec §6、Design §9 | FAIL / IR-009 |
| Mob manual/progress/B/cancel | Spec §7〜8、Design §10.7〜10.8 | FAIL / IR-009 |
| Mob roots/restore/write failure | Spec §9、Design §8.2〜8.5 | PARTIAL。key 分離と write-before-publish は適合、undo/reconcile は不適合 |
| Treasure 非干渉 | Spec §3、Design §7.2〜7.4 | Static/unit 範囲で PASS。Mob code は Treasure key を参照せず、solo/party key を分離 |
| JSON/input/HTML/eval/security | Spec §5、§9、Design §5、§8、security checklist | PARTIAL。React text rendering、exact envelope、外部送信/eval/HTML 注入なし。Mob semantic reconcile は IR-009 |
| Mob master/画像/license | Design §6、§16 | NOT VALIDATED。未確認値を補完していない |
| 対象版 identity | ユーザー指定 fingerprint | FAIL。指定値と実測値が不一致、未追跡対象も hash 外 |

Review Board 観点では、外部契約/UI、trust boundary、state/persistence、route/test の各観点を分離して確認し、Chair 相当で IR-009 の重複原因を統合した。

## 10. 検証結果

- `sha256sum docs/specification/specification.md`: PASS。指定 SHA と一致。
- `sha256sum docs/design/design.md`: PASS。指定 SHA と一致。
- `sha256sum docs/reviews/implementation/implementation-review-010.md`: `ee551b590c2231628b5da06b52a8b6adb0b96aa998d1432f418865e0490e7512`。
- `git rev-parse HEAD`: PASS。指定 base commit と一致。
- `git diff HEAD | sha256sum`: **FAIL**。指定 `...eaa5d5...` に対し実測は `...eaa5a5...`。また未追跡対象はこの hash に含まれない。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（14 files / 131 tests）。IR-009 の未テスト契約を満たす証拠にはならない。
- `pnpm run build`: PASS（Treasure / Mob）。Mob の機能適合や正式 master の存在を示さない。
- `git diff --check`: PASS。
- 実ブラウザ、quota、same-origin deployment、320 CSS px、画像/license、正式 Mob master: Not validated。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Specification / Design Conformance | FAIL | IR-009: Mob の登録Map UI、経路、進行、保存契約が不適合 |
| Correctness / State / Data | FAIL | IR-009: 単純 sort、候補固定、current location/取消/reconcile 欠落 |
| Failure / Resource / Runtime Safety | PARTIAL | write-before-publish と root 単位初期化は確認。route failure と unresolved の扱いは不適合 |
| Security / Trust Boundary | PARTIAL | unsafe HTML/eval/外部送信なし。JSON exact envelope はあるが master semantic reconcile が不足 |
| Compatibility / Integration | FAIL | Mob master revision 復元と共通 Map UI が未成立。対象 fingerprint も不一致 |
| Dependency / Build / Generated Artifact | PASS | 不要な外部依存追加を認めず、両 app build PASS |
| Test / Regression Detection | FAIL | 131 tests は PASS だが Mob の主要 acceptance を覆わず、仕様外 auto sort を固定 |
| Scope Discipline | PASS | 未承認 Mob 値・画像・license を発明していない。Reviewer の変更は本レビュー新規作成のみ |

Gate rationale: HIGH / Open の IR-009 があり、かつ対象 fingerprint の不一致が blocking review condition であるため **REVISE IMPLEMENTATION**。

## 12. 残存リスクと未決定事項

- Mob の production catalog は空であり、正式 Mob master が供給されるまで実利用の入力・表示・性能を検証できない。
- 未追跡の coordinator/catalog/test が `git diff HEAD` fingerprint に含まれないため、再レビュー対象を一つの hash で再現できない。次回は tracked/untracked を含む対象 manifest または同一 commit で版を固定する必要がある。
- Treasure tie 表示は同率候補を UI に列挙するが、多数候補時の実ブラウザ表示・性能は未確認。
- same-origin、quota、mobile、画像/license は後続確認事項であり、今回の PASS を意味しない。

## 13. 自動変更

`docs/reviews/implementation/implementation-review-011.md` を新規作成した。コード、テスト、設定、データ、README、上流文書、既存レビューは変更・削除・改名していない。コミットしていない。

## 14. 最終判定

**REVISE IMPLEMENTATION**

IR-006 / IR-007 / IR-008 は Resolved。IR-009 は HIGH / Open。Mob v1 は独立 root と基本 UI を得たが、正式 master 接続前の domain fixture 上でも経路、地点選択、現在地点、取消、master reconcile が承認済み Specification / Design に適合しない。対象 fingerprint も指定値と一致しないため、この版を READY と判定しない。
