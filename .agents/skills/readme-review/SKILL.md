---
name: readme-review
description: Treasure Compass の README を、manifest、公開 UI、実装、テスト、静的データ、license と照合し、正確性、利用可能性、制約、安全性、文書間の意味的整合性をレビューする。
---

# README Review

READMEが、利用者のセットアップと利用判断に必要な現在の事実を正しく説明しているかを確認する。READMEやコードを直接修正しない。

## 参照

1. AGENTS.md
2. ../review-common/review-playbook.md
3. ユーザー指定の README
4. 同じディレクトリの reviewers、review-gates、output-format が存在する場合
5. package.json、lockfile、主要な src、tests、public、LICENSE、実行結果

## 観点

- アプリの目的、現在の機能、対応範囲、対象外
- セットアップ、Node / pnpm 前提、script、build、preview
- package metadata、依存、ディレクトリ、静的 JSON・画像の説明
- UI、入力解析、地図、経路、進捗、マクロ、localStorage の説明
- 実装・テスト・README間の意味的整合性
- 未実装・将来・制約・エラー・ブラウザ差異の表示
- LICENSE、画像資産、データの帰属、外部リンク
- credential、個人情報、ローカルパス、未確認の保証や性能値の公開有無

READMEの文言から新しい仕様を作らない。内部実装の細部がREADMEにないことは、利用者契約へ影響しない限り欠陥にしない。

## 判定

判定は READY または REVISE README とする。利用手順、現在機能、制約、ライセンス、公開安全性について利用者を誤認させる根本的な誤りがある場合に REVISE README とする。改善提案は必須修正と分ける。

レビュー成果物は ../review-common/output-format.md に従い、manifest、実装、テスト、LICENSEへの追跡を示す。
