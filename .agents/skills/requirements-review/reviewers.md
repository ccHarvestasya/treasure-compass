# Reviewers

メインエージェントは Review Board Chair として、根拠の統合、重複排除、工程分類、重大度、Gate、成果物を担当する。Phase 1 では次の3観点を独立して確認する。Reviewer C は Security primary reviewer とし、A / B は担当領域に現れる安全性の影響だけを cross-check する。

## Reviewer A — 要件品質・明確性・追跡性

次を確認する。

- Requirement の意味が一意に理解でき、外部から何を満たすべきか分かるか
- Requirement ID、上流追跡、用語、MUST / SHOULD 等の規範性が整合しているか
- Requirement 同士に矛盾がないか
- Acceptance Criteria が合否を外部から判断できるか
- 未決定事項が確定事項や Specification 詳細と混同されていないか

Specification や Design の詳細不足を Finding にしない。安全性に関する記述も、明確性・完全性の範囲でのみ cross-check する。

## Reviewer B — 上流整合・利用価値・スコープ

次を確認する。

- Concept の目的、対象ユーザー、価値、利用場面、v1、対象外と整合しているか
- Concept の目的や利用者を Requirements 側で再定義していないか
- Requirement が上流の判断や利用価値へ追跡できるか
- 未要求の機能、利用者、責任、範囲を追加していないか
- 派生要件が本当に論理的に不可欠か

Concept の不足・矛盾は原則として `上流へのフィードバック` とし、Reviewer B 自身が「あると便利」な機能を Requirement として提案しない。

## Reviewer C — 品質・安全性・責任境界（Security primary reviewer）

対象プロジェクトに適用でき、上流根拠から必要な範囲で、次を確認する。

- 保護対象、機密性、完全性、authentication / authorization、privacy
- trust boundary、responsibility boundary、failure safety
- availability / resource safety、recoverability、lifecycle
- interoperability、external dependency

Security Finding は、ユーザー判断、Concept、既存 Requirements、正式な外部契約・法的制約、または明示された責任へ追跡できる Requirements レベルの問題に限る。欠落により、合理的な複数の下流実装が異なる外部安全性を持ち得ること、具体的な外部影響または責任の不明確さを説明できなければならない。下流方式だけで解決できる事項、一般的な安全対策、hardening、Checklist の項目だけを根拠とする指摘は採用しない。Security Checklist 全件を機械的に適用せず、適用外は N/A または未確認として扱う。

## Chair の統合

同じ根本原因の重複 Finding は統合する。工程境界を越える候補は、RR Finding、上流へのフィードバック、保留、未確認、対象外のいずれかへ分ける。詳細な Specification / Design や解決策を完成させず、Required Change には最小限の修正条件だけを記録する。
