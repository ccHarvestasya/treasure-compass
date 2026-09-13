# Treasure Compass / Mob Compass Design Review 010

## 1. レビュー対象

- レビューサイクル: 010
- 確認日: 2026-09-13（Asia/Tokyo）
- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `4ff27875f2a177205ef24cf9321f93a38f32865c`
- 対象成果物: [Design](../../design/design.md) — Design Author Revision 009
- 直接の規範的上流: Specification Author Revision 009、[Specification Review 015](../specification/specification-review-015.md)（`READY`、SR-029 resolved）
- 補助上流: Requirements Author Revision 013、[Requirements Review 013](../requirements/requirements-review-013.md)（`READY`）
- 対象範囲: Design Revision 009 全体。重点は responsive / bulk input ownership、Treasure input pipeline の normalization、Map UI の label projection、依存方向、registration workflow、currentTarget / listSelection、next / back、runtime-only undo、route、persistence / migration、unresolved、Treasure / Mob 分離。
- 未確認範囲: 現行 Implementation / Test の適合性、実ブラウザ・実端末、実 localStorage、master data、画像、配備 origin、出典・ライセンス、performance および release readiness。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。Reviewed HEAD、レビュー境界、旧 geometry / responsive 前提の確認範囲および禁止事項を確認した。
- `design-review` Skill と、`review-common/review-playbook.md`、`review-common/output-format.md`、`design-review/reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`。責務、依存、state / data ownership、failure boundary、工程境界、重大度および Gate を適用した。
- [Specification Revision 009](../../specification/specification.md) と [Specification Review 015](../specification/specification-review-015.md)。responsive、member identity / parser、町名ラベル geometry、Treasure 状態、route、persistence、unresolved および Mob 分離の直接の規範的根拠として確認した。Specification Review 015 は `READY`、SR-029 は resolved。
- [Requirements Revision 013](../../requirements/requirements.md) と [Requirements Review 013](../requirements/requirements-review-013.md)。製品範囲、responsive、入力 identity および責任境界の補助根拠として確認した。Requirements Review 013 は `READY`。
- Design Review 001〜009。既存 DR-001〜DR-013 の状態、レビュー番号および metadata follow-up の履歴を確認した。
- Implementation Review 014 と現行実装。実現可能性・明白な回帰の補助確認に限り参照し、実装から新しい Design decision は逆生成していない。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 1。DR-014 は Specification Review 015 と Requirements Review 013 の承認状態が Design metadata に追随していない traceability metadata の問題であり、責務、依存方向、状態所有、transaction boundary または Gate を妨げない。

## 4. 総評

Design Revision 009 は、Specification Revision 009 の外部契約を変更せず、Presentation → Application / Session Coordinator → Domain / Port の依存方向へ具体化している。Treasure input pipeline は parser、候補解決、行診断および前置装飾 normalization を session 外の proposal lifecycle として担当し、coordinator が conflict / capacity / registration workflow を適用する。Domain と persistence へ parser の生入力や UI-local draft を漏らさない境界が明確で、regex や具体 parser 実装を Design に固定していない。

responsive breakpoint と登録入口の開閉は Presentation concern とされ、手動登録は全対象レイアウト、一括入力は広い画面、狭幅では一括入力入口を省略可能とする。domain / persistence state に responsive 差異や入口 state を持ち込まないため、Specification の responsive contract を実現可能である。

Map UI は session aggregate 外の pure display projection として、幅 `8n + 24` CSS px、高さ24 CSS px、22 CSS px offset / gap、8方向、viewport 内、正の面積による衝突、最大8件、stable ID / candidate order、アイコン全件・ラベルのみ省略、通常表示 / point-selection 同一規則を扱う。案内 overlay は command、session mutation、persistence を発生させない。

Treasure の registration workflow は coordinator に置き、Domain は canonical session、playlist / player transition、selection / current target、completion、ordering、point reference identity の pure rule を所有する。`currentTarget` と `listSelection` は独立参照、next / back の undo chain は runtime-only、route は read-only、保存は write-before-publish、migration / unresolved は adapter / coordinator 境界に分離されている。Treasure / Mob の session root、domain、persistence は分離され、共有は map contract に限定される。

## 5. 指摘事項

### DR-014: 現行上流承認状態が Design metadata に反映されていない

- Category: Traceability defect / metadata follow-up
- Severity: Minor
- Status: New
- Location: Design 冒頭の「上流の承認状態」、§2.1「根拠と工程境界」、§16「未決定事項と参照資料」

**確認した事実**

Design Author Revision 009 は、上流の承認状態を「Requirements Review および Specification Review 待ち」と記載し、Revision 008 / Specification Review 014 を直前の承認済み基準としている。§2.1 も Specification Revision 009 を正式 Specification Review 待ちとし、§16 は Specification Review 014 と Requirements Review 012 を参照している。一方、Requirements Review 013 と Specification Review 015 はともに `READY` であり、SR-029 は解消済みである。

**問題**

