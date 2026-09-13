# Treasure Compass / Mob Compass Design Review 009

## 1. レビュー対象

- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `80d8ad55aa34d4ca5bce72eafccd408a2505f82e`
- 対象成果物: [Design](../../design/design.md)
- 対象 revision: Design Author Revision 008
- 直接の上流: [Specification](../../specification/specification.md) Revision 008、[Specification Review 014](../specification/specification-review-014.md)（Gate: `READY`）
- 対象範囲: Design Revision 008 全体。特に Treasure registration workflow の ownership、Domain / Application / Presentation の境界、現在対象自動確立、selection / current target、next / back、route・保存・公開の transaction、runtime-only undo、unresolved reference、Treasure / Mob 分離、および Specification Revision 008 からの追跡を確認した。
- 除外範囲: Requirements / Specification / Design の直接修正、Implementation / Test の適合性再判定、Mob 実装、実ブラウザ・実端末、実配備、実データ・画像・外部ライセンス、release readiness。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。対象 revision、レビュー境界、禁止事項、確認時点を確定した。
- `design-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、design-review の reviewers、review-gates、output-format、security-checklist。工程境界、Finding、Gate、14章形式および適用可能な trust boundary を適用した。
- [Specification](../../specification/specification.md) Revision 008 と [Specification Review 014](../specification/specification-review-014.md)（`READY`）。直接の規範的根拠として、Treasure UX、状態遷移、route、保存・復元、失敗境界、受入条件を確認した。
- [Requirements](../../requirements/requirements.md) Revision 012、[Requirements Review 012](../requirements/requirements-review-012.md)（`READY`）、[Concept](../../concept/concept.md)、[Concept Review 005](../concept/concept-review-005.md)（`READY`）。意図、追跡、製品境界の補助確認に用いた。
- [Design Review 008](design-review-008.md) と過去 Design Review。既存 `DR-001`〜`DR-012` の状態と review 番号を確認した。
- [Implementation Review 013](../implementation/implementation-review-013.md)。IR-011 / IR-012 が Revision 008 の上流契約更新で置き換わったこと、IR-013 が今回の ownership 確認対象であることを補助確認した。Implementation を Design の正当化根拠には用いていない。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 1。`DR-013` は Specification Review 014 の承認状態に追随していない metadata の問題であり、Design の責務、状態所有、依存方向、transaction boundary、または本 Gate を妨げない。

## 4. 総評

Design Revision 008 は、Specification Revision 008 の Treasure UX を外部契約を変えずに実現できる責務へ分解している。Presentation は入力収集と command 発行、Session coordinator は registration workflow・route・保存・公開の調停、Domain は canonical session と Treasure 固有の pure transition、adapter は master / storage の検証と入出力境界を担う。route calculation と canonical transition、persistence と domain rule、UI と保存 serialization は分離されている。

IR-013 の論点について、registration ID allocation、新規 registration 構築、既存 member 検索、capacity / conflict 判定、manual / bulk proposal 統合は coordinator の workflow responsibility と明示され、Domain には canonical state、player / playlist transition、point reference identity の pure rule が残る。manual と bulk は共通 helper または同じ coordinator により同じ workflow rule を適用する制約があるため、単なる二重実装を許容していない。この分担は Specification Revision 008 の外部結果を満たし、Domain に registration workflow 全体を強制しない合理的な Design である。

`currentTarget` の未設定時だけ登録後 canonical candidate から先頭未完了を確立し、`listSelection` は設定しない順序、next の domain transition → route calculation → exact snapshot validation → write → publish、route / save / stale failure で working state を公開しない境界、runtime-only undo、unresolved reference の非推測復元も明確である。独立再生 control は Presentation の必須操作ではなく、内部の current-target activation を禁止しないため、Revision 008 の外部契約と一致する。

## 5. 指摘事項

### DR-013: 上流 Specification Review の承認状態が Design metadata に追随していない

- 分類: Traceability defect
- 重大度: Minor
- 状態: New / Open
- 対象箇所: Design Status、文書前段の「上流の承認状態」、§2.1「根拠と工程境界」、§16「未決定事項と参照資料」

**確認した事実**

Design は Specification Revision 008 を直接の規範的根拠と明記する一方、Status と前段は `UPSTREAM REQUIREMENTS UPDATE REQUIRED` および「Specification Review 前」と記載し、§2.1 と §16 は Specification Review 013 だけを参照している。現在の [Specification Review 014](../specification/specification-review-014.md) は Revision 008 を対象に `READY` を判定し、その Minor `SR-028` の metadata follow-up は Reviewed HEAD で解消済みである。

**影響**

本文の設計内容は承認済み Specification Revision 008 に追跡できるが、読者が Revision 008 の上流承認が未完了であると誤認し、Design の工程位置と次工程を誤って判断し得る。

**最小修正**

次の Design Author 更新で、Status、前段の承認状態、§2.1 と §16 の Review 参照を Specification Revision 008 / Specification Review 014（`READY`）および `SR-028` 解消後の状態へ更新する。責務、外部契約、state transition、persistence contract をこの metadata 修正で変更しない。

**再確認条件**

Design の metadata と根拠節が Specification Review 014 の `READY` と Reviewed HEAD の承認状態を正しく示し、本文の意味上の変更がないこと。

## 6. 解消済み指摘

- `DR-001`〜`DR-009`: Resolved を維持。Revision 008 の全体確認で、過去の責務・移行・状態境界の指摘を再オープンする根拠はない。
- `DR-010`〜`DR-012`: Resolved を維持。Revision 007 に対する過去 Design Review の解消状態は、今回の UX / ownership 更新で再発していない。
- Implementation Review 013 の `IR-011` / `IR-012`: 現在の Specification Revision 008 では、登録時の現在対象自動確立と独立再生 control 非必須の外部契約へ置き換えられている。Design Finding として再計上しない。
- `IR-013`: Revision 008 の registration workflow responsibility を本レビューで確認した。coordinator と Domain の境界は上記総評のとおり明確であり、現行 Design に対応する Open Design Finding にはしない。

## 7. 上流へのフィードバック

なし。Specification Revision 008 と Specification Review 014（`READY`）は、Design Revision 008 が実現すべき外部契約、登録後の現在対象、selection の独立、next / back、保存・復元、failure の意味を十分に定めている。

## 8. 保留した指摘

なし。Implementation / Test がこの Design と Specification Revision 008 に適合するかは、次の正式 Implementation Review で確認する後続工程であり、現在の Design の不足ではない。

## 9. 対象範囲と追跡

| 確認項目 | Specification / Design の追跡 | 判定 |
| --- | --- | --- |
| 基本依存方向 | Specification §§1、9 / Design §§3.1〜3.2 | PASS。Presentation → coordinator → domain / port を維持し、browser API は adapter に閉じる。 |
| registration workflow | Specification §§4.1〜4.3、9.3 / Design §§3.2、7.2、8.1、10.2 | PASS。workflow と canonical pure rule を分け、manual / bulk に共通 rule を要求する。 |
| current target と selection | Specification §4.3.1、§9.1〜9.2 / Design §§7.2、8.1、10.2〜10.3 | PASS。別参照として所有し、登録後の auto-establishment と selection を混同しない。 |
| Presentation と再生 | Specification §§2、3.2、4.3.1 / Design §§7.2、10.3、11.1 | PASS。独立 control を必須化せず、activation operation は許容する。 |
| next / back と undo | Specification §4.3.1、§9.1〜9.2 / Design §§7.2、8.1、10.3 | PASS。canonical transition、再投影、保存、publish の順序と runtime-only chain を定める。 |
| route / stale / failure | Specification §§6〜7、9.3 / Design §§8.1、9、12 | PASS。planner は read-only、stale / failure は working result を採用しない。 |
| persistence / migration | Specification §9 / Design §§3.2、8、12 | PASS。exact validation、master identity、legacy priority / cleanup、write-before-publish を adapter / coordinator 境界に置く。 |
| unresolved reference | Specification §§9.1.1〜9.2 / Design §§5.3、7.2、8.3、12 | PASS。stable reference を保持し、nearest / 同名 / 別地点への推測置換を禁じる。 |
| trust boundary | Specification §§1.2、4.2、9、10 / Design §§5、8、12 | PASS。入力、static JSON、localStorage は検証前に信用せず、HTML 解釈・不要な外部通信・不要な logging を許容しない。 |
| Treasure / Mob 分離 | Specification §§1、3、5 / Design §§3.1〜3.3、7 | PASS。product domain / session root / persistence boundary を分け、共有は map layer の contract に限定する。 |
| 上流 review metadata | Specification Review 014 / Design Status、§2.1、§16 | FAIL（Minor）。`DR-013`。 |

Two-implementation test: coordinator 内で共通 registration workflow helper を使う実装と、同じ coordinator の一つの transaction policy に manual / bulk command を収束させる実装は、いずれも Domain の canonical transition、route / persistence boundary、外部結果を変えずに成立する。いずれかに route algorithm、storage、UI state を Domain へ流入させる実装は Design に適合しないため、重要な ownership は推測に委ねられていない。

## 10. 検証結果

| 検証 | 結果 | 備考 |
| --- | --- | --- |
| `git status --short`（開始時） | PASS | 作業ツリーは clean だった。 |
| `git diff --check`（artifact 作成前） | PASS | whitespace error はなかった。 |
| Design Revision 008 全文の静的レビュー | PASS | responsibility、state ownership、failure / recovery、security、handoff を確認した。 |
| Specification Revision 008 / Review 014 追跡 | PASS | Revision 008 の直接上流と `READY` を確認した。 |
| Requirements / Concept の補助追跡 | PASS | Requirements Review 012、Concept Review 005 の Gate と製品境界を確認した。 |
| Markdown / relative link validation | PASS | 14章の必須順序と artifact 内の相対参照を確認した。 |
| `pnpm lint` / `pnpm test` / `pnpm run build` | SKIPPED / NOT APPLICABLE | docs-only の Design Review であり、コード、設定、test、static data は変更していない。 |

未検証範囲: 現行 Implementation / Test の Revision 008 適合性、実ブラウザ・実端末、実配備 origin、実 localStorage migration、実 master data、画像・外部ライセンス、performance / release readiness。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | v1、対象外、直接上流、session / product boundary を理解できる。 |
| 2. コンテキストと責任 | PASS | Presentation、coordinator、Domain、route、master、persistence の責務を分離する。 |
| 3. 依存方向 | PASS | product domain の相互依存を禁じ、環境 API を adapter に閉じる。 |
| 4. 主要フローと失敗 | PASS | registration、next / back、route、save / stale / migration failure の責任と非部分公開を定める。 |
| 5. 状態・データ所有 | PASS | canonical session、selection / target、route projection、undo、snapshot、unresolved annotation の所有が明確である。 |
| 6. セキュリティ・整合性・運用境界 | PASS | input / storage / static data validation、resource bound、DOM / logging / external communication の境界を定める。 |
| 7. 上流整合性と工程境界 | PASS | 外部契約を追加せず、Specification Revision 008 を内部責務へ具体化する。metadata は `DR-013` として follow-up が必要だが、本文の整合性を損なわない。 |
| 8. 下流実装可能性 | PASS | workflow、canonical transition、transaction、persistence、route、undo、unresolved の責務を推測なしに実装・検証できる。 |

Critical の New / Open / Reopened は 0 件であるため、design-review Skill の規則に従い Gate は **READY** とする。

## 12. 残存リスクと未決定事項

- `DR-013` が解消されるまで、Design の Status と根拠節だけは実際の Specification Review 014 `READY` を反映しない。本文の設計意味および外部契約への影響はない。
- 実装が registration workflow の共有 rule、保存前 publish 禁止、route failure / stale result の不採用、undo 非永続化を維持するかは、後続の正式 Implementation Review で再確認が必要である。
- data preparation、実 master / asset、配備 origin、実ブラウザ操作、performance、release readiness は本 Design Review の対象外である。

## 13. 自動変更

本レビューで新規作成したのは `docs/reviews/design/design-review-009.md` のみである。Design、Specification、Requirements、Concept、Implementation、Test、既存レビュー、設定、static data、画像を変更していない。commit / push は実施していない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 1。Design Revision 008 は Specification Revision 008 を実現する責務、状態所有、依存方向、transaction boundary を十分に定めている。`DR-013` は non-blocking metadata follow-up として残る。次の正式工程は、現在の Treasure Implementation / Test を Revision 008 の承認済み上流契約に対して再度レビューすること。
