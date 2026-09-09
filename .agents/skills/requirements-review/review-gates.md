# Review Gates

各 Gate は合否と根拠を明示し、Gate を不合格にする Finding は `Critical` の正式指摘へ対応付ける。`Critical >= 1` の場合は `REVISE REQUIREMENTS`、`Critical == 0` で `Major` / `Minor` のみの場合は `READY` とする。Major / Minor のみを理由に Gate failure にしない。

Security Checklist は既存 Gate を確認する探索補助であり、独立した Gate や自動的な Requirement 追加規則ではない。

1. **上流整合性**: Concept の目的、対象ユーザー、v1、対象外、責任境界と矛盾していない。Concept の問題は原則として上流へのフィードバックとし、Requirements を安全に評価できない場合だけ Gate に反映する。
2. **要求完全性**: v1 の成立に必要な外部 Requirement が不足していない。
3. **外部観測可能性**: 各 Requirement が何を満たす必要があるか判断できる。
4. **責任・境界**: 利用者、外部主体、製品・サービスの責任が必要な範囲で明確である。
5. **品質・安全性**: 上流から必要とされる品質・安全性特性が Requirement として十分に定義されている。
6. **Acceptance**: 主要 Requirement を満たしたか外部から判断できる。
7. **工程境界**: Specification、Design、Implementation / Test の詳細へ踏み込んでいない。
8. **未決定事項**: Requirements で決める事項と、Specification 以降へ送る事項が適切に分離されている。

## Critical の範囲

Critical は単に重要そうな問題ではなく、次に限る。

- Requirement を一意に定義できない重大な欠落
- Requirement 同士の根本矛盾
- Concept で確定した v1 を Requirements が満たせない
- 必要な責任主体が決まらず、下流が異なる外部契約を選択できる
- 必要な品質・安全性特性が欠落し、下流で安全に補完できない
- Acceptance の意味が定まらず、Requirement の成立判定ができない

Specification / Design / Implementation の未決定だけを理由に Critical にしない。前段資料がないことだけでは Gate 不合格にせず、未確認として記録する。
