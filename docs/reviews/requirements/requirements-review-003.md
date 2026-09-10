# Requirements Review 003: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 003
- 対象成果物: `docs/requirements/requirements.md`
- 対象フェーズ: Requirements
- 確認日: 2026-09-10（Asia/Tokyo）
- 対象版: Author による RR-004 / RR-005 対応後の作業ツリー上の未コミット・未追跡ドラフト
- 対象範囲: 全文。特に `REQ-Q-003` / `AC-017` のRequirement分類・90%測定、`REQ-S-007` / `AC-018` のGitHub対象母集団・未確認時の受入境界、前回Findingの状態追跡、上流整合性、Acceptance、工程境界を確認した。
- 前回資料: `docs/reviews/requirements/requirements-review-001.md`、`docs/reviews/requirements/requirements-review-002.md`（履歴資料として不変、変更していない）
- 未確認範囲: GitHub の認証が必要な個別の「Security and quality」指摘、実装、テスト、静的データ、画像、外部資料、実際のブラウザ挙動、マスターデータの正確性・利用条件。個別指摘の内容、severity、ID、件数、解消状態は主張しない。

## 2. 使用した根拠

- ユーザー依頼: 「要件定義にテストできる箇所のカバレッジを90%以上に設定。githubのSecurity and qualityで指摘されている項目も解消することを盛り込む」
- 承認済み上流成果物: `docs/concept/concept.md`。目的、対象ユーザー、v1、対象外、責任境界、マップ間移動方針を確認した。
- 対象成果物: `docs/requirements/requirements.md`。前回レビュー後の全体とRR-004 / RR-005対応差分を確認した。
- 前回レビュー資料: `docs/reviews/requirements/requirements-review-001.md`、`docs/reviews/requirements/requirements-review-002.md`。Finding履歴、対象版、前回Gateを確認した。
- 補助資料: `docs/concept/requirements-notes.md`（TEMPORARY / NON-NORMATIVE）。上流と矛盾しない未決定事項の照合に限定して使用した。
- プロジェクト指針: `AGENTS.md`。文書フェーズ、Scope Discipline、セキュリティ、文書検証、既存変更保持の規則を確認した。
- レビュー手順: `requirements-review` Skill、`review-common/review-playbook.md`、`requirements-review/review-gates.md`、`output-format.md`、`reviewers.md`、`security-checklist.md`。

## 3. レビュー結果

`READY`

Critical 0 / Major 1 / Minor 0。前回の `RR-001` / `RR-002` は Resolved、`RR-003` は Open のまま継続、前回の `RR-004` / `RR-005` は今回 Resolved と確認した。新規のCritical Findingはないため、Requirements はSpecificationへ引き渡せる状態と判定する。

## 4. 総評

`REQ-Q-003` / `AC-017` は、全Requirement IDをテスト可能 / テスト不可能のいずれかへ重複なく一度ずつ分類すること、未分類・重複分類・分母0を90%達成として扱わないこと、全件一覧・分母・分子・測定結果・証跡を外部から追跡できることを明記した。これにより、前回 `RR-004` が指摘した分母の恣意的な縮小または分母0の成功扱いを防ぐ外部条件が成立している。

`REQ-S-007` / `AC-018` は、GitHub「Security and quality」に確認時点で表示される全指摘項目を母集団とし、取得不能・未分類・状態不明・母集団不明を未解消または受入不可として扱うことを明記した。これにより、前回 `RR-005` が指摘した `actionable` 限定による依頼範囲の縮小と、取得不能を解消済みとみなす余地が解消されている。個別指摘を未確認であることも明示されており、未確認情報を根拠にした主張はない。

## 5. 指摘事項

なし。今回の再確認でCriticalの新規・Open・Reopened Findingは確認されなかった。

## 6. 解消済み指摘

### RR-001 — Resolved（継続確認）

`REQ-F-006`、`REQ-Q-002`、`AC-005`、`AC-015` により、登録された現在の対象集合から算出し、第一軸を異なるマップへの遷移回数の最小化、同数時の補助評価をテレポ料金・ロード時間とする判断原則が維持されている。前回のCritical条件は再発していない。

### RR-002 — Resolved（継続確認）

`REQ-D-007` / `AC-016` により、空・不正・不完全・未知の入力、欠落・不正なマスターデータを有効な対象・位置情報として扱わず、処理不能または未確認を識別でき、誤ったルート算出・進行更新を防ぐ外部要求が維持されている。

