# Treasure Compass / Mob Compass Specification Review 013

## 1. レビュー対象

- レビューサイクル: 013（Specification Revision 007、SR-025 / SR-027 再確認・全文回帰）
- 対象フェーズ: Specification
- 確認日: 2026-09-12（Asia/Tokyo）
- 対象成果物: `docs/specification/specification.md` Revision 007
- 対象版 / SHA-256（レビュー開始時）: `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46`
- 前回レビュー: `docs/reviews/specification/specification-review-012.md`、SHA-256 `439a5a1a83b0c87a90973b3461537c61611c1c37db08372ef9089cebed7a2ac2`
- 前段承認: Requirements Review 011（`READY`、Critical 0 / Major 0 / Minor 0）
- 対象範囲: SR-025 と SR-027 の再確認、SR-026 を含む解消済み指摘、Specification 全文の Requirements 追跡性、外部契約の完全性、two-implementation test、および Mob、地図、経路、エーテライト、安全性・互換性契約の回帰確認。
- 未確認範囲: 実装適合性、テスト、静的マスターデータ、画像、ブラウザ表示、実 localStorage、実配備 origin、マスターの正確性・完全性、出典・画像利用条件、外部サービス。

## 2. 使用した根拠

- 最新判断を記録した `MEMORY.md`: Treasure の連続プレイリスト、リスト選択／現在対象、再生・次へ・戻る、同格登録、必須名、混在バージョン、一括統合、保存・移行および同一 browser origin の判断を確認した。
- 承認済み Requirements: `docs/requirements/requirements.md` と Requirements Review 011。Requirement、Acceptance、Specification への明示的 handoff を判定基準とした。
- 承認済み Concept: `docs/concept/concept.md` と Concept Review 005。目的、利用者、v1、対象外、責任境界および成功状態を確認した。
- レビュー対象: `docs/specification/specification.md` Revision 007 全526行。
- 前回レビュー: Specification Review 012。SR-025 / SR-027 の Evidence、Required Change、再確認条件、および SR-026 の解消状態を確認した。
- 過去レビュー: Specification Review 001〜011。SR-001〜SR-026 の履歴と解消済み契約の回帰確認に使用した。
- 許可された互換性資料: `README.md` と既存 Treasure の保存境界・型・検証コード。既存利用者向け保存表現との互換確認に限定し、そこから新しい Requirement を作っていない。
- 作業規則: `AGENTS.md`、`spec-review` Skill、review-common の playbook / output format、spec-review の output format / gates / reviewers / security checklist。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。SR-025、SR-026、SR-027 は Resolved。New / Open / Reopened の finding はない。

## 4. 総評

Revision 007 は SR-025 の残存矛盾を解消した。リスト選択と現在対象が同じ、異なる、一方だけ存在する、両方 `null` の各状態について、現在対象または別対象を個別完了・取消した後の選択、現在対象、地図・案内、マップ別現在地点、順序、保存成功・失敗を一意に定めている。再生・次へ・戻る、削除・地点更新、保存・復元にも同じ二状態の意味が維持される。

SR-027 については、現行 v3 と認識対象の v2、統合 v1、separate keys の JSON object、field、必須／任意、JSON 型、値域、参照整合性、余分 field、優先順位、master 未解決、全体拒否、移行原子性および同一 origin が明示された。同じ保存入力に対する認識・拒否・診断・移行結果を二実装で一致させられ、decoder 等の内部方式は下流へ残している。

同格な手動／一括登録、必須メンバー名と同一性、3.x〜7.x 混在、利用者向け `Gxx` 不使用、行単位解決、部分反映、一括保存原子性、プレイリスト、末尾の次へ／戻る、手動順序および既存保存互換性は Requirements と一致する。既存 Mob、地図、経路、エーテライト、入力安全性、状態分離、保存失敗および全消去にも回帰は確認されなかった。

## 5. 指摘事項

現行版に対する正式な指摘事項はなし。