Design の metadata と根拠節が現在の直接上流の承認状態・参照資料を正確に示さず、Revision 009 が未承認上流を前提にしているように読める。本文の責務、依存、state ownership、外部契約または実装可能性の問題ではない。

**必要なフォローアップ**

次の Design Author 更新で、Status / 上流の承認状態、§2.1、§16 の参照を Specification Revision 009 / Specification Review 015（`READY`、SR-029 resolved）および Requirements Revision 013 / Requirements Review 013（`READY`）へ追随させる。Design の意味内容は変更しない。

**再確認条件**

Design metadata と根拠節が現行上流の Revision / Review / Gate を正しく示し、responsive、parser、geometry、registration、route、persistence、undo、unresolved および Treasure / Mob 分離の設計内容に意味上の変更がないこと。

## 6. 解消済み指摘

- DR-001〜DR-012: Resolved を維持。責務、依存、保存、migration、state ownership および failure boundary の回帰は確認されない。
- DR-013: Specification Review 014 の承認状態に関する前 Revision の metadata follow-up は解消済みと扱う。DR-014 は Revision 009 が新しい Specification Review 015 / Requirements Review 013 を参照する際の新規 metadata 不整合であり、過去 finding を機械的に再利用していない。
- IR-014〜IR-016: 製品判断が Requirements / Specification に反映されたものとして確認した。狭幅一括入力、名前装飾、label geometry の旧実装差異を Design finding として逆生成していない。

## 7. 上流へのフィードバック

なし。Specification Revision 009 と Specification Review 015（`READY`）は、Design Revision 009 に必要な外部契約、responsive、parser 結果、label geometry、Treasure 状態、persistence、route および failure boundary を十分に定めている。

## 8. 保留した指摘

- Implementation / Test: 実際の breakpoint、全対象レイアウトの手動登録、一括入口省略、marker / PUA 入力、label projection、currentTarget / listSelection、next / back、write-before-publish、migration、unresolved の適合を検証する。
- Data preparation / deployment: master、画像・license、stable ID report、実 browser origin および配備構成を Design の外部契約を変えずに確認する。

これらは下流で検証・具体化する事項であり、Design の責務不足としては扱わない。

## 9. 対象範囲と追跡

| 確認項目 | Specification / Design の追跡 | 判定 |
| --- | --- | --- |
| responsive / bulk input ownership | Specification §§3.2、11、SPC-AC-018 / 027、Design §§1.1〜1.2、3.2、8.1、10.2、11.2 | PASS。手動登録は全 layout、一括入力は広幅、狭幅入口省略は Presentation concern で、domain / persistence に保持しない。 |
| parser normalization responsibility | Specification §4.1〜4.2、SPC-AC-003、Design §§3.2、8.1、10.2 | PASS。input pipeline が marker / PUA / trim / NFC を扱い、proposal を返す。Domain / persistence は parser 生入力を所有しない。具体 regex は固定していない。 |
| aetheryte label projection | Specification §4.4、§10.2、SPC-AC-023、Design §§3.1〜3.2、5、7.1、10.4、11.1 | PASS。`8n + 24`、24、22、8方向、viewport、正の面積、最大8、stable ID / candidate order、icon 全件・label 省略、両表示同一 projection を維持する。 |
| dependency direction | Specification §§1、3、4、Design §§3.1〜3.2 | PASS。Presentation → coordinator → Domain / Port。Map UI は session aggregate / raw JSON を直接解釈せず、browser API / storage は adapter 境界に閉じる。 |
| registration workflow / Domain | Specification §§4.1〜4.3.1、Design §§3.2、7.2、8.1、10.2〜10.3 | PASS。ID allocation、construction、lookup、capacity、conflict、bulk 統合は coordinator、canonical transition と pure rule は Domain。manual / bulk の共通 workflow rule も要求される。 |
| currentTarget / listSelection | Specification §§2、4.3〜4.3.1、Design §§1.1、7.1〜7.2、10.2〜10.3 | PASS。独立参照、登録時の currentTarget 自動確立、selection 非同期、next / back の selection 非変更を維持する。 |
| next / back / runtime undo | Specification §4.3.1、§9、SPC-AC-028、Design §§7.2、8.1、10.3 | PASS。canonical transition → route → serialize/validate → write → publish、undo chain は runtime-only、no-op / stale / failure で chain を変更しない。 |
| route separation | Specification §§6〜7、Design §§8.1、9、10.3 | PASS。route planner は read-only、session revision / master identity で stale result を破棄し、route failure は working state を公開しない。 |
| persistence / migration | Specification §9、Design §§3.2、8、12 | PASS。v3 exact projection、legacy priority / cleanup、write-before-publish、root failure、origin boundary を adapter / coordinator 責務として分離する。 |
| unresolved reference | Specification §§9.1.1〜9.2、§10、Design §§5.3、7.2、8.3、12 | PASS。stable reference を保持し、nearest / same-name / 別地点 fallback を行わず、route から除外する。 |
| Map UI pure projection | Specification §4.4、SPC-AC-022〜024、Design §§7.1、10.4、11.1 | PASS。overlay の描画・再描画・省略は session mutation / persistence / command を発生させない。 |
| Treasure / Mob 分離 | Specification §§1〜3、5、Design §§1.1、3.1、4.5、7 | PASS。app、domain、session root、persistence を分離し、共有は map contract に限定する。 |
| Specification 009 追跡 | Specification Review 015、Design Status / §2.1 / §16 | FAIL（Minor）。DR-014。 |

