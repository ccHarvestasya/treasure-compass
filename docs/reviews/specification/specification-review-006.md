# Treasure Compass / Mob Compass Specification Review 006

## 1. レビュー対象

- レビューサイクル: 006（全面再レビュー）
- 対象フェーズ: Specification
- 確認日: 2026-09-11（Asia/Tokyo）
- ブランチ: `maintenance/add-mob-compass`
- レビュー開始時 HEAD: `abc223557ccbe14057b91d3a96a0c77a310b73e7`
- 対象成果物: `docs/specification/specification.md` の未コミット版
- 対象 Specification SHA-256: `67d9a4a65201fbe04bb4b7163ca42c16379ea4d1854c62c433bfca385bf336a7`
- レビュー範囲: Specification 全文。Requirements handoff、入力、状態遷移、順序、決定性、失敗、互換性、スマートフォン、工程境界を確認した。
- 未確認範囲: Design、実装、テスト、静的データ、画像、ブラウザ実行、マスターデータの正確性・利用条件。

## 2. 使用した根拠

- 最新ユーザー判断: パーティは A モブ以上だけを対象とし、Treasure と同系統の地図ダイアログで候補地点を選択して即時登録する。Treasure と Mob は同じモノレポ内の別アプリとし、具体的 URL は現工程で決めない。
- 承認済み上流: `docs/requirements/requirements.md`、`docs/reviews/requirements/requirements-review-007.md`、`docs/concept/concept.md`、`docs/reviews/concept/concept-review-005.md`。
- レビュー対象: `docs/specification/specification.md` 全文。
- 既存 Treasure の互換性確認: `README.md` と、以前の正式仕様に記録された一括入力契約。新しい要求の根拠にはしていない。
- 作業・レビュー規律: `AGENTS.md`、`spec-review` Skill、review-common、review-gates、output-format、reviewers、security-checklist。

## 3. レビュー結果

**REVISE SPECIFICATION**

Critical 2 / Major 3 / Minor 0。Critical の New finding があるため、現行 Specification は修正後の再レビューを要する。

## 4. 総評

別アプリと状態境界、ソロ／パーティ、ランク別登録、候補地点選択、進行・取消、保存失敗、スマートフォンおよび対象外は、新 Requirements とユーザー判断へ概ね整合している。旧 Mob のチャット案内・一括登録・リーダー引継ぎも規範的機能から除かれている。

一方、経路の中核である同率結果と、手動順序における一般モブ採用地点に two-implementation test で分岐が残る。Requirements が Specification へ明示的に委譲した Mob 削除、Treasure 置換後の状態、チャット受理形式、マスター座標値域にも外部契約の不足がある。いずれも Design の内部方式ではなく、Specification で利用者可視結果を確定する必要がある。

## 5. 指摘事項

### SR-019 — マップ間同率候補の最終結果が一意でない

- Severity: Critical
- Status: New
- Location: §6.2、§6.3、SPC-AC-008
- Evidence / Fact: §6.2 は料金とロード時間の一方が小さく他方が大きい候補を同率にするが、同率となった複数のマップ順について表示する候補数、採用順、安定化規則を定めていない。§6.3 の安定順は「同じマップ」の最小距離経路に限定される。
- Problem: 同じ対象とマスターに対し、合理的な二実装が異なるマップ順を採用できる。
- 根拠: REQ-R-001、REQ-D-003、AC-008、および Requirements §9.2 の同率候補引継ぎ。
- Why it matters: 利用者が見る巡回順が実装ごとに変わり、経路適合性と決定性を検証できない。
- Required Change: 補助評価後に複数候補が残る場合の同率表示と、採用する一つの全体経路を決める外部規則を定義する。
- 再確認条件: 料金・ロード時間が相反する複数のマップ順から、同じ表示・採用結果を一意に導けること。

### SR-020 — 初期／手動順序の一般モブ採用地点が未定義

