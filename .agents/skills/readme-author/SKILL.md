---
name: readme-author
description: Treasure Compass の README を、package manifest、公開 UI、実装、テスト、静的データ、license と照合して作成・更新する。READMEで未実装機能や新しい仕様を決めない。
---

# README Author

利用者が現在の Treasure Compass を正しく使える README を作成・更新する。READMEは現在の実体を説明する文書であり、未実装の構想や新しい契約を決める場所ではない。

## 参照

1. AGENTS.md
2. ../author-common/author-playbook.md
3. README.md とユーザーの更新依頼
4. package.json、pnpm-lock.yaml、主要な src、tests、public データ、LICENSE
5. 必要な場合だけ設定・実行手順

## 確認内容

- アプリの目的、対応するグレード、メンバー登録、入力、地図、経路、進捗、マクロ
- セットアップ、利用可能な script、ブラウザ実行、ビルド
- 実際の依存、ディレクトリ構成、静的データ、保存の説明
- 現在使える機能、制約、エラー時の利用者向け注意
- LICENSE、画像資産、データの帰属・利用条件
- READMEの説明が、実装・テスト・package metadataと意味的に一致するか

未実装、将来、検討中の機能は現在機能として書かない。実装や一般的なアプリの慣行だけを根拠に、新しい機能、対応環境、性能保証、プライバシー保証、APIを発明しない。

## 作成手順

1. 変更対象と既存 README の構成を確認する。
2. package manifest と実装から、現在の利用手順・機能・制約を抽出する。
3. 利用者が実行できるコマンドと実在するパスを確認する。
4. 誤認を生む表現、古い記述、未実装記述、ライセンス記述を修正する。
5. READMEだけを変更し、リンク、コード例、見出し、差分を確認する。

READMEの記述が実装の変更を要求する場合、READMEで先に仕様を決めず、仕様・実装の適切な作業へ戻る。