Two-implementation test: parser を別モジュールまたは coordinator 内の入力 boundary として実装しても、input pipeline が normalization / proposal を所有し、coordinator が workflow transaction を所有し、Domain が canonical transition を所有する限り同じ外部結果になる。Map UI の overlay projection を異なる純粋関数で実装しても同じ geometry / selection / non-mutation contract を満たせる。storage adapter、route planner、Domain transition を相互に直接呼び出す実装は Design の責務境界に適合しないため、重要な ownership は推測に委ねられていない。

## 10. 検証結果

- `git status --short`（開始時）: PASS。作業ツリーは clean だった。
- `git diff --check`: PASS。
- `docs/design/design.md` の SHA-256: `d6ece7b8452282daf5d5a79c481cf3277fa325d9d0b19bdd5568a80a50e439cb`。
- Design Revision 009 全文、Specification Revision 009、Specification Review 015、Requirements Revision 013、Requirements Review 013、Concept、および過去 Design Review を確認した。
- 依存方向、responsibility、state ownership、transaction、persistence / migration、route、undo、unresolved、Map UI projection、responsive、parser normalization、Treasure / Mob 分離を静的に確認した。
- 旧 `8n + 16`、旧 `4 CSS px`、狭幅でも一括入力必須という設計前提は、現行 Design の規範記述として確認されなかった。現行の `8n + 24`、24 CSS px、22 CSS px、広幅一括入力、狭幅入口省略は Specification 追随として記載されている。
- Design 内の相対リンク（Specification、Specification Review 014、Requirements、Requirements Review 012、Concept、既存 Review）は参照先の存在を確認した。これらの旧 Review 参照が現行上流へ未追随であることは DR-014 として記録した。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。Design Review の docs-only 作業でコード・設定・test・static data を変更していないため。
- Implementation / Test、実ブラウザ、localStorage migration、master data、画像・license、配備 origin、performance / release readiness: Not validated。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Treasure / Mob の v1、responsive、対象外、Specification 009 の直接上流および責任境界を理解できる。 |
| 2. コンテキストと責任 | PASS | Presentation、input pipeline、coordinator、Domain、route、master、Map UI、persistence の責務を分離する。 |
| 3. 依存方向 | PASS | Presentation → Application / Coordinator → Domain / Port を維持し、Treasure / Mob domain の相互依存を禁止する。 |
| 4. 主要フローと失敗 | PASS | registration、parser proposal、next / back、route、save / stale / migration failure の containment と非部分公開を定める。 |
| 5. 状態・データ所有 | PASS | canonical session、listSelection / currentTarget、route projection、undo、v3 snapshot、unresolved annotation、overlay の ownership が明確である。 |
| 6. セキュリティ・整合性・運用境界 | PASS | input / JSON / localStorage validation、HTML 非解釈、不要 logging / external communication の境界、write-before-publish を定める。 |
| 7. 上流整合性と工程境界 | PASS | Specification 009 の外部契約を変更せず、parser regex、CSS 実装、component、storage library、route algorithm は適切に下流へ委譲している。DR-014 は metadata のみ。 |
| 8. 下流実装可能性 | PASS | responsive、input normalization、canonical transition、registration workflow、route、persistence、undo、unresolved、Map UI projection の主要責務を推測なしに実装・検証できる。 |

Critical 0 / Major 0 / Minor 1。Critical の New / Open / Reopened はなく、design-review Skill の規則に従い最終 Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- DR-014 が解消されるまで、Design の Status / §2.1 / §16 は Specification Review 015 と Requirements Review 013 の承認状態を正確に示さない。ただし Design 本文、外部契約および実装可能性への影響はない。
- 実装が parser normalization を input pipeline に閉じ、Map UI を pure projection とし、write-before-publish、runtime-only undo、stale / route failure containment、unresolved non-fallback を維持するかは、後続 Implementation Review で検証する。
- data preparation、master / asset、配備 origin、実ブラウザ、performance および release readiness は本 Design Review の対象外である。

## 13. 自動変更

なし。Design、Specification、Requirements、Concept、Implementation、Test、既存 Review、設定、master data および画像は変更していない。本サイクルで作成した変更はこの Design Review artifact のみであり、commit / push は実施していない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 1（DR-014 metadata follow-up）。Design Revision 009 は Specification Revision 009 / Specification Review 015（`READY`）の responsive、parser normalization、町名ラベル geometry、Treasure / Mob 境界、責務・state ownership・transaction contract を実現可能な内部設計へ具体化しており、次の正式工程である現行 Implementation / Test の再レビューへ進める。
