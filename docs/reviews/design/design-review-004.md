# Treasure Compass / Mob Compass Design Review 004

## 1. レビュー対象

- レビューサイクル: 004（Design Review 003 指摘対応後の再レビュー）
- 対象フェーズ: Design
- 確認日: 2026-09-12（Asia/Tokyo）
- ブランチ: `maintenance/add-mob-compass`
- レビュー開始時 HEAD: `e1a8fda4496c03a4175d450465b08d119c9772a9`
- 対象成果物: `docs/design/design.md` の未コミット Revision 004
- 対象 Design SHA-256: `b2c0cdc417d60459236acd3b030589bc411a8b82c6aac86cb33b4305b29f621c`
- 前回レビュー: [Design Review 003](design-review-003.md)
- 対象範囲: Design 全文と DR-005〜DR-008 の修正。配備・保存移行、経路成功／失敗、master provenance、package 境界を重点確認し、責務、依存、状態、主要フロー、失敗、安全性、下流実装可能性の回帰も確認した。
- 未確認範囲: 実装、テスト、ブラウザ、実配備、static data・画像の実値と利用条件、Mob master、料金、ロード時間、migration report。これらは Design の成立性に必要な既存事実の照合を除き対象外とした。

## 2. 使用した根拠

- ユーザー判断。二つの別アプリ、モノレポ、共有地図基盤、具体的 URL の非決定、既存未使用データの非採用を確認した。
- `AGENTS.md`。Source of Truth、工程境界、既存変更の保全、静的 JSON と localStorage の扱い、docs-only validation、Git 規約を適用した。
- `design-review` Skill、design-review 固有の reviewers / gates / output / security checklist、および review-common。4 Reviewer 観点、Finding 採用条件、Two-implementation test、14章形式を適用した。
- [Specification](../../specification/specification.md) と [Specification Review 007](../specification/specification-review-007.md)。直接の承認済み上流として、旧 Treasure 互換性、補助情報不足時の経路、master と出典、別 app の外部契約を確認した。
- [Requirements](../../requirements/requirements.md)、[Requirements Review 007](../requirements/requirements-review-007.md)、[Concept](../../concept/concept.md)、[Concept Review 005](../concept/concept-review-005.md)。目的、scope、責任境界の補助確認に用いた。
- [Design Review 001](design-review-001.md)、[Design Review 002](design-review-002.md)、[Design Review 003](design-review-003.md)。DR-001〜DR-008 の履歴、重大度、解消条件を確認した。
- 現行 storage key と `GRADE_CONFIG` は移行可能性の補助資料としてのみ参照し、新しい Design requirement の根拠にはしていない。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。DR-005〜DR-008 はすべて `Resolved`。New / Open / Reopened finding はない。

## 4. 総評

Revision 004 は、運用中 Treasure と同じ browser origin へ Treasure entry を配備する制約を追加し、具体的 URL を固定せずに既存 localStorage 移行の到達性を閉じた。Mob entry はこの制約から分離され、別 app と独立保存の境界を維持している。

経路 planner は、第一評価だけで一意な場合の補助情報不足を warning 付き success とし、複数候補の Pareto 比較に補助値が必要な場合だけ failure とする。warning は同じ calculation result と revision で coordinator から presentation へ渡るため、採用経路と警告の不整合も生じない。

map、mob を含む全意味 record は、一件以上の `sourceIds` で共通 catalog へ対応し、未知・空・重複を Master adapter が拒否する。画像 license と情報 source も分離されている。workspace package 名・配置の確定状態も §3.1 と §16 で一致した。修正は Specification の既存契約を内部責務へ反映したもので、外部機能の追加や不要な構造はない。

## 5. 指摘事項

なし。

## 6. 解消済み指摘

### DR-005 — 旧 Treasure 保存へ到達する配備境界 — Resolved

- **対象**: Design §3.3、§8.4、§16。
- **確認結果**: v1 の Treasure entry は運用中 Treasure と同じ browser origin へ配備し、Persistence adapter が同 origin の旧 key を読み新 key へ書く。origin を変更する release は別の承認済み移行 boundary が追加されるまで禁止され、Mob entry は旧 Treasure 値を扱わない。
- **再確認**: path や entry 名が異なっても同 origin なら移行可能である。異なる origin は許可済み実装差ではなく、Design 変更を要する条件として一意になった。具体的 URL は未決定のままでよい。PASS。

