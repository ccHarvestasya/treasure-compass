# Implementation Review 010

## 1. レビュー対象

- レビューサイクル: `010`
- Task ID: `TC-IMPLEMENT-20260913-SPEC-UPDATE`
- 担当: Sol / medium
- 確認時点: 2026-09-13 Asia/Tokyo
- 対象工程: Implementation / Test の再レビュー
- base commit / reviewed HEAD: `7ee2a0a63736c7da57cb0ce8067551766c9303ec`
- tracked working tree 差分 fingerprint: `4727302400cf1ae50800a551b9848266ac6cbb3b085c95da8903a7502877bef5`。`git diff HEAD | sha256sum` の実測値と一致した。
- 前回レビュー: [Implementation Review 009](implementation-review-009.md)、SHA-256 `149c6259711fdc3f929b587233c0935ee09a37bca9996366f700493b4c80f7de`、Gate `REVISE IMPLEMENTATION`。
- 変更範囲: tracked 21ファイルと、今回の検証に含まれる未追跡テスト `apps/treasure-compass/tests/unit/unresolvedReferences.test.ts`。既存の未追跡 Review 008 / 009 は根拠としてのみ参照した。
- レビュー範囲: cycle 009 の IR-002 / 005 / 006 / 007 / 008、Treasure の外部契約・永続化・失敗境界・route、明示された Mob v1 scope、テスト・build・security 回帰。
- 未確認範囲: ブラウザ実機、320 CSS px の縦横表示、実 localStorage quota / SecurityError、実配備 origin、画像内容・出典・license、Mob master の正確性。未確認範囲を PASS とは扱わない。

## 2. 使用した根拠

- ユーザーの本依頼、`AGENTS.md`。
- `implement-review` Skill、`review-common/review-playbook.md`、両 `output-format.md`、`reviewers.md`、`review-gates.md`、`security-checklist.md`。
- [Specification](../../specification/specification.md) Revision 007、SHA-256 `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46`。
- [Design](../../design/design.md) Revision 007、SHA-256 `8721af6bc53bd542b0792fc3b38df28c4c399cc15205dc49b690280ec3db46b4`。
- Specification Review 013 / Design Review 008 の `READY`、Implementation Review 009 の Finding と再確認条件。
- 現在の Treasure / Mob source、domain、master package、persistence、route、UI、全 unit test、package / build 設定。Author / Manager の報告だけに依存せず直接確認した。

## 3. レビュー結果

**REVISE IMPLEMENTATION**

| Finding | 重大度 | サイクル010状態 | 要約 |
| --- | --- | --- | --- |
| IR-002 | HIGH | Resolved | identity 変更後も stable ref を個別解決し、真の未解決だけを診断・除外 |
| IR-005 | MEDIUM | Resolved | clear / delete / reorder / auto / row play の保存成否が UI まで到達 |
| IR-006 | LOW | Open | migration は依然、現行 state 公開前に legacy cleanup を実行 |
| IR-007 | MEDIUM | Open | start projection は追加されたが tie の保持・表示と code-point 順が未実装 |
| IR-008 | MEDIUM | Open | coverage は拡充したが integrated v1 の `mob` 型を仕様より広く受理 |
| IR-009 | HIGH | New | Mob Compass v1 の利用者機能・状態・永続化が未実装 |

Open / New は HIGH 1件、MEDIUM 2件、LOW 1件。IR-009 が blocking Finding である。

## 4. 総評

IR-002 と IR-005 は解消した。master identity 変更は再照合の契機となり、現 catalog で一致する stable ref は route / current location に維持され、解決不能 registration / currentTarget / mapCurrentLocation だけが理由付きで除外される。保存失敗時も clear dialog と入力を保持し、削除・並べ替え・自動切替・行内再生の失敗が UI へ返る。

一方、IR-006 は helper 名を `publishMigratedSnapshot` に変えただけで、実体は localStorage write であり、store state 公開前に cleanup する順序が変わっていない。IR-007 は map 別開始地点を UI まで渡したが、同率情報を result / state / UI に保持せず、文字列比較も Unicode code point 順ではない。IR-008 の表テストは大幅に増えたものの、統合 v1 の opaque `mob` を object に限定せず任意 JSON 値として受理する実装と期待値になっている。

さらに今回明示された Mob scope を照合すると、Mob app は紹介文を表示するだけであり、承認済み v1 の mode、登録、経路、進捗、地図、保存を提供しない。したがって build が成功しても、Treasure / Mob v1 全体を Specification 適合とは判定できない。

## 5. 指摘事項

