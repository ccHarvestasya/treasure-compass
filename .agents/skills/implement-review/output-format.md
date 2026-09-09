# 出力形式

この Skill のレビュー成果物は、`../review-common/output-format.md` の共通構成・章名・順序・指摘必須項目を使用する。共通構成を省略、追加、並べ替えない。

## スキル固有の値

- 正式な指摘 ID 接頭辞: `IR`
- 重大度: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`
- レビュー結果: `READY` / `REVISE IMPLEMENTATION`
- 必須修正: `CRITICAL` または `HIGH` の New / Open / Reopened。1件以上あれば `レビュー結果: REVISE IMPLEMENTATION`
- 任意改善: `MEDIUM` / `LOW` の New / Open / Reopened。これらのみであれば `レビュー結果: READY` とできる。`READY` と `必須修正: HIGH` の組み合わせは不可
- 上流へのフィードバック: `Implementation Review → Specification` を通常とし、問題の発生源が Design / Requirements の場合だけそれぞれへ返す。Implementation を安全に評価・完了できない場合は Implementation 側の正式な指摘を別途記録し、既存の Implementation Gate / Severity policy を適用してフィードバックへ追跡する。共通形式の必須項目を記録し、フィードバックから新しい Specification contract、Design Decision、Requirement を確定せず、同じ問題を二重計上しない
- 保留した指摘: 現在のレビュー対象外、後続検証、または別途の運用・release確認等へ分離する事項。上流の正式資料の不足・曖昧さ・未決定事項は `上流へのフィードバック` に記録し、そこへ混在させない
- 確認観点: Specification Conformance、Test Evaluation、security、相互運用性、異常系、実装品質・実行安全性、型・依存・公開互換性。Security では対象に適用した主要な `security-checklist.md` 項目、主要な適用外項目と理由、未確認範囲を記録する。全項目を機械的に列挙しない
- 対象範囲と追跡: 差分、承認済み仕様・要件・設計、実装、テスト、fixture の対応

## 指摘事項の分類と記載

各 finding は、対象箇所（実装レビューではファイルと行）、発生条件または確認できた事実、既存の Specification / Design / Requirement / 公式資料・確認済みデータ、問題、不要なデータ公開 / 整合性 / 権限 / 計算の正しさ / 実行安全性 / データ互換性 等への影響、Severity の根拠、必要な最小修正または確認、完了条件または再確認方法を含める。

仕様にない新しい製品要求、任意の hardening、将来機能、API、policy、実装方式の好みは finding にしない。一方、既存 security invariant、保護対象データ、trust boundary、実行安全性、データ検証処理の安全条件、ブラウザ境界を具体的に破る defect は、仕様に防御方法が逐語的にないことだけを理由に除外しない。入力データ copy、不要データの破棄、予測可能な処理、異常入力テスト、dependency の不足は、具体的な security impact と到達可能な defect がある場合に限り finding とする。

契約自体が不足・曖昧で実装の正否を決められない場合は、`Implementation defect` と断定せず `Specification ambiguity`、`Specification gap` または `Implementation → Specification feedback` として `Upstream Feedback` へ分離する。Design / Requirements の不足が発生源なら、該当する上流フェーズへの feedback として記録する。

## 判定整合性

`CRITICAL` / `HIGH` の New / Open / Reopened finding は `Required Change` であり、`READY` を阻害し、`REVISE IMPLEMENTATION` とする。`MEDIUM` / `LOW` のみの場合は `Optional / non-blocking` として `READY` とできる。重大度は exploitability、reachability、asset impact、precondition、trust boundary、recovery、downstream effect を根拠に判定し、単にデータ保護コードであることだけを理由に CRITICAL / HIGH としない。仕様不足や設計選択の未決定は implementation defect と断定せず、発生源に応じた `Upstream Feedback` に分類する。ただし、入力データの漏えい、実行安全性の破綻、入力識別値の再利用、データ検証の回避、明確に誤った 入力処理、計算処理 の correctness defect など既存の安全性を具体的に破る defect は、個別の防御策が仕様に列挙されていなくても finding とする。
