---
name: implement-review
description: Treasure Compass の React/TypeScript 実装、静的データ、テスト、差分を、仕様適合、状態・入力境界、UI安全性、保存互換性、回帰、検証品質の観点でレビューする。コードは修正しない。
---

# Implementation Review

承認済み仕様・設計・要件に対する実装の適合性と、利用者向け回帰リスクを確認する。レビュー中はコード、テスト、データ、READMEを変更しない。

## 参照

1. AGENTS.md
2. ../review-common/review-playbook.md
3. ユーザー指定の差分または対象
4. 対応する仕様、設計、要件、README、過去レビュー
5. src、tests、public/json、public/img、package 設定の必要な範囲
6. 実行可能な lint、test、build

## 観点

- 仕様、要件、設計、READMEとの追跡と外部挙動の一致
- React の props、イベント、表示条件、loading / empty / error
- Zustand の状態所有、更新、派生値、リセット、再計算、永続化
- チャット解析、マップ検索、座標変換、経路計算、マクロ出力の境界と決定性
- JSON・画像・設定・型・ファイル名の整合
- ユーザー入力、localStorage、静的データ、HTML 表示、外部通信の安全な扱い
- 空・不正・境界・未知・破損・ロード失敗・キャンセル・重複の失敗経路
- テストの独立性、境界、回帰、実行結果と未確認範囲
- 不要な依存、scope 外の API、未依頼の fallback、ログやエラーへのデータ漏えい

既存コードがそうなっていることだけで正しさを認定しない。仕様に根拠のない一般的改善は、必須指摘ではなく提案へ分ける。

## 判定

判定は READY または REVISE IMPLEMENTATION とする。Critical がある場合だけ後者とする。Critical は、仕様違反が利用者向け動作・保存互換性・データ解釈・安全な失敗を壊し、コードだけで安全に補えない場合に限る。Major / Minor は根拠、影響、最小修正、再確認条件とともに記録する。

レビュー成果物は ../review-common/output-format.md に従う。ファイルと行を可能な範囲で示し、実行していない検証を成功扱いしない。
