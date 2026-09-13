# Treasure Compass / Mob Compass Design Review 006

## 1. レビュー対象

- Task ID: `TC-DESIGN-20260912-TREASURE-SPEC-UPDATE`
- 実行モード: `CREATE_AND_REVIEW` Reviewer フェーズ
- レビューサイクル: 006
- 対象フェーズ: Design
- 確認日: 2026-09-12（Asia/Tokyo）
- ブランチ: `maintenance/add-mob-compass`
- レビュー開始時 HEAD: `0daa77eae45fe558716dca752d2af8351fccb71b`
- 対象成果物: `docs/design/design.md` Revision 006
- 対象 Design SHA-256: `1bbc9917ac36b9ede6d56d2d4abdb4929b92220602752d482f8c50b5c00c8a18`
- 承認済み Specification: `docs/specification/specification.md` Revision 007、SHA-256 `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46`
- Specification Review 013: SHA-256 `5b97e2791f0e9068b9f7de2f67c5fb0445f70d24a0ac4e5b35b3eab934257ce0`、判定 `READY`
- 前回レビュー: [Design Review 005](design-review-005.md)、対象 Design SHA-256 `83ae38aec491f294348663af4138c1c976851357e0f53b9393eda5ec42069d02`、判定 `READY`
- 対象範囲: Design 全文。特に Treasure の連続主表示、同格登録入口、登録後の復帰、playlist、`listSelection` と `currentTarget`、再生／次へ／戻る、個別完了・取消、手動順序、v3 と legacy 保存、same-origin、write-before-publish、cleanup、master 未解決、grade/version projection、既存 Mob / map / route / aetheryte / safety / state separation の回帰、工程境界、過剰設計、Implementation handoff および追跡参照を確認した。
- 未確認範囲: 実装適合性、テスト実行、ブラウザ挙動、実 localStorage 移行、実配備 origin、静的 master の正確性・完全性、画像内容・出典・利用条件、性能および公開手順。下流コードとテストは旧 v2 形式の実在性を確認する補助資料に限定し、上流契約を逆生成していない。
- レビュー開始時の既存変更: `docs/design/design.md` の変更だけを検出した。指定されたレビュー対象として読み取り専用で扱い、修正・ステージしていない。

## 2. 使用した根拠

- ユーザー指定。対象版、SHA-256、重点観点、変更禁止範囲、新規レビュー資料のみの作成、docs-only 検証および commit 禁止を適用した。
- `AGENTS.md`。Source of Truth、工程境界、既存変更の保全、静的 JSON / localStorage の trust boundary、change-aware validation および Git 規約を適用した。
- `design-review` Skill 全文、同 Skill の `reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`、ならびに review-common の `review-playbook.md` と `output-format.md`。4観点の独立確認、Finding 採用条件、Two-implementation test、重大度、Gate および14章形式を適用した。
- [Specification](../../specification/specification.md) Revision 007 と [Specification Review 013](../specification/specification-review-013.md)。直接の承認済み上流として、Treasure player、v3 / legacy の exact 認識・移行、保存原子性、既存 Mob / map / route / aetheryte / safety 契約を確認した。
- [Requirements](../../requirements/requirements.md) と Requirements Review 011。`REQ-T-001`〜`REQ-T-007`、`REQ-L-001`〜`REQ-L-006`、`REQ-Q-002`、受け入れ条件および責任境界の補助根拠として確認した。
- [Concept](../../concept/concept.md) と Concept Review 005。目的、v1 scope、対象外および責任境界の補助根拠として確認した。
- [Design Review 001](design-review-001.md)〜[Design Review 005](design-review-005.md)。`DR-001`〜`DR-009` の履歴、重大度、状態および再発有無を確認した。
- `apps/treasure-compass/src/persistence/storage.ts`、`apps/treasure-compass/src/store/useAppStore.ts`、`apps/treasure-compass/tests/unit/persistence.test.ts`。旧 v2 が `route`、`isManualSort`、`activeStep`、`currentMapPoints` と完了状態を実際に保存する形式であることの補助確認にだけ使用した。

