# Requirements Review 007: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 007（独立再レビュー）
- 対象フェーズ: Requirements
- 確認日: 2026-09-11（Asia/Tokyo）
- 対象版: `HEAD c12fec08e85c91fa53c666e9cfdeb27e0905e559` 上の未コミット作業ツリー
- Requirements SHA-256: `327e00a3d27d7d12e6dd64fe8843a8df43f2137c45ca27cee1025affc298d786`
- Concept SHA-256: `4c4fee80494928ddb28c6c2c7fe678536e918d0c9f87322cb12d827412e79a10`
- 対象成果物: `docs/requirements/requirements.md`
- 前回レビュー: `docs/reviews/requirements/requirements-review-006.md`
- 対象範囲: Concept 整合性、全 Requirement と Acceptance、RR-006〜RR-008 の解消、Traceability、品質・安全性、工程境界
- 未確認範囲: Specification、Design、実装、テスト、静的データ、画像、ブラウザ挙動、マスターデータの正確性・利用条件

## 2. 使用した根拠

- 最新のユーザー判断: Review 006 の修正推奨事項を修正すること。
- 承認済み上流成果物: `docs/concept/concept.md` および `docs/reviews/concept/concept-review-005.md`。
- レビュー対象: `docs/requirements/requirements.md` 全文。
- 前回レビュー: `docs/reviews/requirements/requirements-review-006.md` の RR-006、RR-007、RR-008 と再確認条件。
- 継続的な補助資料: `MEMORY.md`。正式文書の代替とせず、ユーザーが明示した詳細判断の確認に用いた。
- 既存 Treasure の利用者向け契約: `README.md`。既存能力の維持範囲だけを確認した。
- プロジェクト指針およびレビュー手順: `AGENTS.md`、`requirements-review` Skill、review-common、reviewers、review-gates、output-format、security-checklist。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。新規、Open、Reopened の Requirement-level Finding はない。RR-006、RR-007、RR-008 はすべて解消済みであり、Specification へ引き渡し可能である。

## 4. 総評

Requirements は、Treasure と Mob の別アプリ化、Mob のソロ／パーティ、ランク別登録、候補地点、最短経路、手動順序、進行・取消、保存・消去、スマートフォン対応、チャット解析の対象外という上流判断を、外部から確認可能な要求へ一貫して展開している。

今回の修正により、保存失敗時は利用者が失敗を識別でき、未保存変更を保存済みとして扱わず、最後に正常保存された状態を保持することが Requirement と Acceptance で保証された。両アプリで揃える地点選択、手動順序、完了・取消、確認付き全消去、現在地点・完了状態の識別も、対象固有の登録入口と区別して追跡可能になった。スマートフォン要件は、Mob 固有のモード切替と、両アプリに適用する主要操作を区別している。

正確な UI、入力構文、状態遷移、保存形式、同率経路、計算式、アルゴリズム、内部構造は後工程へ分離されている。Requirements で決めるべき外部結果を残したまま実現方式を先取りしておらず、工程境界も適切である。

## 5. 指摘事項

現行版に対する正式な指摘事項はなし。

## 6. 解消済み指摘

### RR-001 — Resolved（継続確認）

`REQ-R-001`、`REQ-R-002`、`AC-008` により、マップ間遷移を第一軸とし、同一マップの X/Y 距離を最小化する経路要求へ追跡できる。

### RR-002 — Resolved（継続確認）

`REQ-D-002`、`AC-017` により、空、不正、不完全、未知または参照不能な情報を正常状態として推測採用せず、誤った成功・ルート・進捗を防ぐ境界が維持されている。

### RR-003 — Resolved（継続確認）

`REQ-R-001` は、同じマップ間遷移回数の候補でテレポ料金とロード時間をいずれか一方へ常に優先させず、補助的な移動負荷として扱う判断を維持している。

### RR-004 / RR-005 — Superseded（継続確認）

Test Strategy、CI / GitHub Security、時点依存の脆弱性台帳に相当する製品 Requirement は現行版に再導入されていない。

### RR-006 — Resolved

`REQ-L-006` と `AC-021` により、保存失敗を利用者が識別でき、未保存変更を保存済みとして扱わず、最後に正常保存された状態を保持する外部結果が定義された。9.2 は正確な表示と状態遷移だけを Specification へ引き継ぎ、同 Requirement の保証を維持するよう明記している。

### RR-007 — Resolved

`REQ-F-005` と `AC-020` により、両アプリで同じ意味を持つ地点選択、手動順序、完了・取消、確認付き全消去、現在地点・完了状態の識別が、一貫した利用結果として要求された。対象固有の登録入口は維持し、正確な UI は Specification へ分離している。Traceability も同 Requirement と Acceptance を上流の共通操作価値へ対応させている。

### RR-008 — Resolved

`REQ-Q-001` と `AC-018` は、両アプリに適用する主要操作と、Mob だけに適用するソロ／パーティのモード切替を明示的に区別している。

## 7. 上流へのフィードバック

