# 出力形式

この Skill のレビュー成果物は、`../review-common/output-format.md` の共通構成・章名・順序・指摘必須項目を使用する。共通構成を省略、追加、並べ替えない。

## スキル固有の値

- 正式な指摘 ID 接頭辞: `RR`
- 重大度: `Critical` / `Major` / `Minor`
- レビュー結果: `READY` / `REVISE REQUIREMENTS`
- 必須修正: `Critical` の New / Open / Reopened（ゲート不合格に対応する差戻し事項）
- 任意改善: `Major` / `Minor` の New / Open / Reopened（Critical がなければ `READY` のまま引継ぎ可能）
- 上流へのフィードバック: なし（Requirements Review は通常 upstream phase を持たない）
- 保留した指摘: 仕様設計以降、対象範囲外、または後続検証へ引き継ぐ指摘。上流の正式資料の不足・曖昧さ・矛盾は含めない
- 確認観点: 要求の完全性、責任・範囲、MUST / SHOULD、受け入れ条件、セキュリティ、相互運用性。Security Domain Check では、適用した `保護対象データ`、`不要なデータ公開`、`integrity`、`authentication / authorization`、`lifecycle`、`responsibility boundary`、`failure safety`、`環境・データ separation` を確認できるようにする。`input / attacker boundary`、`availability / resource safety`、`recoverability` は製品範囲・攻撃面に適用する場合だけ含める。全 checklist 項目を機械的に出力せず、適用外または未確認の範囲は必要なものだけ明示する。

Security Domain Check は `security-checklist.md` をレビュー観点として使用するが、checklist 自体を根拠に新しい Requirement や finding を作らない。正式な Security finding は、Requirements 本文、Concept、ユーザー要求、または適用可能な正式資料へ追跡できるものだけを記録する。データ保護方式、保存方式、データ完全性、入力識別、保存メタデータ、key length、不要データの破棄方式、データ配置、ownership / lifetime、API field、JSON key、交換形式、ライブラリ、ブラウザ境界 / build方式、fuzz harness、test framework 等の下流詳細は Domain Checks の欠落として扱わない。

- 対象範囲と追跡: 要求とコンセプト、設計、適用資料、下流工程との追跡