## 3. レビュー結果

**REVISE DESIGN**

Critical 1 / Major 1 / Minor 1。`DR-010`〜`DR-012` は New / Open である。Critical の `DR-010` があるため、`review-gates.md` に従い Gate は `REVISE DESIGN` とする。

## 4. 総評

Revision 006 は、Treasure の一つの aggregate と主表示 projection、同格の手動／一括登録入口、proposal lifecycle、`listSelection` と `currentTarget` の独立 ownership、player 操作、v3 snapshot、same-origin、write-before-publish、cleanup failure、legacy resurrection 防止、master 未解決と構造破損の分離、および G8〜G18 の version projection を広く設計へ反映している。既存 Mob / map / route / aetheryte / state separation の責務と一方向依存にも重大な回帰はない。

一方、旧 v2 完全状態の移行では、Design が認識・検証した既存の手動順序、完了およびマップ別現在地点を一律に捨て、全登録を未完了・自動順序・現在地点なしへ変換すると明記している。これは、旧保存に存在しない状態だけを初期化する Specification §9.2 と、既存保存を根拠なく破棄しない `REQ-Q-002` を弱化する。移行後に完了対象が未完了へ戻り、手動順序と再開地点が失われるため Critical とする。

また、`nextUndoChain` は連続した「次へ」を積む記述と、新しい「次へ」で旧 frame を破棄する記述が競合し、複数回の「戻る」の成立が実装判断で分岐する。map master についても、料金・ロード時間を追加しないという引継ぎと、それらを必須にする schema / validation が矛盾している。

## 5. 指摘事項

### DR-010 — 旧 v2 の既存進捗・手動順序・現在地点を一律初期化する — Critical — New / Open

- **対象箇所**: `docs/design/design.md:524-542`（特に §8.4 の 532、539〜540 行）、`docs/design/design.md:697-715`。
- **事実**: Design は v2 の `route`、`isManualSort`、`activeStep`、`currentMapPoints` を exact shape として検証する一方、player state 等へ転用しないとし、全 member を `completed=false`、`orderMode=auto`、`mapCurrentLocations=[]` で構築し直して旧 route の表示順と `isManualSort` をコピーしない。既存 v2 では route 要素の `isCompleted`、手動区分、route 順および `currentMapPoints` が保存されていることを補助資料でも確認した。
- **根拠**: Specification §9.1.1 は schemaVersion 2 の旧完全 state と `LegacyRouteStep.isCompleted`、`isManualSort`、`currentMapPoints` を認識対象として定める。§9.2 は、新たに必要な playlist、完了、選択、現在対象、現在地点が旧保存に存在しない場合にだけ未完了・自動・各参照なしを既定化し、認識対象旧保存を非破壊で v3 へ移行する。`SPC-AC-014`、`SPC-AC-017`、`REQ-L-001`〜`REQ-L-002`、`REQ-Q-002` も保存済み進捗・順序・現在地点と既存 Treasure の継続性を要求する。
- **問題**: schemaVersion 2 の旧完全 state に存在する進捗・手動順序・現在地点まで、「新 v3 field がない」場合と同じ既定値へ上書きするため、承認済み移行結果を実現しない。decoder が値を検証しても migration owner が意味を破棄する構造になっている。
- **影響**: 同じ有効な v2 保存から、Design どおり全対象を未完了・自動・初期地点なしへ戻す実装と、Specification どおり表現可能な既存状態を移行する実装が分岐する。前者では完了済み Treasure の再出現、手動順序の消失、保存地点からの再開不能が起き、既存利用者の非破壊移行を満たせない。
- **分類**: Design defect。外部移行結果は Specification で確定済みであり、Design の migration ownership / mapping がそれを弱化している。
- **最小修正**: legacy generation ごとの migration policy を分け、v2 に存在し v3 へ表現可能な順序区分、順序、完了およびマップ別現在地点を破棄しない責務を割り当てる。`listSelection`、`currentTarget`、取消履歴など旧保存に存在しない意味だけを Specification の既定値へする。変換後 snapshot の整合性、lookup 全体拒否、write-before-publish、旧保存保持および cleanup 順序は維持する。
- **再確認条件**: 少なくとも未完了／完了混在、手動／自動、複数 map current location を含む有効な schemaVersion 2 保存が、Specification §9.2 の意味を維持した v3 へ一意に移行されること。schemaVersion 1、統合 v1、separate keys では存在しない意味だけが既定化され、移行失敗時は旧保存が保持されること。

