# Reviewers

メインエージェントは Review Board Chair として、対象確定、根拠管理、重複排除、重大度・状態、ゲート、成果物を担当する。Phase 1 では次の4観点を独立して確認する。Reviewer Board の構造は変更せず、Security の責任だけを Reviewer B に閉じない。

## Reviewer A: 仕様適合性

入力、出力、事前・事後条件、field、制約、処理順序、状態、error、warning、replacement 保存状態、禁止事項、公開動作を承認済み仕様と照合する。仕様が曖昧な場合は欠陥と断定しない。

## Reviewer B: セキュリティ

4フェーズ中で最も深い Security Review を担う。変更から 保護対象データ、attack surface、入力データ path、trust boundary を特定し、`security-checklist.md` の該当項目を適用する。ユーザー入力、入力データ、保存データ、派生 保存データ、一時的な入力データ、localStorage、保存形式から派生した値、復元済み保存データ の 生成、復元、取り込み、利用、一時表現、保存、置換、削除、再起動・復旧、失敗経路 を追跡する。

入力データ ownership、unnecessary copy、lifetime、不要データの破棄、logging / error / panic leakage、actual データ検証処理、計算処理、具体的な side-channel、RNG / entropy、入力処理、localStorage、attacker-controlled parser、ブラウザ実行境界、build / JavaScript boundary、`危険な実行経路`、failure / atomicity、適用可能な concurrency、dependency / feature interaction を確認する。`security-checklist.md` の tests、known vectors、異常入力テスト、differential testing、入力データ-bearing test data も対象にする。

仕様に存在しない新しい製品要求、任意の hardening、将来機能、API、policy を発明しない。別のデータ保護ライブラリ、2FA、外部サービス、一般論としての rate limit、実装スタイルの好み、threat model 外の hardening は finding にしない。一方、保存データ / ユーザー入力 の漏えい、入力データ copy / lifetime / 不要データの破棄 の具体的な破綻、入力識別値の再利用、ブラウザの安全な乱数 failure、データ完全性 authentication result の未検証、仕様と異なる 入力データ、計算処理 の correctness defect、具体的な 入力データ-dependent leakage、ブラウザ境界 の use-after-free / double-free、build / JS への不要な 入力データ 露出、実行安全性 invariant の破壊、攻撃者入力による panic / UB / resource exhaustion、アプリの対象環境・データ または 開発・本番 の混同による誤署名など、既存の security property や言語・境界の安全性を破る具体的 defect は、個別の防御策が仕様へ列挙されていなくても指摘する。

copy が存在すること、`不要データの破棄` crate を使っていること、予測可能な処理 でないこと、異常入力テスト がないことだけでは finding にしない。必要性、lifetime、消去可能性、具体的 leakage path、asset impact、reachability、契約または安全条件の破綻を確認する。仕様・設計・要件または確認済みの データ整合性 / 仕様 fact で正否を判定できる事項は finding として根拠へ追跡し、契約自体が不足・曖昧な場合は `Specification ambiguity` / `Specification gap` / `Implementation → Specification feedback` として分離する。成果物の `Domain Checks` には、適用項目、主要な適用外項目、未確認範囲を明記する。

## Reviewer C: 相互運用性・プロトコル

文字コード、正規化、byte order、整数と精度、deterministic encoding、hex / raw bytes、canonical 入力データ、未知値、fixture、ブラウザ実行・build 境界 の外部形式、依存ライブラリ表現、アプリの対象環境・データ、開発・本番 を確認する。署名対象、domain separation、環境・データ 境界、replay / substitution、wrong account / 環境・データ の観点は Security Reviewer と重なってよい。C は 仕様 contract の観点から独立に確認し、内部方式の好みは指摘しない。

## Reviewer D: ソフトウェア品質・テスト

変更範囲内の責務、ownership、型、依存、panic、公開互換性、`危険な実行経路` の安全条件、正常・異常・境界・改ざん・不正署名・認証失敗・replay・未知 version・サイズ超過・不正 encoding・deterministic encoding のテストを確認する。Security-sensitive path では wrong password / account / 環境・データ、corrupted ciphertext、invalid 検証結果、malformed / truncated input、不要データの破棄 / failure path、fuzz、differential test、known vector、独立した oracle、入力データ-bearing test data を対象にする。実装ロジックを複製した期待値や出典不明 fixture だけで独立検証したことにしない。重大な security property を独立検出できない test gap は、具体的な未検出 defect、到達可能性、影響および最小の検証方法が示せる場合に限り finding とする。

## Chair の採用基準

対象箇所、発生条件、既存根拠、具体的事実、影響、必要条件、完了条件が揃い、現在の変更範囲に直接関係するものだけを採用する。重複する Security / 仕様 / Test finding は根拠を失わないよう統合する。CRITICAL / HIGH は Required Change とし、状態が New / Open / Reopened の1件以上があれば `REVISE IMPLEMENTATION` とする。MEDIUM / LOW は Optional / non-blocking とし、それらのみなら `READY` とできる。新規設計、将来拡張、好みのリファクタリング、optional hardening は却下する。仕様・設計・要件の不足、曖昧さ、未決定により Implementation の正否を判断できない場合は、Implementation defect と断定せず、発生源に応じた `Upstream Feedback` へ分離する。`Upstream Feedback` 自体は formal finding ではなく、Severity を持たない non-normative な記録とする。ただし、upstream gap により Implementation を安全に評価・完了できない場合は、current Implementation phase への影響を示す Implementation 側の formal finding を記録し、`Upstream Feedback` へ trace する。この formal finding には既存の Implementation Gate / Severity policy を適用する。`Deferred Findings` は current scope outside、later verification、operations / release confirmation 等に限定し、Specification / Design / Requirements の不足、曖昧さ、未決定事項には使用しない。formal finding と `Upstream Feedback` は同じ root cause を二重計上せず、前者は current Implementation phase への影響、後者は上流資料へ返す方向・不足・解消条件を記録する。
