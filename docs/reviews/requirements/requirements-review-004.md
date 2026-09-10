# Requirements Review 004: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 004
- 対象成果物: `docs/requirements/requirements.md`
- 対象フェーズ: Requirements
- 確認日: 2026-09-10（Asia/Tokyo）
- 対象版: Author 修正後の作業ツリー上の未コミット・未追跡ドラフト
- 対象範囲: 全文。特にGitHub Security APIスナップショット台帳、`REQ-S-007` / `AC-018`、`REQ-Q-003` / `AC-017`、参照資料の節番号、ID・リンク・Acceptance追跡、前回Findingの状態を確認した。
- 前回資料: `requirements-review-001.md`、`requirements-review-002.md`、`requirements-review-003.md`（履歴資料として不変、変更していない）
- 未確認範囲: GitHub APIの再取得による個別台帳値の外部照合、実装、テスト、静的データ、画像、READMEの現行実装契約、実際のブラウザ挙動、マスターデータの正確性・利用条件。API再取得を行っていないため、個別Package、severity、GHSA、CVE、`first_patched_version`の外部的正確性は主張しない。

## 2. 使用した根拠

- ユーザー依頼: テスト可能箇所の90%以上のカバレッジと、GitHubのSecurity and qualityで指摘されている項目の解消を要件へ盛り込むこと。
- 承認済み上流成果物: `docs/concept/concept.md`。目的、利用者、v1、対象外、責任境界、マップ間移動方針を確認した。
- 対象成果物: `docs/requirements/requirements.md`。今回のGitHub APIスナップショット反映と追跡節の変更を含む作業ツリー版を確認した。
- 前回レビュー: `docs/reviews/requirements/requirements-review-003.md`。`RR-001` / `RR-002` / `RR-003` / `RR-004` / `RR-005` の履歴状態を確認した。
- 補助資料: `docs/concept/requirements-notes.md`（TEMPORARY / NON-NORMATIVE）。上流と矛盾しない未決定事項の照合に限定して使用した。
- プロジェクト指針: `AGENTS.md`。文書フェーズ、Scope Discipline、セキュリティ、変更範囲、検証規則を確認した。
- レビュー手順: `requirements-review` Skill、`review-common/review-playbook.md`、`requirements-review/review-gates.md`、`output-format.md`、`reviewers.md`、`security-checklist.md`。

## 3. レビュー結果

`READY`

Critical 0 / Major 1 / Minor 0。`RR-001` / `RR-002` は Resolved、`RR-003` は Open の任意改善として継続、`RR-004` / `RR-005` は前回修正でResolvedを継続確認した。今回の台帳・追跡節の追加により、新規Critical Findingはない。

## 4. 総評

`REQ-Q-003` / `AC-017` は、全Requirement IDをテスト可能 / テスト不可能へ重複なく一度ずつ分類し、未分類・重複分類・分母0を90%達成と扱わず、全件一覧・分母・分子・測定結果・証跡を外部追跡可能にする条件を維持している。前回 `RR-004` の解消条件と整合する。

`REQ-S-007` / `AC-018` は、2026-09-10 10:24 JSTのスナップショットを基準に、Dependabot total 58 / open 40 / fixed 18と、open alert 40件を台帳化している。台帳番号は21–27、29–46、48–62の40件で、欠落・重複はない。Code ScanningのHTTP 404 `no analysis found`、Secret ScanningのHTTP 404 `disabled`を指摘なし・解消済みとせず、Security advisoriesの空配列も他機能の確認を代替しないことが明記されている。前回 `RR-005` の全表示項目・未確認境界と整合する。

`10.2 ユーザー依頼からRequirementへの追跡` は削除され、参照資料が`10.2`へ繰り上がっている。末尾の未確認範囲も、APIスナップショットは台帳根拠であって、依存更新・指摘解消・受入時再確認を完了した意味ではないと整理されている。

## 5. 指摘事項

なし。今回の確認でCriticalの新規・Open・Reopened Findingは確認されなかった。

## 6. 解消済み指摘

前回 `requirements-review-003` のレビューゲートは `READY`（Critical 0）であり、`RR-001` / `RR-002` は Resolved、`RR-003` は Open の任意改善、`RR-004` / `RR-005` は Resolved と記録されている。今回もこの状態を引き継いで確認した。

### RR-001 — Resolved（継続確認）

`REQ-F-006` / `REQ-Q-002` / `AC-005` / `AC-015` により、登録対象から算出し、第一軸を異なるマップ遷移回数の最小化とする判断原則が維持されている。再発はない。

### RR-002 — Resolved（継続確認）

