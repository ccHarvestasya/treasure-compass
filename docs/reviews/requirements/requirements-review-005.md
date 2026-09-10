# Requirements Review 005: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 005（独立レビュー）
- 対象フェーズ: Requirements
- 確認日: 2026-09-10（Asia/Tokyo）
- 対象版: 現在の未コミット作業ツリー
- Requirements SHA-256: `b1629f2834c2884bc7bbdc4cd875997e2ba0cc69f0a8c6b608836668286582a0`
- Concept SHA-256: `0fba67b9babbc6d0ca23f1198fa371c02a3d23981b5cfe3706f060715cc22864`
- 対象成果物: `docs/requirements/requirements.md`
- 関連確認対象: 要求されたリンク修正を含む `docs/concept/concept.md`
- 前回資料: `docs/reviews/requirements/requirements-review-004.md`。過去レビュー資料 001–004 は履歴として不変のまま確認した。
- 対象範囲: Concept 整合性、v1 の外部能力、責任境界、要求の粒度、ルート判断、Mob Compass の地点意味、対象集合・完了・手動順序変更、重複、Acceptance、Traceability、文書リンク、時点依存の開発・保守・リリース要求の除外。
- 未確認範囲: 実装、テスト、静的データ、画像、README の現行実装契約、ブラウザ挙動、マスターデータの正確性・利用条件、外部 API の現在値。これらを Requirements の合否根拠にはしていない。

## 2. 使用した根拠

