# Design Review 007

## 1. レビュー対象

- Task ID: `TC-DESIGN-20260912-TREASURE-SPEC-UPDATE`
- 実行モード: `CREATE_AND_REVIEW` の Reviewer 再レビュー
- レビューサイクル: `007`
- 確認時点: 2026-09-13 Asia/Tokyo
- 対象成果物: [Design](../../design/design.md)。依頼上は Revision 006（前回レビュー後修正版）、文書の Status 行は Design Author Revision 007 と表記されている。対象は指定 SHA-256 `0dd0a7507c77ee7a45e450dd27d9aa9d8545072e64b83056baa16f5edc4fb65c` と一致する現在のファイル内容で一意に確定した。
- 直接の承認済み上流: [Specification](../../specification/specification.md) Revision 007、SHA-256 `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46`。[Specification Review 013](../specification/specification-review-013.md) の判定は `READY`。
- 前回レビュー: [Design Review 006](design-review-006.md)、SHA-256 `36093d077a07859c05671fc5c03e28265c63801338fff547065c088e4c67d641`。`DR-010` Critical、`DR-011` Major、`DR-012` Minor は New / Open から再確認した。
- 対象範囲: Design 全体。特に Treasure の連続主表示、登録入口、playlist、list selection / current target、player 操作、個別完了・取消、手動順序、保存失敗、v3 / legacy の exact recognition と世代別 migration、same-origin、master 未解決と構造破損、legacy resurrection、バージョン投影、既存 Mob / map / route / aetheryte / safety / state separation、工程境界、過剰設計、Implementation handoff および全追跡参照を確認した。
- 未確認範囲: 実装・テストの適合性、実ブラウザと localStorage の移行動作、実 master data と変換 report の正確性、画像内容・出典・利用条件、実配備 origin、性能および公開手順。これらは Design Review の対象外または後続工程の検証対象である。

## 2. 使用した根拠

- ユーザーの本依頼。対象 SHA、承認済み上流、前回 Finding の再確認条件、レビュー重点、出力・変更制約および確認時点の根拠とした。
- `design-review` Skill 全文、同 Skill の `reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`、ならびに review-common の `review-playbook.md` と `output-format.md`。独立確認、Finding 採用条件、Two-implementation test、重大度、Gate および14章形式を適用した。
- [Specification](../../specification/specification.md) Revision 007 と [Specification Review 013](../specification/specification-review-013.md)。Treasure player、v3 / legacy exact recognition、移行、保存原子性、既存 Mob / map / route / aetheryte / safety 契約の直接根拠とした。
- [Requirements](../../requirements/requirements.md)、[Requirements Review 011](../requirements/requirements-review-011.md)、[Concept](../../concept/concept.md)、[Concept Review 005](../concept/concept-review-005.md)。既存 Treasure の継続、状態分離、手動順序、移行互換性および責任境界の意図を確認した。
- [Design](../../design/design.md) の全節。責務、依存方向、state / data ownership、主要 flow、failure / recovery、persistence、migration、security、運用および Implementation handoff を評価した。
- [Design Review 006](design-review-006.md)。Author の自己評価には用いず、`DR-010`〜`DR-012` の履歴、重大度、状態および再確認条件だけを引き継いだ。
- README、現行 Treasure の `GRADE_CONFIG`、型、persistence、store、関連 unit test および master-data の schema / validator は、現行 v2 state、grade 対応、localStorage と master 境界の実現可能性・回帰を確認する補助資料としてのみ参照した。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。`DR-010`、`DR-011`、`DR-012` はすべて Resolved。Critical の New / Open / Reopened はなく、新規 Finding もないため、`review-gates.md` に従い Gate は `READY` とする。

## 4. 総評

