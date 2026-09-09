# 出力形式

この Skill のレビュー成果物は、`../review-common/output-format.md` の共通構成・章名・順序・
指摘必須項目を使用する。共通構成を省略、追加、並べ替えない。

## スキル固有の値

- 正式な指摘 ID 接頭辞: `RL`
- 重大度: `Critical` / `Major` / `Minor`
- レビュー結果: `READY` / `READY WITH MINOR FIXES` / `NOT READY` / `TARGET CONFIRMATION REQUIRED`
- 必須修正: 公開を妨げる `Critical` / `Major` の New / Open / Reopened
- 任意改善: 公開を妨げない `Minor` の New / Open / Reopened
- 保留した指摘: current review の責務を越える事項、対象外 surface、後工程、未決定事項
- 確認観点: Version Assessment、Documentation / Translation Parity、Package Metadata、
  API / public contract、Distribution、Platform、Security、SBOM / License、Provenance、Durable Publication、
  Retry / Recovery、Validation Evidence、Public Hygiene
- 対象範囲と追跡: discovery した release set / surface、manifest、README、公開 API、
  実装、仕様、workflow、artifact、evidence の対応
- 自動変更: 明示依頼があり安全な metadata / docs を変更した場合だけ記録する。
  publish、commit、tag、registry、remote 変更はレビュー成果物の完了と混同しない。
