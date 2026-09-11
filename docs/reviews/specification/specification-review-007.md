# Treasure Compass / Mob Compass Specification Review 007

## 1. レビュー対象

- レビューサイクル: 007（修正後の独立再レビュー）
- 対象フェーズ: Specification
- 確認日: 2026-09-11（Asia/Tokyo）
- ブランチ: `maintenance/add-mob-compass`
- レビュー開始時 HEAD: `abc223557ccbe14057b91d3a96a0c77a310b73e7`
- 対象成果物: `docs/specification/specification.md` の未コミット修正版
- 対象 Specification SHA-256: `d704c04a0598ae228cb6af85879e69c177efdba0ef76ee2017a406d1df7112ea`
- 前回レビュー: `docs/reviews/specification/specification-review-006.md`
- レビュー範囲: Specification 全文、SR-019〜SR-023 の修正、Requirements handoff、two-implementation test、工程境界。
- 未確認範囲: Design、実装、テスト、静的データ、画像、ブラウザ実行、マスターデータの正確性・利用条件。

## 2. 使用した根拠

- 最新ユーザー判断: パーティ A モブ以上の地図ダイアログ選択・即時登録、別アプリ、モノレポ、具体的 URL は現工程で未決定。
- 承認済み上流: `docs/requirements/requirements.md`、`docs/reviews/requirements/requirements-review-007.md`、`docs/concept/concept.md`、`docs/reviews/concept/concept-review-005.md`。
- レビュー対象: 修正後の `docs/specification/specification.md` 全文。
- 前回レビュー: `docs/reviews/specification/specification-review-006.md` の SR-019〜SR-023 と再確認条件。
- 既存 Treasure の互換性: `README.md` と以前の正式仕様にある入力契約。新しい要求の根拠にはしていない。
- 作業・レビュー規律: `AGENTS.md`、`spec-review` Skill、review-common、review-gates、output-format、reviewers、security-checklist。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。SR-019〜SR-023 はすべて解消済みであり、New / Open / Reopened finding はない。

## 4. 総評

修正版は、マップ間遷移を第一評価、料金とロード時間を非加重の補助評価、X/Y 距離をマップ内評価とする上流判断を維持しながら、同率候補の表示と決定的な採用順を定めた。初回を自動順序とし、手動順序中の一般モブは既存末尾または対象マップのエーテライトから追加距離が最小の一地点を固定するため、自動計算を押すまで既存順序・採用地点を変えない契約も一意である。

Mob の対象単位削除、Treasure の未完了訂正と完了済み枠の置換、チャット指定記号、曖昧行、地図別 X/Y 有効範囲、エーテライト必須条件も外部から検証可能になった。別アプリとしての外部境界を定めつつ、モノレポ、共有地図基盤、具体的 URL、保存技術および探索アルゴリズムは Design へ残しており、工程境界も適切である。

## 5. 指摘事項

正式な指摘事項はなし。

| ID | Severity | Status | 確認結果 |
| --- | --- | --- | --- |
| なし | — | — | 承認済み Requirements に追跡できる、現行 Specification フェーズの未解消問題は確認されなかった。 |

## 6. 解消済み指摘

### SR-019 — Resolved

§6.2 は、補助評価後に複数の全体経路が残る場合の同率表示と、訪問地点の `(正規マップ識別子, X, Y, 対象の安定識別子)` 列による決定的な採用経路を定義した。文字列と数値の比較方法も明示され、相反する料金・ロード時間から同じ結果を導ける。

### SR-020 — Resolved

§3.1 は初回を「ソロ」「自動順序」とした。§7.1 は手動順序へ一般モブを追加する際の開始地点、追加距離、同率規則、採用地点の固定期間を定義した。空状態と既存手動順序の両方で一地点を一意に選べる。

### SR-021 — Resolved

§5.4 は一般、B、A 以上の削除をモブ対象単位とし、候補、探索、未発見、完了、順序、現在地点、再登録への結果を定義した。手動では相対順序を維持し、自動では保存済み現在地点から再計算する。

### SR-022 — Resolved

§4.1 は未完了地点の変更を訂正として扱い、完了済み枠の変更では旧完了対象を置換して新地点を未完了にする。置換後に旧地点を取消対象として残さないため、進捗結果が一意である。

### SR-023 — Resolved

§4.2 は指定記号の集合、省略、名前との境界、複数解釈できる行の拒否を定義した。§10.1 は地図別 X/Y 包含範囲、候補の非負・範囲内条件、対象マップの有効エーテライト必須条件を定義した。

過去 SR-001〜SR-018 のうち新 Requirements に継承された経路決定性、保存破損および保存失敗の契約にも回帰はない。旧 Mob 案内に固有の finding は、廃止された機能を現仕様へ再導入する根拠にはしていない。

## 7. 上流へのフィードバック

なし。Requirements と Concept の変更を必要とする曖昧さは確認されなかった。

## 8. 保留した指摘

