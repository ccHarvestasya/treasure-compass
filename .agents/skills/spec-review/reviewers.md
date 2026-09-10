# Reviewers

メインエージェントは Review Board Chair として、上流追跡、候補統合、重大度・状態、ゲート、成果物を担当する。Phase 1 では次の3観点を独立して確認する。Reviewer C が Security / Interoperability primary reviewer であり、他の Reviewer は自分の担当領域に現れる security implication だけを cross-check する。

## Reviewer A: 契約の明確性と完全性

対象範囲、用語、前提、入力、出力、インターフェース、データ形式、validation、error、状態、順序、determinism、受け入れ条件を確認する。Requirements から Specification へ明示的に委譲された事項、後工程で定義するとされた外部判断、Acceptance に必要な外部契約が Specification で閉じているかを確認し、「Design に送った」という記録だけでは PASS としない。同じ入力・状態に対する合理的な二実装の結果が、差異を許容する正式な根拠なく分岐しないか、外部形式 / protocol、互換性 / version semantics / migration が一意かも確認する。安全性に関わる input / output / error / state / validation が一意か、Security Reviewer が確認する contract の曖昧さがないかを、契約の明確性と完全性の範囲で独立に cross-check する。

## Reviewer B: 利用価値と運用適合性

要件との追跡、利用者から見える結果、外部責任、失敗時の結果、対象外、利用シナリオ、責任境界との整合を確認する。failure / recovery の結果、手動 / 自動の state transition、lifecycle、stale / duplicate、partial failure が、差異を許容する正式な根拠なく実装ごとに分岐しないかを、外部から観測できる範囲で確認する。failure result、external responsibility、authorization / protected operation の外部結果に security implication があれば、利用価値と運用適合性の範囲で独立に cross-check する。

## Reviewer C: Security / Interoperability Reviewer（Security primary reviewer）

`security-checklist.md` を参照し、対象に適用される保護対象データ、trust boundary、authentication / authorization、untrusted input、integrity、malformed / tampered / stale input、replay、fail-closed、partial failure、externally visible atomicity、persistence / recovery / lifecycle、deterministic representation、compatibility / versioning / migration、security testability を確認する。外部表現、破損・改変・stale・replay 時の結果、復旧条件、互換性・version semantics・migration が内部方式に依存せず一意かを確認する。approved Requirements、approved Concept の責任境界、approved formal reference、互換性 Requirement が参照する既存の正式外部契約、target Specification を主な根拠とし、Design の内容を Specification へ逆輸入しない。

確認対象は仕様上の input / output / state / error / encoding / データ整合性 result であり、実装内部の保持期間、clone / copy、不要データの破棄、具体的な呼び出し、side-channel 対策、parser、fuzz harness は Implementation Review へ委譲する。具体的な暗号方式、認証方式、ライブラリ、ミドルウェア、配置方式などは、承認済みの根拠が外部契約として求めていない限り要求しない。具体方式が未決定なだけの場合も、approved Requirements / Concept / formal reference / compatibility contract / target Specification から Specification で定めるべき事項と追跡できない限り finding としない。

## Chair の採用基準

approved Requirements、ユーザーの明示的な最新判断、approved Concept から継承される責任境界、approved formal reference、互換性 Requirement が参照する正式外部契約、または target Specification 自身の内部矛盾へ追跡でき、現在の仕様を一意に実装・検証できない具体的問題だけを採用する。Implementation、Test、README、fixture、静的データなどだけを根拠に新しい Requirement や Specification contract を作らない。`algorithm`、`parser`、`persistence`、`schema` などの名前だけを理由に Design と判定せず、外部結果を決める contract は Specification、同じ contract を内部で実現する方式は Design / Implementation として分離する。Reviewer が Design handoff とした候補も、Requirements handoff と two-implementation test に照らしてから却下する。Design の問題は Specification の上流不足ではなく downstream / deferred / Design handoff として分離し、Design は Specification との明白な矛盾または downstream handoff の確認に限って補助資料とする。Reviewer A / B の cross-check はそれぞれの担当領域に限定し、`security-checklist.md` 全件を再適用しない。contract / operation / security / データ互換性の重複候補は Chair が統合する。より高機能・汎用的にする提案、一般的 hardening、reviewer の具体方式の好みは却下する。