指定 SHA の Design は、前回の三件を Design の抽象度で解消している。v2 完全 state は、存在して v3 に表現できる完了、playlist 順、手動／自動区分および map 別現在地点を世代別 policy で保持し、v1 系・統合 v1・separate keys に存在しない意味だけを既定化する。legacy lookup の一件でも未解決なら全体拒否し、v3 の write、publish、legacy cleanup の順序、旧保存保持、same-origin および v3 marker による復活防止も維持している。

Treasure player は `nextUndoChain` と phase の owner、成功 publish 後だけの更新、連続 next の積み上げ、no-op next の維持、back の一件ずつの消費、back 後の next と他の成功状態変更による失効を一つの lifecycle として定義した。map master、validator、変換、route input および handoff も、料金・ロード時間を保持・検証・要求しない方針で一致する。

Treasure の連続主表示、同格登録入口、playlist、selection / current target の独立所有、個別完了・取消、手動順序、保存失敗時の非部分適用、G8〜G18 の投影に回帰はない。Mob、共通 map projection、route、aetheryte overlay、入力・保存 trust boundary、state separation および Implementation handoff も、承認済み Specification を変更せず実装可能な責務・境界を保っている。

## 5. 指摘事項

なし。

## 6. 解消済み指摘

### DR-010 — 旧 v2 の既存進捗・手動順序・現在地点を一律初期化する — Critical — Resolved

- **対象箇所**: Design §8.4、§12、§14。
- **確認事実**: legacy source ごとの migration policy が分離され、v2 `schemaVersion: 2` は route の `orderNo`、各 step の `isCompleted`、`isManualSort`、`currentMapPoints` を、それぞれ playlist order、completed、order mode、mapCurrentLocations へ写す。route にない occupied member も失わず末尾へ加え、v2 route が存在する場合は再計算で置換しない。
- **上流根拠**: Specification §9.1.1〜§9.2、`SPC-AC-014`、`SPC-AC-017`、`REQ-Q-002`。
- **再確認結果**: PASS。v2 で表現可能な意味は保持される。v2 `schemaVersion: 1`、統合 v1、separate keys では、そこに存在しない completed、playlist、order mode、mapCurrentLocations、selection、current target、undo chain だけを既定化する。各実使用参照の lookup が一件でも未知・曖昧・表現不能なら全体拒否し、v3 write 前は旧保存を変更せず、write と publish の成功後だけ cleanup を試みる。cleanup 失敗時も v3 marker を優先し、全消去は空 v3 snapshot を残すため legacy resurrection を起こさない。

### DR-011 — 連続した「次へ」の undo chain 保持規則が内部で競合する — Major — Resolved

- **対象箇所**: Design §7.2、§8.1、§10.3、§12、§14。
- **確認事実**: coordinator が保存外の `nextUndoChain` と `next | back` phase を所有する。成功した next は phase が `next` なら既存 chain に frame を積み、初回または back 後なら残存 chain を破棄して新 chain を開始する。成功した back は直近 frame を一件だけ消費し、残存 frame は続く back で一件ずつ消費できる。
- **上流根拠**: Specification §4.3.1、`SPC-AC-028`、`REQ-T-007`。
- **再確認結果**: PASS。`next → next → back → back` と `next → next → back → next` の結果が明示され、no-op next、保存失敗、route failure、stale result は chain / phase を維持する。selection、play、登録変更、地点更新、削除、並べ替え、個別完了・取消等の別の成功状態変更は publish 後に失効させる。chain 更新は保存成功・publish 後だけであり、reload / serialize 対象外も維持する。

### DR-012 — 未使用の料金・ロード時間を master へ追加する設計と禁止する引継ぎが矛盾する — Minor — Resolved

- **対象箇所**: Design §2.2、§4.1〜§4.2、§5.2、§6.1、§9.1〜§9.2、§14。
- **確認事実**: map master の構造例から `travelEdges`、`fee`、`loadTime` が除去され、意味 record、validator、source、data preparation の対象にも残っていない。現行 JSON の `time` は変換せず、route planner の入力・採用条件・warning・failure・評価軸にも料金・ロード時間を含めない。
- **上流根拠**: Specification §6.2、§10.1、`SPC-AC-008`、`REQ-R-001`。
- **再確認結果**: PASS。v1 route master、schema、validator、data preparation、route flow および Implementation / Test handoff は、料金・ロード時間を保持・検証・要求しない方針で一意に整合する。