### RR-003 — Open（継続）

同じマップ遷移回数の候補を比較する際のテレポ料金とロード時間の方向・優先関係は、`REQ-F-006` / `REQ-Q-002` / `AC-005` / `AC-015` で補助的評価に留まり、詳細比較方法を下流へ委譲している。これはCriticalではなく、今回のユーザー依頼の対象外であるため任意改善として継続する。

### RR-004 — Resolved（今回再確認）

`REQ-Q-003`（`docs/requirements/requirements.md:179-181`）と `AC-017`（235行）は、全Requirement IDをテスト可能 / テスト不可能のいずれか一方へ重複なく一度ずつ分類すること、テスト不可能の理由を記録すること、未分類・重複分類・分母0を90%達成扱いしないことを明記した。全件一覧、分母・分子、測定結果、証跡の外部追跡も要求されており、前回の再確認条件を満たす。

### RR-005 — Resolved（今回再確認）

`REQ-S-007`（`docs/requirements/requirements.md:209-211`）と `AC-018`（236行）は、`actionable` に限定せずGitHub「Security and quality」に表示される全指摘項目を対象母集団とした。取得不能・未分類・状態不明・個別指摘未確認・対象母集団不明を、解消済みまたは受入成立の根拠として扱わないことも明記されている。前回の依頼範囲・未確認境界・再確認条件を満たす。

## 7. 上流へのフィードバック

- `docs/concept/concept.md:9, 95` は、リネーム後の `./treasure-compass-mob-compass-requirements-notes.md` を参照しており、現行の `docs/concept/requirements-notes.md` と一致しない。Requirementsの直接リンクは正しいため、RequirementsのFindingではなく上流資料の文書整合性フィードバックとして継続する。
- 既存Concept Review資料の旧ファイル名はレビュー履歴として保持されている。現行参照として更新するかは管理者判断とする。

## 8. 保留した指摘

- `REQ-Q-003` の具体的な分類規則、Requirementと自動テスト / 自動検証の追跡形式、測定手順、証跡保存はSpecification / Testへ引き継ぐ。全件分類、分母0不合格、90%以上の閾値はRequirementsで確定済みである。
- `REQ-S-007` のGitHub個別指摘、severity、ID、担当、期限、解消証跡の具体形式は、実際に取得できた情報を確認した後の下流工程へ引き継ぐ。全表示項目を母集団とし、取得不能・未分類・状態不明・母集団不明を未解消または受入不可とする境界はRequirementsで確定済みである。
- ルート評価式、入力形式、保存、チャット形式、状態遷移、アルゴリズム、テストコード等はSpecification / Design / Implementation / Testの責務であり、Requirements Findingにはしない。
- 応答時間、可用性、対応環境、同時利用者数等の数値品質目標は上流根拠がないため未要求とする。

## 9. 対象範囲と追跡

| 根拠 | 対応Requirements | 対応Acceptance | 判定 |
| --- | --- | --- | --- |
| Conceptの目的、マップ間移動、テレポ負担 | `REQ-F-001`, `REQ-F-006`, `REQ-F-007`, `REQ-Q-001`, `REQ-Q-002` | `AC-001`, `AC-005`, `AC-006`, `AC-015` | 上流整合。RR-001 Resolved、RR-003 Open |
| Conceptの対象ユーザー、利用場面、v1、対象外 | `REQ-F-002`–`REQ-F-014`, `REQ-S-003` | `AC-002`–`AC-016` | 追跡可能。対象外の拡張なし |
| Conceptの責任境界・判断原則 | `REQ-D-003`, `REQ-D-007`, `REQ-S-001`–`REQ-S-006` | `AC-012`–`AC-016` | RR-002 Resolved |
| ユーザー依頼: テスト可能箇所の90%カバレッジ | `REQ-Q-003` | `AC-017` | 全件分類、分母0不合格、一覧・証跡を確認可能。RR-004 Resolved |
| ユーザー依頼: GitHub Security and qualityの指摘解消 | `REQ-S-007` | `AC-018` | 全表示項目を対象、未確認・母集団不明は受入不可。RR-005 Resolved |

## 10. 検証結果

