# Requirements Review 011: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 011（RR-010 再確認・Requirements 全体回帰レビュー）
- 対象フェーズ: Requirements
- 確認日: 2026-09-12（Asia/Tokyo）
- 対象成果物: `docs/requirements/requirements.md`
- 対象版 / SHA-256（レビュー開始時）: `a893bf417495c3a7a57c0e389c89a1a9b65999a54eb3930cc56a1ac4c2fccdbd`
- 前回レビュー: `docs/reviews/requirements/requirements-review-010.md`、SHA-256 `ae6dac36f164a7c2e09f5cd4a901fb5e58c76ac517d8836d7f2edeb282dc32d8`（不変・参照のみ）
- 対象範囲: RR-010 の再確認、Requirements 全文の回帰確認、Treasure の同格な登録経路、連続画面、プレイリスト／プレイヤー操作、複数バージョン混在、利用者向けバージョン表記、一括入力の行単位解決・既存リスト統合、既存 v1 要件、Concept 整合、Acceptance、Traceability、品質・安全性、責任および工程境界
- 未確認範囲: 実装、テスト、静的マスターデータ、画像、ブラウザ表示、マスターデータの正確性・完全性、出典・ライセンスの実査、更新前の Specification / Design の新方針への適合性、具体的な URL・画面部品・入力構文・状態遷移・保存スキーマ・アルゴリズム

## 2. 使用した根拠

- 最新のユーザー判断を記録した `MEMORY.md`: Treasure の同格な登録経路、必須メンバー名、一人一 Treasure・最大 8 人、連続画面、プレイリスト、再生・次へ・戻る、3.x〜7.x 混在、利用者向け `Gxx` 廃止と確定対応表、一括入力の行単位解決、既存リスト統合および既存保存との互換境界を確認した。
- 承認済み上流成果物: `docs/concept/concept.md` および `docs/reviews/concept/concept-review-005.md`。目的、対象ユーザー、v1、対象外、責任境界および成功状態との整合確認に使用した。
- レビュー対象: `docs/requirements/requirements.md` 全文。Requirement、Acceptance、未決定事項、下流への引継ぎおよび Traceability を確認した。
- 前回レビュー: `docs/reviews/requirements/requirements-review-010.md`。RR-010 の事実、影響、最小修正および再確認条件を確認した。前回レビュー自体は変更していない。
- 過去レビュー: `docs/reviews/requirements/requirements-review-001.md`〜`requirements-review-009.md`。RR-001〜RR-009 の履歴と解消状態を確認した。
- 既存利用者向け契約: `README.md`。既存 Treasure の対応対象と3.x〜7.xの利用者向け表示対応を確認した。新しい Mob Requirement の根拠には使用していない。
- 下流の補助文脈: `docs/specification/specification.md` および `docs/design/design.md`。既存契約との明白な矛盾および更新が必要な下流範囲の確認に限定し、下流から Requirement を逆生成していない。
- プロジェクト指針とレビュー手順: `AGENTS.md`、`requirements-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`requirements-review/reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。RR-010 は Resolved。New / Open / Reopened の Requirements-level Finding はなく、Requirements は Specification へ引き渡し可能である。

## 4. 総評

RR-010 の修正により、`REQ-T-004` は利用者向け表示で `Gxx` を使用しないこと、G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17→7.x、G18→7.x の外部分類、および表示変更だけを理由に内部 grade 値、legacy 名、既存保存値を変更・破棄しないことを規範的に定義した。`REQ-Q-002` は同じ対応と既存利用者の継続性を維持し、`AC-029` は表示廃止、6対応、混在および内部互換性を外部から判定可能にしている。9.1、9.2、10.1 も、確定要求と Specification で具体化する範囲を分けたうえで同じ境界へ追跡できる。

Treasure の新しい登録から巡回までの方向にも回帰はない。手動入力と一括入力は同格で、必須メンバー名と地点を一つの登録単位として最大 8 人まで扱う。一括入力は各行のバージョン・地点を一意解決し、曖昧行を推測採用せず、既存リストを全置換せずに追加または更新する。登録済み集合と巡回リストは同じ対象集合として一つの連続体験を構成し、再生・次へ・戻るの外部結果を定めながら、準備中／巡回中または再生中／一時停止中という新しい domain 状態を要求しない。

既存のアプリ／モード分離、Mob 登録、経路、手動順序、進行・取消、保存・消去、動的エーテライト、入力安全性、スマートフォンおよび責任境界にも新しい欠落・矛盾は確認されなかった。正確な画面構成、状態遷移、入力構文、保存形式および実現方式は Requirements を変更せず Specification 以降で定められる。

## 5. 指摘事項

現行版に対する正式な指摘事項はなし。