### DR-011 — 連続した「次へ」の undo chain 保持規則が内部で競合する — Major — New / Open

- **対象箇所**: `docs/design/design.md:413`、`docs/design/design.md:419-429`、`docs/design/design.md:481-483`、`docs/design/design.md:603-610`。
- **事実**: §7.2 は成功した「次へ」ごとに直前 frame を chain 先頭へ積み、「戻る」で一件ずつ取り出すとする一方、同じ段落で「戻るの連続中でない新しい『次へ』」は旧 frame を破棄して新しい chain を開始するとする。§8.1 と §10.3 は連続 next の旧 frame を破棄するか保持するかを明示せず、残った frame を連続取消に使う記述もある。
- **根拠**: Specification §4.3.1 と `SPC-AC-028`、`REQ-T-007` は、連続して成功した「次へ」による完了を「戻る」で一件ずつ取り消せることを定める。別の成功状態変更は chain を失効させるが、状態を変えない「次へ」は失効させない。
- **問題**: `next A → next B → back → back` について、二回目の next が A の frame を保持する実装と破棄する実装が Design 上成立し、二回目の back の結果が分岐する。さらに `next A → next B → back → next C` のように back 後に分岐する場合の残存 frame の扱いも一意でない。
- **影響**: Treasure player の主要操作で、取り消せる完了件数、current target、playlist、mapCurrentLocations および route の復元結果が実装ごとに異なる。保存外 interaction state の lifecycle と consistency responsibility を実装者が推測する必要がある。
- **分類**: Design defect。外部の連続取消結果は Specification で確定済みであり、interaction state owner の lifecycle が矛盾している。
- **最小修正**: 介在する成功状態変更がない連続 next では既存 frame を保持して新 frame を積むこと、back 後に新しい next へ分岐する場合および Specification が列挙する別の成功状態変更で残存 chain をどう失効させるかを、同じ lifecycle 規則として一意にする。保存対象外、write success 後だけ更新、no-op next では維持する既存境界は変えない。
- **再確認条件**: 連続 next の後に同数の back が一件ずつ元状態へ戻り、no-op next は chain を維持し、list selection / play / 登録変更 / 個別完了等の成功操作と back 後の新 next では Specification に沿う一意な chain になることを二実装で確認できる。

### DR-012 — 未使用の料金・ロード時間を master へ追加する設計と禁止する引継ぎが矛盾する — Minor — New / Open

- **対象箇所**: `docs/design/design.md:145-153`、`docs/design/design.md:190-226`、`docs/design/design.md:321-329`、`docs/design/design.md:695-715`。
- **事実**: map master の構造例は `travelEdges` に `fee` と `loadTime` を持たせ、有限値・単位・source 対応を検証対象にする。一方、Treasure を含む経路計算は両値を評価に使わず、§14 は「Treasureの料金・ロード時間はv1の評価対象外であり、masterへ追加しない」と明記する。
- **根拠**: Specification §6.2、`REQ-R-001` は料金・ロード時間を順序評価へ使用しない。Design 自身の §14 は master へ追加しないと決定している。過剰設計は承認済み契約または現在の設計問題へ追跡できる場合だけ許容される。
- **問題**: Implementation が schema 例と validator に従って未使用 field / catalog / validation を実装するか、引継ぎに従って除外するか一意でない。現在 scope で利用しないデータの収集・出典・単位管理も発生する。
- **影響**: 外部経路結果は直ちに変わらないが、master schema、validator、data preparation gate と実データ作成範囲が分岐し、不要な coupling と検証負担を持ち込む。
- **分類**: Design defect / 過剰設計。Specification gap ではなく、Design 内の schema と handoff の不整合である。
- **最小修正**: v1 で利用しない料金・ロード時間を map master と validation / data preparation から除くか、現在 scope で必要な正式根拠と責務へ追跡可能にし、§14 と一意に整合させる。将来用途だけを理由に保持しない。
- **再確認条件**: map master、validator、route input、data preparation、Implementation handoff が、料金・ロード時間を v1 で保持・検証するか否かについて矛盾せず、採用する全 field が現在の責務へ追跡できること。