なし。Concept は Requirements と整合し、Specification へ引き渡せる粒度で確定している。

## 8. 保留した指摘

- モード切替、登録／巡回表示、候補地点選択、順序変更、完了・取消、確認付き消去の正確な画面配置、文言および操作は Specification で定義する。
- モブ名・別名検索、複数フィルタ、重複、状態遷移、同率経路、計算不能、保存形式、保存失敗の表示、旧保存データ、破損データの正確な契約は Specification へ引き継ぐ。
- 経路算出アルゴリズム、状態所有、保存技術、ビルド入口、公開先および共有コード構成は Design の責務である。
- 実装、テスト、静的データ、画像、外部資料の正確性・利用条件は本レビューでは検証していない。

## 9. 対象範囲と追跡

| 根拠 | 対応 Requirements | 対応 Acceptance | 判定 |
| --- | --- | --- | --- |
| Concept 1、4: 別アプリ・別状態・ソロ／パーティ | `REQ-F-001`–`REQ-F-004`, `REQ-L-001`–`REQ-L-005` | `AC-001`, `AC-002`, `AC-014`, `AC-015` | 整合 |
| Concept 1、2、3、5、6: 共通操作感 | `REQ-F-005` | `AC-020` | 整合。RR-007 解消 |
| Concept 2、3: Treasure と Mob の代表利用 | `REQ-T-001`–`REQ-T-003`, `REQ-M-001`–`REQ-M-008` | `AC-003`–`AC-007` | 整合 |
| Concept 1、3、4: 最短経路と手動順序 | `REQ-R-001`–`REQ-R-008` | `AC-004`, `AC-008`–`AC-010` | 整合 |
| Concept 3、5、6: 進行と訂正 | `REQ-P-001`–`REQ-P-005` | `AC-011`–`AC-013` | 整合 |
| Concept 4、6、7: 保存・復元・消去・保存失敗 | `REQ-L-001`–`REQ-L-006`, `REQ-D-002` | `AC-014`, `AC-015`, `AC-017`, `AC-021` | 整合。RR-006 解消 |
| Concept 4、6: スマートフォン | `REQ-Q-001` | `AC-018` | 整合。RR-008 解消 |
| Concept 4、5: 対象外・責任境界 | `REQ-S-001`–`REQ-S-005` | `AC-019` | 整合 |

## 10. 検証結果

- Requirement 定義 ID 47件に重複がないことを確認した。
- 47件すべての Requirement が少なくとも1件の Acceptance から参照されていることを確認した。
- Acceptance ID 21件に重複がないことを確認した。
- 旧方針である全ランク一律扱い、チャット案内取込、別リーダーによる管理継続が現行 Requirements に残っていないことを確認した。
- Concept、Concept Review 005、MEMORY、README の相対リンクと参照先の存在を確認した。
- `git diff --check`: PASS。
- Requirements、Concept、MEMORY、README、下流文書、コード、テスト、設定は変更していない。作成した変更は本レビュー成果物のみ。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。docs-only の Requirements Review であり、アプリコード変更がないため対象外。
- 実装、テスト、静的データ、画像、ブラウザ挙動、マスターデータの正確性・利用条件: Not validated。レビュー対象外である。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | PASS | 最新 Concept の別アプリ、ソロ／パーティ、最短経路、共通操作、進行・訂正、対象外を反映している。 |
| 2. 要求完全性 | PASS | v1 の主要能力と、保存失敗を含む必要な外部結果が定義されている。 |
| 3. 外部観測可能性 | PASS | 登録、順序、進行、保存・失敗、消去、共通操作の結果を Acceptance から判断できる。 |
| 4. 責任・境界 | PASS | 利用者、リーダー、参加者、管理者、ゲーム・チャットとの境界が明確である。 |
| 5. 品質・安全性 | PASS | 不正・未知情報の誤採用防止、状態分離、保存失敗時の完全性が定義されている。 |
| 6. Acceptance | PASS | 全 Requirement が Acceptance から参照され、主要能力の成立を外部から判定できる。 |
| 7. 工程境界 | PASS | 正確な UI、状態遷移、形式、アルゴリズム、内部構造を後工程へ分離している。 |
| 8. 未決定事項 | PASS | Requirements で決めた外部判断と Specification / Design への引継ぎを分離している。 |

## 12. 残存リスクと未決定事項

- パーティの候補地点登録 UI は暫定案であり、要件を満たす正確な外部操作は Specification で再確認する。
- 経路の同率時、計算不能時、保存互換性、破損時および保存失敗時の正確な表示・状態遷移は Specification で定義する必要がある。
- 実現方式と実装適合性は未確認であり、後続工程で別途評価する必要がある。

## 13. 自動変更

なし。Reviewer は Requirements、Concept、MEMORY、README、Specification、Design、コード、テストおよび設定を変更していない。本サイクルで新規作成した成果物は `docs/reviews/requirements/requirements-review-007.md` のみである。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。RR-006、RR-007、RR-008 は解消済みであり、Requirements は Specification へ引き渡し可能である。
