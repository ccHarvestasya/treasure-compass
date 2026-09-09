---
name: design-review
description: Treasure Compass の基本設計を、上流要求との追跡、責務・依存方向、状態所有、入力境界、失敗境界、運用前提、実装可能性の観点でレビューする。
---

# Design Review

基本設計が要件を実装可能な責務・データフローへ落とし、後続の仕様・実装が安全に進められるかを判定する。設計やコードを直接修正しない。

## 参照

1. AGENTS.md
2. ../review-common/review-playbook.md
3. ユーザー指定の設計
4. 同じディレクトリの reviewers、review-gates、output-format、security-checklist が存在する場合
5. 対応する要件、コンセプト、既存設計判断、必要な実装・テスト・静的データ

## 観点

- 要件、利用者、対象外、責任への追跡
- React UI、ストア、純粋関数、ブラウザ API、静的資産の責務分離
- 状態の正本、派生値、更新、リセット、再計算、localStorage の所有
- JSON、チャット入力、ユーザー入力の trust boundary と validation の責任
- ロード失敗、キャンセル、破損、空入力、異常値、部分成功の扱い
- 依存方向、循環、データ変換、画像・JSON・設定の対応
- ブラウザ実行、ビルド、静的配布、ライセンス、運用前提
- 仕様へ引き渡す外部契約、未決定事項、検証可能性

具体的な React function、CSS、JSON field、保存キー、閾値、library、テストケースの不足は、設計上の責務と invariant が明確なら下流へ委譲する。チェックリストだけで新しい要求を発明しない。

## 判定

判定は READY または REVISE DESIGN とする。Critical がある場合だけ後者とする。Critical は、責務・状態所有・入力境界・失敗時の扱いを安全に確定できず、仕様や実装で一意に補えない欠陥に限る。Major / Minor は引継ぎまたは改善として分ける。

レビュー成果物は ../review-common/output-format.md に従い、対象箇所、上流根拠、影響、必要な修正、未確認範囲を記録する。
