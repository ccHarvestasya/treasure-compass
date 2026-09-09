---
name: requirements-review
description: 製品、機能、サービス、ツール、ライブラリ、CLI、Web / Mobile アプリケーション、バックエンド、OSS、プロトコル、その他のプロジェクトの Requirements を、承認済み Concept とユーザー判断に照らしてレビューし、Specification へ安全に引き渡せる状態か判定する。
---

# Requirements Review

承認済み Concept とユーザー判断を前提として、Requirements が「外部から見て何を満たす必要があるか」を十分かつ一貫して定義し、Specification へ安全に引き渡せる状態かを確認する。Reviewer は製品を改善・拡張する役割ではなく、レビュー対象を直接修正しない。

次を行わない。

- Concept を再設計する、新しい利用者を追加する、v1 スコープを拡張する
- 新機能を提案して Requirement にする、Specification を完成させる、Design を決める
- Implementation / Test の不足を Requirements の不足へ変換する

## 参照

1. AGENTS.md
2. ../review-common/review-playbook.md
3. ユーザー指定の Requirements と対応する Concept
4. 同じディレクトリの reviewers、review-gates、output-format、security-checklist
5. 必要な範囲の正式資料、既存契約、下流成果物

下流成果物は、既存契約との矛盾、互換性、回帰、実現可能性、現在の状態を確認する場合だけ補助的に参照する。下流の不足から新しい上流 Requirement を逆生成しない。

## 工程境界

```text
Concept
  → なぜ作るか
  → 誰のためか
  → 何を作るか
  → どこまで作るか

Requirements
  → 外部から見て何を満たさなければならないか

Specification
  → 要求を満たすための正確な外部契約・振る舞い

Design
  → 内部でどう実現するか

Implementation / Test
  → 実際のコード、設定、成果物、具体的な検証方法
```

正式 Finding 候補は、採用前に必ずこの工程へ分類する。

| 分類                  | 扱い                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Concept               | 原則として RR Finding にせず、上流へのフィードバックとする。これにより Requirements を安全に評価できない場合だけ Gate に影響させる。                                          |
| Requirements          | 欠落、矛盾、外部からの不明確さ、必要な責任や要求値の未定義、必要な要求値が未決定のまま下流へ委譲されていること、判定不能な Acceptance Criteria は正式 RR Finding 候補とする。 |
| Specification         | 正確な構文、field、schema、endpoint、状態遷移、エラー分類、メッセージ、境界値は、Requirements が十分なら保留または Specification への引継ぎとする。                           |
| Design                | 保存方式、データモデル、アルゴリズム、キャッシュ、モジュール、ライブラリ、フレームワーク、処理順、デプロイ方式は Finding にしない。                                           |
| Implementation / Test | コード構造、テストコード、fixture、具体的な検証方法、CI、build 設定、実装 hardening は Finding にしない。                                                                     |
| Out of Scope          | 現在の対象外として扱い、将来必要そうという理由だけで Finding にしない。                                                                                                       |

Concept が十分明確なのに Requirements へ展開できていない場合は RR Finding とする。Concept 自体の不足・曖昧さ・矛盾は、Requirements の問題として偽装しない。

## Finding 採用前の自己反証

候補ごとに次を確認し、すべてを通過したものだけを正式 Finding とする。

1. 本当に Requirements レベルの問題か。
2. Concept の不足・矛盾ではないか。
3. Specification で決めれば Requirement を変更せず解決できないか。
4. Design で決めれば解決できないか。
5. Implementation / Test の不足を Requirement 不足へ逆変換していないか。
6. 一般的なベストプラクティスや Security Checklist を押し付けていないか。
7. Concept の v1 スコープを拡張していないか。
8. ユーザー判断、Concept、既存 Requirement、正式な外部契約、法的・規制上の制約、明示された責任へ追跡できるか。
9. 外部から観測される影響または責任上の問題を説明できるか。

Finding の数をレビュー品質とみなさない。条件を満たさない候補は、上流へのフィードバック、保留、未確認、対象外のいずれかへ分類する。

## レビュー観点

- Concept との整合、上流追跡性、v1 スコープ、対象外の維持
- 外部から観測可能な機能、入力・出力・状態・ライフサイクル上の要求
- 入力・出力の種類、能力、制約自体は Requirements、正確な構文、field、schema、encoding、境界値、契約は Specification として分類できているか
- 利用者・役割・外部主体の責任、必要な失敗時要求
- 必要な品質、安全性、プライバシー、完全性等と、その根拠
- 数値要件の必要性と根拠。必要な要求値は Requirements で扱い、根拠がなければ未決定事項とし、Specification / Design が独自に決定していないか
- Acceptance Criteria の外部検証可能性
- 未決定事項と Specification への引継ぎ
- Specification / Design / Implementation への過剰な踏み込み
- 根拠のない派生 Requirement や Concept のスコープ拡張

Checklist の項目を埋めるために Finding を作成しない。Reviewer 自身が新機能、新責任、Security Requirement、将来要件を発明しない。

## 判定と成果物

判定は `READY` または `REVISE REQUIREMENTS` とする。`Critical >= 1` の場合だけ `REVISE REQUIREMENTS` とし、`Critical == 0` で `Major` / `Minor` のみなら `READY` とする。Gate の詳細は `review-gates.md`、成果物の形式は `output-format.md` に従う。

レビュー中は Requirements、Concept、Specification、Design、Implementation、Test、README、設定などを変更しない。ユーザーの明示なしに commit、push、tag、publish を行わない。