- Severity: Critical
- Status: New
- Location: §3.1、§5.2、§6.3、§7.1〜7.2
- Evidence / Fact: 初回の順序種別を定めていない。§5.2 は一般モブの一地点を §6 の巡回全体で選ぶが、§6 は自動経路の規則であり、手動順序中に新規一般モブを末尾へ追加する際の候補選択と、その後の候補固定・再評価条件がない。
- Problem: 初回登録が自動か手動か、および手動順序へ追加する一般モブの訪問地点が実装ごとに異なり得る。
- 根拠: REQ-M-004、REQ-R-006、REQ-R-007、AC-006、AC-010。
- Why it matters: 一般モブの一地点だけを巡る主要機能と「明示的な自動計算まで順序を変えない」契約を同時に検証できない。
- Required Change: 初期順序種別を定め、手動順序への一般モブ追加時に既存順序を変えず一地点を選ぶ評価規則と、再選択条件を定める。
- 再確認条件: 複数候補を持つ一般モブを空状態および既存手動順序へ追加した結果を一意に導けること。

### SR-021 — Mob の対象単位削除結果が欠落している

- Severity: Major
- Status: New
- Location: §5、§6.4、§7.2
- Evidence / Fact: 経路節は Mob 対象の削除後を扱うが、登録済み Mob を何単位で削除し、候補・進捗・順序へ何が起きるかを定めていない。
- Problem: Requirements §9.2 が引き継いだ削除時の正確な状態遷移を外部から判定できない。
- 根拠: REQ-D-001、REQ-R-006〜REQ-R-008、Requirements §9.2。
- Why it matters: 誤登録を対象単位で除ける実装と、候補地点だけを除く実装が同じ仕様へ適合し得る。
- Required Change: ソロ／パーティでの削除単位、候補・完了・探索・現在地点・順序への結果を定義する。
- 再確認条件: 一般、B、A 以上の各削除結果と手動／自動順序への作用が一意であること。

### SR-022 — Treasure の地点置換後の完了状態が未定義

- Severity: Major
- Status: New
- Location: §4.1、§4.3、§8.1〜8.2
- Evidence / Fact: 同じ枠の別地点は現在地点を置き換えるが、置換前が完了済みの場合に完了を維持するか、新しい未完了対象にするかを定めていない。
- Problem: 同じ操作から異なる進捗結果が成立する。
- 根拠: REQ-T-001、REQ-T-003、REQ-P-001、REQ-P-002。
- Why it matters: 新しい宝箱地点が巡回対象に入るかが実装ごとに変わる。
- Required Change: 未完了地点の訂正と、完了済み枠への新地点登録について、置換後の完了・進捗結果を定める。
- 再確認条件: 置換前の完了状態ごとに一意な結果を導けること。

### SR-023 — 入力マーカーとマスター座標の受理境界が不足している

- Severity: Major
- Status: New
- Location: §4.2、§10.1〜10.2
- Evidence / Fact: 一括入力例はマーカーなしだが「チャットアイコン一文字」を除外するとし、受理する記号と省略可否が不明である。また、候補 X/Y を有限数とする一方、「範囲外」を拒否するための非負条件または地図別有効範囲を定めていない。
- Problem: 同じチャット行または負座標マスターが実装によって受理・拒否に分かれる。
- 根拠: REQ-T-001、REQ-A-001、REQ-D-002、REQ-Q-002、および Requirements §9.2 の入力構文・値域引継ぎ。
- Why it matters: 既存 Treasure 互換性とマスター検証を一意に判定できない。
- Required Change: 指定記号の集合・省略可否・名前との境界を定め、候補 X/Y の非負条件と地図別有効範囲の責任を定める。
- 再確認条件: マーカーあり／なし、未知記号、負数、地図範囲外の受理結果が一意であること。

## 6. 解消済み指摘

