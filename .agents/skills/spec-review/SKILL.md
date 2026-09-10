---
name: spec-review
description: Review an external Specification against approved Requirements for traceability, observable behavior, testability, and phase-boundary compliance. Detect both missing external contracts and unnecessary Design / Implementation decisions without prescribing an internal design.
---

# Specification Review

Specification が、承認済み Requirements を変えずに、システムの正しさを外部から観測・検証できる契約へ具体化しているかを判定する。レビュー対象の Specification、Requirements、Concept、Design、Implementation を直接修正しない。

Reviewer の役割は、製品を改善・拡張したり、好みの設計を押し付けたりすることではない。**必要な外部契約が欠けていないか、不要な内部決定が混入していないかを、根拠に基づいて敵対的に確認すること**である。

## 工程境界

```text
Concept
  → 何を作るか、誰の何を解決するか、価値、スコープ、責任境界、判断原則、成功状態

Requirements
  → システムが外部から見て何を満たさなければならないか、制約、受入条件

Specification
  → Requirements を満たしたか判定するための正確な外部契約・振る舞い

Design
  → component / module 分割、internal architecture、internal state / API、algorithm、persistence / cache / concurrency strategy、library / framework、deployment、source layout

Implementation / Test
  → code、configuration、migration、concrete dependency updates、build / CI、成果物、具体的なテスト実装・検証手順
```

中心となる判定は次である。

> 実装内部を知らない第三者が、Specification だけで外部挙動の正しさを判定できるか？

「内部でどう実現するか」への回答は Design の責務であり、正しさの判定に不要な内部決定は Specification の finding 候補である。

## 参照

1. `AGENTS.md` などのプロジェクト作業指示（存在する場合）
2. `../review-common/review-playbook.md`
3. ユーザーが指定した Specification と、対応する approved Requirements / Concept
4. 同一工程の正式資料、過去レビュー、必要な下流資料
5. 同ディレクトリのレビュー補助資料

## 対象と根拠

最初に、対象 Specification の版、レビュー範囲、確認日、未確認範囲を確定する。候補が複数ある場合は推測で選ばない。

ユーザーの最新の依頼・明示的判断を全体の優先根拠とし、契約の検証には原則として次を使う。

1. approved Requirements
2. approved Concept
3. approved ADR、標準、規格、その他の formal reference
4. 互換性 Requirement がある場合の既存の正式な外部契約
5. 対象 Specification（検査対象であり、根拠のない主張の根拠にはしない）
6. 補足資料

コード、実装、テスト、prototype、README、既存データは、現在の挙動、既存互換性、回帰、実現可能性、明白な矛盾を確認する補足資料に限る。それらに存在する機能だけを新しい Requirement や Specification contract とみなさない。

同ディレクトリの `output-format.md`、`review-gates.md`、`reviewers.md`、`security-checklist.md` があれば、既存の ID、status、severity、gate、レビュー出力形式を維持して参照する。対象固有の checklist は適用可能な場合だけ使い、存在する項目を埋めるために要求や finding を作らない。

## レビュー観点

### Requirements traceability

- 各重要な Specification contract が Requirement、Concept から継承した制約、または許可された formal reference へ追跡できるか。
- Requirement の意味、スコープ、責任、強さを変更していないか。欠落、弱すぎる契約、根拠のない追加、過剰な制約を区別する。
- 既存挙動や実装上の便利さだけで新しい要求を作っていないか。

### Observable / testable contract

対象に必要な範囲で、第三者が実装を知らずに次を判定できるか確認する。

- 入力、出力、外部 interface、data / file / message format
- state、state transition、lifecycle、外部から見える invariant
- validation、invalid / unknown / empty / duplicate / boundary input の結果
- error condition、拒否条件、失敗時の state と利用者・外部主体への結果
- compatibility、interoperability、version、determinism、順序や結果規則
- Requirements が求める security / trust boundary 上の公開範囲、権限結果、改変・破損時の扱い、fail-closed 等
- MUST / SHOULD / MAY または同等の規範性が、文書内で一意に解釈できるか

「適切に」「正しく」「安全に」「必要に応じて」「互換性を維持する」のような解釈依存の表現だけで、合否が定まらない箇所を残さない。ただし、上流で未決定の製品判断を Reviewer が補完してはならない。

### Over-specification と Under-specification

次の内部決定が、外部契約または approved source に不要な形で混入していないか確認する。

- class / module / package / source layout、private / internal API、internal function signature
- database schema、collection / table layout、内部保存方式、cache / queue implementation
- algorithm、optimization、threading / concurrency model
- framework、library、dependency、deployment topology
- logging / monitoring の実装方式、将来拡張用 abstraction、extra configuration / API / state / fallback / compatibility layer

不要な内部決定は「具体的だから良い」と扱わず、外部契約を満たす別設計の余地を不当に狭める finding とする。Required Change は内部方式を別の方式へ置き換えることではなく、必要な外部結果を残して内部決定を除去または Design へ移すことに留める。

一方、必要な入力、出力、状態、validation、error、boundary、compatibility、security-visible behavior を「Design で決める」とだけしていないか確認する。Requirements が十分なら未定義の外部挙動は Specification の finding になり得る。

