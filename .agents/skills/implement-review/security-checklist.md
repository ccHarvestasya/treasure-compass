# Security / Runtime Safety Checklist

この checklist は、Implementation Review で適用可能な security、trust boundary、integrity、実行安全性、resource safety を探索する補助である。全対象へ強制せず、対象に該当する項目だけを使い、該当しない項目は N/A とする。

checklist の項目だけを根拠に Requirement、Specification、Design Decision、finding、severity、Gate を作らない。一般的な security hardening、特定の製品・library・方式・サービスの採用も要求しない。

## 入力、信頼、実行境界

- untrusted input、外部 resource、実行環境、privilege、trust boundary と責任分界が明確か。
- malformed、tampered、unknown、duplicate、stale、truncated、過大な入力を、適用される契約と安全条件に沿って扱っているか。
- validation、parsing、解釈、出力、外部 effect の責任が境界を越えて逆流していないか。
- injection、unsafe execution、権限逸脱、予期しない code / command 実行、resource exhaustion が具体的に到達可能でないか。

## データ、認証、完全性

- sensitive data、secret、credential、認証情報の生成、使用、保持、公開、破棄の扱いが契約と Design に沿っているか。
- authentication / authorization、privilege separation、integrity、改変・破損検知の結果を実装が正しく扱っているか。
- logging、error、例外、panic、debug output、生成物へ不要な入力・秘密・個人情報を漏えいしていないか。
- 既存の confidentiality、integrity、availability、safety property を、具体的な実行経路で破っていないか。

## 状態、資源、失敗

- state / data ownership、lifecycle、persistence、cache、synchronization、replacement が適用される場合に安全か。
- partial failure、retry、restart、recovery、rollback、atomicity、cleanup、timeout を上流契約と Design に沿って実装しているか。
- fail-open / fail-closed、部分結果、既存状態の保持・破棄が、許可された外部結果と内部責任に一致しているか。
- memory、CPU、storage、network、process、file、外部 resource 等の過剰消費や leak が具体的に到達可能でないか。

## 依存、生成物、運用

- dependency、lockfile、generated artifact、build、packaging、platform boundary、外部通信が、必要な scope と安全条件に整合しているか。
- third-party や生成物を未検証の正本として扱い、trust boundary や integrity を崩していないか。
- runtime、deployment、monitoring、incident / recovery の責任が、正式な Requirements / Specification / Design または運用制約に沿っているか。

## Finding の基準

- checklist の該当だけでは finding にしない。正式 finding は reviewed Implementation / Test、承認済み Specification / Design / Requirements / Concept、formal reference、repository instruction 等へ追跡できる必要がある。
- Implementation / Test が既存の安全条件、上流契約、互換性、実行境界を具体的に破り、到達可能な impact がある場合は finding とする。
- security property や外部契約そのものが不足・曖昧な場合は、`Implementation defect` と断定せず `Upstream Feedback` の `Upstream ambiguity`、`Specification gap`、`Design gap` に分ける。
- 「より安全な方式」、「一般的な hardening」、「特定の認証、暗号、rate limit、監視、dependency を使うべき」という好みは、正式な根拠と concrete impact がない限り finding にしない。
