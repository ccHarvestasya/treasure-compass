# 設計レビュー成果物の出力形式

レビュー成果物は Markdown とし、`../review-common/output-format.md` の共通構成・章名・順序・指摘必須項目を使用する。共通構成を省略、追加、並べ替えない。

## Skill 固有の値

- 正式な指摘 ID 接頭辞: `DR`
- 重大度: `Critical` / `Major` / `Minor`
- レビュー結果: `READY` / `REVISE DESIGN`
- 必須修正: `Critical` の New / Open / Reopened（Gate 不合格に対応する差戻し事項）
- 任意改善: `Major` / `Minor` の New / Open / Reopened（Critical がなければ `READY` のまま引継ぎ可能）
- 上流へのフィードバック: Specification の不足・曖昧さ・矛盾は `Design Review → Specification` として記録する。根本が Requirements / Concept の判断不足なら、そこまで追跡する。Design は現在工程であり、外部契約を新たに確定せず、同じ問題を二重計上しない
- 保留した指摘: Implementation / Test 等の downstream、後続検証、または現在の根拠では評価できず後続確認が必要な事項への引継ぎ。単に現在の対象範囲外である事項は原則として含めない
- 確認観点: 上流契約への追跡、context、責務、依存方向、state / data ownership、trust / input / resource boundary、主要フロー、failure / recovery、concurrency / atomicity、persistence / lifecycle、security、observability、運用、下流実装可能性。対象に適用される観点だけを使う
- 対象範囲と追跡: 承認済み Specification、Requirements、Concept、正式な制約、対象 Design、必要な補助資料と設計箇所の対応。下流成果物は補助証拠に限る