### IR-006: migration write / publish / cleanup の順序が未分離

- 重大度 / 状態 / 分類: **LOW / Open / Implementation defect + Test/validation defect**
- 対象箇所: `apps/treasure-compass/src/persistence/storage.ts:494-574`、`apps/treasure-compass/src/store/useAppStore.ts:26-27, 453-458`、`apps/treasure-compass/tests/unit/persistence.test.ts:323-340`
- Evidence / 事実: `publishMigratedSnapshot` は `writePersistedTreasure` を呼ぶだけで、公開 state を置換しない。`completeMigration` はこの write の直後に `removeLegacyRecords` を実行し、その後 `readPersistedTreasure` が snapshot を返して store 初期化が始まる。追加テストも `set:v3` より後に `remove:legacy` が来ることだけを確認し、store publish より後であることを確認しない。
- 根拠: Specification §9.2 と Design §8.4 は、変換後 v3 の write と現行状態としての publish が成功した後だけ cleanup を試みる順序を要求する。
- 影響: write 後・store公開前に初期化が中断した場合、現行状態として公開される前に旧値を失う。関数名によって順序契約を満たしたことにはならない。
- Required action: decode / v3 write、coordinator の state publish、legacy cleanup を lifecycle 上で分け、publish 成功後だけ cleanup する。
- Validation basis / 再確認条件: write 成功後・publish 前中断、publish 成功後 cleanup、cleanup failure の各段階について、旧値、v3 marker、公開 state を別々に観測するテストが PASS すること。

### IR-007: route tie 契約と Unicode code point 順が未実装

- 重大度 / 状態 / 分類: **MEDIUM / Open / Implementation defect + Test/validation defect**
- 対象箇所: `apps/treasure-compass/src/utils/distance.ts:19-65, 100-179`、`apps/treasure-compass/src/store/useAppStore.ts:242-285, 367-386`、`apps/treasure-compass/src/components/SideBar/RouteProgressTab.tsx:56-59, 112-168`、`apps/treasure-compass/tests/unit/distance.test.ts:37-60`
- Evidence / 事実: `startPoint` と `teleportPoint` は自動 route から一覧へ到達し、「開始」として表示されるため、この部分は修正済みである。しかし `ShortestRouteResult` は同率候補の有無を持たず、store / UI に同率表示もない。map ID と stable ID の比較には `localeCompare` を使うため、例えば `Z` と `a` は code point 順と逆になり得る。追加テストは ASCII の `target-a` / `target-z` と開始地点だけで、同率表示や code-point 差を検出しない。開始地点も tie-break 列へ追加されており、仕様が定める訪問地点 tuple 列そのものではない。
- 根拠: Specification §6.2〜6.3、SPC-AC-008〜009 と Design §9.1〜9.2 は、同率候補を保持・表示し、`(正規map識別子, X, Y, 対象stable識別子)` の列を文字列の Unicode code point 順で比較することを要求する。
- 影響: 同距離経路が同率であることを利用者が確認できず、文字種によって採用順が仕様と異なる。開始地点だけの追加では IR-007 全体を解消しない。
- Required action: 同率を route result から presentation まで保持・表示し、仕様 tuple と Unicode code point 順で表示採用経路を決定する。
- Validation basis / 再確認条件: map内・map間の同率 fixture、locale collation と code point 順が異なる stable ID、登録順変更、複数 aetheryte について、同率表示・採用順・開始地点が一致するテストが PASS すること。

### IR-008: integrated v1 の opaque `mob` を object 以外でも受理する

- 重大度 / 状態 / 分類: **MEDIUM / Open / Implementation defect + Test/validation defect**
- 対象箇所: `apps/treasure-compass/src/persistence/storage.ts:459-472`、`apps/treasure-compass/tests/unit/persistence.test.ts:145-310`
- Evidence / 事実: v3 必須 field、v2 state、integrated root、separate keys、世代優先順位の table-driven test は追加され、前回より回帰検出力が上がった。しかし `decodeIntegrated` は `mob` の存在時型を検証せず、テストは `null`、string、number、array を正常移行として期待する。Specification は `mob` を省略または object に限定し、その object 内部だけを opaque とする。また v2 の `{..., masterIdentity, state}` alternative と上位 v2 不正時の下位 fallback 禁止を直接固定するケースもない。
- 根拠: Specification §9.1.1、SPC-AC-014 / 017 と Design §8.4 は世代別 exact root、記載外の型・形状の全体拒否、上位不正時の fallback 禁止を要求する。
- 影響: 型不正な統合保存を有効な Treasure migration として書き換え、旧値を cleanup する。現在のテストがこの仕様外受理を回帰ではなく成功として固定する。
- Required action: `mob` が存在する場合は object であることだけを検証し、内部を移行・コピーしない。残る v2 envelope alternative と fallback 禁止境界を直接検証する。
- Validation basis / 再確認条件: `mob` の省略 / object を受理し、null / scalar / array を境界全体で拒否して旧値を保持すること、および v2 二形状と不正上位候補の下位非採用を table-driven test で確認すること。