## 6. 解消済み指摘

### DR-009 — Revision 005 の追跡表に旧節番号が残っている — Resolved

- §15 の全参照先は Revision 006 の実在見出しへ更新され、旧 `§6.3` は残っていない。
- Mob 登録は §10.5〜§10.6、名称・ローカライズは §4.2〜§4.3、§10.2、§10.4、§13〜§14へ追跡できる。PASS。

### DR-001〜DR-008 — Resolved 継続確認

- 初回 guide lifecycle 等の旧 scope に関する `DR-001`〜`DR-004` は過去レビューで Resolved であり、Revision 006 から再発していない。
- `DR-005` の same-origin、`DR-006` の route result / stale 排除、`DR-007` の master source / license、`DR-008` の package 名・配置の確定状態は維持されている。`DR-010`〜`DR-012` は別の根本原因であり、過去 Finding の Reopened にはしない。

## 7. 上流へのフィードバック

なし。旧保存の exact 形式と移行結果、連続した「戻る」、料金・ロード時間を評価しない外部契約は承認済み Specification / Requirements で確認できる。`DR-010`〜`DR-012` は Design の migration policy、interaction lifecycle および master schema / handoff の修正で解消でき、新しい外部契約を発明する必要はない。

## 8. 保留した指摘

正式な Deferred finding はなし。v3 / legacy decoder の具体コード、registration ID 生成、route algorithm、テスト fixture、UI component、実 migration 実行、実 origin、Mob master、画像・source・license および静的データの正確性は Implementation / Test または data preparation gate で検証する事項である。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Design | 判定 |
| --- | --- | --- | --- |
| Treasure 連続主表示、同格登録入口、登録後の復帰 | Specification §3.2、§4.1〜§4.2、`SPC-AC-003`、`SPC-AC-027` | §1.1、§3.1〜§3.2、§7.1〜§7.2、§10.2、§11.1 | PASS |
| playlist、selection / current target 分離、個別完了・取消 | Specification §2、§4.3〜§4.3.1、`SPC-AC-011`、`SPC-AC-028` | §7.1〜§7.2、§8.1〜§8.3、§9、§10.3 | PASS（undo chain は DR-011） |
| 再生、次へ、戻る、末尾・no-op | Specification §4.3.1、`REQ-T-007`、`SPC-AC-028` | §7.2、§8.1、§10.3、§12 | FAIL（DR-011） |
| 手動順序、追加・更新・削除 | Specification §4.2〜§4.3.1、§7、`SPC-AC-004`、`SPC-AC-031` | §7.2、§9.3、§10.2〜§10.3 | PASS |
| v3 exact envelope、structural failure / master unresolved | Specification §9.1.1〜§9.3、`SPC-AC-014`、`SPC-AC-017`、`SPC-AC-021` | §7.2、§8.1〜§8.3、§12 | PASS |
| v2 / integrated v1 / separate exact recognition、優先順位 | Specification §9.1.1〜§9.2 | §3.2、§8.3〜§8.4、§12 | PASS |
| legacy migration の意味保持、same-origin、write-before-publish、cleanup、resurrection 防止 | Specification §9.2〜§9.4、`REQ-Q-002` | §3.3、§8.1、§8.4〜§8.5、§12 | FAIL（DR-010。原子性・origin・cleanup 自体は PASS） |
| G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17/G18→7.x と内部値分離 | Specification §4.3、§9.2、`SPC-AC-029` | §1.1、§2.2、§4.3、§7.2、§8.2、§8.4 | PASS |
| Mob / map / route / aetheryte / safety / state separation 回帰 | Specification §3、§5〜§10、`SPC-AC-001`〜`SPC-AC-025` | §3〜§13 | PASS（未使用 master field は DR-012） |
| 工程境界、過剰設計、Implementation / Test handoff | Specification §13 | §1〜§2、§13〜§16 | FAIL（DR-010、DR-012） |
| 追跡表の参照先 | Specification §14、Design §15 | §15 | PASS（DR-009 Resolved） |

