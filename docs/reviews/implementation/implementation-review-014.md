# Treasure Compass Implementation Review 014

## 1. レビュー対象

- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `a22cf7b541593826e4bddddc2f2909fdf12edd94`
- レビュー方式: 現在の承認済み Requirements Revision 012、Specification Revision 008、Design Revision 008 に対する Treasure Compass の Implementation / Test 全体レビュー。Implementation Review 013 の Finding は履歴資料としてのみ参照し、ゼロベースで判定した。
- 対象範囲: `apps/treasure-compass/**`、`packages/treasure-domain/**`、`packages/map-core/**`、Treasure が使用する map / master-data / persistence / migration / parser / test、および Treasure に関係する root build・lint・test 設定。
- 除外範囲: Mob 実装の完成度・未実装部分・将来 Mob feature、Skill 品質、上流文書の文章レビュー、README の独立レビュー、deployment / release readiness、performance optimization、cosmetic cleanup、無関係な dependency 更新。
- 未確認範囲: 実ブラウザ・実端末、実配備 origin での legacy storage、実ゲーム入力、実画像の外部ライセンス。source、unit test、build で確認可能な今回の Finding の到達性と Gate 判定を妨げる evidence 不足はない。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。対象 HEAD、Treasure 限定範囲、変更禁止事項、validation を確定した。
- `implement-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、implement-review の reviewers、review-gates、output-format、security-checklist。Finding、severity、Gate、14章形式、security / trust boundary を適用した。
- [Requirements](../../requirements/requirements.md) Revision 012、[Requirements Review 012](../requirements/requirements-review-012.md)（`READY`）。Treasure の連続した登録・巡回、同格の手動／一括登録、320 CSS px、進行、保存を確認した。
- [Specification](../../specification/specification.md) Revision 008、[Specification Review 014](../specification/specification-review-014.md)（`READY`）。登録後の current target、selection の独立、parser、aetheryte layout、route、v3、migration、failure contract を直接照合した。
- [Design](../../design/design.md) Revision 008、[Design Review 009](../design/design-review-009.md)（`READY`）。Domain / coordinator / adapter の責務、write-before-publish、runtime-only undo、unresolved reference、trust boundary を照合した。
- [Implementation Review 013](implementation-review-013.md)。IR-011〜IR-013 の旧根拠と、Revision 008 による扱いの変更を履歴として確認した。
- Reviewed HEAD の source、unit test、master data、workspace configuration、実行 validation。下流の存在だけから上流要求を生成していない。

## 3. レビュー結果

**REVISE IMPLEMENTATION**

CRITICAL 0 / HIGH 1 / MEDIUM 2 / LOW 0。`IR-014` は幅 640 CSS px 未満で一括入力の入口を失わせ、承認済みの同格登録経路と 320 CSS px 対応を満たさない HIGH Finding である。`IR-015` と `IR-016` は parser とエーテライト表示の明示的な契約との差異である。

## 4. 総評

Treasure の registration workflow は、current target 未設定時だけ先頭未完了を確立し、listSelection を変更しない。既存 target は登録・更新だけで置換されず、手動／一括で member identity、capacity、同地点／別地点更新、completion、save failure を同じ意味で扱う。旧 IR-011 は現在の外部契約に適合しており、旧 IR-012 の独立 Play control は現在の主操作要件ではなく、旧 IR-013 の coordinator workflow 配置も Design Revision 008 に適合する。

Domain は browser / Zustand / storage に依存せず、canonical playlist、selection、current target、completion、next、remove、move、reorder、point reference の pure transition を保持する。Coordinator は route projection、v3 validation / write、publish、migration cleanup、runtime-only undo を調停し、route / save failure は working state を公開しない。v3 exact validation、legacy priority、unresolved stable reference、master validation、T-only aetheryte、R exclusion、Z 非使用、Treasure / Mob domain の非依存も確認した。

一方、320 CSS px を含む responsive contract で一括入力を開く control が非表示になる。さらに parser は許可されない先頭文字と二つ目以降の指定記号を削除し、aetheryte label layout は Specification の 4 CSS px / `8n + 16` px ではなく 22 CSS px / `8n + 24` px を実装・テストしている。いずれもテストが通過しているが、現行上流契約に対する証拠にはならない。

## 5. 指摘事項

### IR-014: 狭い viewport で一括入力の登録入口に到達できない

- 分類: Implementation defect
- 重大度: HIGH
- 状態: New / Open
- 対象箇所: `apps/treasure-compass/src/components/SideBar/SideBar.tsx:26-28`
- 上流根拠: Requirements §1 の手動登録とチャット一括入力を同格の登録経路とする要求、Requirements `REQ-Q-001`、Specification §3.2 / §4.2、Design §§1.2、11.1〜11.2。

**確認した事実と到達条件**

`一括入力` button は `hidden ... sm:inline-flex` であり、Tailwind の `sm` breakpoint 未満では表示されない。`SideBar` に同 dialog を開く別の control はなく、通常の 320〜639 CSS px viewport では手動登録とクリアだけが登録入口として到達可能である。

**影響**

スマートフォンを含む要求された画面幅で、正式な一括入力経路を利用できない。これは見た目の選好ではなく、手動入力と同格であるべき Treasure の登録能力を失わせるため、貼り付けチャットを利用する利用者は登録できない。

**必要な最小修正**

320 CSS px 以上を含む対象 viewport で、一括入力 dialog を開く利用者操作を提供し、手動登録と一括入力を主表示から到達可能な同格の入口として維持する。

**再確認条件**

320 CSS px と desktop viewport の UI / interaction test で、いずれも一括入力を開け、解決済み行の部分適用と保存失敗後の再試行を行えることを確認する。

### IR-015: 一括 parser が指定外の先頭文字を member identity から削除する

- 分類: Implementation defect / Test defect
- 重大度: MEDIUM
- 状態: New / Open
- 対象箇所: `apps/treasure-compass/src/utils/bulkParser.ts:28,39-44`、`apps/treasure-compass/tests/unit/bulkParser.test.ts:39-45`
- 上流根拠: Specification §4.2 の指定記号は列挙された一文字だけを除外し、指定記号以外の先頭文字を暗黙に除去しない契約。

**確認した事実と到達条件**

`normalizeMemberName` は、列挙された指定記号ではない private-use-area 先頭文字を削除し、さらに match 後に残る指定記号を一つ以上まとめて削除する。例えば `(<private-use>★Alice)` は `Alice` として扱われ、二つ目以降の指定記号も member name から失われる。unit test はこの削除を正常系として期待している。

**影響**

Specification が保持を要求する文字を削った name で一人一 Treasure 判定、既存 member 更新、conflict 判定が行われる。該当する貼り付け行は別 member と区別できず、既存 registration の誤更新または conflict の誤判定を起こし得る。

**必要な最小修正**

括弧直後の列挙済み指定記号一文字だけを除外し、それ以外の文字と二つ目以降の文字を member name として NFC 正規化後も保持する。上流契約の境界例を検証する regression test も更新する。

**再確認条件**

指定記号なし・一文字・指定外先頭文字・連続指定記号の各行で、Specification の member name と登録／conflict 結果になることを parser と bulk apply の test で確認する。

### IR-016: エーテライト町名ラベルが指定された矩形と 4 CSS px 配置規則を実装していない

- 分類: Implementation defect / Test defect
- 重大度: MEDIUM
- 状態: New / Open
- 対象箇所: `apps/treasure-compass/src/utils/aetheryteLayout.ts:64,84-85,126-136`、`apps/treasure-compass/tests/unit/aetheryteLayout.test.ts:12-35`
- 上流根拠: Specification §4.4、`SPC-AC-023`、Design §§10.4、11.1。NFC 後の幅 `8n + 16` CSS px、高さ 24 CSS px、anchor から 4 CSS px の 8方向候補を定める。

**確認した事実と到達条件**

実装は label width を `8n + 24`、候補間隔を `LABEL_GAP = 22` とし、N / NE / E 等の全矩形をその値で生成する。unit test も一文字の幅 32 px と 22 px 間隔による座標を期待しており、Specification の幅 24 px、4 px 間隔を検出しない。

**影響**

正常・地点選択の双方で label の位置、表示領域内判定、重なり判定、最大8件時の採否と同率結果が規定された表示結果と異なる。アイコンを固定しラベルを非操作にする性質は保持するが、明示的な案内表示契約には適合しない。

**必要な最小修正**

NFC code point 数から定める label rectangle と、4 CSS px の8方向候補を Specification の式・位置表どおりに実装し、同じ入力で通常表示と地点選択表示が同じ結果を返す test を修正する。

**再確認条件**

一文字・結合文字・境界・過密 viewport・同率の fixture で、幅、高さ、各方向座標、重なり、最大8件、安定 ID / 候補順が §4.4 と SPC-AC-023 に一致することを確認する。

## 6. 解消済み指摘

- IR-011: Reopened しない。`registerManual` / `applyBulkProposal` は計算後の canonical state に `ensureTreasureCurrentTarget` を適用し、target が既にあれば維持し、selection を設定しない。現在の Specification §4.3.1 / Design §7.2 に適合する。
- IR-012: Reopened しない。`RouteProgressTab` に独立 Play control はないが、現在の Specification / Design はそれを Treasure 主操作として必須にしていない。内部 `play` / `playRegistration` は主 UI から通常巡回開始を妨げず、Play button 不在だけでは不適合にならない。
- IR-013: Reopened しない。registration ID allocation、existing member lookup、capacity、proposal integration、route、persistence、publish は coordinator にあり、canonical session / player / playlist / point identity の pure rule は `treasure-domain` にある。Design Revision 008 の許容された ownership に適合する。
- IR-001〜IR-010: 現行根拠と Reviewed HEAD を確認した範囲で、過去の解消済み状態を再オープンする concrete evidence はない。

## 7. 上流へのフィードバック

なし。IR-014〜IR-016 は、Requirements / Specification / Design が明確に定める現在の外部結果・画面幅・入力解釈・label geometry に対する Implementation / Test の欠陥である。

## 8. 保留した指摘

なし。実ブラウザ・実端末、実配備 origin、実ゲーム貼り付け、画像ライセンスは未確認範囲として記録するが、今回の source、test、validation による判定を妨げる blocking review condition ではない。

## 9. 対象範囲と追跡

| 確認項目 | 根拠 | 結果 |
| --- | --- | --- |
| registration / current target 自動確立 | Specification §§4.1〜4.3.1、Design §§7.2、8.1 | PASS。登録成功時だけ未設定 target を確立し、既存 target と selection を維持する。 |
| selection / current target の独立 | Specification §§2、4.3.1、9.1〜9.2、Design §7.2 | PASS。selection command、next / back、保存 / 復元を別参照で扱う。 |
| manual / bulk registration | Specification §§4.1〜4.2、Design §§3.2、7.2、10.2 | PASS。normalized identity、8枠、更新、same / different point、completion、save-before-publish を同じ結果で扱う。 |
| Domain / coordinator responsibility | Design §§3.1〜3.2、7.2、8.1 | PASS。pure canonical transition を domain、workflow / transaction を coordinator が所有する。 |
| next / back / undo | Specification §4.3.1、§9.1〜9.3、Design §§7.2、8.1、10.3 | PASS。no-op、playlist wrap、map location、manual / auto、runtime-only frame、back 後 next を確認した。 |
| complete / cancel / remove / reorder | Specification §§4.3.1、6〜7、Design §§7.2、8.1、9.3 | PASS。reference、completion、manual order、route projection、write failure boundaryを確認した。 |
| route / atomicity | Specification §§6〜7、9.3、Design §§8.1、9、12 | PASS。domain は route planner に依存せず、route / save failure は publish しない。 |
| v3 / migration / unresolved | Specification §9、Design §§5.3、8、12 | PASS。exact decoder、priority、marker、cleanup、stable reference、fallback禁止を確認した。 |
| bulk parser | Specification §4.2、Design §12 | FAIL。`IR-015`。 |
| master / map / aetheryte | Specification §§4.4、10、Design §§4〜5、10.4 | FAIL。T-only / R exclusion / stable projection は PASS、label geometry は `IR-016`。 |
| responsive registration UI | Requirements `REQ-Q-001`、Specification §3.2、Design §11 | FAIL。`IR-014`。 |
| Treasure / Mob separation | Design §§3.1〜3.3 | PASS。Treasure app / domain は mob package に依存しない。 |
| security / trust boundary | AGENTS.md、Specification §§1.2、4.2、9、Design §§5、8、12 | PASS。user input、localStorage、master は検証され、unsafe HTML / `eval` / dynamic script /不要な外部通信 / input logging を確認しない。 |

## 10. 検証結果

| 検証 | 結果 | 備考 |
| --- | --- | --- |
| `git status --short`（開始時） | PASS | 作業ツリーは clean だった。 |
| `git diff --check`（artifact 作成前） | PASS | whitespace error はなかった。 |
| `pnpm lint` | PASS | `oxlint --type-aware --type-check .`。 |
| `pnpm test` | PASS | 13 files / 128 tests。IR-015 / IR-016 の現行 test は契約と異なる挙動を期待するため、これらを検出しない。 |
| `pnpm run build` | PASS | Treasure / Mob build が成功。Treasure bundle の 500 kB 超過 warning は出たが、今回の contract failure ではない。 |
| 静的 Implementation / Test review | PASS WITH FINDINGS | coordinator、domain、route、persistence、migration、unresolved、parser、master、Map UI、UI reachability、dependency を確認した。 |

未検証: 実ブラウザ・実スマートフォン・実ゲーム貼り付け・実配備 origin・実 localStorage 既存データ・外部画像ライセンス。これらは今回の Finding とは別の後続確認事項である。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | FAIL | IR-014〜IR-016。responsive entry、parser、aetheryte layout が明示的な上流契約に適合しない。 |
| Correctness / State / Data | FAIL | IR-015 が pasted member identity を変更し、IR-016 が規定の label geometry を変更する。 |
| Failure / Resource / Runtime Safety | PASS | write-before-publish、route failure、save failure、undo、migration cleanup、unresolved reference を確認した。 |
| Compatibility / Integration | PASS | v3 / legacy migration priority、exact validation、master identity、Treasure / Mob dependency を確認した。 |
| Security / Trust Boundary | PASS | input、storage、static JSON、DOM execution、logging、external communicationに concrete defect はない。 |
| Test / Validation / Regression | FAIL | IR-014 の narrow viewport 到達性が未検証で、IR-015 / IR-016 の test は上流契約と異なる結果を期待する。 |
| Implementation Discipline | PASS | current Design が許容する coordinator workflow と Domain / port 境界を維持する。 |

New / Open の HIGH Finding `IR-014` があるため、blocking review condition の有無にかかわらず Gate は **REVISE IMPLEMENTATION** とする。追加の blocking review condition はない。

## 12. 残存リスクと未決定事項

- 320〜639 CSS px の利用者は、IR-014 の解消まで一括入力を使えない。
- IR-015 の入力では member identity の衝突により既存地点の誤更新または conflict 判定の誤りが起こり得る。
- IR-016 の geometry は viewport / density に応じて label の採否・位置を変え、通常・地点選択表示が共通実装であることは維持しても正規の配置結果を保証しない。
- 実端末、実配備 origin、実データ・license、release readiness は今回の正式 Scope 外である。

## 13. 自動変更

Implementation、Test、Requirements、Specification、Design、master data、設定、既存 review は変更していない。本レビューで新規作成したのは `docs/reviews/implementation/implementation-review-014.md` のみである。commit / push は実施していない。

## 14. 最終判定

**REVISE IMPLEMENTATION**

CRITICAL 0 / HIGH 1 / MEDIUM 2 / LOW 0。旧 IR-011〜IR-013 は現行承認済み上流に対して再オープンしない。一方、IR-014 を解消し、IR-015 と IR-016 を上流契約へ整合させて regression test を更新した後、Treasure Implementation / Test を再レビューする必要がある。
