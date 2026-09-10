# 安全性・信頼境界チェックリスト

この checklist は、対象に適用される安全性、信頼境界、完全性、失敗分離、運用責任を探索する補助である。単独で新しい Requirement、Specification、Design Decision、threat、保証、重大度を作らない。該当する項目だけを使い、対象外は N/A とする。

## 入力と境界

- untrusted input、入力の所有者、解釈責任、validation responsibility、出力先、trust / privilege boundary が明確か。
- malformed、tampered、unknown、duplicate、stale、過大な入力を、上流契約に必要な範囲で安全に扱う責任が割り当てられているか。
- 外部資源、実行環境、権限、データを越える境界と、各境界での失敗責任が明確か。

## データ、権限、完全性

- sensitive data の生成、使用、保持、破棄、公開範囲、所有者が明確か。
- authentication / authorization、privilege separation、integrity、改変・破損検知の責任が必要な範囲で割り当てられているか。
- failure isolation、fail-closed、回復後の状態が、既存の Specification を満たす構造になっているか。

## 状態、資源、復旧

- state / data ownership、lifecycle、persistence、cache、synchronization、replacement の責任が明確か。
- partial failure、retry、restart、recovery、rollback、atomicity、resource cleanup の境界が、対象に該当する場合に成立しているか。
- 過大入力、過大な資源消費、無限処理、部分結果が問題になる場合、containment と責任主体が設計されているか。

## 運用と観測

- runtime、deployment、外部依存、logging / metric / event、incident / recovery の責任分界が、正式な Requirements / Specification / 運用制約に沿っているか。
- 具体的な security product、library、保存技術、認証方式、監視基盤を、根拠なく採用・要求していないか。

## Finding の基準

- checklist の項目が対象に該当することだけでは finding にしない。正式な finding は、対象 Design、approved Specification / Requirements / Concept、formal reference、既存の正式な architecture constraint、またはユーザー要求へ追跡できる必要がある。
- 実装、テスト、設定、データは、実現可能性、現行構造、互換性、回帰、明白な矛盾を確認する補足証拠に限る。そこに存在する内容だけを根拠に新しい上流要求や Design responsibility を逆生成しない。
- 外部契約の未定義は Specification gap、内部の責務・境界・所有の欠落は Design finding、具体コードの不足は Implementation / Test handoff として分ける。