### Review Board の独立確認

- Reviewer A（構造と責務）: Treasure aggregate、input pipeline、coordinator、domain、route planner、master adapter、persistence adapter の責務と依存方向を確認した。v2 migration policy の意味破棄を `DR-010`、master schema と handoff の矛盾を `DR-012` とした。
- Reviewer B（Security）: static JSON、localStorage、exact decoder、same-origin、構造破損、master 未解決、write-before-publish、cleanup failure、HTML 非解釈、ログ抑制および failure isolation を確認した。legacy lookup の全体拒否と v3 marker は成立しているが、検証済み旧状態を意味的に破棄する integrity 問題を `DR-010` に統合した。
- Reviewer C（フローと運用）: 起動、登録、player、route、保存、復元、移行、全消去、master 更新を確認した。連続 next / back の lifecycle 競合を `DR-011` とし、移行の write / publish / cleanup 順序自体は成立すると確認した。
- Reviewer D（追跡と下流実装可能性）: Specification Revision 007、Review 013、Design 全節、既存 Finding、§15 の実在参照および Implementation handoff を確認した。`DR-010` は外部互換契約の弱化、`DR-011` は state lifecycle の推測、`DR-012` は内部 schema 範囲の不一致として採用した。
- Chair: 同じ根本原因を統合し、上流問題や Implementation detail を正式 Finding へ混在させていない。

### Two-implementation test

| ケース | 実装 A | 実装 B | 判定 |
| --- | --- | --- | --- |
| v2 完全 state の移行 | Design §8.4 に従い全登録を未完了・auto・現在地点なしへ初期化 | Specification §9.2 に従い表現可能な完了・manual order・現在地点を維持 | FAIL（DR-010。外部結果が分岐） |
| 連続 next の後の連続 back | next ごとの frame を保持して二件戻す | 新 next で旧 frame を破棄し一件しか戻せない | FAIL（DR-011。interaction lifecycle が分岐） |
| v3 structural failure / master unresolved | decoder と reconcile の内部構成が異なる | 構造破損は root 全体拒否、構造有効な master 未解決は保持・経路除外 | PASS |
| v3 write / publish / legacy cleanup | adapter の内部方式が異なる | write 成功後だけ publish、その後 cleanup。cleanup 失敗でも v3 優先 | PASS |
| version projection | mapping table / projection の実装構造が異なる | 利用者表示は 3.x〜7.x、内部 grade / legacy 値は表示変更だけで改変しない | PASS |
| Treasure player / selection | reducer や coordinator の分割が異なる | selection と target を独立所有し、play / next / 個別完了・取消の外部結果を維持 | PASS（undo chain lifecycle は DR-011） |
| map master の未使用負荷値 | schema 例どおり fee / loadTime を必須実装 | §14 どおり master へ追加しない | FAIL（DR-012。内部 schema と準備範囲が分岐） |

## 10. 検証結果

