# 安全性・相互運用性チェックリスト

この checklist は、対象に適用される安全性、信頼境界、相互運用性、失敗時挙動を探索する補助である。単独で新しい Requirement、Specification contract、設計判断、保証、重大度を作らない。必要な項目だけを使い、該当しない項目は N/A とする。

## 入力と信頼境界

- untrusted input の範囲、解釈対象、処理権限、出力先、越えてよい外部境界が明確か。
- 空、過大、形式不正、範囲外、未知値、重複、改変、解析不能な入力を、対象の契約に必要な範囲で扱っているか。
- 入力をデータ、命令、識別子、参照先などとして解釈する条件が一意か。
- エラー、ログ、成果物、外部応答に保護対象データや入力値を不要に含めない契約が必要な場合、外部から確認できるか。

## 保護対象データと権限

- 保護対象データ、所有者、責任主体、公開・返却・保持・削除の境界が、Requirement に関係する場合に明確か。
- authentication / authorization、protected operation、権限不足時の外部結果が、対象に該当する場合に一意か。
- trust boundary を越えるデータ、権限、エラー、状態の扱いが、適用される外部契約と整合しているか。

## 完全性・状態・失敗

- integrity、改変検知、stale、replay（該当する場合）、unknown / version の扱いが外部から判定できるか。
- malformed / tampered / stale input や権限エラー時に、fail-closed が必要な箇所の結果が明確か。
- partial failure、再試行、取消し、復旧、rollback、externally visible atomicity が外部契約に関係する場合、結果と状態遷移が一意か。
- persistence / lifecycle が外部から観測できる契約に含まれる場合、保存・復元・破損・削除・互換性・migration の扱いが明確か。

## インターフェースと相互運用性

- interface、データ形式、encoding、エラー表現、順序、deterministic representation が相手から判定できるか。
- compatibility / versioning / migration、未知の値や版、既存の正式外部契約との互換条件が必要な範囲で明確か。
- 外部依存や責任分界がある場合、どの結果を対象の契約として保証するかが明確か。

## 資源と検証可能性

- 過大入力、過大な資源消費、無限処理、タイムアウト、部分結果などが外部契約に影響する場合、その境界と結果を検証できるか。
- security invariant、失敗時の安全側の結果、受け入れ条件を、実装内部を知らない第三者が確認できるか。

## 適用と Finding の基準

- checklist の項目が対象に該当することだけでは finding にしない。一般的な hardening や、特定の方式・製品・ライブラリ・配置の採用を要求しない。
- 正式な finding は、approved Requirements、ユーザーの明示的な最新判断、approved Concept から継承される制約、approved formal reference、互換性 Requirement が参照する正式外部契約、または target Specification 自身の内部矛盾へ追跡できる必要がある。
- Implementation、Test、README、fixture、静的データなどは、現在の挙動、回帰、既存互換性、実現可能性、明白な矛盾を確認する補足証拠に限る。これらだけを根拠に新しい Requirement や Specification contract を逆生成しない。
- security checklist の観点から問題を見つけても、Specification で決定できる根拠がなければ `upstream feedback` または `unresolved` として扱う。内部実現方法に属する場合は downstream / deferred / Design handoff とする。
