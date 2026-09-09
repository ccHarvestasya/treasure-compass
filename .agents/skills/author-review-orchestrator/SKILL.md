---
name: author-review-orchestrator
description: Treasure Compass の作成・レビュー作業を、sol low の管理エージェントと luna xhigh の作業者・レビュアーへ分担し、段階的に実行・再レビューする半自動ワークフローを管理する。
---

# Author / Review Orchestrator

Treasure Compass の Concept、Requirements、Design、Specification、Implementation、README、Release Readiness の作成・レビューを半自動化する。管理エージェントは作業を分解・委譲・判定し、詳細な作成とレビューは別の luna xhigh エージェントへ委譲する。

この Skill は、現在の環境で利用できるエージェント起動・委譲機構がある場合に使用する。委譲機構や指定モデルが利用できない場合、別モデルへ黙って切り替えず、実行不能として理由を報告する。

## 固定モデル割り当て

| 役割 | モデル | 担当 |
| --- | --- | --- |
| Manager | sol low | 依頼分類、対象確定、作業分解、進行管理、Gate 判定、最終報告 |
| Author | luna xhigh | 選択された author Skill による文書・コード・テストの作成または修正 |
| Reviewer | luna xhigh | 選択された review Skill による独立レビュー、指摘、再確認 |

委譲時はモデル指定を sol low または luna xhigh として明示する。モデル名を変換したり、理由なく代替したりしない。Manager は詳細な本文、コード、レビュー指摘を自分で代行せず、対象整理・委譲・状態管理・結果統合を担当する。

## 参照とルーティング

作業開始時に次の順で読む。

1. AGENTS.md
2. この Skill
3. 対象フェーズの author / review Skill
4. author-common または review-common
5. ユーザー指定の資料と対象

| 対象 | Author | Reviewer |
| --- | --- | --- |
| Concept | concept-author | concept-review |
| Requirements | requirements-author | requirements-review |
| Design | design-author | design-review |
| Specification | spec-author | spec-review |
| Implementation | implement-author | implement-review |
| README | readme-author | readme-review |
| Release Readiness | なし | release-readiness-review |

複数フェーズにまたがる依頼は上流から順に分割する。要件・設計・仕様・実装を一つの worker に混ぜない。Release Readiness はレビュー中に修正しない。

## 実行モード

- CREATE: Author のみを起動する。
- REVIEW: Reviewer のみを起動する。
- CREATE_AND_REVIEW: Author の完了後、独立した Reviewer を起動する。

「作成してレビュー」「実装して確認」などの依頼は CREATE_AND_REVIEW とする。単なる相談・説明・レビュー結果の要約では worker を起動しない。

## CREATE_AND_REVIEW

### 1. Manager brief

Manager は task_id、目的、完了条件、対象フェーズ、選択 Skill、対象ファイル、許可パス、参照資料、検証範囲、無関係な既存変更、worker の役割とモデルを brief に含める。

ユーザー入力、localStorage の内容、環境変数、credential、個人情報を brief や成果物へコピーしない。

### 2. Author

Author を luna xhigh で起動する。対象 author Skill と必要な資料だけを渡し、次を明示する。

- 指定範囲だけを変更する。
- 上流資料にない外部可視動作を追加しない。
- 変更ファイル、根拠、検証、未確認範囲を返す。
- Review を完了扱いにせず、レビュー待ちで返す。

対象外のファイル変更があれば採用せず、Author に戻すかユーザーへ確認する。

### 3. Independent Reviewer

Author の成果物を確認した後、別の Reviewer を luna xhigh で起動する。Reviewer には Author の推測・結論・自己評価を渡さず、対象成果物、上流根拠、依頼範囲、review Skill だけを渡す。

Reviewer はコード、仕様、要件、README、テスト、静的データを変更しない。対象箇所、根拠、影響、最小修正、再確認条件、検証結果、未確認範囲を返す。

### 4. Manager gate

Reviewer の結果を次に分類する。

- READY: 必須修正なし。
- REVISE: 必須修正あり。最小修正だけを Author に返す。
- BLOCKED: 対象不明、上流決定不足、モデル・委譲機構不足、安全に継続できない。
- OUT_OF_SCOPE: 依頼範囲外。別作業として報告する。

任意改善だけで REVISE にしない。重大度、Gate、Upstream Feedback は対象 review Skill を優先する。

### 5. Revision loop

REVISE では、Manager は指摘を新しい要求へ膨らませず Author に返す。修正後は同じ Reviewer を再起動する。再レビューは最大 3 回を既定値とし、READY にならなければ BLOCKED として未解決指摘と必要な判断を報告する。上限の明示指定があれば優先する。

## 実装と検証

Implementation の Author brief には、変更前の git status、許可パス、対象テスト、依存変更の有無を含める。Reviewer の完了前に commit、push、publish を実行しない。

検証は AGENTS.md の change-aware validation に従う。文書・Skill だけの作業ではアプリの lint、test、build を要求しない。未実行の検証を成功扱いにしない。

## 状態と最終報告

状態は次のとおり管理する。

PLANNED → AUTHORING → REVIEWING → READY

修正時は REVIEWING → REVISION_NEEDED → AUTHORING とし、停止時は BLOCKED または OUT_OF_SCOPE とする。

最終報告には、task と worker の役割・モデル、変更ファイル、Reviewer の判定・指摘・対応状況、検証結果、未確認範囲、残存する未決定事項を含める。

ユーザーの明示なしに commit、push、tag、publish、外部メッセージ送信を行わない。ユーザーが明示した場合でも、Review が READY になるまで公開操作を実行しない。

## 失敗時の扱い

- 指定モデルが利用できない場合は BLOCKED / MODEL_UNAVAILABLE とする。
- 対象や上流資料が一意に定まらない場合は BLOCKED / TARGET_CONFIRMATION_REQUIRED とする。
- 無関係な作業ツリー変更は維持し、worker の許可範囲から除外する。
- Author と Reviewer が同じ成果物を同時に変更しない。
- Reviewer の指摘だけを根拠に上流資料を無断で変更しない。
- 入力データや credential の漏えいがあれば処理を止め、範囲を広げず報告する。

この Skill は委譲と判定を管理するものであり、対象フェーズの author / review Skill の代替ではない。
