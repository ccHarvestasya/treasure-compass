# Review Gates

Gate を不合格にする finding は `Critical` の正式指摘へ対応付ける。`Critical` が1件以上存在する場合は `REVISE DESIGN`、`Critical` がなく `Major` / `Minor` のみの場合は `READY` とする。

Specification に不足する外部契約は `Specification gap` または `Upstream ambiguity` として上流へ戻す。Design Review が具体的な外部挙動を発明して Gate failure や `Critical` にしてはならない。checklist の項目だけで自動的に Gate failure や `Critical` にせず、`Major` を自動的に Gate failure へ変更しない。

1. 目的と範囲: Design の目的、対象、対象外、前提、承認済み Specification を一意に理解できる。
2. コンテキストと責任: 外部主体、system / subsystem / component の責務、trust boundary、機密データ・権限境界が必要な範囲で明確である。
3. 依存方向: dependency direction、collaboration boundary、責務の流れが成立し、不要な循環や責任の逆流がない。
4. 主要フローと失敗: 重要な data flow、正常・失敗・partial failure、retry、restart、recovery、resource cleanup の内部責任が確認できる。
5. 状態・データ所有: source of truth、ownership、更新、保持、破棄、replacement、persistence、cache、lifecycle の責任が必要な範囲で明確である。
6. セキュリティ・整合性・運用境界: 適用される validation responsibility、authentication / authorization、integrity、failure isolation、concurrency / atomicity、runtime / deployment / operational responsibility、observability responsibility が上流契約に沿って割り当てられている。
7. 上流整合性と工程境界: Design が Specification の外部契約を変更、弱化、拡張しておらず、Specification gap を Design で補完していない。
8. 下流実装可能性: Implementation / Test が上流契約を推測せず進めるための責務、constraint、boundary、主要な設計判断が十分である。ただし exact code や test implementation までは要求しない。

Security の確認は主に Gate 2、5、6、7 に対応付ける。persistence、concurrency、deployment、observability などは対象に存在する場合だけ適用する。

次のような欠陥は、根拠、外部影響、downstream blocking を確認したうえで `Critical` になり得る。

- Specification を満たすために必要な component responsibility、state owner、dependency direction、trust boundary、validation responsibility がなく、安全な内部設計を確定できない
- Design の責任分担が矛盾し、同じ上流契約を満たす合理的な Implementation が ownership、consistency、atomicity、recovery responsibility、security responsibility を推測しなければならない
- 必要な failure containment、resource lifecycle、integrity、権限分離、機密データ境界が欠落し、重大な外部契約・安全性を設計から実現できない
- Implementation が推測で補うと、上流契約との適合または重大な architecture constraint を損なう

外部入力の解釈、出力、error result、ordering、protocol behavior、compatibility behavior そのものの未定義は、Design finding として埋めず `Specification gap` とする。