- `requirements-review` Skillおよび指定されたreview-common / requirements-reviewの参照資料を確認した。
- `AGENTS.md`、Concept、Requirements、検討メモ、Requirements Review 001 / 002を確認した。
- `REQ-Q-003` / `AC-017`について、Requirement IDの全件分類、重複なし、未分類・分母0の不合格境界、90%以上の測定・証跡追跡を確認した。
- `REQ-S-007` / `AC-018`について、全表示項目の母集団、取得不能・未分類・状態不明・母集団不明の未解消 / 受入不可境界、解消証跡を確認した。
- 全Requirement ID（REQ-F 001–014、REQ-D 001–007、REQ-Q 001–003、REQ-S 001–007）とAcceptance ID（AC-001–018）の識別子を確認した。
- Markdown構成、Requirement / Acceptance IDの参照、RequirementsからConceptへの内部リンクを手動確認した。
- `git diff --check`: PASS（レビュー資料作成前の対象差分）。
- 既存 `requirements-review-001.md` / `requirements-review-002.md` のSHA-256はレビュー前後で不変として確認した。既存資料は変更していない。
- 変更範囲: Authorの対象差分は `docs/requirements/requirements.md` のみ。Reviewerはレビュー資料以外を変更していない。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。docsのRequirementsレビューであり、コード変更を伴わないため対象外。
- GitHubの個別「Security and quality」指摘: Not validated。認証不備により取得しておらず、個別内容・件数・severity・ID・解消状態を成功扱いにしていない。
- README、実装、テスト、静的データ、画像、ブラウザ挙動、マスターデータの正確性・利用条件: Not validated。Requirementsの根拠または対象範囲外として成功扱いにしていない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | PASS | Conceptの目的、対象、v1、対象外、責任境界を維持し、ユーザー依頼の2項目もRequirementsへ直接追跡されている。 |
| 2. 要求完全性 | PASS | 巡回・進行・責任境界に加え、90%カバレッジの完全分類条件とGitHub全表示項目の解消要求・Acceptance・引継ぎが定義されている。RR-004 / RR-005はResolved。 |
| 3. 外部観測可能性 | PASS | `AC-017`は全件分類・分母・分子・測定・証跡を、`AC-018`は全表示項目の台帳・解消証跡・未確認時の受入不可を要求している。 |
| 4. 責任・境界 | PASS | テストカバレッジの分類・証跡と、GitHub指摘を未確認のまま解消済みとしない境界が明確である。個別台帳項目・担当等は下流へ委譲されている。 |
| 5. 品質・安全性 | PASS | `REQ-Q-003`は検証可能性と測定完全性、`REQ-S-007`は品質指摘の全件母集団と解消証跡を要求する。個別GitHub内容を未確認のまま主張していない。 |
| 6. Acceptance | PASS | `AC-017` / `AC-018`は、90%閾値、完全分類、全表示項目、未確認・母集団不明の不合格を外部から判定可能にしている。 |
| 7. 工程境界 | PASS | 具体的なテストコード、GitHub個別指摘、台帳フォーマット、入力解析、アルゴリズムをRequirementsで発明せず下流へ送っている。 |
| 8. 未決定事項 | PASS | 90%閾値、分類完全性、分母0不合格、全表示項目の母集団、未確認・母集団不明の不合格境界はRequirementsで確定し、詳細手順と個別値は下流へ分離している。 |

## 12. 残存リスクと未決定事項

- RR-003はOpenの任意改善であり、同じマップ遷移回数の候補における料金・ロード時間の比較方向と優先関係は下流で決定する必要がある。
- GitHub個別指摘は未取得であり、台帳の内容・severity・ID・件数・解消状態は未確認である。REQ-S-007 / AC-018により、未確認を解消済みまたは受入成立の根拠にはできない。
- Mob Compassの候補状態、チャット案内の具体契約、保存・保持・互換性、マスターデータの具体契約は下流へ残っている。
- Conceptの旧リンクは上流資料側の文書整合性問題として継続している。

## 13. 自動変更

なし。`docs/requirements/requirements.md`、Concept、検討メモ、README、コード、テスト、設定、既存レビュー資料は変更していない。作成したのは本レビュー資料のみである。

## 14. 最終判定

**READY**

Criticalは0件。`RR-001` / `RR-002`はResolved、`RR-003`はOpenの任意改善、`RR-004` / `RR-005`は今回の修正によりResolvedと確認した。90%カバレッジは全Requirement IDの完全分類、分母0・未分類・重複分類の不合格、一覧・測定・証跡へ追跡可能であり、GitHub Security and qualityは全表示項目を母集団として取得不能・未分類・状態不明・母集団不明を未解消または受入不可としている。`requirements-review` SkillのGate規則により、Critical 0のため最終判定は`READY`とする。