### IR-009: Mob Compass v1 の主要外部契約が実装されていない

- 重大度 / 状態 / 分類: **HIGH / New / Implementation defect + Test/validation defect**
- 対象箇所: `apps/mob-compass/src/App.tsx:1-19`、`packages/mob-domain/src/index.ts:1-3`、`packages/mob-domain/tests/mobDomain.test.ts:1-8`、`packages/master-data/package.json:6-12`、`packages/master-data/data/`
- Evidence / 事実: Mob app は「ソロ / パーティ」という文字列を静的表示するだけで、操作可能な mode switch、登録 / 巡回 tab、検索・filter、ソロ / パーティ登録、地図選択、route、手動順序、完了・取消、B Next / 取消 / 再探索、全消去、三 root の保存・復元・失敗表示を持たない。mob-domain は mode 定数だけで、テストもその配列一件だけである。Design が前提とする `mob-master.v1.json` と package export も存在しない。
- 根拠: Specification §1.1、§3、§5〜9、§12 の SPC-AC-001〜002 / 006〜007 / 010〜012 / 017、および Design §3、§4.4、§7.3〜7.5、§8.2、§10.5〜10.8、§11、§14 は Mob v1 の利用者操作、独立状態、保存、検証を実装対象とする。
- 影響: 利用者は Mob Compass の v1 機能を一つも実行できず、ソロ / パーティ状態の独立性や保存失敗境界も成立しない。Mob build PASS は静的 shell が bundle できることしか示さない。
- Required action: 未確認の Mob 値を推測せず Design §16 の data preparation gate を満たした上で、Specification が要求する Mob v1 の操作・状態・永続化・失敗境界と対応テストを実装する。段階リリースとして対象外にするなら、承認済み上流と今回の review scope を正式に分離する必要がある。
- Validation basis / 再確認条件: Mob master の承認済み入力を用い、mode / tab、各登録経路、route / progress、B探索、削除・全消去、三 root 分離、復元・破損・write failure、Treasure 非干渉を仕様の acceptance に沿って検証し、Mob app で操作可能であることを確認する。

## 6. 解消済み指摘

### IR-002: Resolved

- `unresolvedReferences` は catalog に stable tuple が存在すれば identity 差分にかかわらず解決済みとし、`routeInputs` も個別 ref の解決結果だけで対象を作る。
- 新規 `unresolvedReferences.test.ts` は identity 変更後の全 ref 解決、registration、currentTarget、mapCurrentLocation の各未解決を分離して検証する。
- RouteProgressTab は unresolved を通常の完了表示・完了／取消操作から分け、MapCanvas は unresolved currentTarget で別 route / map へ fallback しない。

### IR-005: Resolved

- `clearAllData` は boolean を返し、write failure 時は draft / dialog / undo を保持する。App は失敗時に dialog を閉じず、成功通知を出さない。
- 自動切替と行内再生は単一の成否として扱い、削除・並べ替えは UI が false を識別表示する。
- store test は clear / auto の状態保持と行内再生の一 logical write / failure 非部分適用を確認する。削除・並べ替えの UI は同じ boolean failure wrapper を使うことを直接確認した。

### 過去 Resolved の維持

- IR-001、IR-003、IR-004 は cycle 009 の Resolved を維持する。今回差分に再発を示す変更はない。

## 7. 上流へのフィードバック

なし。IR-006〜IR-009 の期待結果と責務は承認済み Specification / Design で判断できる。Mob の正式 master 値・出典は Design §16 の data preparation 項目であり、Reviewer が補完しない。

## 8. 保留した指摘

- ブラウザ実機の quota / SecurityError、320 CSS px 縦横、orientation change、pointer / touch は後続の実機検証へ引き継ぐ。
- 実配備で Treasure entry が旧保存と同一 origin になることは release configuration で確認する。
- 画像内容・出典・license と Mob master の正確性は未確認であり、値を推測して適合扱いしない。

## 9. 対象範囲と追跡

