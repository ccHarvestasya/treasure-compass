# 出力形式

この Skill のレビュー成果物は、`../review-common/output-format.md` の共通構成・章名・順序・指摘必須項目を使用する。共通構成を省略、追加、並べ替えない。

## スキル固有の値

- 正式な指摘 ID 接頭辞: `DR`
- 重大度: `Critical` / `Major` / `Minor`
- レビュー結果: `READY` / `REVISE DESIGN`
- 必須修正: `Critical` の New / Open / Reopened（ゲート不合格に対応する差戻し事項）
- 任意改善: `Major` / `Minor` の New / Open / Reopened（Critical がなければ `READY` のまま引継ぎ可能）
- 上流へのフィードバック: `Design Review → Requirements` の方向で、Requirements の不足・曖昧さ・矛盾を共通形式の必須項目に従って記録する。Design を安全に評価・完了できない場合は Design 側の正式な指摘を別途記録し、既存の Design Gate / Severity policy を適用してフィードバックへ追跡する。フィードバックから新しい Requirement や Design Decision を確定せず、同じ問題を二重計上しない
- 保留した指摘: 下位仕様・実装・運用、対象範囲外、または後続検証へ引き継ぐ指摘。Requirements の正式資料へのフィードバックは含めない
- 確認観点: システムコンテキスト、責務、依存方向、trust boundary、データ所有、主要フロー、運用、下流実装可能性、設計判断。Security Domain Check では、適用した `保護対象データ`、`trust boundaries`、`入力データ ownership`、`入力データ lifecycle`、`authentication / authorization`、`入力処理 authority`、`failure model`、`state consistency / replacement`、`アプリ本体 / ブラウザ実行・build 境界 / アプリケーション boundary`、`attacker-controlled input`、`環境・データ separation`、`security invariants`、`downstream handoff` を確認できるようにする。全 checklist 項目を機械的に出力せず、適用外または未確認の主要観点だけ必要に応じて示す。checklist 自体を正式な指摘の根拠にせず、Design 本文、Requirements、Concept、既存の適用可能な Design Decision、またはユーザー要求へ追跡できるものだけを記録する。
- 対象範囲と追跡: 要件・仕様・既存設計判断と設計箇所の対応