### DR-001〜DR-009 — Resolved 継続確認

- `DR-001`〜`DR-004` の旧 scope、`DR-005` の same-origin、`DR-006` の route result / stale 排除、`DR-007` の master source / license、`DR-008` の package 名・配置、`DR-009` の追跡参照は再発していない。
- §15 の参照先は現在の Design / Specification の実在節へ追跡できる。

## 7. 上流へのフィードバック

なし。Specification Revision 007 は本レビューに必要な外部結果を定めており、Design で補完すべき Specification gap または Requirements / Concept の Upstream ambiguity は確認しなかった。

## 8. 保留した指摘

正式な Deferred finding はなし。v3 / legacy decoder の具体コード、registration ID の生成、route algorithm、test fixture、UI component、実 migration、実 origin、Mob master、画像・source・license および静的データの正確性は Implementation / Test または data preparation gate の検証事項であり、Design Finding にはしない。

## 9. 対象範囲と追跡

| 確認対象                                                       | 上流根拠                                                   | Design                                     | 判定                    |
| -------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Treasure 連続主表示、同格登録入口、登録後の復帰                | Specification §3.2、§4.1〜§4.2、`SPC-AC-003`、`SPC-AC-027` | §1.1、§3.1〜§3.2、§7.1〜§7.2、§10.2、§11.1 | PASS                    |
| playlist、selection / current target 分離、個別完了・取消      | Specification §2、§4.3〜§4.3.1、`SPC-AC-011`、`SPC-AC-028` | §7.1〜§7.2、§8.1〜§8.3、§9、§10.3          | PASS                    |
| 再生、next、no-op next、back、連続取消                         | Specification §4.3.1、`REQ-T-007`、`SPC-AC-028`            | §7.2、§8.1、§10.3、§12、§14                | PASS（DR-011 Resolved） |
| 手動順序、追加・更新・削除                                     | Specification §4.2〜§4.3.1、§7、`SPC-AC-004`、`SPC-AC-031` | §7.2、§9.3、§10.2〜§10.3                   | PASS                    |
| 保存失敗と一操作の非部分適用                                   | Specification §4.2〜§4.3.1、§9.3、`SPC-AC-021`             | §8.1、§10.2〜§10.3、§12                    | PASS                    |
| v3 exact envelope、構造破損 / master 未解決の分離              | Specification §9.1.1〜§9.3、`SPC-AC-014`、`SPC-AC-017`     | §7.2、§8.1〜§8.3、§12                      | PASS                    |
| v2 / integrated v1 / separate exact recognition と優先順位     | Specification §9.1.1〜§9.2                                 | §3.2、§8.3〜§8.4、§12                      | PASS                    |
| generation 別 migration、意味保持、lookup 全体拒否             | Specification §9.1.1〜§9.2、`REQ-Q-002`                    | §8.4、§12、§14                             | PASS（DR-010 Resolved） |
| same-origin、write-before-publish、cleanup、resurrection 防止  | Specification §9.2〜§9.4、`REQ-Q-002`                      | §1.1、§3.3、§8.1、§8.4〜§8.5、§12          | PASS                    |
| G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17/G18→7.x と内部値分離    | Specification §4.3、§9.2、`SPC-AC-029`                     | §1.1、§2.2、§4.3、§7.2、§8.2、§8.4         | PASS                    |
| Mob / map / route / aetheryte / safety / state separation 回帰 | Specification §3、§5〜§10、`SPC-AC-001`〜`SPC-AC-025`      | §3〜§13                                    | PASS                    |
| route master の fee / loadTime 非保持・非評価                  | Specification §6.2、§10.1、`SPC-AC-008`                    | §2.2、§4.2、§5.2、§6.1、§9.1〜§9.2、§14    | PASS（DR-012 Resolved） |
| 工程境界、過剰設計、Implementation / Test handoff              | Specification §13                                          | §1〜§2、§13〜§16                           | PASS                    |
| 全追跡参照                                                     | Specification §14、Design §15                              | §15                                        | PASS                    |

