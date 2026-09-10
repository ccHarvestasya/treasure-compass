# 出力形式

この Skill のレビュー成果物は、`../review-common/output-format.md` の共通構成・章名・順序・指摘必須項目を使用する。共通構成を省略、追加、並べ替えない。

## スキル固有の値

- 正式な指摘 ID 接頭辞: `SR`
- 重大度: `Critical` / `Major` / `Minor`
- レビュー結果: `READY` / `REVISE SPECIFICATION`
- 必須修正: `Critical` の New / Open / Reopened（ゲート不合格に対応する差戻し事項）
- 任意改善: `Major` / `Minor` の New / Open / Reopened（Critical がなければ `READY` のまま引継ぎ可能）
- 上流へのフィードバック: Requirement または Concept の不足・曖昧さ・矛盾が原因の場合に限り、原則 `Specification Review → Requirements`、必要に応じて Concept へ戻す。Specification を安全に評価・完了できない場合は Specification 側の正式な指摘を別途記録し、既存の Specification Gate / Severity policy を適用してフィードバックへ追跡する。Design は Specification の downstream であり、上流フィードバック先とはしない。フィードバックから新しい Design Decision、Requirement、Specification contract を確定せず、同じ問題を二重計上しない
- 保留した指摘: 実装・検証、対象範囲外、または後続確認へ引き継ぐ未決定事項・確認事項。上流の正式資料へのフィードバックは含めない
- 確認観点: API・データ契約、validation、error、状態、処理、security、相互運用性、検証可能性。Security は適用される保護対象データ、trust boundary、authentication / authorization、untrusted input、integrity、malformed / tampered input、replay、fail-closed、partial failure、externally visible atomicity、persistence / lifecycle、deterministic representation、compatibility / versioning、security testability を必要な範囲で確認する。
- 対象範囲と追跡: 要件・コンセプト・前段レビューと仕様箇所の対応。Design、Implementation、Test、README 等は downstream の補足資料として扱い、そこから新しい Requirement や Specification contract を逆生成しない