## 6. 解消済み指摘

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| SR-001〜SR-024 | Resolved（継続確認） | 入力・座標、状態 lifecycle、Mob、経路、順序、削除、マスター、エーテライト表示、決定性、安全性および相互運用契約に回帰はない。 |
| SR-025 | Resolved | §2、§4.3〜4.3.1、§9.1〜9.3、`SPC-AC-028` がリスト選択と現在対象を独立状態として扱う。特に個別完了・取消は、同一、異なる、一方のみ、両方 `null` の状態ごとに参照、前面表示、現在地点、保存成功・失敗を一意にする。 |
| SR-026 | Resolved（継続確認） | 最後の未完了対象への最初の「次へ」は完了・現在地点・全件完了を保存して「戻る」対象となり、その後の現在対象なし／全件完了での「次へ」は無操作で戻る可能状態を失効させない。 |
| SR-027 | Resolved | §9.1.1 は v3、v2、統合 v1、separate keys の exact JSON field、型・値域、参照、余分 field、優先順位を定める。§9.2 は master 未解決、移行全体拒否、旧保存保持、v3 優先、同一／異なる origin の結果を定め、§13 は外部契約を変えない decoder 等の内部方式だけを下流へ委譲する。 |

## 7. 上流へのフィードバック

なし。Requirements Review 011 は `READY` であり、Requirements と Concept の意味を変更する問題は確認されなかった。

## 8. 保留した指摘

- Design: 確定したリスト選択／現在対象、プレイヤー操作、v3 / legacy 保存、移行、Mob、経路、地図およびエーテライト契約を変えずに、内部状態所有、decoder、移行 marker、アルゴリズム、コンポーネントおよび配備構成を決める。
- Implementation / Test: 状態組合せ、末尾進行、保存失敗、v3 / legacy の正常・不正・余分 field・参照不整合・master 未解決・origin 条件、および既存 Mob / map 契約への適合を検証する。
- Documentation / Release: 実際の URL / origin、利用者向けバージョン、プレイヤー操作および保存移行条件を実装済み契約と照合する。
- 静的マスターと画像: データ正確性、T / R 境界、地図画像の埋め込み表示除去、出典および利用条件を後続で実査する。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Specification | 判定 |
| --- | --- | --- | --- |
| 同格登録、必須名、同一性、最大8件 | REQ-T-001、REQ-T-006、REQ-D-005、AC-026、AC-031 | §3.2、§4.1〜4.2、§12 | PASS |
| 連続プレイリスト、混在バージョン、`Gxx` 不使用 | REQ-T-002、REQ-T-004、REQ-D-003、REQ-Q-002、AC-027、AC-029 | §2〜§4、§9.2、§12 | PASS |
| 行単位解決、統合、部分反映、原子性 | REQ-T-005〜REQ-T-006、REQ-D-001、REQ-D-006、REQ-L-006、AC-030〜AC-031 | §4.2、§9.3、§12 | PASS |
| リスト選択、現在対象、個別完了・取消 | REQ-T-007、REQ-P-001〜REQ-P-002、REQ-D-003、AC-011、AC-028 | §2、§4.3〜4.3.1、§8、§9、§12 | PASS（SR-025 Resolved） |
| 末尾の次へ・戻る | REQ-T-007、REQ-P-001〜REQ-P-002、AC-028 | §4.3.1、§12 | PASS（SR-026 Resolved） |
| 保存、復元、破損、旧形式、移行、失敗 | REQ-L-001〜REQ-L-006、REQ-D-002、REQ-Q-002、AC-014、AC-017、AC-021 | §9、§12〜§13 | PASS（SR-027 Resolved） |
| Mob 登録・探索・削除・モード分離 | REQ-F-003〜REQ-F-004、REQ-M-001〜REQ-M-008、REQ-P-003〜REQ-P-005 | §3、§5、§8 | PASS |
| 地図、経路、手動順序、決定性、計算不能 | REQ-R-001〜REQ-R-008、REQ-A-001〜REQ-A-002 | §2、§5〜§7、§10 | PASS |
| エーテライト表示、T / R 境界、非操作性 | REQ-F-006〜REQ-F-008、REQ-A-003〜REQ-A-004 | §4.4、§10、§12 | PASS |
| 無効入力、安全性、状態分離、全消去 | REQ-D-001〜REQ-D-002、REQ-L-003〜REQ-L-006、REQ-S-001〜REQ-S-005 | §1.2、§3.1、§9〜§10 | PASS |
| Acceptance / Requirement Traceability | AC-001〜AC-031 | §12、§14 | PASS |

