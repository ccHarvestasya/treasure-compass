# Review Gates

Gate を不合格にする finding は `Critical` の正式指摘へ対応付ける。`Critical` が1件以上存在する場合は `REVISE SPECIFICATION`、`Critical` がなく `Major` / `Minor` のみの場合は `READY` とする。

1. 目的と範囲: 要件を満たす対象、対象外、利用者、責任を一意に理解できる。
2. 要件追跡と契約: 要件を満たしたか判定するための入力、出力、データ、validation、error、状態、禁止事項を確認でき、重要な契約を承認済みの根拠へ追跡できる。
3. 処理と例外: 現在の範囲に必要な正常時、失敗時、境界、順序、状態結果を確認できる。
4. 内部整合性: 用語、要求、例、図表、関連資料に外部契約の解釈・検証を妨げる矛盾がない。
5. 検証可能性: 既存要求の合否、境界、失敗を独立して検証できる。
6. 安全性・信頼境界・相互運用性: 適用される保護対象データ、trust boundary、authentication / authorization、untrusted input、integrity、malformed / tampered input、replay、fail-closed、partial failure、externally visible atomicity、persistence / lifecycle、deterministic representation、compatibility / versioning、security testability が外部から判定できる。
7. 上流整合性と工程境界: Concept、Requirements、前段レビューのブロック判定や未解決 Critical と矛盾せず、外部契約として必要な根拠なく Design / Implementation の内部決定を Specification に固定していない。

Security checklist の項目は独立した Gate ではなく、主に Gate 2（契約）、Gate 3（処理と例外）、Gate 5（検証可能性）、Gate 6（安全性と相互運用性）、Gate 7（上流整合性）へ対応付ける。チェック項目が存在することだけで不合格にはしない。

次のような根本欠陥は、既存 Gate の impact、ambiguity、downstream blocking に照らし、Critical になり得る。

- 外部入力の解釈対象または決定的なデータ表現が一意でない
- trust boundary、責任、またはデータ境界が不明である
- 入力データの返却・公開条件、または越えてよい外部境界が不明である
- データ整合性、互換性、または versioning の契約が合理的な実装間で分岐する
- malformed / tampered input、replay（該当する場合）の扱い、または fail-closed contract が不明である
- 外部契約に関係する persistence / lifecycle の field、表現、失敗時の結果が一意でない
- partial failure または externally visible atomicity の結果が外部から判定できない

これは自動分類ではない。根拠、外部影響、実装・検証の阻害を確認して重大度を決める。Major を自動的に Gate failure へ変更しない。

上流資料やフィードバックがないことだけでは Gate 不合格にせず、未確認として記録する。Gate 不合格に対応する Critical がない場合、Major / Minor のみを理由に差し戻さない。
