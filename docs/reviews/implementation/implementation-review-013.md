# Treasure Compass Implementation Review 013

## 1. レビュー対象

- レビューサイクル: 013
- 確認日: 2026-09-13（Asia/Tokyo）
- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `5c5f568d4f7923fc8a6372e74d22cf47c3cb2f19`
- レビュー方式: Treasure Compass の Implementation / Test 全体レビュー。直前の refactoring commit は責務移管の確認資料として参照したが、Gate は Reviewed HEAD の全 Treasure 実装に対して判定した。
- 対象範囲: `apps/treasure-compass/**`、`packages/treasure-domain/**`、`packages/map-core/**`、`packages/master-data/**` の Treasure / map 関連箇所、および Treasure に関係する root build / lint / test 設定。
- 除外範囲: `apps/mob-compass/**`、`packages/mob-domain/**`、Mob 固有 master / workflow / scaffold、`.agents/**` の品質、上流文書そのもの、README の独立レビュー、release readiness、deployment。
- 未確認範囲: 実ブラウザ・実端末での操作、実配備 origin からの legacy storage 移行、実ゲーム入力、外部の画像出典・利用条件。これらは今回の source / unit test / build による適合性判定を阻害する evidence ではない。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。対象 revision、Treasure 限定範囲、変更禁止範囲および validation を確定した。
- `implement-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`implement-review/reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`。finding 分類、Gate、14章形式および security の適用範囲を適用した。
- [Concept](../../concept/concept.md) と [Concept Review 005](../concept/concept-review-005.md)。Treasure の継続利用、プレイリスト、進行および対象外を確認した。Gate は `READY`。
- [Requirements](../../requirements/requirements.md) と [Requirements Review 011](../requirements/requirements-review-011.md)。Treasure 登録、プレイヤー、保存、経路および受け入れ条件を確認した。Gate は `READY`。
- [Specification](../../specification/specification.md) Revision 007 と [Specification Review 013](../specification/specification-review-013.md)。Treasure の登録、`listSelection` / `currentTarget`、再生、次へ・戻る、保存・移行および failure 契約を判定基準とした。Gate は `READY`。
- [Design](../../design/design.md) Revision 007 と [Design Review 008](../design/design-review-008.md)。Design は Specification Revision 007 を直接の規範根拠とし、Design Review 007 の `READY` を維持している。domain 所有、coordinator transaction、route projection、persistence boundary を判定基準とした。
- Reviewed HEAD の Treasure 実装、Treasure / map 関連 master、unit test、root 設定、ならびに Implementation Review 008〜012。過去 IR-001〜IR-010 の解消状況と refactoring の回帰を補助確認した。

## 3. レビュー結果

**REVISE IMPLEMENTATION**

CRITICAL 0 / HIGH 2 / MEDIUM 1 / LOW 0。New / Open の HIGH finding が 2 件あるため、Gate は `REVISE IMPLEMENTATION` とする。blocking review condition はない。

## 4. 総評

Treasure の v3 exact persistence、legacy migration の write-before-cleanup、unresolved stable reference、route projection、next / back の runtime-only undo、parser、master validation、および build 境界は、対象実装・テスト・再実行 validation で確認した範囲では上流契約と整合している。Mob scaffold は本レビューの finding に含めていない。

一方、Treasure の主操作である「再生」が presentation から発行できず、登録がその欠落を補うために `currentTarget` を暗黙設定している。この二つは Specification が独立状態として定めた登録と player 操作を利用者が区別できない具体的な契約違反である。また、Design が domain operation の所有と定めた registration identity、8枠、地点置換の canonical transition が coordinator store に残っている。

## 5. 指摘事項

### IR-011: 新規登録が `currentTarget` を暗黙設定する

- 分類: Implementation defect
- 重大度: HIGH
- 状態: New / Open
- 対象箇所: `apps/treasure-compass/src/store/useAppStore.ts:298`、`:364`、`packages/treasure-domain/src/index.ts:183-189`
- 根拠: Specification §4.3.1 の新規追加規則（§4.3:170）は、新規追加が `listSelection` と `currentTarget` のいずれも設定しないことを定める。Design §7.2 も新規登録は両参照を設定しないと定める。
- 事実と到達条件: 空の `currentTarget` に対して、`registerManual` と `applyBulkProposal` は `ensureTreasureCurrentTarget` を適用して保存・公開する。新規登録後、利用者が再生を選んでいなくても最初の未完了 registration が現在対象になる。既存 unit test もこの結果を期待している（`apps/treasure-compass/tests/unit/useAppStore.test.ts:161-171`）。
- 影響: 登録と player 操作の外部状態が混同される。利用者は「再生」前に地図・案内の前面表示と「次へ」の対象を得てしまい、保存・復元される `currentTarget` も契約と異なる。
- 最小修正: 新規 registration の成功時に selection / current target を変更しない canonical state を保存・公開し、既存参照を持つ地点更新だけは Specification の参照保持規則を満たすこと。
- 再確認条件: 手動登録・一括登録の新規追加、既存メンバーの同地点／別地点更新、保存失敗、復元を含む回帰 test で、登録だけでは両参照を作らず、再生だけが current target を設定することを確認する。

### IR-012: 利用者が Treasure の「再生」を実行できない

- 分類: Implementation defect
- 重大度: HIGH
- 状態: New / Open
- 対象箇所: `apps/treasure-compass/src/components/SideBar/RouteProgressTab.tsx:45-53,153-160,209`、`apps/treasure-compass/src/components/SideBar/SideBar.tsx:14-51`、`apps/treasure-compass/src/store/useAppStore.ts:389-407`
- 根拠: Specification §4.3.1:151-153 は、リスト選択または先頭未完了を current target にする利用者操作「再生」を必須とする。Design §10.3 および §11.2 は Treasure 主表示から player 操作を command として発行する責務を定める。
- 事実と到達条件: store には `play` / `playRegistration` があるが、Treasure の表示コンポーネントは `selectListItem`、`next`、`back`、個別完了・取消、順序変更だけを取得・発行している。選択項目を再生する control も、選択なしで先頭未完了を再生する control も存在しない。従って利用者は UI から Specification の再生遷移を発行できない。
- 影響: `listSelection` と `currentTarget` を独立させ、任意の選択済み（完了済みを含む）対象を前面表示する中核操作が利用不能である。IR-011 の暗黙 current target が残る場合でも、それは正規の再生操作の代替にならず、削除後・復元後・選択変更後に正しい player flow を提供できない。
- 最小修正: Treasure 主表示に、Specification の再生遷移を発行し、保存失敗時には公開状態を変更しない利用者操作を提供すること。
- 再確認条件: UI または統合レベルの test で、選択済み未完了・選択済み完了・選択なし・空リスト・全件完了・保存失敗の各再生結果と、selection 不変を確認する。

### IR-013: registration の canonical invariant を domain が所有していない

- 分類: Implementation defect
- 重大度: MEDIUM
- 状態: New / Open
- 対象箇所: `apps/treasure-compass/src/store/useAppStore.ts:75-104,272-300,303-379`、`packages/treasure-domain/src/index.ts`
- 根拠: Design §3.1 は `packages/treasure-domain` に registration identity、8枠、地点置換および Treasure 固有規則を所有させ、§3.2 と §7.2 は domain operation が操作前後の invariant と registration transition を所有すると定める。proposal の parse、行診断、曖昧性選択および保存 orchestration は application に残せる。
- 事実と到達条件: store は `allocateRegistrationId`、新規 registration 構築、既存名の地点置換、completed の維持／解除、8枠判定を手動・一括の二経路で直接実装している。`treasure-domain` はこれら registration transition を公開しておらず、domain test もこの canonical transition を検証していない。
- 影響: Design が一か所に固定する registration invariant が application の複数経路へ分散し、手動・一括入力の差異または将来の coordinator 変更が identity、容量、進捗保持を不整合にしても domain boundary で検出できない。これは proposal / diagnostic / save orchestration を store に残すこととは異なる canonical state ownership の不適合である。
- 最小修正: registration identity、capacity、同一地点再登録、別地点置換時の completed / reference 保持に関する canonical transition を Treasure domain operation に集約し、store は proposal と transaction orchestration に限定すること。
- 再確認条件: domain-level test で上記 invariant を手動・一括で共通に適用できる形で確認し、store test では proposal、route、保存成功前 publish 禁止を確認する。

## 6. 解消済み指摘

- IR-001〜IR-008: Resolved を維持。current HEAD で、一括 proposal、unresolved reference、parser、registration ID 衝突回避、保存失敗、migration cleanup、route tie、exact decoder の各修正と回帰 test を確認した。
- IR-010: Resolved。`bulkParser` のゲーム用文字と指定記号の正規化を対象 parser test で確認した。Review 012 の組合せ欠落は current HEAD では再現しない。
- IR-009: Out of Scope。本レビューは Treasure 全体に限定され、Mob の未完成実装を再判定しない。

## 7. 上流へのフィードバック

なし。Specification Revision 007 と Design Revision 007 は、IR-011〜IR-013 を Implementation で判定するために十分な外部契約と ownership を定めている。

## 8. 保留した指摘

なし。実ブラウザ・実端末、実ゲーム貼り付け、実配備 origin の確認は未検証範囲として記録するが、今回の static evidence と validation で判定可能な Treasure Implementation finding には含めない。

## 9. 対象範囲と追跡

| 確認項目 | 根拠 | 結果 |
| --- | --- | --- |
| 手動登録・一括登録・同一性・競合・8枠 | Specification §4.1〜4.2、Design §7.2 | FAIL: IR-011、IR-013 |
| `listSelection` / `currentTarget`・再生・next / back | Specification §4.3〜4.3.1、Design §7.2、§8.1 | FAIL: IR-011、IR-012。next / back の canonical transition、undo runtime-only、save-before-publish は PASS。 |
| 個別完了・取消・削除・並べ替え | Specification §4.3.1、Design §7.2 | PASS（IR-013 の registration ownership は除く） |
| auto / manual route、tie、current location、failure | Specification §6〜7、§10、Design §9 | PASS。料金・ロード時間・`time` は route 評価に使用していない。 |
| unresolved stable reference / master identity | Specification §9.2、§10.2、Design §5.3、§7.2 | PASS。近似・同名・別地点への置換を確認しない。 |
| v3 persistence・restore・migration・clear | Specification §9、Design §8 | PASS。exact validation、marker、write-before-cleanup、cleanup failure、legacy resurrection 防止を確認。 |
| Map / UI、aetheryte、interactive selection | Specification §4.4、§11、Design §10.4、§11 | PASS（IR-012 の再生 control 不在を除く）。 |
| input / DOM / resource / external communication | AGENTS.md、Specification §1.2、§4.2、§10、security checklist | PASS。解析・localStorage・static master の境界を検証し、unsafe HTML / `eval` / 意図しない外部通信を確認しない。 |
| Treasure と Mob の依存分離 | Design §3.1〜3.3 | PASS。Treasure の source / package は Mob domain / app に依存しない。 |

## 10. 検証結果

- `git status --short`（開始時）: PASS。作業ツリーは変更なし。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（13 files / 128 tests）。
- `pnpm run build`: PASS。Treasure / Mob build が成功。Treasure bundle の 500 kB 超過 warning は出力されたが、今回の Treasure 契約違反または build failure ではない。
- `git diff --check`: PASS。
- `git diff --check 17715afe..5c5f568d4f7923fc8a6372e74d22cf47c3cb2f19`: PASS。
- 追加の Treasure 限定 test: `pnpm test` が Treasure domain、Treasure app、map-core、master-data を含む全13 test filesを実行するため、別限定実行は不要。
- 静的 review: domain / coordinator / route / unresolved / persistence / validation / parser / map / UI / master validator / unit test / root configuration を確認した。
- 未検証: 実ブラウザ・実スマートフォン、実ゲーム入力、実配備 origin、実 localStorage の既存データ、画像の外部ライセンス。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | FAIL | IR-011、IR-012、IR-013。登録・再生・domain ownership が Specification / Design に適合しない。 |
| Correctness / State / Data | FAIL | IR-011 が新規登録で保存される current target を誤って変更する。 |
| Failure / Resource / Runtime Safety | PASS | save-before-publish、route failure の操作不採用、undo chain、migration write / cleanup、unresolved reference を確認した。 |
| Compatibility / Integration | PASS | v3 / legacy exact decode、migration priority、marker、master identity、Treasure / Mob 依存分離を確認した。 |
| Security / Trust Boundary | PASS | user input、貼り付け入力、localStorage、static master、DOM injection、ログ、外部通信の適用範囲を確認し、concrete defect はない。 |
| Test / Validation / Regression | FAIL | IR-011 の誤った current target を既存 test が期待し、IR-012 の presentation command 到達性を test が検出しない。 |
| Implementation Discipline | FAIL | IR-013。Design が domain に割り当てた registration canonical transition が coordinator に残る。 |

Gate rationale: New / Open の HIGH finding である IR-011 と IR-012 があるため、blocking review condition の有無にかかわらず **REVISE IMPLEMENTATION**。

## 12. 残存リスクと未決定事項

- IR-011 と IR-012 の組合せにより、現在の UI は暗黙 current target に依存して巡回を開始しており、Specification の登録／再生分離を満たさない。
- IR-013 解消後も、proposal と canonical transition の boundary を回帰 test で維持する必要がある。
- 実ブラウザ・実端末・実ゲーム貼り付け・実配備 origin は未検証である。これらは本 Gate の blocking condition ではないが、公開前の別工程で確認が必要である。

## 13. 自動変更

`docs/reviews/implementation/implementation-review-013.md` を新規作成した。Implementation、Test、Specification、Design、Requirements、Concept、master data、設定、既存レビューは変更していない。commit / push は実施していない。

## 14. 最終判定

**REVISE IMPLEMENTATION**

CRITICAL 0 / HIGH 2 / MEDIUM 1 / LOW 0。IR-011 と IR-012 を解消し、IR-013 の domain ownership を Design に適合させて再検証する必要がある。