## 10. 検証結果

- 対象 SHA-256 `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46` と前回レビュー SHA-256 `439a5a1a83b0c87a90973b3461537c61611c1c37db08372ef9089cebed7a2ac2` は、レビュー開始時に指定値と一致した。
- Specification Revision 007 全526行、Requirements 全440行、Requirements Review 011、Concept、Concept Review 005、`MEMORY.md`、README、および Specification Review 001〜012 を確認した。
- Reviewer A: Requirement handoff、状態遷移、JSON 表現、境界、適合条件、Traceability と two-implementation test を確認し、SR-025 / SR-027 の解消を確認した。
- Reviewer B: プレイリスト、選択・再生・個別完了、末尾進行、登録、保存・移行、および既存 Mob / route / map の利用者可視結果を確認した。
- Reviewer C: 未信頼入力、exact JSON、unknown / malformed / duplicate / dangling、partial failure、原子性、master 未解決、version / migration、origin および fail-closed result を確認した。
- two-implementation test: リスト選択と現在対象の全組合せ、末尾操作、および同じ v3 / legacy 保存入力に対し、外部状態・表示・認識・拒否・診断・移行結果を一意に決定できる。内部方式だけが異なる二実装を許容する。
- Requirement ID 59件、Acceptance ID 31件、Specification Acceptance ID 31件を確認し、集合内の重複はない。
- 対象文書が参照する Requirements、Requirements Review 011、Concept、Concept Review 005、README、`MEMORY.md` の存在を確認した。
- 既存保存実装・型は v2、統合 v1、separate key と legacy point / member / route の補足整合確認に限定して参照した。実装を新しい Requirement の根拠にはしていない。
- `git diff --check`: PASS。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。docs-only review のためアプリ検証は対象外。
- 実装適合性、テスト、静的マスター、画像、ブラウザ挙動、実 localStorage、配備 origin、出典・ライセンス: Not validated。
- レビュー終端で対象、前回レビューおよび過去 Specification Review の SHA-256、変更・staged・untracked file を再確認する。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Treasure / Mob、連続プレイリスト、対象外、利用者および責任境界は上流と一致する。 |
| 2. 要件追跡と契約（handoff closure） | PASS | 状態、入力、結果、保存・互換性を含む Requirements の明示 handoff が閉じ、全 Acceptance を追跡できる。 |
| 3. 処理と例外 | PASS | 正常・失敗・境界、末尾、順序、破損・未解決・移行結果が一意である。 |
| 4. 内部整合性 | PASS | 選択／現在対象、完了・取消、保存 JSON、適合条件および下流引継ぎに解釈を分岐させる矛盾がない。 |
| 5. 検証可能性 | PASS | 同じ入力・状態に対する利用者可視結果と保存互換結果を第三者が独立して判定できる。 |
| 6. 安全性・信頼境界・相互運用性 | PASS | 不正・余分・重複・参照不能、部分失敗、保存境界、version、migration、origin および fail-closed result を判定できる。 |
| 7. 上流整合性と工程境界 | PASS | 外部契約を Specification で閉じ、decoder、内部状態所有、アルゴリズム、UI 部品等の実現方式だけを下流へ残している。 |

Critical 0 / Major 0 / Minor 0 のため、最終ゲートは `READY` とする。

## 12. 残存リスクと未決定事項

- Specification は次工程へ引き渡し可能だが、Design、実装、テスト、静的マスター、画像および実配備の適合性は未検証である。
- G18 の実データ範囲、具体的 URL、内部アルゴリズム、保存実装、legacy decoder およびコンポーネント構成は、確定済み外部契約を変えない下流判断として残る。
- Mob master、画像の出典・利用条件および実ブラウザ表示は後続確認が必要である。

## 13. 自動変更

なし。Specification、Review 012、Requirements、`MEMORY.md`、Concept、Design、実装、テスト、README、設定、画像および既存レビューは変更していない。本サイクルで新規作成した成果物は `docs/reviews/specification/specification-review-013.md` のみである。commit / push は実施していない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。SR-025、SR-026、SR-027 は Resolved。Requirements 全体への追跡と外部契約が閉じ、既存 Mob / map / route / aetheryte / safety / compatibility 契約に回帰はなく、Specification は Design へ引き渡し可能である。
