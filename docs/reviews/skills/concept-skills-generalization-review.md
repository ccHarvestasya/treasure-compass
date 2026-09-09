# コンセプト関連 Skill 汎用化レビュー

## Review Summary

- 対象コミット:
  - 初回変更: `55133c70659b00dba72c2a560a75a79f8a9e2926`
  - 最終確認版: `1e02af3824142153dbc4024473b64b66b01bb4b4`
- 対象範囲:
  - `.agents/skills/concept-author/**`
  - `.agents/skills/concept-review/**`
  - `.agents/skills/author-review-orchestrator/**`
- 確認観点:
  - 特定アプリ、リポジトリ、モデル、実行環境に依存しない Skill になっているか
  - `concept-author` と `concept-review` が対として同じコンセプト境界を扱うか
  - 統括 Skill が、明示的なコミット許可のもとで「対象変更をコミット → 独立レビュー → 完了後にレビュー資料を別コミット」と進められるか
  - Skill Creator の構造、記述、UI メタデータ規則に適合するか
- 未確認範囲:
  - 対象外の Skill、アプリ本体、コンセプト文書の内容
  - 実際のエージェント委譲を伴う end-to-end 実行
  - push、tag、publish など、今回の Skill が別許可として扱う外部操作
- Gate: **READY**
- Open Finding: Critical 0件 / Major 0件 / Minor 0件
- Resolved Finding: Major 1件

## Assessment

`concept-author` と `concept-review` は、製品、機能、サービス、ツール、ライブラリ、プロジェクトを対象とし、Treasure Compass、特定パス、特定技術構成、固定モデルへの依存を残していない。両者は、課題、対象ユーザー、提供価値、v1、対象外、責任境界、成功状態、要件定義への引継ぎ、および Concept / Requirements / Design / Out of Scope の工程分類を対応する形で扱っている。作成者がレビュー成果物を自己作成せず、対になる `concept-review` へ独立レビューを委ねる境界も明確である。

`author-review-orchestrator` は、コミットを通常の作成・レビューから分離し、ユーザーの明示的な許可がある場合だけ `CREATE_COMMIT_REVIEW` を選択する。対象成果物とレビュー資料を明示パスで別々にステージし、対象コミット ID をレビュー版として固定し、push、tag、publish へ権限を拡張しないため、意図された二段階コミットの安全条件は概ね定義されている。

初回レビューで確認した Gate 名の不一致は、最終確認版で対象レビュー Skill 固有の必須修正 Gate を `REVISION_NEEDED` へ正規化する規則が追加され、解消された。`REVISE CONCEPT` も明示的にこの制御状態へ対応付けられ、修正コミットと同一 Reviewer による再レビューへ一意に進める。

## Findings

### AR-001 — Major: `REVISE CONCEPT` を修正ループへ確実に対応付けられない

**状態:** Resolved

**対象:** `.agents/skills/author-review-orchestrator/SKILL.md` の「Gate と修正ループ」、`.agents/skills/concept-review/SKILL.md` の「Gate」

**根拠:** 統括 Skill は対象レビュー Skill の Gate を優先すると記述しているが、修正が必要な分岐と後続手順は `REVISE` とだけ定義されている。対になる `concept-review` が返す不合格 Gate は `REVISE CONCEPT` であり、文字どおりには統括 Skill の `REVISE` 分岐と一致しない。

**影響:** `concept-review` が `REVISE CONCEPT` を返した場合、Manager が修正コミットと同一 Reviewer による再レビューへ進むのか、未知の Gate として停止するのかが一意に決まらない。結果として、対象変更を固定コミットし、独立レビューで必須修正を検出し、追加の対象コミットを経て最終レビュー資料を別コミットするという意図された流れが途中で途切れる可能性がある。

**必要な修正:** 対象レビュー Skill 固有の Gate を、統括 Skill の正規化された制御状態へ明示的に対応付けること。少なくとも `REVISE CONCEPT` を修正ループへ入る Gate として扱うことを明記するか、`REVISE*` のような曖昧な文字列判定ではなく「対象 Skill が必須修正を要求する Gate」を `REVISION_NEEDED` へ正規化する規則を定める。

**解決確認:** `1e02af3824142153dbc4024473b64b66b01bb4b4` で、対象レビュー Skill が必須修正を要求する Gate を `REVISION_NEEDED` へ正規化し、`REVISE` と `REVISE CONCEPT` を例示する規則へ更新された。後続の修正ループも `REVISION_NEEDED` を条件に統一されているため、必要な修正を満たした。

## Gate Rationale

3つの Skill の汎用化、作成・レビュー間の概念境界、明示的許可に基づく二段階コミット、無関係な作業ツリー変更の排除、レビュー対象コミットへの追跡、公開操作への権限非拡張は成立している。AR-001 も最終確認版で解消され、`concept-review` の必須修正 Gate から修正・再レビュー経路まで一貫した。未解決 Finding はないため **READY** と判定する。

## Validation Results

- Skill Creator `SKILL.md`: 全文確認済み
- Skill Creator `references/openai_yaml.md`: 全文確認済み
- 対象3 Skill の `SKILL.md`: 全文確認済み
- 対象3 Skill の `agents/openai.yaml`: 全文確認済み
- `quick_validate.py`:
  - `concept-author`: PASS
  - `concept-review`: PASS
  - `author-review-orchestrator`: PASS
- 初回変更の親から最終確認版までの対象範囲に対する `git diff --check`: PASS
- アプリ・環境固有語の残存検索: 対象3 Skill 内に該当なし
- 削除された補助資料への残存参照: 対象3 Skill 内に該当なし
- アプリの lint / test / build: SKIPPED（Skill とレビュー資料のみが対象）
- 作業開始前から存在した `docs/concept/**` の未コミット変更: 未変更・未確認
