# Requirements Review 008: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 008（独立 Requirements Review）
- 対象フェーズ: Requirements
- 確認日: 2026-09-12（Asia/Tokyo）
- 対象成果物: `docs/requirements/requirements.md`
- 対象版 / SHA-256（レビュー開始時）: `79ce6d7c3638ea371d27caa0c7418a94a34fd36cbb247a7137fcc9b9526e79ad`
- 前回レビュー: `docs/reviews/requirements/requirements-review-007.md`（不変・参照のみ）
- 対象範囲: Requirements 全文、Concept との整合、全 Requirement と Acceptance、最新の動的エーテライト・町名表示判断、共通地図情報、画像移行、T / legacy R 境界、初期日本語・将来ローカライズ境界、責任・安全性、Traceability、工程境界
- 未確認範囲: 実装、テスト、静的マスターデータ、地図画像の実体・編集結果、ブラウザ表示、マスターデータの正確性・完全性、出典・ライセンスの実査、Specification / Design の実現可能性、`MEMORY.md` の内容および既存差分

## 2. 使用した根拠

- 最新のユーザー判断: 動的エーテライト表示、地図画像の背景化、全対応マップの重複除去、アイコン・町名ラベルの表示優先順位と非操作性、共通地図マスター、検証済み T レコードのみの採用と legacy R の不使用、既存 Treasure の継続利用、初期日本語・将来ローカライズ境界、資産再利用と出典・ライセンス確認の境界。
- 承認済み上流成果物: `docs/concept/concept.md` および `docs/reviews/concept/concept-review-005.md`。Treasure / Mob の目的、利用者、v1、対象外、責任境界、成功状態との整合確認に使用した。
- レビュー対象: `docs/requirements/requirements.md` 全文。外部要求、責任、Acceptance、Traceability、未決定事項を確認した。
- 前回レビュー: `docs/reviews/requirements/requirements-review-007.md` および必要な範囲の過去履歴。RR-001〜RR-008 の状態と、前回の READY 判定後に追加された要求の境界を確認した。
- 下流文脈: `docs/specification/specification.md`、`docs/design/design.md`。Requirements の詳細不足を Finding 化せず、Specification / Design へ委譲された事項の確認に限定して参照した。
- 既存利用者向け契約・作業指針: `README.md`、`AGENTS.md`。既存 Treasure の継続範囲、対応グレード、画像・データ・文書レビューの検証境界を確認した。
- レビュー手順: `requirements-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`requirements-review/reviewers.md`、`review-gates.md`、`security-checklist.md`。
- `MEMORY.md`: 作業開始時の既存無関係差分を保護するため、内容・差分を本レビューの根拠として採用せず、参照・変更していない。

## 3. レビュー結果

**REVISE REQUIREMENTS**

Critical 1 / Major 0 / Minor 0。`RR-009` は最新の明示判断に対する Requirements-level の新規欠落であり、表示・経路計算に用いる有効エーテライト集合を一意に定義できない。Critical の New Finding があるため、Gate ルールにより Specification への引き渡し前に Requirements の修正が必要である。

## 4. 総評

Requirements は、前回レビューで確認された Treasure / Mob の分離、Mob のソロ／パーティ、登録対象、経路、手動順序、進行・取消、保存・消去、保存失敗、スマートフォン対応、共通操作および既存 Treasure 継続性を維持している。Requirement 53 件と Acceptance 25 件は ID と対応関係を保ち、正確な UI、データスキーマ、保存方式、ラベル回避アルゴリズム、資産の具体的扱い、テスト手順を後工程へ分離している。

今回追加された動的エーテライト要求も、地図画像を背景として扱うこと、G8 / G10 / G12 / G14 / G17 の全マップで埋め込み表示を重複させないこと、通常表示と地点選択表示で有効な案内を継続すること、アイコンを実座標へ置くこと、町名ラベルの回避・省略、クリック／タップによる状態変更の禁止、利用者によるマスター編集の禁止、同じマップのグレード間共通化として外部要求へ展開されている。初期リリースを日本語に限定し、英語等の翻訳、多言語 UI、Mob 名称・別名・検索語の多言語照合を含めない境界も明記されている。

ただし、最新判断の「検証済み T レコードだけを採用し、legacy R は使わない」というデータ境界は、`REQ-F-006`、`REQ-A-003`、`REQ-A-004`、`AC-022` および Traceability に明示されていない。「検証済み」「参照解決済み」「対象範囲内」という現在の表現だけでは、検証済みの legacy R を含める実装と除外する実装を区別できず、外部表示集合と経路の開始候補が分岐する。この一点は T / R の正確な schema を要求するものではなく、製品として採用するレコード集合の責任境界を Requirements で確定する必要があるため、Critical とした。

## 5. 指摘事項

### RR-009 — Critical — New — 有効エーテライトの T / legacy R 境界が未定義

- **状態:** New
- **対象箇所:** `REQ-F-006`（85行）、`REQ-A-003`（237行）、`REQ-A-004`（241行）、`AC-022`（322行）、9.1 の 11・12 項、10.1 の最新ユーザー判断の Traceability 行
- **事実:** Requirements は、対象マップに登録された「有効」「検証済み」「対象マップとの参照が解決できる」エーテライトを表示・参照すると定めている。しかし、最新の明示判断で採用対象とされた検証済み `T` レコードであること、legacy `R` を使用しないことが、Requirement、Acceptance、または Traceability に明記されていない。「対象範囲外」は、T / legacy R のどちらが対象かを外部から一意に判定できる定義になっていない。
- **根拠:** 最新ユーザー判断 8「検証済み T aetheryte records のみが対象。legacy R は使用しない」。対象文書の `REQ-F-006`、`REQ-A-003`、`REQ-A-004` および `AC-022` は、動的表示・共通地図情報・有効性・受け入れ条件を定義しているが、このレコード種別境界を追跡していない。
- **影響:** 下流が、検証済みかつマップ参照を解決できる legacy R を表示対象・町名ラベル対象・経路計算の開始候補として採用する契約と、T だけを採用する契約のいずれも選べる。これにより、通常表示・地点選択表示の案内内容、町名の表示数、初回経路の開始候補および移動負担が変わり、ユーザーが確定した「R は使わない」という外部境界を Acceptance で判定できない。
- **最小修正:** エーテライトの採用集合を「検証済み T レコード」に限定し、legacy R を共通地図情報、表示・参照および経路計算に使用しないことを Requirements の外部境界として明記する。対応する Acceptance と Traceability もこの境界を判定できるよう更新する。T / R の具体的な schema、field 名、移行方法、検証手順は Specification / Design / Implementation / Test に残す。
- **再確認条件:** `REQ-F-006` / `REQ-A-003` / `REQ-A-004`、`AC-022`、9.1 および 10.1 から、表示・参照・経路計算に使える集合が検証済み T のみであり legacy R を使わないことを一意に追跡できること。T 境界を満たすための具体的なデータ形式や移行手順を Requirements が先取りしていないこと。

## 6. 解消済み指摘

前回レビューで確認された状態を維持している。`requirements-review-007.md` は変更していない。

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| RR-001 | Resolved（継続確認） | `REQ-R-001` / `REQ-R-002` / `AC-008` で、マップ間遷移を第一軸、同一マップの X/Y 距離を最小化する要求が維持されている。 |
| RR-002 | Resolved（継続確認） | `REQ-D-002` / `AC-017` で、無効・未知・参照不能情報を正常採用せず、誤ったルート・進捗を防ぐ境界が維持されている。RR-009 は T / legacy R の採用集合を決める別の欠落である。 |
| RR-003 | Resolved（継続確認） | `REQ-R-001` で、同じ遷移回数の候補に対する料金・ロード時間を一方へ常に優先しない補助評価とする判断が維持されている。 |
| RR-004 / RR-005 | Superseded（継続確認） | Test Strategy、CI / GitHub Security、時点依存の脆弱性台帳に相当する旧要求は現行 Requirements に再導入されていない。 |
| RR-006 | Resolved（継続確認） | `REQ-L-006` / `AC-021` で、保存失敗の識別、未保存変更を保存済みと扱わないこと、最後の正常保存状態の保持が定義されている。 |
| RR-007 | Resolved（継続確認） | `REQ-F-005` / `AC-020` で、対象固有の入口を保ちながら、両アプリの共通操作の利用結果が追跡可能である。 |
| RR-008 | Resolved（継続確認） | `REQ-Q-001` / `AC-018` で、Mob 固有のモード切替と各アプリに該当するスマートフォン主要操作の適用範囲が区別されている。 |

## 7. 上流へのフィードバック

なし。Concept Review 005 で確認された目的、対象ユーザー、v1、対象外、責任境界および成功状態は、今回の動的エーテライト・ローカライズ判断を評価するための既存製品スコープとして十分である。最新の T / legacy R、資産、初期言語に関する判断は、ユーザーが後から明示した Requirements への直接根拠として扱い、Concept の不足へ偽装しない。

## 8. 保留した指摘

- エーテライトおよび町名の正確な項目、値域、参照形式、T レコードの schema、検証方法、同じマップの統合・更新・訂正・公開手順は Specification / Design / Implementation / Test へ引き継ぐ。T の採用と legacy R の不使用という外部境界自体は RR-009 の修正対象である。
- アイコンの具体的な資産、再利用の採否、出典・ライセンス確認の証跡、画像編集方法、対応画像の実体および全マップの移行結果は後続確認へ引き継ぐ。Requirements の資産再利用方針を超える Finding は作成しない。
- 町名ラベルの正確な配置、衝突回避、近接範囲、省略・非表示の判定、表示上限、通常表示と地点選択表示の具体的 UI は Specification へ引き継ぐ。アイコン優先、ラベルの非操作性、接続線を必須としないという外部判断は現行 Requirements で確認した。
- 初期日本語データの正確な名称表現、既存 Treasure のマップ名・町名およびチャット一括登録との詳細な照合、将来言語追加時の正確な名称契約は Specification / Data 管理へ引き継ぐ。英語等の翻訳、多言語 UI、Mob 名称・別名・検索語の多言語照合を v1 に追加する指摘は作成しない。
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
| Concept 5、7: マスター、入力、責任境界 | `REQ-A-001`, `REQ-A-002`, `REQ-D-001`–`REQ-D-003`, `REQ-S-001`–`REQ-S-005` | `AC-016`, `AC-017`, `AC-019` | 概ね整合 |
| 最新ユーザー判断: 動的エーテライト、共通地図、画像移行、非操作性、初期ローカライズ | `REQ-F-006`–`REQ-F-008`, `REQ-A-003`, `REQ-A-004`, `REQ-D-004`, `REQ-S-005` | `AC-022`–`AC-025` | T のみ・legacy R 不使用の追跡が欠落（RR-009） |

## 10. 検証結果

- レビュー開始時に `sha256sum docs/requirements/requirements.md` を実行し、指定された対象 SHA-256 `79ce6d7c3638ea371d27caa0c7418a94a34fd36cbb247a7137fcc9b9526e79ad` と一致することを確認した。
- Requirements 全文、Concept、Concept Review 005、前回 Requirements Review 007、README、AGENTS.md、レビュー手順一式を確認した。前回レビュー成果物は変更していない。
- Requirement ID 53 件、Acceptance ID 25 件を確認し、定義 ID の重複はない。各 Requirement は Acceptance 表から少なくとも一度参照され、追加された `REQ-F-006`–`REQ-F-008`、`REQ-A-003`–`REQ-A-004`、`REQ-D-004` も `AC-022`–`AC-025` へ追跡されている。
- 対象文書の 14 章構成、対象文書内の相対リンク（Concept、Concept Review、MEMORY、README）および参照先の存在を確認した。`MEMORY.md` は既存無関係差分のため内容・差分をレビューしていない。
- `git diff --check`: docs-only の作業ツリーで確認対象の空白エラーなし。対象 Requirements の SHA-256 は確認中に変化していない。
- `git diff --name-only`、`git diff --cached --name-only`、`git ls-files --others --exclude-standard` により、既存の `MEMORY.md` と対象 Requirements の作業ツリー差分を保持し、本レビューで作成する成果物以外を変更しないことを確認する。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。Requirements 文書だけのレビューであり、アプリコードを変更していないため対象外。
- 実装、テスト、静的マスター、画像、ブラウザ表示、マスターデータの正確性・完全性、画像出典・ライセンス、Specification / Design の実現可能性: Not validated。本レビューの対象外または後続工程で確認する事項である。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | FAIL | Concept 由来の既存スコープは整合しているが、最新ユーザー判断で確定した T のみ・legacy R 不使用の境界が Requirements に展開されていない。`RR-009`（Critical）に対応する。 |
| 2. 要求完全性 | FAIL | 動的表示の大枠は定義されているが、表示・参照・経路計算へ入る aetheryte レコード集合を一意に限定する必要な外部境界が欠落している。`RR-009` に対応する。 |
| 3. 外部観測可能性 | FAIL | `AC-022` は「有効なエーテライト」を受け入れるが、検証済み T と legacy R を区別できないため、表示内容と初回経路の成立判定が一意でない。`RR-009` に対応する。 |
| 4. 責任・境界 | FAIL | マスターデータ管理者の責任と利用者の編集禁止は定義されているが、採用してよい aetheryte レコード種別の境界が明示されず、下流主体の責任が異なる採用集合を選べる。`RR-009` に対応する。 |
| 5. 品質・安全性 | PASS | 無効・未知・参照不能情報の誤採用防止、状態分離、保存失敗時の完全性、エーテライト案内の非操作性は定義されている。T / legacy R の境界は要求完全性上の `RR-009` として扱う。 |
| 6. Acceptance | FAIL | `AC-022` は通常表示・地点選択表示・共通地図情報・重複除去を確認できるが、T のみ・legacy R 不使用を判定できない。`RR-009` に対応する。 |
| 7. 工程境界 | PASS | 正確な schema、field 名、ラベルアルゴリズム、画像編集方法、資産ライセンスの具体的処理、テスト手順は後工程へ分離されている。 |
| 8. 未決定事項 | PASS | Requirements で確定すべき採用境界と、Specification / Design で決める詳細は概ね分離されている。T / legacy R の外部境界だけは下流へ委譲できず、`RR-009` の修正が必要である。 |

Critical 1 件が Gate 1、2、3、4、6 の不合格に対応するため、最終判定は `REVISE REQUIREMENTS` とする。

## 12. 残存リスクと未決定事項

- `RR-009` を解消しないままでは、検証済み legacy R を表示・参照・経路計算へ含める余地が残り、ユーザー判断と異なる案内と経路が成立する。
- `RR-009` 解消後も、T レコードの実データの正確性、全対応マップの完全性、座標の正しさ、同じマップの共通化結果、画像の重複除去結果は未検証である。
- 既存視覚資産の再利用可否、出典、利用条件および画像編集結果は未確定・未検証であり、後続の資産確認が必要である。
- 町名ラベルの自動回避、近接範囲、省略・非表示、狭い・過密な表示での最終的な外部契約は Specification で定める必要がある。ただしアイコン優先と非操作性は Requirements の確定事項である。
- 初期日本語名称と既存 Treasure のマップ名・町名・チャット一括登録の整合、および将来言語を追加する際の正確な名称契約は未検証・未決定である。v1 に英語等の翻訳、多言語 UI、Mob 名称・別名・検索語の多言語照合を追加しない前提は維持する。
- `MEMORY.md` の既存差分は本レビューの根拠・対象に含めていない。

## 13. 自動変更

なし。`docs/requirements/requirements.md`、Concept、前回レビュー、Specification、Design、README、`MEMORY.md`、コード、テストおよび設定は変更していない。本サイクルで新規作成する成果物は `docs/reviews/requirements/requirements-review-008.md` のみである。

## 14. 最終判定

**REVISE REQUIREMENTS**

Critical 1 / Major 0 / Minor 0。`RR-009` の New Critical Finding を解消し、検証済み T レコードのみを採用し legacy R を使用しない外部境界を Requirement、Acceptance、Traceability から一意に追跡できる状態にしてから、Specification へ引き渡すこと。