`REQ-D-007` / `AC-016` により、不正・不完全・未知の入力や不正マスターデータを有効扱いせず、処理不能・未確認を識別し、誤ったルート算出・進行更新を防ぐ要求が維持されている。

### RR-003 — Open（継続）

同じマップ遷移回数の候補におけるテレポ料金とロード時間の比較方向・優先関係は、`REQ-F-006` / `REQ-Q-002` / `AC-005` / `AC-015`で補助評価に留まっている。Criticalではなく、今回の依頼対象外のMajor任意改善として下流へ継続する。

### RR-004 — Resolved（継続確認）

`REQ-Q-003`（179–181行）と`AC-017`（284行）は、全Requirement IDの完全一回分類、未分類・重複分類・分母0の不合格、90%以上の分子・分母・証跡追跡を明記している。前回の解消条件を満たす。

### RR-005 — Resolved（継続確認）

`REQ-S-007`（209–260行）と`AC-018`（285行）は、`actionable`限定をやめ、全表示項目を母集団とした。取得不能・未分類・状態不明・対象母集団不明・個別指摘未確認を、解消済みまたは受入成立の根拠としないことが明記されている。Dependabotの40行台帳、Code / Secret Scanningの未検出状態、Security advisories空配列の非代替性も確認できる。

## 7. 上流へのフィードバック

- `docs/concept/concept.md:9, 95` は、リネーム後の`./treasure-compass-mob-compass-requirements-notes.md`を参照しており、現行の`docs/concept/requirements-notes.md`と一致しない。Requirementsの直接リンクは正しいため、Requirements Findingではなく上流資料の文書整合性フィードバックとして継続する。
- 既存Concept Review資料の旧ファイル名は履歴情報として保持されている。現行参照として更新するかは管理者判断とする。

## 8. 保留した指摘

- GitHub APIの再取得、個別アラートの外部照合、受入時の実際の解消状態は今回未確認であり、Requirementsのスナップショット根拠を超える主張はしない。
- `REQ-S-007`の具体的な台帳運用、次回スナップショットとの差分形式、個別担当・期限・解消証跡の形式は、取得可能な情報と運用判断に基づく下流へ引き継ぐ。
- `REQ-Q-003`の分類規則、追跡形式、測定手順、証跡保存は下流へ引き継ぐ。完全分類、分母0不合格、90%以上の閾値はRequirementsで確定済みである。
- ルート評価式、入力形式、保存、チャット形式、状態遷移、アルゴリズム、テストコード等はSpecification / Design / Implementation / Testの責務であり、Requirements Findingにはしない。
- 応答時間、可用性、対応環境、同時利用者数等の数値品質目標は上流根拠がないため未要求とする。

## 9. 対象範囲と追跡

| 根拠 | 対応Requirements | 対応Acceptance | 判定 |
| --- | --- | --- | --- |
| Conceptの目的、マップ間移動、テレポ負担 | `REQ-F-001`, `REQ-F-006`, `REQ-F-007`, `REQ-Q-001`, `REQ-Q-002` | `AC-001`, `AC-005`, `AC-006`, `AC-015` | 上流整合。RR-001 Resolved、RR-003 Open |
| Conceptの対象ユーザー、利用場面、v1、対象外 | `REQ-F-002`–`REQ-F-014`, `REQ-S-003` | `AC-002`–`AC-016` | 追跡可能。対象外の拡張なし |
| Conceptの責任境界・判断原則 | `REQ-D-003`, `REQ-D-007`, `REQ-S-001`–`REQ-S-006` | `AC-012`–`AC-016` | RR-002 Resolved |
| ユーザー依頼: テスト可能箇所の90%カバレッジ | `REQ-Q-003` | `AC-017` | 完全分類、分母0不合格、一覧・測定・証跡を確認可能。RR-004 Resolved |
| ユーザー依頼: GitHub Security and qualityの指摘解消 | `REQ-S-007` | `AC-018` | スナップショットと40行台帳、未検出状態、未確認時の受入不可を追跡可能。RR-005 Resolved |

## 10. 検証結果

