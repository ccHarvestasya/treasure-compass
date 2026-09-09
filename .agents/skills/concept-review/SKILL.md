---
name: concept-review
description: Treasure Compass のコンセプトを、根拠、課題・価値、対象ユーザー、v1 の境界、責任、成功条件、成立性の観点でレビューし、要件定義へ進める品質を判定する。
---

# Concept Review

コンセプトを設計・実装・書き直すのではなく、要件定義を安全に開始できる品質かを判定する。

## 参照

1. AGENTS.md
2. ../review-common/review-playbook.md
3. ユーザー指定のコンセプト
4. reviewers、review-gates、output-format が同じディレクトリに存在する場合はそれら
5. 対応する既存の上流資料と過去レビュー

## 対象

- 指定があればそのコンセプト1件を対象にする。
- 未指定の場合は docs/concept/ の候補を確認し、候補が0件または複数なら推測で選ばない。
- 要件、設計、仕様、実装、テスト、過去レビューは対象候補ではなく、根拠・成立性の補助として必要な場合だけ読む。
- 出力先はユーザー指定を優先し、未指定でレビュー成果物が必要なら docs/reviews/concept/ を候補とする。

## レビュー観点

- 課題と対象ユーザーが具体的で、提供価値へつながっているか
- 地図情報、メンバー、巡回、チャット入力などの責任境界が過不足なく表現されているか
- v1、対象外、外部責任、将来構想が混ざっていないか
- 成功条件が目的を検証でき、根拠のない数値や実装条件を含まないか
- 前提、リスク、未決定事項が要件定義へ引き継がれているか
- API、保存方式、画面詳細、依存、実装をコンセプトで先取りしていないか

レビュー中はコンセプトやコードを変更しない。根拠のない機能追加を要求しない。

## 判定

判定は READY または REVISE CONCEPT とする。要件定義の境界・価値・責任を安全に確定できない欠陥は Critical、改善可能な不足は Major / Minor とするが、重大度は本文と根拠に基づいて決める。Critical がある場合だけ REVISE CONCEPT とする。未確認範囲と未決定事項は別に記録する。

成果物は ../review-common/output-format.md の構成に従い、Review Result、Finding、Upstream Feedback、Deferred Findings、Validation Results、Final Decision を追跡可能に記録する。