## 6. 解消済み指摘

前回までの Finding 履歴を維持する。RR-010 は再確認条件を満たしたため Resolved とする。

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| RR-001 | Resolved（継続確認） | `REQ-R-001` / `REQ-R-002` / `AC-008` で、マップ間遷移を第一軸、同一マップの X/Y 距離を最小化する要求が維持されている。 |
| RR-002 | Resolved（継続確認） | `REQ-D-002` / `AC-017` で、無効・未知・参照不能情報を正常採用せず、誤ったルート・進捗を防ぐ境界が維持されている。 |
| RR-003 | Resolved（継続確認） | `REQ-R-001` で、テレポ料金・ロード時間を順序評価に使用しない判断が維持されている。 |
| RR-004 / RR-005 | Superseded（継続確認） | Test Strategy、CI / GitHub Security、時点依存の脆弱性台帳を製品 Requirement とする旧指摘は再導入されていない。 |
| RR-006 | Resolved（継続確認） | `REQ-L-006` / `AC-021` で、保存失敗の識別、未保存変更の非成功扱い、最後の正常保存状態の保持が維持されている。 |
| RR-007 | Resolved（継続確認） | `REQ-F-005` / `AC-020` で、対象固有の入口を保ちながら共通操作結果を追跡できる。 |
| RR-008 | Resolved（継続確認） | `REQ-Q-001` / `AC-018` で、Mob 固有のモード切替と各アプリに該当するスマートフォン主要操作を区別している。 |
| RR-009 | Resolved（継続確認） | `REQ-F-006`、`REQ-A-003`、`REQ-A-004`、`AC-022` で、検証済み T のみを使用し legacy R を除外する境界が維持されている。 |
| RR-010 | Resolved | `REQ-T-004`、`REQ-Q-002`、`AC-029`、9.1 項目16、9.2 および10.1で、利用者向け `Gxx` 不使用、`3.x` 形式の6対応、および内部値・既存保存の互換境界を一意に追跡できる。 |

## 7. 上流へのフィードバック

なし。Concept は既存 v1 の目的、対象ユーザー、価値、対象外、責任境界および成功状態を評価するのに十分である。追加された Treasure のプレイリスト／プレイヤー方向とバージョン表記は最新ユーザー判断として Requirements に反映されている。

## 8. 保留した指摘

- Treasure の連続画面における正確な UI 部品、配置、文言、主従、登録入口の開閉および登録後の復帰は Specification へ引き継ぐ。Requirements は一つの対象集合、連続体験、三つの独立トップレベル体験を維持しないこと、および再生・次へ・戻るの外部結果を確定済みである。
- 完了済み Treasure の再生、末尾での次へ／戻る、プレイヤー操作と個別完了取消の正確な併存は Specification へ引き継ぐ。最新判断でも完了済み選択は未決定であり、Requirements Finding として結果を発明しない。
- 一括入力のメンバー同一性、行構文、曖昧候補の選択、重複・競合、上限超過、部分反映および保存失敗の正確な結果は Specification へ引き継ぐ。
- 利用者向け6対応を前提とした正確な表示・入力と内部 grade / legacy 値との互換境界は Specification へ引き継ぐ。`Gxx` 不使用と6対応自体は Requirements の確定契約として変更しない。
- Treasure のプレイヤー現在位置と経路再計算に用いる現在地点の関係、保存単位および復元時の外部遷移は Specification で定める。新しい再生中／一時停止中の保存状態は要求しない。
- 実装、テスト、静的マスター、画像、ブラウザ表示、出典・ライセンス、および更新前の Specification / Design の新方針への適合性は後続レビューへ引き継ぐ。

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
| 最新判断: 複数バージョン混在、項目別関連付け、全体選択なし、`Gxx` 不使用、6対応 | `REQ-T-004`, `REQ-T-005`, `REQ-D-003`, `REQ-D-005`, `REQ-D-006`, `REQ-Q-002` | `AC-029`, `AC-030` | 整合。RR-010 解消 |
| 最新判断: 動的エーテライト、T のみ・legacy R 不使用、共通地図、画像、非操作性、初期日本語 | `REQ-F-006`–`REQ-F-008`, `REQ-A-003`, `REQ-A-004`, `REQ-D-004`, `REQ-S-005` | `AC-022`–`AC-025` | 整合。RR-009 解消を継続確認 |

## 10. 検証結果

