# Review Gates

Gate を不合格にする finding は `Critical` の正式指摘へ対応付ける。`Critical` が1件以上存在する場合は `REVISE DESIGN`、`Critical` がなく `Major` / `Minor` のみの場合は `READY` とする。

Security の確認は独立した Gate を追加せず、既存 Gate へ対応付ける。入力データ owner が不明、trust boundary が成立していない、入力処理 authority の責任主体が不明、UI / 保存状態 / utility 間で 入力データ responsibility が逆流している、failure model が安全側を保証できない、または security invariant を Specification へ引き渡せない根本欠陥は、影響と下流 blocking が確認できる場合に既存 Gate の `Critical` になり得る。checklist の項目だけで自動的に Gate failure や `Critical` にしてはならず、`Major` を自動的に Gate failure へ変更しない。

保護対象データ、trust boundaries、入力データ ownership、境界 boundary は主に Gate 2 と 5、lifecycle、failure model、replacement、restart は Gate 4 と 5、authentication / authorization、入力処理 authority、環境・データ separation は Gate 6、security invariant と downstream handoff は Gate 6 と 8 へ対応付ける。実際の finding は影響と根拠に応じて一つ以上の既存 Gate に結び付ける。

1. 目的と範囲: 設計の目的、対象、対象外、前提が一意に理解できる。
2. コンテキストと責任: 外部主体、コンポーネント責務、trust boundary、機密データ境界が明確である。
3. 依存方向: 依存が意図した方向に流れ、責務の逆流や循環がない。
4. 主要フロー: 正常、失敗、再試行、再起動、重複、結果対応の責任が確認できる。
5. データ所有: 状態、機密データ、保持、更新、破棄の所有者と境界が明確である。
6. セキュリティと相互運用性: 保護対象データ、入力データ lifecycle、authorization / 入力処理 authority、failure safety、security invariant、アプリの対象環境・データ、開発・本番、アプリ本体 / ブラウザ実行・build 境界 の境界を弱めていない。
7. 上流整合性: 要件、仕様、既存設計と重大な矛盾がない。
8. 下流実装可能性: 下位仕様・実装・検証へ必要な設計判断を推測なしに引き渡せる。

API、schema、データ保護パラメータなど下位工程の未決定だけでは Gate 不合格にしない。Gate 不合格に対応する Critical がない場合、Major / Minor のみを理由に差し戻さない。
