# 実装レビュー成果物の出力形式

レビュー成果物は Markdown とし、`../review-common/output-format.md` の共通構成・章名・順序・指摘必須項目を使用する。共通構成を省略、追加、並べ替えない。

## Skill 固有の値

- 正式な指摘 ID 接頭辞: `IR`
- 重大度: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`
- レビュー結果: `READY` / `REVISE IMPLEMENTATION`
- 必須修正: `CRITICAL` / `HIGH` の New / Open / Reopened は `Required Change`。ただし Gate はこれらの有無だけでなく、blocking review condition も確認して判定する
- 任意改善: `MEDIUM` / `LOW` の New / Open / Reopened。これらのみで、blocking review condition がなければ `READY` とできる
- 上流へのフィードバック: 上流の不足・曖昧さ・未決定は `Upstream Feedback` として記録し、発生源を `Upstream ambiguity`、`Specification gap`、`Design gap` に分ける。Implementation defect として二重計上せず、上流から新しい契約・設計・要求を作らない。判定を阻害する場合は Gate rationale に blocking impact を記録するが、架空の Implementation Finding や Severity を作らない
- 保留した指摘: 後続検証、外部環境、運用、release、または後続工程で確認すべき事項への引継ぎ。現在の適合性判定に必須な未確認事項は含めず、単に現在の対象範囲外である事項や上流問題も含めない
- Gate 判定: `REVISE IMPLEMENTATION` は blocking formal finding または blocking review condition がある場合、`READY` はその両方がない場合。後続確認でよい事項は `Deferred`、対象外は Review Scope / Excluded Scope に記録する
- 確認観点: Specification / Design conformance、correctness、state / data、failure / resource / runtime safety、security、compatibility / integration、dependency / build / generated artifact、test、validation、regression、scope。対象に適用される観点だけを使う
- 対象範囲と追跡: reviewed revision / base、changed files、依頼範囲、承認済み上流成果物、Implementation / Test、補助証拠、除外範囲、未確認範囲の対応

## 指摘事項の分類と記載

各正式 finding は、共通形式に加え、意味上少なくとも次を含める。

- location（可能ならファイルと行）
- upstream basis または reviewed artifact
- observed problem、発生条件、到達可能性
- correctness、security、integrity、compatibility、scope、regression、validation 等への具体的影響
- classification、severity、status
- 必要な最小修正、完了条件、再確認方法

仕様・設計が不足して正否を判定できない場合は、`Implementation defect` と断定しない。`Upstream Feedback` の発生源を明示し、同じ根本原因を正式 finding と二重計上しない。

Specification / Design にない新しい製品要求、任意の hardening、将来機能、API、policy、実装方式の好みは finding にしない。一方、既存契約、安全条件、互換性、実行境界を具体的に破る到達可能な defect は、根拠と影響を示して finding とする。

`Out of Scope` は必要なら Review Scope / Excluded Scope に記録し、Deferred に自動変換しない。