- ユーザー依頼および `TC-REQ-CLEANUP-2026-09-10 / CREATE_COMMIT_REVIEW` のレビュー指示。Requirements から GitHub Security / 脆弱性スナップショットと Test Strategy 相当の要求を除外し、製品判断を Requirements で確定することを確認した。
- 承認済み上流成果物: `docs/concept/concept.md`。別の公開単位、Treasure の 1:1、Mob の 1:多、利用形態、共有周回の管理主体、v1 対象外、責任境界、地点意味の分離、マスターデータと周回情報の分離、第一軸をマップ間遷移回数とする方針を確認した。
- 補助資料: `docs/concept/requirements-notes.md`。`TEMPORARY / NON-NORMATIVE` として、単独で要求の根拠にせず、下流へ送る検討事項との整合確認にだけ使用した。
- 対象 Requirements: 全文。現行の要求、Acceptance、未決定事項、Traceability、参照資料、未確認範囲を確認した。
- 前回レビュー: `docs/reviews/requirements/requirements-review-004.md`。RR-001–RR-005 の状態と、旧リンク・旧工程要求の履歴を確認した。
- プロジェクト指針: `AGENTS.md`。Source of Truth、Scope Discipline、文書フェーズ、docs-only の検証規則、既存資料不変の規則を確認した。
- レビュー手順: `requirements-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`requirements-review/output-format.md`、`review-gates.md`、`reviewers.md`、`security-checklist.md`。

## 3. レビュー結果

`READY`（目標 Gate: `READY FOR SPECIFICATION`）。

現行版に対する Critical 0 / Major 0 / Minor 0。新規、Open、Reopened の Requirement-level finding はない。前回 Open だった RR-003 は、同一マップ遷移回数の候補について料金とロード時間をいずれか一方へ常に優先させず、同等の補助的な移動負荷として扱う外部判断が追加されたため Resolved とする。RR-004 / RR-005 は、最新のユーザー判断により対象要求自体が Requirements から除外されたため、歴史上の Resolved 状態を保持しつつ、現行版では Superseded / 適用外として扱う。

## 4. 総評

Requirements は、Concept の製品能力・制約・責任境界を外部から確認可能な要求へ展開できている。Treasure Compass と Mob Compass の公開単位、対象と座標の対応、個人利用とリーダー管理の共有周回、チャットを介した伝達、マスターデータの責任境界、ゲーム状態の自動取得・判定を行わない境界が維持されている。

今回の整理で、時点依存の Dependabot / CVE / GHSA / Code Scanning / Secret Scanning の台帳と、Requirement のテスト分類・自動テスト追跡率・証跡管理が Requirements から除外された。これらを製品の外部要求として残しておらず、根拠のない品質指標も追加していない。

`REQ-F-006` は、第一軸を異なるマップへの遷移回数とし、同数時には Concept が示すゲーム内通貨とロード時間の双方を、いずれか一方を常に優先しない同等の補助軸として扱う製品判断を確定している。これは新しい品質指標の追加ではなく、Concept の「移動に伴う双方の負担を抑える」という判断を Requirements レベルへ具体化したものであり、単位、正規化、比較式、アルゴリズムは下流に適切に残されている。

Mob Compass については、候補地点、現在のルートに採用された候補地点、確定した地点、利用者が確認した地点を同じ意味にせず、候補またはルート採用だけから利用者確認を導かない関係が Requirements と Acceptance に反映されている。対象の追加・削除、完了、手動順序変更についても、利用者から見える集合・完了区分・現在順序の結果を定め、正確な状態遷移と再算出規則を下流へ分離している。

## 5. 指摘事項

現行版に対する正式な指摘事項はなし。

| ID | 重大度 | Cycle 005 の状態 | 確認結果 |
| --- | --- | --- | --- |
| RR-001 | Critical（過去レビュー） | Resolved | 第一軸をマップ間遷移回数とする要求、現在対象集合からの算出、Acceptance への追跡が維持されている。 |
| RR-002 | Critical（過去レビュー） | Resolved | 無効・未確認の入力やマスターデータを有効扱いせず、誤ったルート・進行更新を防ぐ外部境界が維持されている。 |
| RR-003 | Major | Resolved | 同数時の料金・ロード時間の優先関係が「いずれか一方を常に優先しない同等の補助軸」として確定された。 |
| RR-004 | Major | Superseded（現行版では適用外） | Test Strategy / Verification Policy 相当の要求と Acceptance が削除され、Requirements に残っていない。過去の Resolved 状態は履歴として保持する。 |
| RR-005 | Major | Superseded（現行版では適用外） | GitHub Security / 脆弱性スナップショットの要求、台帳、Acceptance が削除され、Requirements に残っていない。過去の Resolved 状態は履歴として保持する。 |

## 6. 解消済み指摘

### RR-001 — Resolved（継続確認）

`REQ-F-006`、`AC-005`、9.1 の 1 項により、第一軸は異なるマップへの遷移回数であり、登録された現在の対象集合からルートを算出することが追跡できる。固定順序の提示だけを許す要求には戻っていない。

### RR-002 — Resolved（継続確認）

`REQ-D-007` / `AC-014` により、空・不正・不完全・未知の入力、欠落・不正なマスターデータを有効な対象・位置情報として扱わず、処理不能または未確認を利用者が識別でき、誤ったルート算出・進行更新を防ぐ外部結果が定義されている。

### RR-003 — Resolved（今回再確認）

`REQ-F-006` / `AC-005` / 9.1 の 1 項は、マップ間遷移回数が同一の候補について、ゲーム内通貨とロード時間を双方とも補助的に考慮し、どちらか一方を常に優先しないことを明記している。Concept は両者を別マップ移動の負担として扱っており、今回の記述はその両方を同等に扱う製品判断である。具体的な単位・観測条件・比較式・アルゴリズムを Requirements へ持ち込んでいないため、前回の RR-003 は解消と判定する。

### RR-004 / RR-005 — 歴史上 Resolved、現行版では Superseded

前回までの Requirements には、ユーザー依頼を背景とした Test Strategy 相当の 90% カバレッジ要求と、特定日時点の GitHub Security / 脆弱性台帳要求が存在し、RR-004 / RR-005 はそれらの明確化後に Resolved と記録されていた。今回の最新ユーザー判断は、これらがプロダクト Requirements の責任範囲外であるとして削除することである。現行版に該当する Requirement ID、Acceptance、時点依存台帳はなく、過去指摘を Reopened する理由はない。

## 7. 上流へのフィードバック

なし。前回までの Concept 内の `requirements-notes` 旧ファイル名参照は、現行 `docs/concept/concept.md` で `./requirements-notes.md` に修正され、実ファイルと一致している。`requirements-notes.md` は引き続き `TEMPORARY / NON-NORMATIVE` として扱われ、Requirements の単独根拠へ昇格されていない。

## 8. 保留した指摘

- 正確な入力形式、必須項目、上限、解析規則、データスキーマ、UI、保存方式は Specification / Design へ引き継ぐ。Requirements では、受け取る能力と無効情報を有効扱いしない外部結果までを定めている。
- ルートの評価式、単位・観測条件、候補比較の具体式、同率時の具体的な選択・表示方法、アルゴリズム、データ構造は Specification / Design へ引き継ぐ。第一軸と同順位時の料金・ロード時間の関係自体は Requirements で確定済みである。
- Mob Compass の候補地点、ルート採用地点、確定地点、利用者確認地点の正確な入力・表示・状態遷移、対象追加・削除・完了・手動順序変更に伴う再算出契機と既存情報の保持規則は Specification へ引き継ぐ。外部から区別すべき意味と操作結果は Requirements で確定済みである。
- チャット案内の構文、項目、古さ・欠落・重複の扱い、保存・保持・互換性、マスターデータの具体スキーマ・更新手順は後続工程へ引き継ぐ。
- CI、GitHub Security 運用、特定日時点の脆弱性台帳、Test Strategy / Verification Policy / Definition of Done の分類・カバレッジ・証跡は、本 Requirements の製品要求としては扱わない。今回のレビューでは代替文書を新設・変更していない。

## 9. 対象範囲と追跡

| 根拠 | 対応 Requirements | 対応 Acceptance | 判定 |
| --- | --- | --- | --- |
| Concept 1: 公開単位、マップ間移動、テレポ負担 | `REQ-F-001`, `REQ-F-006`, `REQ-F-007` | `AC-001`, `AC-005`, `AC-006` | 整合。第一軸と同順位時の関係を追跡可能。 |
| Concept 2–3: 対象ユーザー、利用場面、提供価値 | `REQ-F-002`, `REQ-F-003`, `REQ-F-004`, `REQ-F-007`, `REQ-F-009`, `REQ-F-010`–`REQ-F-013`, `REQ-D-001`, `REQ-D-005` | `AC-002`–`AC-011` | 個人利用、共有周回、チャット案内、管理継続を追跡可能。 |
| Concept 4: v1 スコープと対象外 | `REQ-F-001`, `REQ-F-003`–`REQ-F-005`, `REQ-F-008`, `REQ-F-010`, `REQ-S-003` | `AC-001`, `AC-003`, `AC-004`, `AC-007`, `AC-009` | 別公開単位、1:1 / 1:多、一律扱い、共有機能の対象外に矛盾なし。 |
| Concept 5: 責任境界・判断原則 | `REQ-F-004`, `REQ-F-008`, `REQ-F-009`, `REQ-F-014`, `REQ-S-001`–`REQ-S-005`, `REQ-D-007` | `AC-004`, `AC-007`, `AC-008`, `AC-009`, `AC-013`, `AC-014` | 自動判定なし、地点意味の分離、周回情報の分離、異常情報の安全な外部結果を追跡可能。 |
| Concept 6–7: 成功状態・要件定義への引継ぎ | `REQ-F-003`, `REQ-F-004`, `REQ-F-006`–`REQ-F-012`, `REQ-F-014`, `REQ-D-001`, `REQ-D-005`, `REQ-D-007`, `REQ-S-006` | `AC-003`–`AC-014` | 外部判断は Requirements、構文・状態遷移・計算詳細は下流へ分離。 |
| 最新ユーザー判断: 工程固有要求の除外 | 現行 Requirements に `REQ-Q-003` / `REQ-S-007` は存在しない | `AC-017` / `AC-018` は存在しない | プロダクト要求との混在なし。 |

## 10. 検証結果

- Requirements Review Skill と、指定された review-common / requirements-review の playbook、output format、gates、reviewers、security checklist を確認した。
- `AGENTS.md`、Concept、Requirements、TEMPORARY / NON-NORMATIVE requirements-notes、Requirements Review 001–004 を確認した。
- 対象 Requirements / Concept の SHA-256 はユーザー指定値と一致した。
- `REQ-F-*` 14件、`REQ-D-*` 3件、`REQ-S-*` 6件の現行 Requirement ID に重複はなく、14件の Acceptance が各 Requirement を参照していることを確認した。`REQ-Q-*` は現行 Requirements に存在しない。
- Acceptance と Traceability から、削除済みの `REQ-Q-003`、`REQ-S-007`、`AC-017`、`AC-018` への残存参照がないことを確認した。
- Concept、Requirements、requirements-notes 間の現行相対リンクを確認し、参照先ファイルの存在を確認した。旧ファイル名は現行3文書に残っていない。
- `git diff --check`: PASS。
- 過去レビュー 001–004 のファイルは変更・上書き・削除・改名していない。レビュー前に確認した既存変更は `docs/concept/concept.md` と `docs/requirements/requirements.md` の2件であり、本レビューでは対象以外を変更していない。
- `pnpm lint`: SKIPPED。docs-only の Requirements レビューであり、コード変更を伴わないため対象外。
- `pnpm test`: SKIPPED。docs-only の Requirements レビューであり、コード変更を伴わないため対象外。
- `pnpm run build`: SKIPPED。docs-only の Requirements レビューであり、コード変更を伴わないため対象外。
- 実装、テスト、README、静的データ、画像、ブラウザ挙動、マスターデータの正確性・利用条件、外部 API の現在値: Not validated。レビュー対象外または根拠未確認であり、成功扱いにしていない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | PASS | Concept の目的、対象、v1、対象外、責任境界、ルート第一軸が Requirements に反映され、リンク修正も現行ファイルと一致する。 |
| 2. 要求完全性 | PASS | 登録、候補を含むルート、進行、追加・削除・完了・手動順序変更、共有周回、チャット案内、マスターデータ、無効情報の外部結果が定義されている。 |
| 3. 外部観測可能性 | PASS | 現在対象集合、ルート順、遷移回数、候補・採用・確認済みの区別、完了区分、手動順序の結果を利用者から確認できる要求がある。詳細構文は下流で定義可能。 |
| 4. 責任・境界 | PASS | 利用者、共有周回リーダー、参加者、別のリーダー、マスターデータ管理者、ゲーム内チャットの責任境界が明確で、共有画面・同期・共同編集・権限移譲を v1 に追加していない。 |
| 5. 品質・安全性 | PASS | ゲーム状態の自動取得・判定を行わず、無効・未確認情報を有効扱いせず誤ったルート・進行更新を防ぐ要求がある。一般的な CI / GitHub Security 要求や根拠のない品質指標は残っていない。 |
| 6. Acceptance | PASS | 現行 Requirement ID と Acceptance の対応があり、ルート判断、地点意味、対象更新、完了、責任境界、異常情報の結果を外部から判定できる。 |
| 7. 工程境界 | PASS | 正確な入力形式、UI、スキーマ、保存、計算式、アルゴリズム、内部状態遷移、テスト手順、CI 運用、脆弱性台帳を下流または対象外へ分離している。 |
| 8. 未決定事項 | PASS | Requirements で決める外部判断は 9.1 と要求本文で確定し、状態遷移・再算出規則や評価式などの詳細は Specification / Design へ引き継いでいる。 |

## 12. 残存リスクと未決定事項

- 同一マップ遷移回数の候補で料金とロード時間を比較する単位・観測条件・具体式は未決定であり、Specification / Design で決める必要がある。ただし、いずれか一方を常に優先しないという Requirements の判断原則は確定している。
- Mob Compass の候補地点、ルート採用地点、確定地点、利用者確認地点の正確な状態遷移・表示・選択規則は未決定である。ただし、同じ意味として扱わないこと、候補・採用だけから確認済みとしないことは確定している。
- 対象の追加・削除・完了・手動順序変更に伴う既存情報の保持、再算出の契機、ルートと手動順序の切替規則は未決定である。ただし、更新後集合、完了区分、手動順序を外部から識別できる要求は確定している。
- チャット案内の古さ・欠落・重複、保存・保持・互換性、マスターデータの具体契約は下流で定義する。
- 特定日時点の GitHub Security 状態、脆弱性件数、テストカバレッジ、証跡の存在を、本 Requirements の Gate 判定根拠にはしていない。

## 13. 自動変更

なし。Reviewer は Requirements、Concept、requirements-notes、過去レビュー、README、コード、テスト、設定を変更していない。本サイクルで新規作成した成果物は `docs/reviews/requirements/requirements-review-005.md` のみであり、commit / push は行っていない。

## 14. 最終判定

**READY（READY FOR SPECIFICATION）**

Critical 0 / Major 0 / Minor 0。Concept の確定事項を取りこぼさず、Requirements の責任範囲を超える Test Strategy・CI / GitHub Security・時点依存脆弱性台帳を除外し、Acceptance と Traceability を現行 ID に合わせている。RR-003 は製品判断の追加により Resolved、RR-004 / RR-005 は最新判断により現行版では Superseded と確認した。`requirements-review` Skill の Gate 規則に従い、Requirements は Specification へ引き渡し可能である。