### Review Board の独立確認

- Reviewer A（構造と責務）: app、presentation、input pipeline、coordinator、domain、route planner、master adapter、Map UI / overlay、persistence adapter の責務と依存方向を確認した。Treasure aggregate と保存外 interaction state の owner は分離され、generation 別 migration の変換責任も一意である。
- Reviewer B（Security）: static JSON、localStorage、利用者入力の trust boundary、exact decoder、allow-list validation、same-origin、構造破損、master 未解決、write-before-publish、cleanup failure、HTML 非解釈、ログ抑制および failure isolation を確認した。legacy lookup と移行失敗は fail-closed であり、旧保存の integrity を維持する。
- Reviewer C（フローと運用）: 起動、登録、player、route、保存、復元、世代別移行、全消去、master 更新を確認した。next / back lifecycle、保存失敗、stale calculation、cleanup failure と legacy resurrection の責任境界は成立する。
- Reviewer D（追跡と下流実装可能性）: Specification Revision 007、Review 013、Requirements / Concept、Design 全節、既存 Finding、§15 の参照および handoff を確認した。実装者は migration semantics、chain lifecycle または route master scope を推測せず、内部コード構造だけを選択できる。
- Chair: 候補を独立に再確認し、上流問題、Implementation detail、対象外および好みの architecture を正式 Finding に混在させていない。

### Two-implementation test

| ケース                                    | 実装上許容される差                                               | 両実装が維持する結果                                                                                   | 判定 |
| ----------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---- |
| v2 完全 state の移行                      | decoder、変換関数、registration ID の具体構造が異なる            | v2 の完了、playlist、manual / auto、mapCurrentLocations を保持し、一件でも lookup 不能なら全体拒否する | PASS |
| v1 系 legacy の移行                       | route planner と deterministic slot-order 構築の内部構成が異なる | source に存在しない意味だけを既定化し、selection / target / chain は作らない                           | PASS |
| next / back chain                         | reducer、stack 表現、coordinator 分割が異なる                    | next→next を積み、back を一件ずつ消費し、no-op を維持し、back 後の next は旧 chain を失効させる        | PASS |
| v3 structural failure / master unresolved | decoder と reconcile の内部構成が異なる                          | 構造破損は root 全体拒否、構造有効な master 未解決は保持・経路除外とする                               | PASS |
| v3 write / publish / cleanup              | persistence port と adapter の内部方式が異なる                   | write 成功後だけ publish、その後 cleanup。cleanup 失敗でも v3 を優先する                               | PASS |
| version projection                        | table、value object、projection の実装構造が異なる               | 利用者表示は 3.x〜7.x、G17 / G18 の内部参照は区別し、legacy 値を表示変更だけで破棄しない               | PASS |
| Treasure player / selection               | state reducer や coordinator の分割が異なる                      | selection と current target を独立所有し、play / next / 個別完了・取消の外部結果を維持する             | PASS |
| route master                              | schema validator と route input builder の内部構造が異なる       | fee / loadTime を field、validation、data preparation、route input の対象にしない                      | PASS |

## 10. 検証結果

