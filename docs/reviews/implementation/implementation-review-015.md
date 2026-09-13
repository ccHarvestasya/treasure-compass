# Treasure Compass Implementation Review 015

## 1. レビュー対象

- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `94a60bb043f6aab260a6ea76e3573528e7b6260a`
- 確認日: 2026-09-13
- レビュー方式: 承認済み Requirements Revision 013、Specification Revision 009、Design Revision 009 に対する Treasure Compass の Implementation / Test 全体再レビュー。Implementation Review 014 の IR-014〜IR-016 は履歴資料としてのみ参照し、現在の上流契約に対してゼロベースで判定した。
- 対象範囲: `apps/treasure-compass/**`、`packages/treasure-domain/**`、`packages/map-core/**`、Treasure から利用される map UI / master-data、persistence / migration、parser、unit test、Treasure に関係する root build・lint・test 設定。
- 除外範囲: Mob 実装の完成度・未実装部分・将来 Mob feature、Skill 自体の品質、上流文書の文章レビュー、README の独立レビュー、deployment / release readiness、performance optimization、cosmetic cleanup、無関係な dependency 更新。
- 未確認範囲: 実ブラウザ・実スマートフォン、実配備 origin、実ゲームチャット貼り付け、外部画像ライセンス。source、unit test、lint、test、build による今回の Gate 判定を妨げる blocking evidence 不足はない。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。Reviewed HEAD、Treasure 限定範囲、変更禁止事項、validation を確定した。
- `implement-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、implement-review の reviewers、review-gates、output-format、security-checklist。Finding、severity、Gate、14章形式、security / trust boundary を適用した。
- [Requirements](../../requirements/requirements.md) Revision 013、[Requirements Review 013](../requirements/requirements-review-013.md)（`READY`）。全対象レイアウトの手動登録、狭幅での一括入口省略、320 CSS px、member identity、保存を確認した。
- [Specification](../../specification/specification.md) Revision 009、[Specification Review 015](../specification/specification-review-015.md)（`READY`、SR-029 resolved）。responsive、parser normalization、label geometry、registration、遷移、persistence、migration、unresolved reference を直接照合した。
- [Design](../../design/design.md) Revision 009、[Design Review 010](../design/design-review-010.md)（`READY`、DR-014 resolved）。Domain / Coordinator / adapter の責務、route、write-before-publish、runtime-only undo、Map UI projection、Treasure / Mob 分離を照合した。
- [Implementation Review 014](implementation-review-014.md)。IR-014〜IR-016 の旧根拠と上流更新後の扱いを履歴として確認した。旧 finding は機械的に再オープンしていない。
- Reviewed HEAD の source、unit test、master data、persistence、workspace configuration、および実行 validation。下流の実装から新しい Requirement / Specification / Design を生成していない。

## 3. レビュー結果

**READY**

CRITICAL 0 / HIGH 0 / MEDIUM 1 / LOW 0。`IR-017` は marker 除去後の空白を再度 trim しない parser 境界差異であり、影響は該当入力に限定される。blocking finding および blocking review condition はない。

## 4. 総評

現行実装は、最新の上流で正式化された responsive 契約に適合している。手動登録は狭幅を含む主表示から利用でき、一括入口は `sm` 未満で省略されるが、これは Specification / Design が許容する Presentation 差異であり、domain / persistence state へ流出していない。

IR-015 相当の parser は、指定 marker 列、先頭 FFXIV private-use-area glyph、連続 marker、trim / NFC の基本経路を実装し、通常の名前文字や任意の Unicode symbol を推測削除していない。IR-016 相当の label layout は `8n + 24` CSS px、24 CSS px、22 CSS px、8方向、viewport、正の面積衝突、最大8件、stable ID / candidate order、icon 全件・label のみ省略を実装し、通常表示と地点選択表示で同じ overlay projection を利用する。

Treasure の registration workflow は Coordinator が調停し、Domain が canonical session、selection / current target、completion、playlist、next / back、remove / move / reorder、point identity の pure operation を所有する。登録成功後の current target 自動確立、listSelection との独立、manual / bulk の capacity・identity・更新意味、route 分離、write-before-publish、v3 persistence、legacy migration、unresolved stable reference、runtime-only undo は上流契約と整合する。

## 5. 指摘事項

### IR-017: marker 除去後の前後空白を再度正規化していない

- 分類: Implementation defect / Test defect
- 重大度: MEDIUM
- 状態: New / Open
- 対象箇所: `apps/treasure-compass/src/utils/bulkParser.ts:39-45`、`apps/treasure-compass/tests/unit/bulkParser.test.ts:72-76`
- 上流根拠: Specification §4.2。前置装飾を除去した名前を前後空白除去・Unicode NFC 正規化して member identity に用いる契約。

**確認した事実と到達条件**

`normalizeMemberName` は入力全体を最初に `trim()` した後、先頭の private-use-area glyph と marker 列を削除し、最後に NFC だけを適用する。したがって、チャット行が `(★ Alice) Map (X, Y)` または `(private-use-glyph★ Alice) Map (X, Y)` のように装飾と名前の間に空白を含む場合、装飾除去後の先頭空白が残り、`memberName` が `" Alice"` になる。現在の parser test は空白なしの連続装飾だけを確認している。

**影響**

該当する許容入力で、手動登録と同じ identity にならず、既存 member の更新・同一名 conflict・8枠判定の比較キーが変わる。任意の名前文字を削除する問題ではないが、外部から観測可能な正規化結果が Specification と一致しない。

**必要な最小修正**

前置装飾を除去した後の文字列に対しても Specification の前後空白除去と NFC 正規化を適用し、装飾直後の空白を含む境界入力を parser / bulk apply の regression test で検証する。

**再確認条件**

指定 marker なし、一文字 marker、連続 marker、private-use-area glyph + marker、装飾と名前の間の空白、指定外先頭文字の各入力で、正規化後 member identity と既存 member 更新・conflict 結果が Specification §4.2 / §4.1 に一致することを確認する。

## 6. 解消済み指摘

- IR-014 相当（responsive / bulk input）: 再オープンしない。狭幅で一括入口が省略されることは Revision 013 の正式契約で許容され、手動登録は `SideBar` の常時表示 button から到達できる。320 CSS px 以上で手動登録による登録・巡回・進行を提供する設計と実装である。
- IR-015 相当（member identity / parser）: 指定 marker、private-use-area glyph、連続 marker、trim / NFC の主経路は現行 Specification に適合する。上記の装飾直後空白だけを新規 IR-017 として分離した。
- IR-016 相当（aetheryte label geometry）: 再オープンしない。実装・test は現行 Specification の `8n + 24` CSS px、24 CSS px、22 CSS px 規則へ整合している。
- IR-011〜IR-013: 現在の Requirements / Specification / Design に対する concrete な再発 evidence はない。登録時 currentTarget 自動確立、独立 Play control 非必須、Coordinator の registration workflow ownership は現行契約に適合する。
- IR-001〜IR-010: 現行 Reviewed HEAD で再オープンすべき concrete evidence はない。

## 7. 上流へのフィードバック

なし。IR-017 は Specification §4.2 に対する現在 Implementation / Test の具体的な境界欠陥であり、上流の不足・曖昧さではない。

## 8. 保留した指摘

なし。実ブラウザ・実端末・実配備 origin・実ゲーム貼り付け・外部画像ライセンスは未確認範囲として記録するが、source、unit test、lint、test、build による今回の適合性判定を阻害するものではない。

## 9. 対象範囲と追跡

| 確認項目 | 根拠 | 結果 |
| --- | --- | --- |
| responsive / 一括入力入口 | Requirements `REQ-T-001` / `REQ-T-002` / `REQ-Q-001`、Specification §3.2、Design §§1.2、11.1〜11.2 | PASS。手動登録は全対象レイアウト、一括入口は狭幅で省略可能。domain / persistence state に breakpoint を保存しない。 |
| member identity / parser | Specification §§4.1〜4.2、Design §§3.2、8.1 | PASS WITH IR-017。指定 marker / glyph の主経路は適合するが、装飾後空白の境界が未正規化。 |
| aetheryte label geometry | Specification §§4.4、10.2、Design §§10.4、11.1 | PASS。`8n + 24`、24、22、8方向、viewport、正の面積衝突、最大8、stable ID / candidate order、icon 全件・label 省略、両表示共通 projection を確認。 |
| registration / currentTarget 自動確立 | Specification §§4.1〜4.3.1、Design §§7.2、8.1、10.2 | PASS。登録成功時に target 未設定なら先頭未完了を確立し、既存 target と listSelection を不用意に変更しない。 |
| listSelection / currentTarget | Specification §§2、4.3.1、9.1〜9.2、Design §7.2 | PASS。selection は別参照で、selection 単独では target、完了、順序、map current location を変更しない。 |
| manual / bulk registration | Specification §§4.1〜4.2、Design §§7.2、8.1、10.2 | PASS。identity、8枠、same / different point、completion、更新、partial apply、save failure の workflow を確認。IR-017 の入力境界を除く。 |
| Domain / Coordinator responsibility | Design §§3.1〜3.2、7.2、8.1 | PASS。pure canonical transition は Domain、workflow / route / persistence / publish は Coordinator が所有する。 |
| next / back / undo | Specification §§4.3.1、9.1〜9.3、Design §§7.2、8.1、10.3 | PASS。no-op、playlist 順、completion、map location、selection 維持、runtime-only frame、back 後 next を確認。 |
| complete / cancel / remove / reorder | Specification §§4.3.1、6〜7、Design §§7.2、8.1、9.3 | PASS。個別進捗、参照解除、manual order、route projection、保存失敗境界を確認。 |
| route separation / atomicity | Specification §§6〜7、9.3、Design §§8.1、9、12 | PASS。Domain は route planner に依存せず、route / save failure は publish しない。 |
| persistence v3 / migration | Specification §9、Design §§5.3、8、12 | PASS。exact validation、revision、master identity、priority、write-before-publish、cleanup failure、legacy resurrection 防止を確認。 |
| unresolved reference | Specification §10.2、Design §§5.3、8、12 | PASS。stable reference を保持し、nearest / same-name 自動置換を行わず、route / completion から未解決を分離する。 |
| master / map / Map UI | Specification §§4.4、10、Design §§4〜5、10.4 | PASS。T-only / R exclusion、finite X/Y、Z 非使用、validated projection、overlay 非操作性、marker selection を確認。 |
| Treasure / Mob separation | Requirements `REQ-F-001`〜`REQ-F-002`、Design §§3.1〜3.3 | PASS。Treasure app / domain は Mob package に依存せず、shared map boundary のみ利用する。 |
| security / trust boundary | AGENTS.md、Specification §§1.2、4.2、9、10.2、Design §§5、8、12 | PASS。pasted chat、localStorage、static JSON を検証し、unsafe HTML / `eval` / dynamic script / 不要な外部通信 / raw input logging を確認しない。 |

## 10. 検証結果

| 検証 | 結果 | 備考 |
| --- | --- | --- |
| `git status --short`（開始時） | PASS | 作業ツリーは clean だった。 |
| `git diff --check` | PASS | レビュー開始時に whitespace error はなかった。 |
| `pnpm lint` | PASS | `oxlint --type-aware --type-check .`。 |
| `pnpm test` | PASS | 13 files / 128 tests。 |
| `pnpm run build` | PASS | TypeScript、Treasure build、Mob build が成功。Treasure bundle の 500 kB 超過 warning はあったが、今回の契約欠陥ではない。 |
| 静的 Implementation / Test review | PASS WITH IR-017 | registration、domain、route、persistence、migration、unresolved、responsive、parser、master、Map UI、dependency、security を確認した。 |

未検証: 実ブラウザ・実スマートフォン・実ゲーム貼り付け・実配備 origin・実 localStorage 既存データ・外部画像ライセンス。IR-017 の装飾後空白は source の制御フローと契約から再現条件を確認したが、実端末での貼り付けイベントまでは検証していない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | PASS | 最新 Requirements / Specification / Design と全主要操作の追跡を確認。IR-014〜IR-016 の旧差異は現行契約に適合する。 |
| Correctness / State / Data | PASS WITH MINOR | canonical state、registration、target / selection、route、persistence は適合。IR-017 は parser の限定的な identity 境界差異。 |
| Failure / Resource / Runtime Safety | PASS | save-before-publish、route failure、save failure、undo、migration cleanup、unresolved reference を確認。 |
| Compatibility / Integration | PASS | v3 / legacy migration、master identity、validated map projection、Treasure / Mob dependency を確認。 |
| Security / Trust Boundary | PASS | pasted input、localStorage、static JSON、DOM execution、logging、external communication に concrete な欠陥はない。 |
| Test / Validation / Regression | PASS WITH MINOR | lint / test / build は成功。IR-017 の装飾後空白境界 test が不足しているため、修正時に regression test を追加する。 |
| Implementation Discipline | PASS | 現行 Design の Domain / Coordinator / adapter 境界、Map UI pure projection、responsive presentation concern を維持する。 |

CRITICAL / HIGH の New / Open / Reopened はなく、blocking review condition もないため、正式 Gate は **READY** とする。IR-017 は MEDIUM の任意改善ではなく具体的な修正候補だが、現行 Gate を blocking にはしない。

## 12. 残存リスクと未決定事項

- IR-017 が残る間、装飾と名前の間に空白を含む一括入力では member identity が仕様どおりにならず、既存更新・conflict 判定へ限定的な影響がある。
- 実ブラウザ、実端末、実配備 origin、外部画像ライセンス、release readiness は今回の正式 Scope 外または未確認範囲である。
- IR-014〜IR-016 の旧根拠を現在の finding として再利用していない。上流変更により判定基準が変わったため、現行契約へ追跡し直した。

## 13. 自動変更

Implementation、Test、Requirements、Specification、Design、master data、設定、既存 review は変更していない。本レビューで新規作成するのは `docs/reviews/implementation/implementation-review-015.md` のみである。commit / push は実施していない。

## 14. 最終判定

**READY**

CRITICAL 0 / HIGH 0 / MEDIUM 1 / LOW 0。IR-014〜IR-016 は再オープンしない。IR-017 は marker 除去後の空白正規化に関する限定的な MEDIUM finding であり、responsive、label geometry、registration ownership、canonical transition、route / persistence / migration、Treasure / Mob 分離を阻害しない。現行 Treasure Implementation / Test は、最新の承認済み上流に対して blocking defect なしと判定する。