- 過去の SR-001〜SR-018 は旧 Requirements と旧 Mob 案内仕様を対象としていた。新 Requirements で廃止された契約は現仕様へ再導入されておらず、現行契約に継承された経路決定性、保存破損、保存失敗の観点は維持されている。
- Specification Review 005 の保存書込み失敗 gap は、現仕様 §9.3 と SPC-AC-021 でも解消状態を維持している。

## 7. 上流へのフィードバック

なし。各 finding は承認済み Requirements の意味を変えずに Specification-level clarification として解消できる。

## 8. 保留した指摘

モノレポのパッケージ構成、共有地図基盤、ビルド入口、保存技術、内部データモデル、経路探索アルゴリズム、具体的 URL と配備先は Design 以降へ正当に引き継がれている。外部結果を変えない範囲の下流事項であり、finding としない。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Specification | 判定 |
| --- | --- | --- | --- |
| 別アプリ・状態境界 | REQ-F-001〜REQ-F-005 | §1、§3、§9 | PASS |
| Treasure 登録・互換性 | REQ-T-001〜REQ-T-003、REQ-Q-002 | §4、§9.2 | SR-022、SR-023 |
| Mob 登録 | REQ-M-001〜REQ-M-008 | §5 | PASS |
| 経路・順序 | REQ-R-001〜REQ-R-008 | §6、§7 | SR-019、SR-020、SR-021 |
| 進行・取消 | REQ-P-001〜REQ-P-005 | §8 | PASS |
| 保存・復元・消去 | REQ-L-001〜REQ-L-006 | §9 | PASS |
| マスター・不正入力 | REQ-A-001〜REQ-A-002、REQ-D-001〜REQ-D-003 | §10 | SR-023 |
| スマートフォン | REQ-Q-001 | §11 | PASS |
| 責任・対象外 | REQ-S-001〜REQ-S-005 | §1.2、§8、§10 | PASS |

## 10. 検証結果

- Requirement 47 件、Acceptance 21 件について対象仕様内の参照を確認した。参照漏れはない。
- 対象仕様内の相対リンクを確認した。リンク切れはない。
- 旧 `MOB-COMPASS/1`、Mob チャット案内・一括登録が規範的機能として残っていないことを確認した。
- `git diff --check`: PASS（レビュー成果物作成前）。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。docs-only review のため対象外。
- 実装、テスト、静的データ、画像、ブラウザ挙動、マスターデータの実値: Not validated。レビュー対象外。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | 新 Requirements の対象、対象外、利用者責任を維持している。 |
| 2. 要件追跡と契約 | FAIL | SR-020、SR-021、SR-023 により引継ぎ契約が閉じていない。 |
| 3. 処理と例外 | FAIL | SR-019、SR-020、SR-022 により同率・追加・置換結果が分岐する。 |
| 4. 内部整合性 | FAIL | SR-023 の入力例とマーカー境界が一意でない。 |
| 5. 検証可能性 | FAIL | SR-019、SR-020 により主要経路結果を一意に検証できない。 |
| 6. 安全性・信頼境界・相互運用性 | FAIL | SR-023 により外部入力とマスターの拒否境界が不足する。 |
| 7. 上流整合性と工程境界 | PASS | 上流の機能範囲を変更せず、内部方式を Design へ残している。 |

## 12. 残存リスクと未決定事項

- SR-019〜SR-023 が未解消である。
- 上流へ戻す製品判断はなく、仕様修正後に再レビューできる。
- 実装適合性とマスターデータ実値は未確認であり、後続工程で検証する。

## 13. 自動変更

Reviewer は対象 Specification、Requirements、Concept、Design、コード、テストおよび既存レビューを変更していない。本サイクルで新規作成したのは本レビュー成果物だけである。

## 14. 最終判定

**REVISE SPECIFICATION**

Critical 2 / Major 3 / Minor 0。SR-019〜SR-023 を修正し、再レビューする必要がある。