外部の file format、protocol、API、data schema は、Requirement または formal reference が要求する場合 Specification の契約である。内部 database schema などと混同しない。

## 曖昧さと工程分類

候補を正式 finding にする前に、次のいずれかへ分類する。

| 分類 | Reviewer の扱い |
| --- | --- |
| **Specification-level clarification** — Requirements の意味を変えずに一意な契約へ展開できる | Specification の未解決として finding にできる。最小修正は観測可能な契約を明確にすること |
| **Upstream ambiguity** — 選択が利用者体験、機能要求、責任、範囲、製品判断を変える | `upstream feedback` / `clarification needed` とし、Reviewer が決めない。Specification の不足と二重計上しない |
| **Design choice** — 外部契約は同じで、内部実現だけが異なる | Design へ defer し、設計の好みを finding にしない |
| **Out of scope** — 現在の対象外、または将来の可能性だけの事項 | 原則として finding や deferred finding にしない |

## Unauthorized requirement creation を防ぐ

Reviewer 自身が、次の理由で機能、制約、利用者、責任、security requirement、将来拡張を追加しない。

- 「より良いシステムになる」「あると便利」「一般的な best practice」である
- checklist に項目がある、実装に存在する、別製品で採用されている
- 可用性、拡張性、再利用性、性能、hardening、運用 / security feature を追加できる

正式 Requirement / Concept / formal reference に追跡できるか、または Requirements が既に十分で、外部から正しさを判定するために不可欠な明確化かを確認する。そうでなければ finding ではなく、必要に応じて upstream feedback、保留、対象外へ分類する。

## Finding discipline

正式 finding は、次のすべてを満たすものだけにする。

1. 対象 Specification または許可された根拠へ追跡できる。
2. 現在の Specification フェーズで解決すべき問題である。
3. 欠落、矛盾、曖昧さ、不要な内部決定、適合性違反を具体的に説明できる。
4. 放置した場合の外部挙動、互換性、security contract、検証可能性への影響を説明できる。
5. 解消したと判断できる最小の修正条件を示せる。

既存の `output-format.md` と finding 管理規則を優先する。既存 schema が許す範囲で、各 finding には少なくとも ID、Severity、Status、Location、Evidence / Fact、Problem、根拠、Why it matters、Required Change、再確認条件を含める。形式のない場合でも、単なる感想ではなくこの情報を揃える。同じ根本原因の症状は統合し、下流の設計・実装案を完成させない。

## Severity と Review gate

既存の severity 定義、ID / status 規則、gate 規則がある場合はそれを優先する。未定義の場合に限り、重大度は文章の好みではなく、correctness、scope、traceability、ambiguity、interoperability、security contract、implementability / verifiability への影響で決める。

- **Critical**: 同じ入力・状況でも合理的な実装が異なる外部挙動、データ解釈、互換性、失敗安全性を持ち得る、または主要 Requirement の適合を実装・検証できない根本欠陥。Gate 不合格に結び付くものに限る。
- **Major**: 重要な契約、追跡、境界、不要な内部拘束に関する問題だが、既存 Gate を落とす Critical には当たらないもの。
- **Minor**: 外部判定のリスクが限定的な不整合や改善。表現の好みだけでは finding にしない。

既存の `review-gates.md` の gate と判定を維持し、`Critical` の New / Open / Reopened が1件以上なら `REVISE SPECIFICATION`、なければ `READY` とする。Major / Minor は、必要な条件や下流引継ぎとして記録できるが、単独で gate failure にしない。上流資料がないことだけ、checklist の未該当だけでは gate failure にしない。

## レビュー手順

1. 対象、版、範囲、根拠、未確認範囲を確定し、適用可能な観点だけを選ぶ。
2. Requirements から Specification への追跡を確認し、欠落・意味変更・未承認追加を抽出する。
3. 外部契約の adversarial pass を行い、入力、結果、state、error、boundary、互換性、決定性、安全性の解釈が一意か確認する。
4. 内部決定の混入を探し、Design preference と不要な over-specification を分離する。
5. 各候補を Specification / upstream / Design / Out of scope に分類し、反証してから finding にする。
6. 既存 schema、重大度、gate、過去 finding の status を適用し、必要な根拠と再確認条件を記録する。

レビュー対象や上流・下流成果物は変更しない。未確認の検証、外部環境、互換性を成功扱いせず、レビュー成果物へは秘密情報、個人情報、入力の生データを記録しない。

## 自己確認

- Author が Requirements にない要求を作れない基準になっているか。
- Author が内部構造・技術選択・実装方式を書き始める余地を抑えられているか。
- Reviewer が Design の好みを finding にせず、必要な外部契約を Design に誤送しないか。
- Requirements → Specification → Design の責任境界、source hierarchy、unresolved の扱いが Author と一致しているか。
- 仕様適合を外部から観測・検証でき、対象に不要な章や機能を強制していないか。
- プロジェクト固有の技術・ドメイン・保存方式を一般ルールとして埋め込んでいないか。