- 対象 Design SHA-256: `0dd0a7507c77ee7a45e450dd27d9aa9d8545072e64b83056baa16f5edc4fb65c`。指定値と一致した。
- 承認済み Specification SHA-256: `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46`。指定値と一致した。
- Design Review 006 SHA-256: `36093d077a07859c05671fc5c03e28265c63801338fff547065c088e4c67d641`。指定値と一致した。作成前後で再確認し、既存レビュー資料を変更していない。
- Specification Review 013 の判定 `READY` を確認した。
- Design の全見出し、表、code fence、相対リンク、§15 の参照先、および本レビューの14章構成を確認した。
- `git diff --check`: PASS。
- Markdown formatting check: PASS。
- 相対 Markdown link existence check: PASS。
- 差分状態: 新規作成した `docs/reviews/design/design-review-007.md` 以外に、本レビュー開始前から `docs/design/design.md` の変更と `docs/reviews/design/design-review-006.md` の未追跡状態が存在する。対象 Design、上流文書、既存レビュー、README、コード、テスト、データ、画像は本レビューで変更していない。
- `pnpm lint`: SKIPPED / NOT APPLICABLE。docs-only review のためアプリ検証は対象外。
- `pnpm test`: SKIPPED / NOT APPLICABLE。docs-only review のためアプリ検証は対象外。
- `pnpm run build`: SKIPPED / NOT APPLICABLE。docs-only review のためアプリ検証は対象外。
- Not validated: 実装適合性、unit test、ブラウザ、実 localStorage 移行、実 master data、画像実内容・license、実配備 origin、性能および公開手順。

## 11. レビューゲート

| Gate                              | 判定 | 根拠                                                                                                                                                              |
| --------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 目的と範囲                     | PASS | 指定 SHA で対象を一意に確定でき、Revision 007 の Specification、対象、対象外、既存 Treasure 継続と Mob / map 範囲を識別できる                                     |
| 2. コンテキストと責任             | PASS | app、domain、input pipeline、coordinator、master、route、Map UI、storage、browser origin の責務を分離している                                                     |
| 3. 依存方向                       | PASS | presentation → application → domain / port、app 間非依存、Map UI event と persistence boundary が成立する                                                         |
| 4. 主要フローと失敗               | PASS | 登録、player、route、保存、復元、世代別移行、cleanup、全消去と各失敗結果を一意に実現できる                                                                        |
| 5. 状態・データ所有               | PASS | Treasure / Mob roots、selection / target、playlist、mapCurrentLocations、保存外 undo chain、master projection の owner と lifecycle が明確である                  |
| 6. セキュリティ・整合性・運用境界 | PASS | exact decode、same-origin、全体拒否、write-before-publish、stale 排除、cleanup failure、復活防止、HTML 非解釈が上流契約に沿う                                     |
| 7. 上流整合性と工程境界           | PASS | Specification の外部契約を変更・弱化・拡張せず、fee / loadTime 等の不要な scope を持ち込んでいない                                                                |
| 8. 下流実装可能性                 | PASS | migration semantics、interaction lifecycle、state owner、atomicity、failure / recovery と handoff が十分で、具体コードだけを Implementation / Test に委譲している |

Critical の New / Open / Reopened は 0 件であるため、最終 Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- 依頼上の対象版名は Revision 006、指定 SHA の文書内 Status は Revision 007 である。対象内容は SHA で一意に確定しており Gate には影響しないが、履歴参照では SHA と文書内 Revision を併記する。
- 具体的 URL と配備先は意図的に未決定だが、Treasure の same-origin 制約を満たす必要がある。
- Mob master、画像 source / license、configured dataset の背景画像除去、migration report および stable ID 対応表は未検証であり、data preparation gate を通るまで production data として扱えない。
- exact code、package 内部 file、algorithm、UI component および test fixture は Implementation / Test の詳細である。

## 13. 自動変更

レビュー中は対象 Design、Specification、Requirements、Concept、README、MEMORY、コード、テスト、静的データ、画像および既存レビューを変更していない。本サイクルで新規作成したのは `docs/reviews/design/design-review-007.md` だけである。commit / push は実施していない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。`DR-010`〜`DR-012` は Resolved であり、新規 Finding はない。指定 SHA の Design は承認済み Specification Revision 007 に対する責務、依存、ownership、migration、failure / recovery、security boundary および Implementation handoff を満たし、Implementation / Test へ引き渡し可能である。
