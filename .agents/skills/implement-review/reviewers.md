# Reviewers

メインエージェントは Review Board Chair として、対象、根拠、重複、重大度、状態、Gate、成果物を管理する。次の4観点を独立に確認するが、人数や分担のためだけに追加のレビューを作らない。Security の責任を Reviewer B だけに閉じず、各 Reviewer は担当領域の concrete な security implication を cross-check する。

## Reviewer A: Conformance / Phase Boundary

承認済み Specification / Design と Implementation の入力、出力、error、state transition、ordering、validation result、公開動作、制約を照合する。requested scope、upstream traceability、外部挙動の変更、上流問題の分類を確認する。契約が不足する場合は `Specification gap` 等へ分け、Reviewer が新しい契約を作らない。

## Reviewer B: Security / Runtime Safety

`security-checklist.md` の適用項目を使い、trust boundary、authentication / authorization、sensitive data、secret lifecycle、integrity、privilege、unsafe execution、resource safety、concurrency、外部通信、logging / error leakage、dependency / build boundary 等を確認する。対象に適用される範囲だけを深く扱う。

既存の上流契約、安全条件、言語・実行境界を具体的に破る到達可能な defect は finding とする。一方、security best practice、任意の hardening、特定 library / service / mechanism の好みだけで要求を作らない。checklist の項目だけで finding、severity、Gate を生成しない。

## Reviewer C: Data / Compatibility / Integration

対象に存在する場合、data representation、persistence、protocol / serialization、encoding、version、public compatibility、migration、dependency、platform、resource、外部連携、cross-implementation interoperability を確認する。異なる実装や環境でも承認済み契約を満たすか、互換性回帰や統合上の具体的な defect がないかを評価する。

protocol、serialization、persistence、migration 等が対象にない場合は適用しない。canonical encoding、byte order、known vector、differential test 等を一般論で要求せず、実装方式の好みを finding にしない。

## Reviewer D: Software Quality / Test / Validation

具体的な実装 correctness、責務、型、依存、例外、resource lifecycle、error handling、regression、Test / validation evidence を確認する。対象に応じて normal、boundary、failure、compatibility、security の検証が、Specification、Design invariant、Requirement、bug reproduction、regression risk へ追跡できるかを見る。

Test 数、coverage、fixture の存在だけで finding にしない。missing test を指摘する場合は、どの具体的な defect、契約、invariant、regression、security property をどの条件で検出できないかを示す。base revision の既存 failure と今回の regression を区別する。

## Chair の採用基準

次を満たすものだけを正式 finding として採用する。

- location、発生条件、事実、根拠、impact、解消条件がある
- reviewed Implementation / Test または適用される上流根拠へ追跡できる
- Current Phase で解決すべき concrete defect である
- reviewer preference、future feature、optional hardening、checklist の存在だけに依存しない

Concept / Requirements / Specification / Design の不足や曖昧さで正否を判断できない場合は、発生源に応じた `Upstream Feedback` とし、`Implementation defect` と二重計上しない。`Out of Scope` は Review Scope / Excluded Scope に記録し、Deferred にしない。Deferred は後続検証、外部環境、運用、release 等の確認へ限定する。

Required Change は問題が解消したと判断できる最小条件に留め、完成した修正コード、exact private function structure、特定 library、好みの architecture を指定しない。`CRITICAL` / `HIGH` の New / Open / Reopened は `REVISE IMPLEMENTATION`、`MEDIUM` / `LOW` のみなら `READY` とする。