### DR-006 — 補助情報不足時の route result — Resolved

- **対象**: Design §5.2、§9.1〜§9.2、§12、§14。
- **確認結果**: 第一評価で全体経路が一意なら、不足 edge と値種別を warning にした success を返す。第一評価後に複数候補が残り、Pareto 比較に必要な値が不足する場合だけ failure とし、部分比較を採用しない。Application は success と warning を同じ revision で採用して表示する。
- **再確認**: warning の破棄や failure への昇格を禁止し、failure 時は既存状態を維持するため、Specification §6.2 と §6.4 の両経路が成立する。PASS。

### DR-007 — master の意味情報と出典の対応 — Resolved

- **対象**: Design §4.2〜§4.4、§5.1、§6.2、§13〜§14。
- **確認結果**: expansion、map、aetheryte、travel edge、grade set、Treasure point、mob、mob candidate は、必須かつ一件以上の `sourceIds` で共通 `sources` catalog を参照する。map と mob の例にも field が追加され、Master adapter が cardinality と参照を検証する。
- **再確認**: 意味情報の source、画像の license、変換 report の役割が分離され、空・未知・重複 source を正常 record として採用しない。PASS。

### DR-008 — package 名・配置の確定状態 — Resolved

- **対象**: Design §3.1、§16。
- **確認結果**: §3.1 の workspace package 名・配置を確定 Design とし、Implementation へ委譲するのは各 package 内の source file、具体的 algorithm、UI component 分割であると §16 を揃えた。
- **再確認**: package 境界の確定／未決定について矛盾はない。PASS。

DR-001〜DR-004 は Design Review 002 で `Resolved` であり、今回の修正による再発はない。

## 7. 上流へのフィードバック

なし。DR-005〜DR-008 は承認済み Specification の変更を要さず、Design の配備、結果表現、data integrity、工程境界で解消されている。新しい Specification gap と Upstream ambiguity は確認しなかった。

## 8. 保留した指摘

正式な Deferred finding はなし。Mob master、料金、ロード時間、画像 license、legacy conversion report の実値確認は Design §6 と §14 の data preparation gate で扱う下流検証である。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Design | 判定 |
| --- | --- | --- | --- |
| 別 app、モノレポ、配備境界 | Specification §1、§13 | §1、§3、§16 | PASS。DR-005、DR-008 解消 |
| Treasure 登録・旧保存移行 | Specification §4、§9 | §6、§7.2、§8.2〜§8.5、§10.1 | PASS。same-origin と write-before-publish を分離 |
| Mob mode・登録・探索 | Specification §3、§5、§8 | §7.3〜§7.5、§10 | PASS |
| 自動・手動経路 | Specification §6〜§7 | §4.2、§5.2、§7.1、§9、§12 | PASS。DR-006 解消 |
| master schema・出典・移行 | Specification §10 | §2、§4〜§6、§13〜§14 | PASS。DR-007 解消 |
| state ownership・保存原子性 | Specification §8〜§9 | §7〜§8、§10.4 | PASS |
| smartphone / UI boundary | Specification §3、§11 | §3、§10〜§11 | PASS |
| security・failure isolation | Specification §6、§9〜§10 | §5、§8〜§9、§12 | PASS |
| downstream handoff | Specification §12〜§13 | §13〜§16 | PASS |

### Review Board の独立確認

- Reviewer A（構造と責務）: app、固有 domain、map core/UI、master-data の依存と確定 package 境界を確認した。DR-008 は解消、他の責務競合はなし。
- Reviewer B（Security）: static JSON、source/license、localStorage、HTML 表示、過大計算、部分復元、ログの境界を確認した。DR-007 は解消し、認証等の対象外機構は追加されていない。
- Reviewer C（フローと運用）: same-origin migration、route warning/failure、保存、復元、master 更新、取消、全消去を確認した。DR-005、DR-006 は解消、failure/recovery の回帰はなし。
- Reviewer D（追跡と下流実装可能性）: Specification 21適合条件と Design §15、DR-005〜DR-008 の解消条件を確認した。重大な判断を Implementation へ押し流す残りはなし。
- Chair: 各観点の候補を統合し、新規または Reopened finding は採用しなかった。

