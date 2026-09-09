# Reviewers

メインエージェントは Review Board Chair として、根拠管理、候補統合、重大度・状態、ゲート、成果物を担当する。Phase 1 では次の4観点を独立して確認する。Reviewer B が Security primary reviewer であり、他の Reviewer は自分の担当領域に現れる security implication だけを cross-check する。

## Reviewer A: 構造と責務

目的、範囲、コンテキスト、コンポーネント責務、依存方向、境界、循環依存、所有権を確認する。trust boundary、ownership、dependency direction、アプリ本体 / ブラウザ実行・build 境界 / アプリケーション responsibility に security implication があれば、構造と責務の範囲で独立に cross-check する。

## Reviewer B: Security Reviewer（成立性と安全性）

`security-checklist.md` を参照し、保護対象データ、trust boundaries、入力データ ownership、responsibility boundaries、入力データ lifecycle、authentication / authorization、入力処理 authority、failure / rollback / replacement、アプリ本体 / ブラウザ実行・build 境界 / アプリケーション 境界、attacker-controlled input、環境・データ separation、security invariants、downstream security handoff を Design レベルで確認する。機密データの生成・保持・使用・破棄・公開範囲と、各境界での validation、ownership、失敗責任が逆流していないかを確認する。

対象 threat は Concept、Requirements、対象 Design、明示された 保護対象データ / trust boundary またはユーザー要求から合理的に追跡できるものに限定する。checklist の項目だけを根拠に新しい Requirement、Design Decision、threat、invariant、finding を発明しない。データ保護方式、保存方式 / データ完全性、入力識別 / 保存メタデータ / tag、key length、交換形式、API、具体的 error code、TypeScript の データ保持期間 / 不要データの破棄 / 危険な実行経路、公開境界 / build の具体形式、parser / fuzz / test の方式は要求しない。

## Reviewer C: フローと運用

主要フロー、lifecycle、状態、再試行、重複、再起動、障害、保持、可用性、外部連携、運用責任を確認する。lifecycle、failure、retry、replacement、restart / recovery に security implication があれば、フローと運用の範囲で独立に cross-check する。対象外の将来運用機能は追加しない。

## Reviewer D: 追跡と下流実装可能性

要求・仕様・既存設計へのtraceability、下位仕様への委譲、検証可能性、実装者が推測すべき設計判断の有無を確認する。security invariant、responsibility、downstream handoff が Specification へ一意に渡るかを、追跡と下流実装可能性の範囲で独立に cross-check する。APIやclassの詳細不足は設計欠陥としない。

## Chair の採用基準

基本設計で決めるべき責務、依存、境界、フロー、品質特性、または既存判断との矛盾であり、根拠・影響・完了条件を説明できるものだけを採用する。Security finding は、既存の正式資料へ追跡でき、Design で決める ownership / responsibility / trust boundary / lifecycle / authorization / failure model / invariant の欠落または矛盾であり、下流方式だけでは安全に解消できず、複数の合理的な security architecture を許す場合に限る。Reviewer A / C / D の cross-check はそれぞれの担当領域に限定し、`security-checklist.md` 全件を再適用しない。Security の重複候補は Chair が統合する。重大度は checklist 項目ではなく、実際の impact と downstream blocking で決める。