| 確認対象 | 主な根拠 | 判定 |
| --- | --- | --- |
| IR-002 stable ref / unresolved / fallback | Spec §9.1.1〜9.2、§10.3、Design §8.3 | PASS / Resolved |
| IR-005 UI 保存失敗境界 | Spec §9.3〜9.4、Design §8.1、§8.5、§12 | PASS / Resolved |
| IR-006 migration ordering | Spec §9.2、Design §8.4 | FAIL / Open |
| IR-007 tie / start projection | Spec §6.2〜6.3、Design §9 | PARTIAL / Open。start は適合、tie と code-point 順は不適合 |
| IR-008 exact decoder / priority | Spec §9.1.1〜9.2、Design §8.4 | PARTIAL / Open。表テスト拡充、integrated `mob` 型ほか残存 |
| Treasure 主表示・登録・player・順序・version projection | Spec §3.2〜4.3.1、§7〜9 | PASS（上記 Open Finding を除く） |
| Mob mode・登録・route・progress・保存 | Spec §3、§5〜9、Design §7.3〜7.5、§10.5〜10.8 | FAIL / IR-009。shell と build entry のみ存在 |
| 状態分離・外部通信・HTML/eval・fee/loadTime | Spec §1.2、§3.1、§9〜10、Design §12 | PASS（実装済み Treasure 境界）。新規外部通信・unsafe HTML/eval・fee/loadTime保持なし |
| Mob master / 画像 / license | Design §6、§16 | NOT VALIDATED。未確認値を補完していない |

Review Board 観点では、Reviewer A が外部契約と Mob scope、Reviewer B が入力・localStorage・unsafe execution・失敗境界、Reviewer C が exact snapshot / migration / state separation、Reviewer D が route と120 tests の回帰検出力を確認し、Chair が重複、severity、status、Gate を統合した。

## 10. 検証結果

- 上流 SHA: Specification / Design とも指定値に一致。
- 前回 Review 009 SHA: 指定値に一致。
- tracked 差分 fingerprint: PASS。指定値と一致。未追跡 `unresolvedReferences.test.ts` は fingerprint 外だがレビュー・テスト対象に含めた。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（13 files / 120 tests）。IR-007 / IR-008 / IR-009 の未検出・誤期待条件があるため、契約適合 PASS の代用にはしない。
- `pnpm run build`: PASS（Treasure / Mob）。Mob は静的 shell の build 成功であり、IR-009 の機能適合を示さない。
- `git diff --check`: PASS。
- 依存追加・lockfile変更なし。対象差分に `dangerouslySetInnerHTML`、`eval`、`new Function`、新規外部通信、認証、telemetry を検出しなかった。
- 実ブラウザ、実 origin、画像・license、Mob master の正確性、公開手順: Not validated。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | FAIL | IR-007、IR-008、IR-009 |
| Correctness / State / Data | FAIL | IR-007、IR-008、IR-009 |
| Failure / Resource / Runtime Safety | FAIL | IR-006、Mob failure boundary 未実装の IR-009 |
| Compatibility / Integration | FAIL | IR-006、IR-008、Mob state / master integration 未実装の IR-009 |
| Security / Trust Boundary | PARTIAL | Treasure の入力・保存境界に新規 unsafe 実行なし。IR-008 の不正保存受理と Mob 境界未実装が残る |
| Test / Validation / Regression | FAIL | IR-006〜IR-009 の再確認条件が未充足 |
| Implementation Discipline | PASS | tracked差分は指定範囲内、不要依存・lockfile変更なし。未確認データを推測追加していない |

HIGH の New Finding `IR-009` があるため、最終 Gate は **REVISE IMPLEMENTATION** とする。必須証拠 unavailable による別の blocking review condition はない。

## 12. 残存リスクと未決定事項

- Treasure は IR-006〜IR-008 の限定された永続化・route契約が残る。特に integrated v1 の型不正データは正常 migration として cleanup され得る。
- Mob v1 は未実装であり、Mob master / 出典を未確認のまま補完してはならない。data preparation と機能実装を分けて再確認する必要がある。
- 同一 origin、mobile / browser 実機、画像・license は後続確認を要するが、IR-009 の不在機能を正当化しない。

## 13. 自動変更

本レビューで新規作成したのは `docs/reviews/implementation/implementation-review-010.md` のみ。コード、テスト、設定、データ、README、Specification、Design、既存レビューは変更・上書き・削除・改名していない。commit / push は実施していない。

## 14. 最終判定

**REVISE IMPLEMENTATION**

IR-002 / IR-005 は Resolved。IR-006 / IR-007 / IR-008 は Open、IR-009 は HIGH / New。Mob Compass v1 の主要契約が未実装であるため READY へ進めない。
