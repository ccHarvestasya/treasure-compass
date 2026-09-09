---
name: phase-context-maintainer
description: Treasure Compass の正式資料から、任意のフェーズ用に非規範的な Phase Context の必要性を評価・作成・更新する。正式資料、レビュー成果物、コードを変更しない。
---

# Phase Context Maintainer

複数の正式資料を毎回横断して再確認する負荷が大きい場合に限り、探索用の Phase Context を維持する。Context は新しいフェーズ、要件、設計、仕様、Source of Truth ではない。

## 責務と禁止事項

- 対象フェーズの正式資料を確認し、反復利用される安定した用語、責務境界、データフロー、判断、資料の所在を抽出する。
- Context の必要性を評価し、依頼された場合だけ新規作成・refresh する。
- Concept、Requirements、Design、Specification、Review、コード、テスト、静的データを変更しない。
- 新しい要求、設計判断、仕様、API、field、error、fallback、互換性、将来機能を作らない。
- 競合、stale、未決定事項を独断で解消しない。

## 参照

1. AGENTS.md
2. Context 登録の有無
3. 承認済み正式資料と直接必要な上流資料
4. 既存 Context は stale / conflict の確認に限って読む
5. 必要な場合だけレビュー、実装、テスト、静的データを補助参照する

登録されていない Context を自動利用しない。作成する場合は、実在するパスを AGENTS.md の Phase Contexts に登録する。登録だけを先に行わない。

## 必要性の評価

次を実際の作業で確認する。

- 典型的な作業で横断する正式資料の数と深さ
- 複数の作成・レビュー作業で同じ資料群を読む頻度
- 安定した責務、状態所有、データフロー、用語、決定事項の量
- Context化で探索が減るか
- 正式資料の変更に追随する維持コスト

判定は NO CONTEXT NEEDED または CONTEXT RECOMMENDED とする。評価だけの依頼ではファイルを作成しない。

## Context の形式

作成・refresh が依頼された場合だけ、docs/context/<phase>-context.md などの実在するパスへ作成する。YAML frontmatter に phase、status: non-normative、last_refreshed を含め、本文に次を記載する。

- Purpose
- Scope
- Non-normative status
- Authoritative source precedence
- Source documents
- Refresh policy
- Topic と正式資料の source map
- 未決定事項と競合

正式資料の要約を丸ごとコピーせず、探索に必要な最小情報へ絞る。Contextが曖昧、stale、競合、外部契約や責務へ影響する場合は正式資料へ戻る。

## 完了条件

Contextの必要性または作成結果が正式資料へ追跡できる。登録、frontmatter、source map、リンクを確認する。正式資料、レビュー成果物、コード、テスト、静的データを変更していない。
