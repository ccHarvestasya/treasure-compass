# 出力形式

レビュー成果物は `../review-common/output-format.md` の共通構成・章名・順序・必須項目を使用する。該当しない項目は「なし」と記載する。

## スキル固有の値

- 正式な指摘 ID 接頭辞: `RR`
- 重大度: `Critical` / `Major` / `Minor`
- レビュー結果: `READY` / `REVISE REQUIREMENTS`
- 必須修正: `Critical` の New / Open / Reopened
- 任意改善: `Major` / `Minor` の New / Open / Reopened。Critical がなければ `READY` のまま引継ぎ可能
- 上流へのフィードバック: Concept の不足・曖昧さ・矛盾。Requirements の問題として偽装しない
- 保留した指摘: Specification / Design / Implementation / Test で決める事項、対象外、後続検証への引継ぎ。Concept の問題はここではなく上流へのフィードバックとする
- 確認観点: 要求の完全性、外部可視性、責任・範囲、数値要件、Acceptance Criteria、品質、安全性、未決定事項、工程境界

## 上流・下流の追跡

Requirements の直接上流は Concept とする。

```text
Concept / User Decision
        ↓
Requirement
        ↓
Acceptance Criteria
```

Specification、Design、Implementation への追跡は、Requirement が下流へ引き渡せるか、明白な矛盾がないかを補助的に確認するために使う。下流成果物を新しい Requirement の根拠へ昇格させない。

## Acceptance Criteria と Test Case

```text
Requirement
  → 何を満たす必要があるか

Acceptance Criteria
  → 満たしたと外部から判断できる状態

Test Case
  → 具体的な操作・入力・検証手順
```

Acceptance Criteria が具体的なテストスクリプトになっている場合は工程境界の問題として確認できる。一方、具体的なテストコード、fixture、検証方法が定義されていないことは Requirements Finding にしない。

## レビューの独立性

Review Skill はレビュー対象を直接修正しない。Required Change に最小限の修正条件を示すことはできるが、Concept、Requirements、Specification、Design、Implementation、Test、README、設定を変更せず、詳細な解決策を完成させない。