- `requirements-review` Skillおよび指定されたreview-common / requirements-reviewの参照資料を確認した。
- `AGENTS.md`、Concept、Requirements、検討メモ、Requirements Review 001–003を確認した。
- Dependabot台帳はAlert 21–27、29–46、48–62の40行であること、番号の欠落・重複がないことを確認した。
- 各台帳行にPackage、Severity、GHSA、CVE（または`-`）、`first_patched_version`の6列があり、値が空でないことと形式上の整合を確認した。APIとの個別値照合はNot validated。
- Dependabot total 58 / open 40 / fixed 18、スナップショット時刻2026-09-10 10:24 JST、Code Scanning 404 `no analysis found`、Secret Scanning 404 `disabled`、Security advisories空配列の扱いをRequirements本文および対応するAcceptanceと照合した。
- 10.2が参照資料となっていること、ユーザー依頼からRequirementへの旧追跡節が残っていないことを確認した。
- 全Requirement定義（REQ-F 001–014、REQ-D 001–007、REQ-Q 001–003、REQ-S 001–007）とAcceptance（AC-001–018）のID重複・欠落がないことを確認した。
- RequirementsからConcept、検討メモ、READMEへの内部リンクを確認した。Concept内の旧検討メモリンクは上流フィードバックとして記録し、修正していない。
- `git diff --check`: PASS。
- 既存レビュー001–003のSHA-256はレビュー前後で不変として確認した。既存資料は編集・上書き・改名・削除していない。
- 変更範囲: Authorの対象差分は`docs/requirements/requirements.md`のみ。Reviewerは本資料以外を変更していない。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。docsのRequirementsレビューであり、コード変更を伴わないため対象外。
- GitHub API再取得および個別アラートの外部正確性: Not validated。既存のスナップショット記載を外部API再照合なしでレビューし、個別値の正確性を成功扱いにしていない。
- README、実装、テスト、静的データ、画像、ブラウザ挙動、マスターデータの正確性・利用条件: Not validated。Requirementsの根拠または対象範囲外として成功扱いにしていない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | PASS | Conceptの目的、対象、v1、対象外、責任境界を維持し、ユーザー依頼の2項目もRequirementsへ追跡されている。 |
| 2. 要求完全性 | PASS | 既存の巡回・進行・責任境界に加え、90%カバレッジ条件とGitHub全表示項目の解消要求、API状態、台帳、Acceptance、引継ぎが定義されている。 |
| 3. 外部観測可能性 | PASS | `AC-017`は分類・測定・証跡を、`AC-018`は40行台帳、Code / Secret Scanningの未検出状態、未確認時の不成立を確認可能にしている。Security advisoriesの空配列を他機能の確認の代替としない扱いは、対応する`REQ-S-007`本文で確認できる。 |
| 4. 責任・境界 | PASS | 未確認API結果を解消済みとしない境界、依存更新採用を`first_patched_version`だけで確定しない境界、個別台帳運用を下流へ送る責任分離が明確である。 |
| 5. 品質・安全性 | PASS | `REQ-Q-003`は検証可能性、`REQ-S-007`は全指摘母集団・解消証跡・未検出状態の扱いを要求する。個別GitHub値は未再取得のまま主張していない。 |
| 6. Acceptance | PASS | `AC-017` / `AC-018`は90%閾値、全表示項目、40行台帳、未確認・母集団不明の不成立を外部から判定可能にしている。 |
| 7. 工程境界 | PASS | API個別値の将来取得、台帳運用詳細、テストコード、依存更新の採用、アルゴリズムをRequirementsで過度に確定せず、必要な外部境界だけを定義している。 |
| 8. 未決定事項 | PASS | スナップショット基準と現在の台帳対象は記録され、次回差分・個別運用・実際の解消確認は下流へ適切に引き継がれている。 |

## 12. 残存リスクと未決定事項

- `RR-003`はOpenのMajor任意改善であり、同じマップ遷移回数の候補における料金・ロード時間の比較方向と優先関係は下流で決定する必要がある。
- GitHub APIスナップショットの個別値は今回再取得していない。台帳値が変更された場合、次回スナップショットで差分を追跡する必要がある。
- Dependabotのopen 40件は受入時までに実際の解消証跡が必要であり、`first_patched_version`は依存更新採用や解消を意味しない。
- Code Scanning / Secret Scanningの現状は指摘なし・解消済みではなく、受入時に状態または指摘結果を確認する必要がある。
- Mob Compassの候補状態、チャット案内の具体契約、保存・保持・互換性、マスターデータの具体契約は下流へ残っている。
- Conceptの旧リンクは上流資料側の文書整合性問題として継続している。

## 13. 自動変更

なし。`docs/requirements/requirements.md`、Concept、検討メモ、README、コード、テスト、設定、既存レビュー資料は変更していない。作成したのは本レビュー資料のみである。

## 14. 最終判定

**READY**

Criticalは0件。`RR-001` / `RR-002`はResolved、`RR-003`はOpenの任意改善、`RR-004` / `RR-005`はResolvedを継続確認した。全40行のDependabot台帳、Code / Secret Scanningの404状態を未解消境界として扱うこと、Security advisories空配列の非代替性、10.2の参照資料への繰上げ、ID・リンク・履歴資料不変性を確認した。`requirements-review` SkillのGate規則により、Critical 0のため最終判定は`READY`とする。
