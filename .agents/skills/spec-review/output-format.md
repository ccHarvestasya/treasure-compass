# 出力形式

この Skill のレビュー成果物は、`../review-common/output-format.md` の共通構成・章名・順序・指摘必須項目を使用する。共通構成を省略、追加、並べ替えない。

## スキル固有の値

- 正式な指摘 ID 接頭辞: `SR`
- 重大度: `Critical` / `Major` / `Minor`
- レビュー結果: `READY` / `REVISE SPECIFICATION`
- 必須修正: `Critical` の New / Open / Reopened（ゲート不合格に対応する差戻し事項）
- 任意改善: `Major` / `Minor` の New / Open / Reopened（Critical がなければ `READY` のまま引継ぎ可能）
- 上流へのフィードバック: `Specification Review → Design` を通常とし、問題の発生源が Requirements の場合だけ `Specification Review → Requirements` とする。Specification を安全に評価・完了できない場合は Specification 側の正式な指摘を別途記録し、既存の Specification Gate / Severity policy を適用してフィードバックへ追跡する。フィードバックから新しい Design Decision、Requirement、Specification contract を確定せず、同じ問題を二重計上しない
- 保留した指摘: 実装・検証、対象範囲外、または後続確認へ引き継ぐ未決定事項・確認事項。上流の正式資料へのフィードバックは含めない
- 確認観点: API・データ契約、validation、error、状態、処理、security、相互運用性、検証可能性。Security は適用した 保護対象データ exposure、authentication / authorization、入力処理 authority、入力処理 target / 決定的なデータ表現、環境・データ 境界、データ整合性 contract、入力識別 / 保存メタデータ / randomness、AAD / domain separation、localStorage / persistence、データ形式、malformed / tampered input、fail-closed、atomic visible result、ブラウザ実行境界、build、unknown / version、データ互換性、security testability を必要な範囲で確認する。
- 対象範囲と追跡: 要件・コンセプト・設計・前段レビューと仕様箇所の対応
