# Review Gates

Gate を不合格にする finding は `Critical` の正式指摘へ対応付ける。`Critical` が1件以上存在する場合は `REVISE SPECIFICATION`、`Critical` がなく `Major` / `Minor` のみの場合は `READY` とする。

1. 目的と範囲: 要件を満たす対象、対象外、利用者、責任を一意に理解できる。
2. 契約: 入力、出力、データ、validation、error、状態、禁止事項を確認できる。
3. 処理と例外: 現在の範囲に必要な正常時、失敗時、境界、順序、状態結果を確認できる。
4. 内部整合性: 用語、要求、例、図表、関連資料に実装を妨げる矛盾がない。
5. 検証可能性: 既存要求の合否、境界、失敗を独立して検証できる。
6. 安全性と相互運用性: 適用される 保護対象データ exposure、authentication / authorization、入力処理 authority、入力処理 target / 決定的なデータ表現、環境・データ、データ整合性 contract、入力識別 / 保存メタデータ / randomness、AAD / domain separation、localStorage / persistence、データ形式、malformed / tampered input、fail-closed、atomic visible result、error、ブラウザ実行・build 境界 boundary、unknown / version、データ互換性、security testability が外部から判定できる。
7. 上流整合性: コンセプト、要件、前段レビューのブロック判定や未解決 Critical と矛盾しない。

Security checklist の項目は独立した Gate ではなく、主に Gate 2（契約）、Gate 3（処理と例外）、Gate 5（検証可能性）、Gate 6（安全性と相互運用性）、Gate 7（上流整合性）へ対応付ける。チェック項目が存在することだけで不合格にはしない。

次のような根本欠陥は、既存 Gate の impact、ambiguity、downstream blocking に照らし、Critical になり得る。

- 入力処理 target / 決定的なデータ表現 が一意でない
- 環境・データ 境界 が不明である
- 入力データ を返してよいか、どの boundary を越えてよいか不明である
- データ整合性 contract が合理的な実装間で分岐する
- tampered data の扱いまたは fail-closed contract が不明である
- localStorage の 安全性に関わる field / encoding が一意でない
- ブラウザ実行・build 境界 の ownership・length・error 境界が安全に実装できない

これは自動分類ではない。根拠、外部影響、実装・検証の阻害を確認して重大度を決める。Major を自動的に Gate failure へ変更しない。

上流資料やフィードバックがないことだけでは Gate 不合格にせず、未確認として記録する。Gate 不合格に対応する Critical がない場合、Major / Minor のみを理由に差し戻さない。