- レビュー開始時に `sha256sum docs/requirements/requirements.md docs/reviews/requirements/requirements-review-010.md` を実行し、対象 SHA-256 `a893bf417495c3a7a57c0e389c89a1a9b65999a54eb3930cc56a1ac4c2fccdbd` および前回レビュー SHA-256 `ae6dac36f164a7c2e09f5cd4a901fb5e58c76ac517d8836d7f2edeb282dc32d8` と一致することを確認した。
- Requirements 全440行、Concept、Concept Review 005、`MEMORY.md`、README、Requirements Review 010、必要な過去 Finding 履歴、下流の関連箇所、AGENTS.md およびレビュー手順一式を確認した。
- Reviewer A: Requirement の規範性、ID、Acceptance、用語、未決定事項および Traceability を確認した。Reviewer B: Concept、最新判断、v1、対象外、既存価値およびスコープを確認した。Reviewer C: 入力の推測採用禁止、状態分離、保存失敗、互換境界、マスター責任、外部連携対象外を Security primary として確認した。
- Requirement ID 59 件、Acceptance ID 31 件を確認し、定義 ID の重複はない。全59 Requirement は Acceptance 表から少なくとも一度参照される。
- 対象文書内の相対リンク（Concept、Concept Review、MEMORY、README）と参照先の存在を確認した。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。Requirements Review の docs-only 変更であり、アプリコードを変更していないため対象外。
- 実装、テスト、静的マスター、画像、ブラウザ挙動、正確性・完全性、出典・ライセンス、更新前の下流文書の新方針への適合性: Not validated。本レビューの対象外または後続工程で確認する事項である。
- レビュー終端で、対象と前回レビューの SHA-256、`git diff --check`、変更ファイル、staged file、untracked file を再確認する。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | PASS | Concept の既存スコープと最新ユーザー判断の Treasure 登録・連続体験・プレイヤー・バージョン表示・統合方針に整合する。 |
| 2. 要求完全性 | PASS | 既存 v1 の主要能力と新しい Treasure 方向に必要な外部 Requirement が定義され、RR-010 の表示値も補完された。 |
| 3. 外部観測可能性 | PASS | 登録、混在、`Gxx` 不使用、6対応、再生・次へ・戻る、一括入力統合、既存能力および保存結果を Acceptance から判断できる。 |
| 4. 責任・境界 | PASS | 利用者、リーダー、参加者、管理者、ゲーム・チャット・共有機能、アプリ／モード、マスター／周回状態の責任境界が明確である。 |
| 5. 品質・安全性 | PASS | 無効・曖昧・未知情報の推測採用禁止、利用者による曖昧行解決、状態分離、保存失敗時の完全性、既存保存の非破壊境界が定義されている。 |
| 6. Acceptance | PASS | 全 Requirement が Acceptance から参照され、`AC-029` で RR-010 の `Gxx` 不使用、6対応および内部互換性を判定できる。 |
| 7. 工程境界 | PASS | 確定した外部表示値を Requirements に置き、正確な UI、入力、状態遷移、保存形式、アルゴリズムおよびテスト手順を後工程へ分離している。 |
| 8. 未決定事項 | PASS | Requirements で確定した外部判断と、Specification / Design / Implementation / Test で定める詳細を適切に分離している。 |

Critical 0 / Major 0 / Minor 0。Gate failure はなく、RR-010 も Resolved のため、最終判定は `READY` とする。

## 12. 残存リスクと未決定事項

- 完了済み Treasure の再生、末尾でのプレイヤー操作、個別完了取消との併存は Specification で未決定である。Requirements の再生・次へ・戻る結果と、新しい domain 状態を設けない境界を維持して定める必要がある。
- プレイヤーの現在位置と経路再計算上の現在地点の関係、画面の正確な主従、入力入口、保存・復元の詳細は Specification / Design で定める必要がある。
- 利用者向け6対応と内部 grade / legacy 値、既存保存データとの正確な互換契約は Specification で具体化する必要がある。
- 既存 Treasure 保存データの実移行、同一 origin 配備、マスター参照、画像、入力解析および新 UI の実装適合性は未検証である。
- エーテライト・地図・Treasure / Mob マスターデータの正確性、完全性、出典および画像利用条件は未検証である。

## 13. 自動変更

なし。`docs/requirements/requirements.md`、`docs/reviews/requirements/requirements-review-010.md`、`MEMORY.md`、Concept、Specification、Design、実装、テスト、README、設定およびその他の既存レビューは変更していない。本サイクルで新規作成した成果物は `docs/reviews/requirements/requirements-review-011.md` のみである。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。RR-010 は Resolved。利用者向け `Gxx` 不使用、3.x形式の6対応、および内部値・既存保存との互換境界が Requirement、Acceptance、決定済み事項、Specification 引継ぎおよび Traceability から一意に追跡できる。Requirements 全体に新しい回帰はなく、Treasure の登録・プレイリスト／プレイヤー方向と既存 v1 Requirements は Specification へ引き渡し可能である。
