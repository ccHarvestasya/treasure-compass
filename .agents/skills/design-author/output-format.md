# 基本設計書の出力形式

設計成果物は Markdown とし、既存の正式テンプレートがある場合はその命名・配置・意味に合わせる。次の構成は基準であり、対象に不要な章を省略・統合してよい。章を埋めるためだけに内容、component、制約を発明しない。

1. Design の目的・対象・対象外
2. 上流根拠、用語、前提、制約
3. System context / trust boundary
4. Architecture、component 責務、dependency direction
5. Data / state ownership、内部 lifecycle
6. 主要な内部フロー、collaboration boundary
7. Failure containment、recovery、retry、restart、concurrency、atomicity
8. Persistence、external resource、runtime、deployment、operational responsibility
9. Security / observability responsibility
10. Design decisions、代替案、trade-offs
11. Upstream ambiguity / Specification の不足
12. Design decision pending
13. Implementation / Test handoff
14. Out of Scope
15. Traceability / references

## 出力上の境界

- Specification の外部契約を再定義せず、それを満たす内部責務・構造・依存・境界を記録する。
- 外部契約が不足して設計を安全に確定できない事項は、`Upstream ambiguity` または `Specification の不足` として上流へ戻す。
- 外部契約を変えない設計上の未決定は `Design decision pending` として Design で解決する。
- exact class / function、source layout、具体的な設定・依存 version、migration script、CI、test code、fixture などは `Implementation / Test handoff` に分ける。
- `Out of Scope` は現在対象外の境界を示すためにのみ記録し、未解決事項や下流引継ぎの一覧へ変換しない。

外部契約と内部方式の境界が判断しにくい場合は、同じ Specification に適合する複数の実装が異なる外部結果を返し得るかを確認する。結果が異なるなら Specification または上流の不足、結果が同じなら原則として Design の裁量である。

## Design Decision の記録

重要な判断には、必要に応じて次を付ける。

- decision
- upstream constraint / problem
- alternatives considered
- rationale
- consequences / trade-offs
- assumptions
- revisit condition

各判断は承認済み Specification、Requirements / Concept、正式な標準・規格、または既存の正式なアーキテクチャ制約へ追跡する。一般論、好み、将来性だけで採用した方式を正式な設計判断にしない。

## Traceability

基本方向は次とする。

```text
Specification
      ↓
Design responsibility / decision
      ↓
Implementation constraint / handoff
```

形式的な表は役に立つ場合だけ作る。実装、テスト、設定、データに存在する内容だけを根拠に、上流の Requirement、Specification、Design を逆生成しない。本文、図、例、fixture、ログへ credential、secret、token、password、個人情報、機密データを含めない。
