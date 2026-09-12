# Requirements Review 010: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 010（独立 Requirements 全体レビュー）
- 対象フェーズ: Requirements
- 確認日: 2026-09-12（Asia/Tokyo）
- 対象成果物: `docs/requirements/requirements.md`
- 対象版 / SHA-256（レビュー開始時）: `336a3ab7363425e16f59d5868e4c224b635f2f7bfa83d7cc6978194a331ead89`
- 前回レビュー: `docs/reviews/requirements/requirements-review-009.md`（不変・参照のみ）
- 対象範囲: Requirements 全文、最新ユーザー判断による Treasure の同格な登録経路、連続画面、プレイリスト／プレイヤー操作、複数バージョン混在、一括入力の行単位解決・既存リスト統合、既存 v1 要件、Concept 整合、Acceptance、Traceability、品質・安全性、責任および工程境界
- 未確認範囲: 実装、テスト、静的マスターデータ、画像、ブラウザ表示、マスターデータの正確性・完全性、出典・ライセンスの実査、更新前の Specification / Design の新方針への適合性、具体的な URL・画面部品・入力構文・状態遷移・保存スキーマ・アルゴリズム

## 2. 使用した根拠

- 最新のユーザー判断を記録した `MEMORY.md`: Treasure の手動入力と一括入力の同格性、必須メンバー名、一人一 Treasure・最大 8 人、連続画面、プレイリスト、再生・次へ・戻る、3.x〜7.x 混在、行単位のバージョン／地点解決、既存リストへの統合、利用者向け `Gxx` 廃止とバージョン対応表、既存保存との互換境界を確認した。正式文書の代替ではなく、明示された最新判断の追跡に限って使用した。
- 承認済み上流成果物: `docs/concept/concept.md` および `docs/reviews/concept/concept-review-005.md`。目的、対象ユーザー、v1、対象外、責任境界および成功状態との整合確認に使用した。
- レビュー対象: `docs/requirements/requirements.md` 全文。Requirement、Acceptance、未決定事項、下流への引継ぎおよび Traceability を確認した。
- 過去レビュー: `docs/reviews/requirements/requirements-review-001.md`〜`requirements-review-009.md`。RR-001〜RR-009 の履歴と解消状態を確認し、既存 ID を重複作成していない。
- 既存利用者向け契約: `README.md`。既存 Treasure が対応する G8 / G10 / G12 / G14 / G17 / G18 と利用者向け 3.x〜7.x 表記の対応を確認した。新しい Mob Requirement の根拠には使用していない。
- 下流の補助文脈: `docs/specification/specification.md` および `docs/design/design.md`。既存のバージョン表示対応と同一 origin の互換境界が既に存在すること、現行下流文書が新しい Treasure UI 方針より古いことを確認した。下流の内容から新しい Requirement を逆生成していない。
- プロジェクト指針とレビュー手順: `AGENTS.md`、`requirements-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`requirements-review/reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`。

## 3. レビュー結果

**REVISE REQUIREMENTS**

Critical 1 / Major 0 / Minor 0。Treasure の利用者向けバージョン表記について、確定済みの表示廃止境界と対応表が規範 Requirement および Acceptance に定義されていないため、Specification へ安全に引き渡せない。

## 4. 総評

新しい Treasure の登録から巡回までの方向は概ね Requirements の適切な抽象度へ反映されている。手動入力と一括入力は同格の入口となり、必須のメンバー名と地点を一つの登録単位として最大 8 人まで扱う。一括入力は行ごとにバージョンと地点を一意解決し、曖昧行を推測採用せず、既存リストを全置換せずに新規メンバーの追加と既存メンバーの更新を行う。登録済み集合と巡回リストは一つの対象集合となり、準備中／巡回中または再生中／一時停止中という新しい domain 状態を設けず、再生・次へ・戻るの外部結果も定義されている。

`REQ-T-002`、`REQ-T-007`、`AC-027`、`AC-028` は連続するプレイリスト体験と進行結果を定め、正確な画面構成、末尾・完了済み選択、個別完了取消との併存は Specification へ適切に分離している。これらを Requirements Finding にはしない。既存のアプリ／モード分離、Mob 登録、経路、手動順序、進行・取消、保存・消去、動的エーテライト、入力安全性、スマートフォンおよび責任境界にも回帰は確認されなかった。

一方、`REQ-T-004` は `Gxx` とバージョンを「同時に」表示しないことしか要求せず、最新判断の `Gxx` 利用者向け表示の廃止を保証しない。また、3.x〜7.x を識別することは要求するが、G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17→7.x、G18→7.x という確定対応を定義していない。`REQ-Q-002`、`AC-029`、9.1、9.2、10.1 もこの対応を確定せず、Specification が異なる表示対応を選べるため RR-010 とする。

## 5. 指摘事項

### RR-010 — 利用者向けバージョン表記の廃止境界と確定対応表が Requirement / Acceptance にない

- 重大度: Critical
- 状態: New
- Reviewer 観点: A（要件品質・追跡性）、B（最新ユーザー判断・既存価値との整合）。C は保存互換性への影響だけを cross-check した。
- 対象箇所: `REQ-T-004`、`REQ-Q-002`、`AC-029`、9.1 項目16、9.2 のバージョン引継ぎ、10.1 の最新ユーザー判断追跡
- 事実: `REQ-T-004` は3.x〜7.x の混在、項目ごとのバージョン識別、巡回全体のバージョン非選択、および `Gxx` とバージョンの同時表示禁止を定める。しかし、利用者向け `Gxx` 表記そのものを廃止することと、G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17→7.x、G18→7.x の確定対応を定めていない。`AC-029` も混在と二重表示の有無しか判定せず、確定した表示値を検証できない。
- 根拠: `MEMORY.md` の最新判断は、Treasure の利用者向け `Gxx` 表記を廃止して Mob と同じ `x` 形式を使うこと、および上記6対応を明示的に確定している。`README.md` の既存利用者向け契約も同じ対応を示す。これは field や内部 schema ではなく、利用者から観測される表示分類と必要な要求値である。
- 影響: 現行文面のままでは、`Gxx` だけを表示する、G18 を非表示にする、または各 grade を別の 3.x〜7.x へ対応させる Specification も形式上は成立し得る。利用者が既存 Treasure をどのバージョンとして識別するかが一意にならず、一括入力・手動絞り込み・既存保存復元の表示結果も異なり得る。
- 最小修正: 利用者向けに `Gxx` 表記を用いず `x` 形式のバージョン表記を用いる外部要求と、確定済み6対応を規範 Requirement に定義する。対応する Acceptance と Requirements 内の決定済み事項・Traceability から、各表示対応および `Gxx` 非表示を判定可能にする。内部 grade 値、legacy 名または保存形式を表示変更だけで変更・破棄しない既存互換境界は維持する。
- 再確認条件: Requirement → Acceptance → Traceability を通じて、利用者向け `Gxx` 廃止、`3.x` 形式、および6対応が一意に追跡でき、内部値・既存保存の互換性とは分離されていること。

## 6. 解消済み指摘

過去 Finding の履歴を維持する。RR-001〜RR-009 は現行版でも再発していない。

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| RR-001 | Resolved（継続確認） | `REQ-R-001` / `REQ-R-002` / `AC-008` で、マップ間遷移を第一軸、同一マップの X/Y 距離を最小化する要求が維持されている。 |
| RR-002 | Resolved（継続確認） | `REQ-D-002` / `AC-017` で、無効・未知・参照不能情報を正常採用せず、誤ったルート・進捗を防ぐ境界が維持されている。 |
| RR-003 | Resolved（継続確認） | `REQ-R-001` で、テレポ料金・ロード時間を順序評価に使用しない確定判断が維持されている。 |
| RR-004 / RR-005 | Superseded（継続確認） | Test Strategy、CI / GitHub Security、時点依存の脆弱性台帳を製品 Requirement とする旧指摘は再導入されていない。 |
| RR-006 | Resolved（継続確認） | `REQ-L-006` / `AC-021` で、保存失敗の識別、未保存変更の非成功扱い、最後の正常保存状態の保持が維持されている。 |
| RR-007 | Resolved（継続確認） | `REQ-F-005` / `AC-020` で、対象固有の入口を保ちながら共通操作結果を追跡できる。 |
| RR-008 | Resolved（継続確認） | `REQ-Q-001` / `AC-018` で、Mob 固有のモード切替と各アプリに該当するスマートフォン主要操作を区別している。 |
| RR-009 | Resolved（継続確認） | `REQ-F-006`、`REQ-A-003`、`REQ-A-004`、`AC-022` で、検証済み T のみを使用し legacy R を除外する境界が維持されている。 |

## 7. 上流へのフィードバック

なし。Concept は既存 v1 の目的、対象ユーザー、価値、対象外、責任境界および成功状態を評価するのに十分である。Treasure のプレイリスト／プレイヤー方向とバージョン表記は、Concept の欠陥ではなく最新ユーザー判断として Requirements に展開すべき事項である。

## 8. 保留した指摘

- Treasure の連続画面における正確な UI 部品、配置、文言、プレイリスト・現在位置・プレイヤー操作の表示優先、登録入口の開閉および登録後の復帰は Specification へ引き継ぐ。Requirements は一つの対象集合、連続体験、三つの独立トップレベル体験を維持しないこと、および再生・次へ・戻るの結果を確定済みである。
- 完了済み Treasure を選択して再生した結果、末尾での次へ／戻る、プレイヤー操作と個別完了取消の正確な併存は Specification へ引き継ぐ。最新判断でも完了済み選択は未決定であり、Reviewer が Requirements へ結果を発明しない。
- 一括入力のメンバー同一性、行構文、曖昧候補の選択、重複・競合、上限超過、部分反映および保存失敗の正確な結果は Specification へ引き継ぐ。推測採用禁止、利用者による解決、既存リストの全置換禁止、一人一 Treasure・最大 8 人は Requirements で確定済みである。
- Treasure のプレイヤー現在位置と、経路再計算に用いる最後の完了・探索地点の正確な関係、保存単位および復元時の外部遷移は Specification で定める。Requirements は現在位置の識別と周回状態・現在地点の保存復元を要求しており、新しい再生中／一時停止中の保存状態は要求しない。
- 既存 Treasure の localStorage へ到達する同一 browser origin 配備は、具体的 URL・path・保存方式ではなく互換性を成立させる現行 Design 制約として確認した。Requirement の外部結果は `REQ-Q-002` の非破壊な移行または復元境界で維持されているため、新しい Requirements Finding にはしない。
- 実装、テスト、静的マスター、画像、ブラウザ表示、出典・ライセンス、および更新前の Specification / Design の新しい Treasure 方針への適合性は後続レビューへ引き継ぐ。

## 9. 対象範囲と追跡

| 根拠 | 対応 Requirements | 対応 Acceptance | 今回の判定 |
| --- | --- | --- | --- |
| Concept 1、4: 別アプリ・別状態・ソロ／パーティ | `REQ-F-001`–`REQ-F-004`, `REQ-L-001`–`REQ-L-005` | `AC-001`, `AC-002`, `AC-014`, `AC-015` | 整合 |
| Concept 1、2、3、5、6: 共通操作感 | `REQ-F-005` | `AC-020` | 整合。RR-007 解消を継続確認 |
| Concept 2、3: Treasure と Mob の代表利用・既存継続 | `REQ-T-001`–`REQ-T-003`, `REQ-M-001`–`REQ-M-008`, `REQ-Q-002` | `AC-003`–`AC-007` | 整合 |
| Concept 1、3、4: 最短経路と手動順序 | `REQ-R-001`–`REQ-R-008` | `AC-004`, `AC-008`–`AC-010` | 整合。RR-001 / RR-003 解消を継続確認 |
| Concept 3–6: 進行と訂正 | `REQ-P-001`–`REQ-P-005` | `AC-011`–`AC-013` | 整合 |
| Concept 4–6: 独立状態、復元、消去、保存失敗 | `REQ-L-001`–`REQ-L-006`, `REQ-D-002` | `AC-001`, `AC-002`, `AC-014`, `AC-015`, `AC-017`, `AC-021` | 整合。RR-006 解消を継続確認 |
| 最新判断: Treasure の同格登録、必須名、一人一件、最大8人、既存リスト統合 | `REQ-T-001`, `REQ-T-003`, `REQ-T-006`, `REQ-D-001`, `REQ-D-005`, `REQ-D-006` | `AC-003`, `AC-026`, `AC-030`, `AC-031` | 整合 |
| 最新判断: 連続プレイリスト体験、再生・次へ・戻る、厳密な再生状態なし | `REQ-T-002`, `REQ-T-007`, `REQ-P-001`, `REQ-P-002`, `REQ-D-003` | `AC-027`, `AC-028` | 整合。詳細は Specification へ引継ぎ可能 |
| 最新判断: 複数バージョン混在、項目別関連付け、全体選択なし | `REQ-T-004`, `REQ-T-005`, `REQ-D-003`, `REQ-D-005`, `REQ-D-006` | `AC-029`, `AC-030` | 混在と関連付けは整合。利用者向け表記廃止・対応表は RR-010 |
| 最新判断: 動的エーテライト、T のみ・legacy R 不使用、共通地図、画像、非操作性、初期日本語 | `REQ-F-006`–`REQ-F-008`, `REQ-A-003`, `REQ-A-004`, `REQ-D-004`, `REQ-S-005` | `AC-022`–`AC-025` | 整合。RR-009 解消を継続確認 |

## 10. 検証結果

- レビュー開始時に `sha256sum docs/requirements/requirements.md` を実行し、指定された対象 SHA-256 `336a3ab7363425e16f59d5868e4c224b635f2f7bfa83d7cc6978194a331ead89` と一致することを確認した。
- Requirements 全440行、Concept、Concept Review 005、`MEMORY.md`、README、前回 Requirements Review 009、必要な過去 Finding 履歴、下流の関連箇所、AGENTS.md およびレビュー手順一式を確認した。
- Reviewer A: Requirement の規範性、ID、Acceptance、用語、未決定事項および Traceability を確認した。Reviewer B: Concept、最新判断、v1、対象外、既存価値およびスコープを確認した。Reviewer C: 入力の推測採用禁止、状態分離、保存失敗、互換境界、マスター責任、外部連携対象外を Security primary として確認した。
- Requirement ID 59 件、Acceptance ID 31 件を確認し、定義 ID の重複はない。全59 Requirement は Acceptance 表から少なくとも一度参照される。
- 対象文書内の相対リンク（Concept、Concept Review、MEMORY、README）と参照先の存在を確認した。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。Requirements Review の docs-only 変更であり、アプリコードを変更していないため対象外。
- 実装、テスト、静的マスター、画像、ブラウザ挙動、正確性・完全性、出典・ライセンス、更新前の下流文書の新方針への適合性: Not validated。本レビューの対象外または後続工程で確認する事項である。
- レビュー終端で、対象 SHA-256、`git diff --check`、変更ファイル、staged file、untracked file を再確認する。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | FAIL | Concept 由来の既存スコープと新しい Treasure フローの大半は整合するが、最新ユーザー判断の利用者向け `Gxx` 廃止・確定対応表が規範要求へ展開されていない。RR-010 に対応する。 |
| 2. 要求完全性 | FAIL | プレイリスト／プレイヤー、登録、一括入力、混在能力は定義されたが、利用者が各 Treasure をどのバージョンとして識別するかの必要な要求値が欠落する。RR-010 に対応する。 |
| 3. 外部観測可能性 | FAIL | `AC-029` は混在と二重表示禁止を確認できるが、`Gxx` が利用者向けに残っていないこと、および6対応が正しいことを判定できない。RR-010 に対応する。 |
| 4. 責任・境界 | PASS | 利用者、リーダー、参加者、管理者、ゲーム・チャット・共有機能、アプリ／モード、マスター／周回状態の責任境界は明確である。 |
| 5. 品質・安全性 | PASS | 無効・曖昧・未知情報の推測採用禁止、利用者による曖昧行解決、状態分離、保存失敗時の完全性、既存保存の非破壊境界が定義されている。 |
| 6. Acceptance | FAIL | 全 Requirement は Acceptance から参照されるが、確定したバージョン表示値と `Gxx` 廃止を検証する Acceptance がない。RR-010 に対応する。 |
| 7. 工程境界 | PASS | 正確な画面部品、入力構文、状態遷移、保存 schema、経路アルゴリズムおよびテスト手順を後工程へ分離している。確定表示値は Requirements の責務であり RR-010 は下流詳細を要求しない。 |
| 8. 未決定事項 | FAIL | 表示／内部値の互換境界を Specification へ送ること自体は妥当だが、Requirements で確定済みの表示廃止と対応表まで下流判断として残している。RR-010 に対応する。 |

Critical 1 / Major 0 / Minor 0。Gate 1、2、3、6、8 の不合格は RR-010 に対応するため、最終判定は `REVISE REQUIREMENTS` とする。

## 12. 残存リスクと未決定事項

- RR-010 が解消されるまで、既存 grade と利用者向けバージョンの対応、および `Gxx` を利用者へ残すかが下流で分岐し、一括入力、手動絞り込み、巡回リスト表示および保存復元後の表示結果が一意にならない。
- 完了済み Treasure の再生、末尾でのプレイヤー操作、個別完了取消との併存は Specification で未決定である。Requirements に新しい domain 状態や一般履歴を追加せず、確定済みの再生・次へ・戻る結果を維持して定める必要がある。
- プレイヤーの現在位置と経路再計算上の現在地点の関係、画面の正確な主従、入力入口、保存・復元の詳細は Specification / Design で定める必要がある。
- 既存 Treasure 保存データの実移行、同一 origin 配備、マスター参照、画像、入力解析および新 UI の実装適合性は未検証である。
- エーテライト・地図・Treasure / Mob マスターデータの正確性、完全性、出典および画像利用条件は未検証である。

## 13. 自動変更

なし。`docs/requirements/requirements.md`、`MEMORY.md`、Concept、Specification、Design、実装、テスト、README、設定および既存レビューは変更していない。本サイクルで新規作成した成果物は `docs/reviews/requirements/requirements-review-010.md` のみである。

## 14. 最終判定

**REVISE REQUIREMENTS**

Critical 1 / Major 0 / Minor 0。RR-010（New）は、利用者向け `Gxx` 表記の廃止、`3.x` 形式、および G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17→7.x、G18→7.x の確定対応を Requirement、Acceptance、決定済み事項および Traceability から一意に追跡できる状態にしてから再確認する。その他の新しい Treasure 登録・プレイリスト／プレイヤー方向と既存 v1 Requirements は、Specification へ引き継げる抽象度で整合している。