- 対象 Design SHA-256: `1bbc9917ac36b9ede6d56d2d4abdb4929b92220602752d482f8c50b5c00c8a18`。指定値と一致した。
- 承認済み Specification SHA-256: `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46`。指定値と一致した。
- Specification Review 013 SHA-256: `5b97e2791f0e9068b9f7de2f67c5fb0445f70d24a0ac4e5b35b3eab934257ce0`。指定値と一致し、判定 `READY` を確認した。
- Design Review 001〜005 の SHA-256、`DR-001`〜`DR-009` の履歴および状態を確認した。既存レビュー資料は変更していない。
- Design §15 に記載された節参照はすべて実在する。Design / review の Markdown 見出し、表、code fence、相対リンクおよび14章構成を確認した。
- `git diff --check`: レビュー資料作成前 PASS。作成後に再実行する。
- `pnpm lint`: SKIPPED / NOT APPLICABLE。docs-only review のためアプリ検証は対象外。
- `pnpm test`: SKIPPED / NOT APPLICABLE。docs-only review のためアプリ検証は対象外。
- `pnpm run build`: SKIPPED / NOT APPLICABLE。docs-only review のためアプリ検証は対象外。
- Not validated: 実装適合性、unit test、ブラウザ、実 localStorage 移行、実 master data、画像実内容・license、実配備 origin、性能および公開手順。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Revision 007、対象、対象外、連続 Treasure 体験および既存 Mob / map 範囲を識別できる |
| 2. コンテキストと責任 | PASS | app、domain、input pipeline、coordinator、master、route、storage、browser origin の責務を分離している |
| 3. 依存方向 | PASS | presentation → application → domain / port、app 間非依存、Map UI event 境界が成立する |
| 4. 主要フローと失敗 | FAIL | v2 migration の成功フローが旧進捗を失う `DR-010` により承認済み外部結果を実現しない。`DR-011` も player lifecycle の修正を要する |
| 5. 状態・データ所有 | FAIL | v2 から v3 へ移す既存完了・手動順序・現在地点の ownership / replacement が `DR-010` で不正。`nextUndoChain` lifecycle は `DR-011` で競合する |
| 6. セキュリティ・整合性・運用境界 | FAIL | exact decode、same-origin、write-before-publish、cleanup は成立するが、検証済み v2 状態の意味的 integrity を `DR-010` が失う |
| 7. 上流整合性と工程境界 | FAIL | `DR-010` が Specification §9.2 / `REQ-Q-002` を弱化し、`DR-012` は schema と handoff を矛盾させる |
| 8. 下流実装可能性 | FAIL | migration result を上流どおり実装できず、undo chain と master schema の選択も実装者の推測へ残る |

Critical の New / Open / Reopened が 1 件あるため、最終 Gate は `REVISE DESIGN` とする。

## 12. 残存リスクと未決定事項

- `DR-010`（Critical）、`DR-011`（Major）、`DR-012`（Minor）は New / Open である。
- `DR-010` 未解消では、有効な v2 保存を移行した利用者の完了、手動順序および保存済み現在地点が失われる。
- 具体的 URL と配備先は意図的に未決定だが、Treasure の same-origin 制約を満たす必要がある。
- Mob master、画像 source/license、configured dataset の背景画像除去、migration report および stable ID 対応表は未検証であり、data preparation gate を通るまで production data として扱えない。
- exact code、package 内部 file、algorithm、UI component および test fixture は Implementation / Test の詳細である。

## 13. 自動変更

レビュー中は対象 Design、Specification、Requirements、Concept、README、MEMORY、コード、テスト、静的データ、画像および既存レビューを変更していない。本サイクルで新規作成したのは `docs/reviews/design/design-review-006.md` だけである。commit / push は実施していない。

## 14. 最終判定

**REVISE DESIGN**

Critical 1 / Major 1 / Minor 1。`DR-010`〜`DR-012` は New / Open である。特に `DR-010` が旧 v2 の有効な進捗・手動順序・現在地点を失うため、Revision 006 は承認済み Specification の保存互換契約を満たさず、Design 修正と再レビューが必要である。
