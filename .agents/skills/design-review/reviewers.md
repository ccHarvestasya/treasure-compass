# Reviewers

メインエージェントは Review Board Chair として、根拠管理、候補統合、重大度・状態、Gate、成果物を担当する。Phase 1 では次の4観点を独立して確認する。Reviewer B が Security primary reviewer であり、他の Reviewer は自分の担当領域に現れる security implication だけを cross-check する。

## Reviewer A: 構造と責務

目的、範囲、system context、system / subsystem / component / module の責務、依存方向、collaboration boundary、循環依存、ownership を確認する。Specification が要求する外部結果を保ったまま、複数の合理的な Implementation が Design の責務・境界に従えるかを確認し、コード構造の好みは要求しない。

## Reviewer B: Security Reviewer（成立性と安全性）

`security-checklist.md` を参照し、対象に適用される sensitive data ownership、trust boundary、privilege separation、validation responsibility、authentication / authorization responsibility、integrity、failure isolation、security invariant を Design レベルで確認する。機密データの生成・使用・保持・破棄・公開範囲と、各境界での失敗責任が上流契約に沿って割り当てられているかを確認する。

対象 threat、security invariant、方式は、approved Specification、Requirements、Concept、formal reference、既存の正式な architecture constraint、またはユーザー要求へ追跡できるものに限定する。checklist の項目だけを根拠に新しい Requirement、Specification、Design Decision、threat、invariant、finding を発明しない。具体的な security product、library、保存方式、認証方式、error code、parser、test method は、上流の正式な制約がない限り要求しない。

## Reviewer C: フローと運用

主要な内部フロー、lifecycle、state、data flow、resource acquisition / release、persistence、retry、重複、restart、failure、recovery、保持、可用性、外部連携、運用責任を確認する。対象に concurrency がある場合は ownership、synchronization、atomicity、consistency、race prevention の責任を確認する。外部から観測される error、timeout、retry の意味を新たに作らず、既存 Specification を実現する内部責任だけを評価する。

## Reviewer D: 追跡と下流実装可能性

`Specification → Design → Implementation / Test` の追跡、上流契約の適合、Design constraint、検証可能性、実装者が推測すべき重大な設計判断の有無を確認する。Design が不足する場合と、exact class / function、source layout、設定、依存 version、migration script、CI、test code、fixture など Implementation / Test に委譲できる事項を分離する。下流の存在だけを根拠に上流要求や Design finding を作らない。

## Chair の採用基準

対象 Design または承認済み Specification / Requirements / Concept / formal reference へ追跡でき、現在の Design 工程で解決すべき具体的問題だけを採用する。Specification の外部契約が不足している場合は `Specification gap`、Requirements / Concept の判断が不足している場合は `Upstream ambiguity` とし、Design の Required Change として新しい外部契約を発明しない。

`algorithm`、`parser`、`persistence`、`schema`、`serialization`、`cache`、`deployment` などの名前だけで Design defect と判定しない。外部契約を満たす責務・境界・制約が Design にあれば、内部方式やコードの違いは Implementation の自由度である。Reviewer が「Implementation に任せればよい」とした候補も、Specification の適合、Design の責務・制約、Two-implementation test に照らして再確認する。

Reviewer A / C / D の cross-check は担当領域に限定し、`security-checklist.md` 全件を機械的に再適用しない。複数 Reviewer の同じ根本原因は Chair が統合する。一般的な best practice、将来機能、好みの architecture、特定技術の採用を finding にしない。
