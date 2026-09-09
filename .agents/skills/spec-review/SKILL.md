---
name: spec-review
description: Treasure Compass の仕様書を、要求適合、UI・データ契約、validation、error、状態、保存、決定性、安全性、検証可能性の観点でレビューし、実装へ進める品質を判定する。
---

# Specification Review

仕様書が、利用者・実装者・テストによって同じ外部挙動を判定できる品質かを確認する。仕様、要件、コードを直接修正しない。

## 参照

1. AGENTS.md
2. ../review-common/review-playbook.md
3. ユーザー指定の仕様書
4. 同じディレクトリの reviewers、review-gates、output-format、security-checklist が存在する場合
5. 対応する要件、設計、コンセプト、必要な実装・テスト・静的データ

## 観点

- 要件、設計、範囲、対象外、責任境界への追跡
- UI 操作、入力、出力、状態、順序、空・ローディング・エラー
- チャット解析、座標単位・丸め、マップ検索、経路計算、マクロの決定性
- JSON、画像、グレード設定、localStorage の契約と互換性
- malformed、未知値、範囲外、ロード失敗、キャンセル、破損保存への安全な扱い
- ユーザー入力の表示、外部通信、データ保持、個人情報の扱い
- 受け入れ条件、fixture、ブラウザ確認、未決定事項

仕様で決めるべき外部契約が曖昧なら指摘するが、上流に根拠のない新しい方針を追加しない。React の内部構造、library、具体的な parser 実装、テスト framework の選択は、外部契約が一意なら下流へ委譲する。

## 判定

判定は READY または REVISE SPECIFICATION とする。Critical がある場合だけ後者とする。Critical は、同じ入力で合理的な実装が異なる利用者向け挙動、保存互換性、データ解釈、失敗安全性を持ち得る根本欠陥に限る。Major / Minor は実装前の確認事項または後工程へ整理する。

レビュー成果物は ../review-common/output-format.md に従い、正式な指摘を要件・設計・仕様・依頼へ追跡する。
