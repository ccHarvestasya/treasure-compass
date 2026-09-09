# Review Gates

目的は、実装を完璧にすることではなく、対象範囲が承認済み Specification を安全かつ検証可能に満たすかを判断することである。Implementation Review の release-quality gate として、具体的な security defect、実行安全性の破綻、データ整合性 misuse、ブラウザ境界 / 境界 境界の破綻を、仕様に個別の防御策が列挙されていないことだけを理由に見逃さない。一方、仕様にない新しい要求、任意の hardening、将来機能、API、policy は不合格理由にしない。

1. 仕様適合性: 入力、出力、制約、処理、状態、error、禁止事項を満たす。
2. セキュリティ: 保護対象データ、入力データ ownership / lifecycle、権限、trust boundary、データ保護、実行安全性、失敗時の安全性を満たす。
3. 相互運用性: encoding、canonical 入力データ、数値、環境、実行環境、アプリの対象環境・データ、外部形式が別実装でも一致する。
4. 異常系: malformed、boundary、authentication failure、tamper、truncated、duplicate、unknown value / version、attacker-controlled input を仕様どおりに扱う。
5. テスト十分性: 重要な仕様違反、退行、非互換、データ保護誤用、失敗を独立して検出できる。対象に応じて known vector、differential test、異常入力テスト も確認する。
6. 実装品質・実行安全性: 型、ownership、依存、例外、`危険な実行経路`、ブラウザ実行境界、build 境界、並行性が具体的欠陥を生じさせていない。

各ゲートの観察結果は、対象箇所、発生条件、具体的事実、根拠、影響、完了条件へ追跡する。security checklist は独立した大量の Gate へ変換せず、対象に適用した主要観点を Security、異常系、テスト十分性、実装品質・実行安全性 の既存 Gate へ対応付ける。仕様が曖昧で正否を決められない事項は、ゲート不合格や implementation defect と断定せず、`Specification ambiguity` / `Specification gap` / `Implementation → Specification feedback` として分離する。ただし、保存データ / ユーザー入力 の漏えい、実行安全性の破綻、入力識別値の再利用、データ検証の回避、明確に誤った署名計算など、既存の安全条件を具体的に破る defect は、実装 finding として判定する。

## Severity と判定

Severity は固定スコアで決めず、CRITICAL / HIGH / MEDIUM / LOW の4段階を維持する。exploitability、reachability、保護対象データ impact、precondition、trust boundary、recovery、downstream effect、既存の緩和要因を総合する。単にデータ保護コード、機密データ、`危険な実行経路`、ブラウザ境界、依存があることだけで CRITICAL / HIGH にはしない。

- `CRITICAL`: 保存データ / ユーザー入力 の直接漏えい、attacker による 入力データ recovery、arbitrary 入力処理、重大な 検証結果 forgery / authorization bypass、データ整合性 protection の実質的崩壊、攻撃者入力から重大な 実行安全性の破綻 が成立し 入力データ protection が崩壊するもの。
- `HIGH`: realistic condition での 入力データの漏えい、入力識別値の再利用 等の重大な データ整合性 misuse、誤った利用者状態 / 入力処理、重大な 入力データ lifecycle failure、重大な ブラウザ境界 実行安全性 bug、security impact を伴う 計算処理 の correctness defect、攻撃者入力による重大な security property の破壊、Critical / High defect を独立検出できない 安全性に関わる test gap。
- `MEDIUM`: 重大な invariant を直接破らない localized robustness issue、具体的で影響が限定された hardening gap、低影響の maintainability-driven security risk。
- `LOW`: 既存の security property に関係し、影響と到達可能性が限定的な defensive / security hygiene の不足。一般論や好みだけでは採用しない。

`CRITICAL` または `HIGH` の New / Open / Reopened finding が1件以上ある場合、該当 finding は `Required Change` とし、`REVISE IMPLEMENTATION` とする。`MEDIUM` / `LOW` のみ、または解決済み・Deferred のみの場合は `Optional / non-blocking` とし、`READY` とできる。したがって、`READY` と `Required Changes: HIGH` の組み合わせは成立しない。coverage の任意の数値目標は新設しない。
