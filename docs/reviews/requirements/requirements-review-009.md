# Requirements Review 009: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 009（RR-009 再確認・比例的な全体再レビュー）
- 対象フェーズ: Requirements
- 確認日: 2026-09-12（Asia/Tokyo）
- 対象成果物: `docs/requirements/requirements.md`
- 対象版 / SHA-256（レビュー開始時）: `30f91a210b44bc2e69422d6d807ac678e7b6ca52fa669301308bc7618554cba0`
- 前回レビュー: `docs/reviews/requirements/requirements-review-008.md`（不変・参照のみ）
- 対象範囲: RR-009 の再確認、Requirements 全文の比例的な回帰確認、動的エーテライト・町名表示、共通地図情報、T / legacy R 境界、対応マップ、画像背景化・重複除去、案内表示の非操作性、初期日本語・将来ローカライズ境界、既存 Treasure 継続性、Acceptance、Traceability、責任・安全性、工程境界
- 未確認範囲: 実装、テスト、静的マスターデータ、地図画像の実体・移行結果、ブラウザ表示、マスターデータの正確性・完全性、出典・ライセンスの実査、Specification / Design の実現可能性、`MEMORY.md` の内容および既存差分

## 2. 使用した根拠

- 最新のユーザー判断: 動的マスターデータ描画、地図画像の背景化、通常表示・地点選択表示での全有効エーテライト表示、案内表示の非操作性、全対応マップの埋め込み表示除去、アイコンの実座標、町名ラベルの回避・省略、共通地図情報、検証済み T レコードのみの採用と legacy R の不使用、既存アイコン資産の再利用境界、既存 Treasure の継続利用、初期日本語・将来ローカライズ境界。
- 承認済み上流成果物: `docs/concept/concept.md` および `docs/reviews/concept/concept-review-005.md`。Treasure / Mob の目的、利用者、v1、対象外、責任境界、成功状態との整合確認に使用した。
- レビュー対象: `docs/requirements/requirements.md` 全文。外部要求、Acceptance、Traceability、未決定事項および前回指摘の修正を確認した。
- 前回レビュー: `docs/reviews/requirements/requirements-review-008.md`。RR-009 の事実、最小修正、再確認条件および RR-001〜RR-008 の履歴を確認した。前回レビュー自体は変更していない。
- 下流文脈: `docs/specification/specification.md`、`docs/design/design.md`。T / legacy R の具体的な schema、移行、表示アルゴリズム等を Requirements の不足へ逆生成せず、後工程への引継ぎ境界と明白な矛盾の有無だけを確認した。
- 既存利用者向け契約・作業指針: `README.md`、`AGENTS.md`。既存 Treasure の継続範囲、対応グレード、画像・データ・文書レビューの検証境界を確認した。
- レビュー手順: `requirements-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`requirements-review/reviewers.md`、`review-gates.md`、`security-checklist.md`。
- `MEMORY.md`: 既存無関係差分を保護するため、内容・差分を本レビューの根拠として採用せず、参照・変更していない。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。RR-009 の再確認条件は満たされ、New / Open / Reopened の Requirements-level Finding はない。既存の製品スコープ、動的エーテライト表示、共通地図情報、初期ローカライズ境界にも回帰は確認されず、Specification へ引き渡し可能である。

## 4. 総評

RR-009 の修正により、`REQ-F-006`、`REQ-A-003`、`REQ-A-004`、`AC-022`、9.1、9.2、10.1 の各箇所で、検証済み T レコードだけを共通地図情報へ採用し、表示・参照・経路計算に使用すること、legacy R レコードは検証済みまたは参照解決済みであっても使用しないことが一意に追跡できる。`REQ-R-003` の「利用可能なエーテライト」も `REQ-A-004` の境界により解釈が揃う。

動的エーテライト要求は、地図画像を背景として扱うこと、G8 / G10 / G12 / G14 / G17 の全マップで埋め込みの町名・エーテライト表示を除去して重複させないこと、通常の地図表示と地点選択表示の双方で全有効エーテライトを継続表示すること、アイコンを実座標へ置くこと、町名ラベルを近接範囲で回避し狭い・過密な表示ではアイコンを優先すること、ラベルの省略・非表示を許容すること、クリック／タップで状態を変更しないこと、利用者がマスター情報を編集できないこととして維持されている。

初期リリースは日本語のみで、英語等の翻訳、多言語 UI、Mob の正式名・別名・検索語の多言語照合を含めない。将来の言語追加を妨げない名称の扱いは現行要件に残し、正確な名称契約やデータ形式は後工程へ分離されている。前回までの別アプリ・別モード状態、経路、手動順序、進行・取消、保存・消去、保存失敗、スマートフォン、共通操作、既存 Treasure 継続性および入力境界にも回帰はない。

## 5. 指摘事項

現行版に対する正式な指摘事項はなし。RR-009 は前回の Critical New Finding として、次節で Resolved を記録する。

## 6. 解消済み指摘

前回レビューまでの Finding 履歴を維持し、RR-009 の再確認条件を満たしたため Resolved とする。`requirements-review-008.md` およびそれ以前のレビュー成果物は変更していない。

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| RR-001 | Resolved（継続確認） | `REQ-R-001` / `REQ-R-002` / `AC-008` で、マップ間遷移を第一軸、同一マップの X/Y 距離を最小化する要求が維持されている。 |
| RR-002 | Resolved（継続確認） | `REQ-D-002` / `AC-017` で、無効・未知・参照不能情報を正常採用せず、誤ったルート・進捗を防ぐ境界が維持されている。 |
| RR-003 | Resolved（継続確認） | `REQ-R-001` で、同じ遷移回数の候補に対する料金・ロード時間を一方へ常に優先しない補助評価とする判断が維持されている。 |
| RR-004 / RR-005 | Superseded（継続確認） | Test Strategy、CI / GitHub Security、時点依存の脆弱性台帳に相当する旧要求は現行 Requirements に再導入されていない。 |
| RR-006 | Resolved（継続確認） | `REQ-L-006` / `AC-021` で、保存失敗の識別、未保存変更を保存済みと扱わないこと、最後の正常保存状態の保持が維持されている。 |
| RR-007 | Resolved（継続確認） | `REQ-F-005` / `AC-020` で、対象固有の入口を保ちながら、両アプリの共通操作の利用結果が追跡可能である。 |
| RR-008 | Resolved（継続確認） | `REQ-Q-001` / `AC-018` で、Mob 固有のモード切替と各アプリに該当するスマートフォン主要操作の適用範囲が区別されている。 |
| RR-009 | Resolved | `REQ-F-006` は検証済み T のみを案内表示へ採用し、`REQ-A-003` は legacy R を共通地図情報へ採用せず、`REQ-A-004` は T のみを共通地図情報・表示・参照・経路計算に使用し legacy R を除外する。`AC-022`、9.1、9.2、10.1 も同じ境界を明記し、Requirement → Acceptance → Traceability を通じて再確認条件を満たしている。 |

## 7. 上流へのフィードバック

なし。Concept Review 005 で確認された目的、対象ユーザー、v1、対象外、責任境界および成功状態は、既存製品スコープの評価に十分である。動的エーテライト、T / legacy R、資産およびローカライズに関する追加判断は、最新のユーザー判断として Requirements に適切に反映されており、Concept の不足として扱う必要はない。

## 8. 保留した指摘

- エーテライトおよび町名の正確な schema、field、値域、参照形式、検証方法、同じマップの統合・更新・訂正・公開手順は Specification / Design / Implementation / Test へ引き継ぐ。T のみ・legacy R 不使用という外部境界は Requirements で確定済みである。
- 町名ラベルの正確な配置、衝突回避、近接範囲、省略・非表示の判定、表示上限、通常表示と地点選択表示の具体的 UI は Specification へ引き継ぐ。アイコン優先、実座標、案内表示の非操作性、接続線を必須としない判断は現行 Requirements で確定している。
- 既存エーテライト視覚資産の再利用可否、出典・ライセンス確認、画像編集方法、対応画像の実体および全対応マップの移行結果は後続確認へ引き継ぐ。これらの未検証状態を Requirements Finding へ変換しない。
- 初期日本語データの正確な名称表現、既存 Treasure のマップ名・町名およびチャット一括登録との詳細な照合、将来言語追加時の名称契約は Specification / Data 管理へ引き継ぐ。英語等の翻訳、多言語 UI、Mob 名称・別名・検索語の多言語照合を v1 に追加する指摘は作成しない。
- 保存、経路、既存保存データ、ブラウザ挙動、マスターデータ、画像、ライセンス、実装およびテストの適合性は本 Requirements Review では検証していない。

## 9. 対象範囲と追跡

| 根拠 | 対応 Requirements | 対応 Acceptance | 今回の判定 |
| --- | --- | --- | --- |
| Concept 1、4: 別アプリ・別状態・ソロ／パーティ | `REQ-F-001`–`REQ-F-004`, `REQ-L-001`–`REQ-L-005` | `AC-001`, `AC-002`, `AC-014`, `AC-015` | 整合 |
| Concept 1、2、3、5、6: 共通操作感 | `REQ-F-005` | `AC-020` | 整合。RR-007 解消を継続確認 |
| Concept 2、3: Treasure と Mob の代表利用・既存継続 | `REQ-T-001`–`REQ-T-003`, `REQ-M-001`–`REQ-M-008`, `REQ-Q-002` | `AC-003`–`AC-007` | 整合 |
| Concept 1、3、4: 最短経路と手動順序 | `REQ-R-001`–`REQ-R-008` | `AC-004`, `AC-008`–`AC-010` | 整合。RR-001 / RR-003 解消を継続確認 |
| Concept 3–6: 進行と訂正 | `REQ-P-001`–`REQ-P-005` | `AC-011`–`AC-013` | 整合 |
| Concept 4–6: 独立状態、復元、消去、保存失敗 | `REQ-L-001`–`REQ-L-006`, `REQ-D-002` | `AC-001`, `AC-002`, `AC-014`, `AC-015`, `AC-017`, `AC-021` | 整合。RR-006 解消を継続確認 |
| Concept 4、6: スマートフォン | `REQ-Q-001` | `AC-018` | 整合。RR-008 解消を継続確認 |
| Concept 5、7: マスター、入力、責任境界 | `REQ-A-001`, `REQ-A-002`, `REQ-D-001`–`REQ-D-003`, `REQ-S-001`–`REQ-S-005` | `AC-016`, `AC-017`, `AC-019` | 整合 |
| 最新ユーザー判断: 動的エーテライト、T のみ・legacy R 不使用、共通地図、画像移行、非操作性、初期ローカライズ | `REQ-F-006`–`REQ-F-008`, `REQ-A-003`, `REQ-A-004`, `REQ-D-004`, `REQ-S-005` | `AC-022`–`AC-025` | 整合。RR-009 解消 |

## 10. 検証結果

- レビュー開始時に `sha256sum docs/requirements/requirements.md` を実行し、指定された対象 SHA-256 `30f91a210b44bc2e69422d6d807ac678e7b6ca52fa669301308bc7618554cba0` と一致することを確認した。
- Requirements 全文、Concept、Concept Review 005、前回 Requirements Review 008、README、AGENTS.md、レビュー手順一式を確認した。`MEMORY.md` は既存無関係差分のため内容・差分を確認していない。
- RR-009 の再確認として、`REQ-F-006`、`REQ-A-003`、`REQ-A-004`、`AC-022`、9.1、9.2、10.1 を照合した。検証済み T のみの採用・表示・参照・経路計算と legacy R の不使用が全箇所で一致している。
- Requirement ID 53 件、Acceptance ID 25 件を確認し、定義 ID の重複はない。各 Requirement は Acceptance 表から少なくとも一度参照され、新規・修正された T / legacy R 境界も `AC-022` と 10.1 へ追跡されている。
- 対象文書の Markdown 章構成、対象文書内の相対リンク（Concept、Concept Review、MEMORY、README）および参照先の存在を確認した。
- `git diff --check`: 既存の作業ツリー差分に空白エラーなし。対象 Requirements の SHA-256 はレビュー中に変化していない。
- `git diff --name-only`、`git diff --cached --name-only`、`git ls-files --others --exclude-standard` で、既存の `MEMORY.md` と対象 Requirements の差分を保持し、本サイクルの新規成果物以外を変更していないことを確認する。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。Requirements 文書だけのレビューであり、アプリコードを変更していないため対象外。
- 実装、テスト、静的マスター、画像、ブラウザ表示、マスターデータの正確性・完全性、画像出典・ライセンス、Specification / Design の実現可能性: Not validated。本レビューの対象外または後続工程で確認する事項である。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | PASS | Concept の既存目的、対象ユーザー、v1、対象外、責任境界と矛盾しない。最新ユーザー判断の動的エーテライト・T / legacy R・画像・ローカライズ境界も Requirements へ反映されている。 |
| 2. 要求完全性 | PASS | 既存 v1 の主要能力に加え、動的表示、共通地図情報、全対応マップの重複除去、T のみ・legacy R 不使用、非操作性、初期日本語境界が外部要求として定義されている。 |
| 3. 外部観測可能性 | PASS | 通常表示・地点選択表示での案内、実座標、ラベル優先・省略、クリック／タップ時の非状態変更、既存操作および保存結果を Acceptance から判断できる。 |
| 4. 責任・境界 | PASS | マスターデータ管理者の責任、利用者によるマスター編集禁止、ゲーム・チャット・共有機能との境界、T のみ・legacy R 不使用の採用範囲が明確である。 |
| 5. 品質・安全性 | PASS | 無効・未知・参照不能情報の誤採用防止、状態分離、保存失敗時の完全性、画像と動的表示の重複防止、エーテライト案内の非操作性が定義されている。 |
| 6. Acceptance | PASS | 全 Requirement が Acceptance へ追跡され、`AC-022` が T のみ・legacy R 不使用、表示範囲、共通化、画像重複除去をまとめて判定できる。 |
| 7. 工程境界 | PASS | schema、field 名、UI 部品、ラベル回避アルゴリズム、保存方式、画像編集方法、資産ライセンスの具体的処理、テスト手順を後工程へ分離している。 |
| 8. 未決定事項 | PASS | Requirements で確定すべき外部境界と、Specification / Design / Implementation / Test で定める詳細・検証を適切に分離している。 |

Critical 0 / Major 0 / Minor 0。Gate failure はなく、RR-009 の New Critical Finding も Resolved のため、最終判定は `READY` とする。

## 12. 残存リスクと未決定事項

- T レコードの実データの正確性・完全性、全対応マップの共通化結果、座標、参照整合性、legacy R 除外の実装結果は未検証であり、後続工程で確認する必要がある。
- G8 / G10 / G12 / G14 / G17 の全マップ画像から埋め込み町名・エーテライト表示が実際に除去され、動的表示と重複しないことは未検証である。
- 既存エーテライト視覚資産の再利用可否、出典、利用条件および画像編集結果は未確定・未検証である。
- 町名ラベルの自動回避、近接範囲、省略・非表示、狭い・過密な表示での最終的な外部契約は Specification で定める必要がある。ただしアイコン優先、実座標、接続線を必須としないこと、案内表示の非操作性は Requirements で確定している。
- 初期日本語名称と既存 Treasure のマップ名・町名・チャット一括登録の整合、および将来言語を追加する際の正確な名称契約は未検証・未決定である。v1 に英語等の翻訳、多言語 UI、Mob 名称・別名・検索語の多言語照合を追加しない前提は維持する。
- `MEMORY.md` の既存差分は本レビューの根拠・対象に含めていない。

## 13. 自動変更

なし。`docs/requirements/requirements.md`、Concept、前回レビュー、Specification、Design、README、`MEMORY.md`、コード、テストおよび設定は変更していない。本サイクルで新規作成した成果物は `docs/reviews/requirements/requirements-review-009.md` のみである。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。RR-009 は Resolved。検証済み T レコードのみを共通地図情報、表示・参照・経路計算へ使用し、legacy R レコードを使用しない外部境界が Requirements、Acceptance、9.1、9.2、10.1 から一意に追跡できるため、Requirements は Specification へ引き渡し可能である。