正式な Deferred finding はない。モノレポのパッケージ構成、共有地図基盤、ビルド入口、具体的 URL・配備先、保存媒体・キー・形式、内部状態、探索アルゴリズム、UI 部品およびテストコードは、現仕様の外部結果を変えない範囲で Design / Implementation / Test へ引き継げる。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Specification | 判定 |
| --- | --- | --- | --- |
| 別アプリ・状態境界・モード | REQ-F-001〜REQ-F-005 | §1、§3、§9 | PASS |
| Treasure 登録・入力・互換性 | REQ-T-001〜REQ-T-003、REQ-Q-002 | §4、§9.2 | PASS。SR-022、SR-023 解消 |
| Mob の検索・ランク別登録・削除 | REQ-M-001〜REQ-M-008、REQ-D-001 | §5 | PASS。SR-021 解消 |
| 自動経路・手動順序 | REQ-R-001〜REQ-R-008 | §6、§7 | PASS。SR-019、SR-020 解消 |
| 完了・取消・B モブ探索 | REQ-P-001〜REQ-P-005 | §8 | PASS |
| 保存・復元・消去・保存失敗 | REQ-L-001〜REQ-L-006 | §9 | PASS |
| マスター・不正入力 | REQ-A-001〜REQ-A-002、REQ-D-001〜REQ-D-003、REQ-S-005 | §10 | PASS。SR-023 解消 |
| スマートフォン | REQ-Q-001 | §11 | PASS |
| 責任・対象外 | REQ-S-001〜REQ-S-004 | §1.2、§8、§10 | PASS |

### Board の独立確認

- Reviewer A: Requirement 47 件と Acceptance 21 件の追跡、入力、状態、同率、順序、失敗、互換性を確認し、外部結果の未定義はないと判定した。
- Reviewer B: ソロ／パーティの登録、連続登録、進行・取消、削除、再開、消去およびスマートフォン利用の lifecycle が上流価値と一致すると判定した。
- Reviewer C: チャット・マスター・保存を非信頼入力として拒否側に扱い、部分適用、破損、保存失敗、状態境界、旧 Treasure 移行の外部結果が一意であると判定した。
- Chair: 重複候補を統合し、正式な追加 finding は採用しなかった。

### Two-implementation test

| ケース | 合理的な実装差 | 仕様から導ける共通結果 | 判定 |
| --- | --- | --- | --- |
| 料金とロード時間が相反する同率経路 | 探索順・内部アルゴリズムが異なる | 同率表示後、規定タプル列で同じ一経路を採用 | PASS |
| 手動順序へ複数候補の一般モブを追加 | 全候補列挙方法が異なる | 既存末尾またはエーテライトから最小追加距離の同じ一地点を採用し固定 | PASS |
| B モブを対象削除 | 内部状態の分割が異なる | 候補・探索・完了・全訪問地点を対象単位で除き、現在地点は維持 | PASS |
| 完了済み Treasure 枠の地点変更 | 更新・置換方式が異なる | 旧完了対象を置換し、新地点を未完了の現在対象にする | PASS |
| マーカーなし／未知記号／曖昧なチャット行 | parser 実装が異なる | 指定記号は省略可、未知記号は名前、複数解釈行は拒否 | PASS |
| 負数／地図範囲外の候補 | master 表現が異なる | 0 以上かつ地図別包含範囲内だけを有効候補とする | PASS |
| 保存書込み失敗 | commit / rollback 方式が異なる | 操作前の表示・最後の正常保存状態を維持し、部分適用しない | PASS |

## 10. 検証結果

- Requirement 定義 47 件、Acceptance ID 21 件を抽出し、対象仕様内の参照漏れがないことを確認した。
- Specification、Requirements、Requirements Review 007、Concept、Concept Review 005、README、MEMORY の相対リンクと参照先を確認した。リンク切れはない。
- 旧 `MOB-COMPASS/1`、Mob チャット案内・一括登録が規範的機能として残っていないことを確認した。
- `git diff --check`: PASS（レビュー成果物作成前）。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。docs-only review のため対象外。
- 実装、テスト、静的データ、画像、ブラウザ挙動、マスターデータの実値: Not validated。レビュー対象外。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | 別アプリ、ソロ／パーティ、対象外、利用者責任を一意に理解できる。 |
| 2. 要件追跡と契約 | PASS | 全 Requirement と Acceptance が本文・適合条件へ追跡でき、handoff が閉じている。 |
| 3. 処理と例外 | PASS | 登録、置換、削除、同率、進行、取消、復元、破損、保存失敗の結果が一意である。 |
| 4. 内部整合性 | PASS | 用語、状態、本文、適合条件、追跡表に矛盾を確認しなかった。 |
| 5. 検証可能性 | PASS | two-implementation test を含め、外部結果を実装方式によらず判定できる。 |
| 6. 安全性・信頼境界・相互運用性 | PASS | 不正入力、マスター、保存境界、破損、部分失敗、旧 Treasure 移行を外部から判定できる。 |
| 7. 上流整合性と工程境界 | PASS | 上流判断を維持し、モノレポ内部、具体 URL、保存・探索方式を下流へ残している。 |

## 12. 残存リスクと未決定事項

- 上流へ戻す未決定事項はない。
- 具体的 URL と配備先は Design / release configuration の未決定事項であり、外部仕様の成立を妨げない。
- 実装適合性、マスターデータの正確性・完全性・出典・利用条件は未確認であり、後続工程で検証する。

## 13. 自動変更

Reviewer は対象 Specification、Requirements、Concept、Design、コード、テストおよび既存レビューを変更していない。本サイクルで新規作成したのは本レビュー成果物だけである。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。SR-019〜SR-023 は解消済みであり、Specification は Design へ引き渡し可能である。
