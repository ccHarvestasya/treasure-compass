---
name: release-readiness-review
description: Treasure Compass のブラウザアプリ、静的データ、画像、package、build、テスト、README、license と公開手順を、リポジトリの実体に照合して公開前確認する。公開操作やソース変更は行わない。
---

# Release Readiness Review

ブラウザへ配布する Treasure Compass が、現在の実装、静的資産、利用手順、ライセンス、ビルド成果物、検証結果と一致し、安全に公開できるかを確認する。publish、tag、remote、registry、ソース、設定、配布物の変更は行わない。

## 参照

1. AGENTS.md
2. ../review-common/review-playbook.md
3. 同じディレクトリの reviewers、review-gates、output-format、agents/openai.yaml
4. README、package.json、pnpm-lock.yaml、LICENSE
5. src、tests、public、Vite / TypeScript / ESLint 設定、CI・デプロイ設定、変更差分

存在しない package、workflow、artifact、サービスを前提にしない。

## 対象の確定

- ユーザー指定の公開対象、環境、commit、配布形式を優先する。
- 指定がなければ、このリポジトリのブラウザアプリ、build 出力、静的 JSON・画像、README、license、検証コマンドを一つの公開対象として確認する。
- 複数の環境や配布方式が見つかった場合は、それぞれの asset、設定、責任を分けて記録する。
- 対象が不明で結果が変わる場合は TARGET CONFIRMATION REQUIRED とする。

## 確認範囲

1. package name、version、license、依存、script、lockfile、repository metadata
2. build が参照する src、静的 JSON、画像、favicon、生成物の含有
3. READMEのセットアップ、機能、制約、ブラウザ前提、licenseとの一致
4. JSON・画像の欠落、不要ファイル、未確認資産、ローカルパス、credential、個人情報
5. build、lint、unit test、必要なブラウザ smoke の結果と証拠
6. 環境変数、外部通信、localStorage、エラー表示、source map の公開方針
7. CI・デプロイ設定が存在する場合の trigger、権限、artifact、環境、rollback、再実行
8. obsolete、TODO、未実装、placeholder、誤った copyright、未確認の性能・安全保証

公開パッケージやサーバーが存在しない場合、それらの確認は対象外として記録する。存在しない release evidence を要求しない。

## 判定

判定は READY、READY WITH MINOR FIXES、NOT READY、TARGET CONFIRMATION REQUIRED とする。利用者が誤った配布物・セットアップ・license・セキュリティ保証を受け取る阻害事項は NOT READY、軽微な改善のみなら READY WITH MINOR FIXES とする。

このレビューは公開ゲートのため、コード差分がなくても対象の full validation を依頼・実行できる。ただし未実行のブラウザ、CI、外部環境、デプロイ、配布操作を成功扱いにしない。レビュー中に source、README、manifest、設定、test、fixture、生成物を変更しない。

成果物は ../review-common/output-format.md に従い、対象、asset、証拠、未確認範囲、finding、gate、残存リスクを追跡可能にする。