### Two-implementation test

| ケース | 合理的な実装差 | 共通して導ける結果 | 判定 |
| --- | --- | --- | --- |
| 旧 Treasure 初回移行 | decoder や state 構築方式が異なる | 同 origin の優先 keyを検証し、成功 write 後だけ新 state を公開 | PASS |
| 補助 edge 不足、第一評価は一意 | result の内部型が異なる | 経路と不足対象を warning 付き success として同時採用 | PASS |
| 補助 edge 不足、第一評価後に複数候補 | graph 探索方式が異なる | 部分比較を採用せず補助情報不足 failure | PASS |
| map/mob source 検証 | validator の実装方式が異なる | 一件以上の有効 source がない意味 record を採用しない | PASS |
| package 内部構成 | component / function 分割が異なる | 確定 workspace package と一方向依存を維持 | PASS |
| 保存 write failure | immutable candidate または rollback buffer | 操作前 current と最後の正常保存状態を維持 | PASS |

## 10. 検証結果

- 対象 Design SHA-256: `b2c0cdc417d60459236acd3b030589bc411a8b82c6aac86cb33b4305b29f621c`。レビュー中に対象 Design を変更していない。
- DR-005〜DR-008: 全件 `Resolved`。修正箇所と再確認条件を個別に照合した。
- 参照先: Specification、Specification Review 007、Requirements、Requirements Review 007、Concept、Concept Review 005、Design Review 001〜003、および Skill 資料の存在を確認した。
- Markdown: 見出し、表、code fence、相対リンク、レビュー構成を確認した。
- `git diff --check`: レビュー作成前 PASS。成果物作成後に再実行する。
- `pnpm lint`: SKIPPED。文書のみの変更で対象外。
- `pnpm test`: SKIPPED。文書のみの変更で対象外。
- `pnpm run build`: SKIPPED。文書のみの変更で対象外。
- Not validated: 実装、unit test、browser、実 master data、画像、配備、性能、migration 実行結果。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | 承認済み上流、対象、対象外、現行資産と移行範囲が明確 |
| 2. コンテキストと責任 | PASS | app、domain、master、storage、利用者、browser origin の責務を分離 |
| 3. 依存方向 | PASS | workspace package の一方向依存と app 間非依存を定義 |
| 4. 主要フローと失敗 | PASS | 起動、登録、経路、warning/failure、保存、復元、取消、全消去を定義 |
| 5. 状態・データ所有 | PASS | 三 session root、preference、visit/progress、undo、master/source、snapshot の owner を定義 |
| 6. セキュリティ・整合性・運用境界 | PASS | strict validation、source/license、same-origin、write-before-publish、stale 排除を定義 |
| 7. 上流整合性と工程境界 | PASS | Specification を変更せず、URL・実データ・コード詳細との境界を維持 |
| 8. 下流実装可能性 | PASS | Implementation が重大な ownership、consistency、migration、failure を推測せず進められる |

Critical の New / Open / Reopened は0件であるため、最終 Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- Design finding は残っていない。
- 具体的 URL と配備先は意図的に未決定だが、Treasure の same-origin 制約を満たす必要がある。
- Mob master、移動補助値、画像利用条件、変換 report は未検証であり、Design の data preparation gate を通るまで production data として扱えない。
- exact code、package 内部 file、route algorithm、UI component、test fixture は Implementation / Test の詳細である。

## 13. 自動変更

レビュー中は対象 Design、Specification、Requirements、Concept、コード、テスト、静的データ、画像、既存レビューを変更していない。本サイクルで新規作成したのは `docs/reviews/design/design-review-004.md` だけである。`MEMORY.md` の未コミット差分は Design Author による同期であり、本レビューによる変更ではない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。DR-005〜DR-008 はすべて `Resolved`、New / Open / Reopened finding はない。Revision 004 は承認済み Specification を実現でき、Implementation / Test へ進行可能である。
