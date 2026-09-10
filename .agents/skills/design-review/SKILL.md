---
name: design-review
description: 承認済み Specification に対する Design を、責務、依存方向、状態・データ所有、境界、失敗・復旧、運用、実装可能性の観点からレビューする汎用 Skill。外部契約を変更せず、実装コードも修正しない。
---

# 基本設計レビュー（Design Review）

承認済み Specification を満たすために必要な内部責務、依存、状態、データ、失敗、運用の境界が Design に定義され、Implementation が上流契約を推測せず進められる状態かを判定する。

Design Review の中心は、**承認済み Specification を変更せず、それを実現可能な内部設計へ落とせているか**である。Implementation の具体的なコードまで一意に決められているかは求めない。複数の合理的な Implementation を許容する設計でよい。

## 工程境界

```text
Concept
  → なぜ作るか、誰に提供するか、何を作るか、どこまで扱うか

Requirements
  → 外部から見て何を満たす必要があるか、制約、受入条件

Specification
  → 正確な外部契約・外部から観測できる振る舞い

Design
  → その契約を内部でどう実現するか、責務・構造・依存・境界

Implementation / Test
  → 実際のコード、設定、成果物、具体的な検証
```

Design の直接の上流は Specification である。Specification にない外部入力の解釈、出力、error result、状態遷移、ordering、conflict resolution、compatibility behavior、protocol behavior、外部から見える timeout / retry semantics を Design で発明しない。これらが不足する場合は `Specification gap` または `Upstream ambiguity` として上流へ戻し、Implementation に押し流さない。

Design Review は Specification の完全性や Implementation のコード品質を再レビューする工程ではない。前者は必要に応じて上流の `Specification gap` として扱い、後者は Implementation / Test の工程へ委譲する。

同じ Specification に適合し、Design が定める責務・依存・境界を満たす二つの Implementation が、内部コード構造だけを変えて同じ外部結果を実現できるなら問題ではない。逆に、Implementation の選択によって Design の責務、ownership、consistency、trust boundary、atomicity、recovery responsibility、security responsibility が変わり、担当者が推測しなければならないなら Design 不足候補である。

## 参照と根拠

`AGENTS.md` などの作業指示と `../review-common/review-playbook.md` の共通規律に従う。判定の根拠は、ユーザーの最新の明示的判断を優先し、次の順で確認する。

1. 承認済み Specification
2. 対応する承認済み Requirements / Concept
3. 承認済み ADR、標準、規格、正式な architecture constraint
4. 対象 Design
5. 必要な実装、テスト、設定、データなどの補助資料

既存コード、設定、テスト、データは、実現可能性、現行構造、migration impact、compatibility、回帰、Design と実体の明白な矛盾を確認する補助資料に限る。実装されているという理由だけで Design requirement、Specification、Requirements、Concept を逆生成しない。

正式な上流契約と既存実体が異なる場合は、現状、承認済み契約、対象 Design、移行・互換性影響を分けて記録する。実装の都合だけで未決定事項を確定しない。

## Review Scope と適用性

レビュー開始時に、対象 Design の版、確認日、対象範囲、除外範囲、未確認の根拠を確定する。複数の候補がある場合は推測で選ばない。

system、data、security、concurrency、persistence、deployment、observability などの観点は対象に存在する場合だけ適用する。対象にない concern が記載されていないことだけを理由に finding を作らない。

## レビュー観点

### Specification への追跡と工程境界

- 各重要な Design responsibility / decision が Specification、Requirements、Concept から継承される制約、または正式な参照資料へ追跡できるか。
- Design が Specification の外部契約を変更、弱化、拡張していないか。
- Design 上の都合だけで新しい外部挙動、機能、制約、security requirement を追加していないか。
- Specification の不足を Design で補完せず、Implementation に押し流していないか。
- Implementation の具体的な不足と、Design の責務・制約不足を区別しているか。

形式的な Traceability 表を埋めること自体は要求しない。根拠と Design decision の関係を説明できればよい。

### Architecture と責務

- system / subsystem / component / module の責務が必要な範囲で明確か。
- 責務の重複、責任不明、責務の逆流がないか。
- dependency direction と collaboration boundary が明確か。
- 不要な循環依存や、外部 concern と内部 responsibility の混同がないか。

### State と data ownership

- state / data の source of truth、ownership、更新責任、lifecycle が必要な箇所で明確か。
- 派生状態と正本、入力と保存データ、作成者と利用者が混同されていないか。
- persistence、cache、synchronization、replacement の責任が必要な範囲で定義されているか。
- 特定の storage technology を採用していないことだけを不足扱いしない。

### Boundary

対象に必要な範囲で、次の境界と責任を確認する。

- trust boundary、input boundary、validation responsibility
- process / runtime boundary、external resource boundary
- privilege / security boundary、データ公開・保持・破棄の責任

Specification で外部 validation result、拒否条件、error result が定まっている場合、Design がその結果を変更していないか確認する。結果そのものが Specification にない場合、具体的な結果を Design の Required Change として発明しない。

### Major flow

重要な内部フローについて、必要な範囲で次を確認する。

- responsibility transition、data flow、state transition の内部責任
- resource acquisition / release、persistence、synchronization
- interaction boundary、外部依存との責任分界

Implementation に必要な責務と制約を確認するが、具体的な function call sequence や source-level call graph は要求しない。

### Failure、recovery、concurrency

対象に該当する場合、次を確認する。

- failure containment、partial failure、retry responsibility、recovery、restart
- rollback / atomicity、timeout responsibility、resource cleanup
- concurrency の ownership、synchronization boundary、race prevention responsibility、consistency model

外部から観測される失敗結果、timeout、retry の意味そのものは Specification の責務である。Design Review は新しい error behavior を発明せず、既存契約を実現する内部責任の欠落や矛盾だけを指摘する。

### Persistence、lifecycle、migration、運用

対象に必要な場合、persistence responsibility、data lifecycle、migration architecture、compatibility architecture、cache invalidation responsibility、resource lifecycle を確認する。具体的な database schema、migration SQL、storage key、保存ライブラリなどは、Design の責務と制約が十分なら Implementation / Test に委譲できる。

### Security と observability

Security Requirement / Specification または正式な運用制約がある場合に、trust boundary、sensitive data ownership、privilege separation、validation responsibility、authentication / authorization responsibility、integrity responsibility、failure isolation が Design に割り当てられているか確認する。一般論だけを理由に security mechanism を追加しない。

Requirements / Specification や正式な運用制約が求める場合に、observability responsibility、logging / metric / event responsibility、runtime responsibility、deployment boundary、recovery responsibility を確認する。具体的な library、dashboard、metric name、配置方式を好みで要求しない。

## Specification gap と Design defect

外部から観測される結果を決めないと Design を評価できない場合、その問題を直ちに Design defect としない。次のような未定義は、まず `Specification gap` を確認する。

- input interpretation、output contract、external state transition、error result
- ordering、conflict resolution、protocol behavior、compatibility behavior
- externally visible retry / timeout / recovery semantics

Specification の不足を検出した場合、Design Review は具体的な外部契約を Required Change として作らない。`Specification でこの外部結果を一意化する必要がある` という upstream finding とし、根本が Requirements / Concept の判断不足なら `Upstream ambiguity` として扱う。

一方、Specification が十分なのに、component responsibility、state owner、dependency direction、trust boundary 上の validation responsibility、failure containment、persistence responsibility、concurrent ownership などを安全に決定できない場合は Design finding とする。

## Implementation detail と Design defect

次の不足だけを理由に Design finding を作らない。

- exact class / function / private method / variable
- source file / directory structure
- exact configuration key、package version、build command、CI job
- concrete SQL、migration script、exact test case、fixture、CSS

Design の責務、constraint、boundary が十分なら Implementation / Test へ委譲する。ただし、実装者が上流契約や重大な architecture decision を推測しなければ実装できない状態なら、Design 不足として評価する。

## Two-implementation test

対象 Design に適合する合理的な Implementation を二つ想定する。両者が同じ Specification の外部結果を満たし、Design の責務、依存、ownership、trust boundary、failure / recovery、security responsibility を守ったうえで、内部コード構造だけが異なるなら問題ない。

一方、実装の選択によって責務、state source of truth、consistency、atomicity、recovery responsibility、security responsibility などの重要事項まで変わり、Implementation 担当者が推測する必要があるなら Design 不足候補とする。この test はすべてを一意に固定するために使わず、合理的な Implementation の自由度を残す。

## 過剰設計の検出

次の要素は、承認済み Specification / Requirements、正式な architecture constraint、または現在スコープの明確な設計問題への根拠がない限り、不要な Design として確認する。

- generic abstraction、plugin architecture、repository layer
- event bus、queue、cache、fallback、compatibility layer
- distributed architecture、microservice、追加 configuration
- unnecessary persistence、security mechanism、observability infrastructure、future extension point

「その技術が嫌い」「別方式が一般的」という理由では指摘しない。対象になるのは、上流契約の達成に不要で、正式制約にもなく、complexity / coupling / operational burden を実質的に増やす場合である。Required Change は代替 architecture を細かく設計せず、不要な構造を除去するか必要性を根拠へ追跡可能にする条件に留める。

## 未決定事項の分類

| 分類 | 扱い |
| --- | --- |
| **Upstream ambiguity** | Concept / Requirements の判断不足。Design で確定せず、必要なら上流へ差し戻す |
| **Specification gap** | Requirements が求める外部契約が Specification に不足している。Design で補完せず、Specification の修正を依頼する |
| **Design decision pending** | 外部契約を変えず Design の裁量で決められるが、Design 完了に必要な判断。Design で解決する |
| **Implementation detail** | Design の責務・constraint は十分で、具体的な実装方法だけが未決定。Implementation / Test へ委譲する |
| **Out of Scope** | 現在のレビュー対象外。Finding や Deferred の一覧へ変換しない |

`Upstream ambiguity` と `Specification gap` は上流問題であり、Design の Required Change として新しい外部契約を作らない。`Implementation detail` は、Design の不足を隠すための引継ぎにしない。

## Out of Scope と Deferred

`Out of Scope` は、現在のレビュー対象外であることを示す境界であり、未決定事項や Implementation handoff ではない。単に将来対応だからという理由で Deferred finding にしない。

Deferred / 保留として記録するのは、review-common に従い、Implementation / Test で評価すべき事項、後続検証が必要な事項、現在の根拠では評価できず後続確認が必要な事項に限る。対象外は必要なら Review Scope / Unreviewed Scope に簡潔に記録する。

## レビュアーの役割と Finding

レビュアーは Design Author ではない。Design を直接書き換えず、好みの architecture、完成した Design、具体的なコード、新しい Requirement / Specification、future feature、checklist を埋めるための finding を作らない。

正式な finding は、対象 Design または承認済み Specification / Requirements / Concept / formal reference へ追跡でき、Design 工程で解決すべき具体的な問題である場合だけ採用する。少なくとも location、upstream basis、observed problem、impact、classification、required change、severity、status を記録し、同じ根本原因の候補は統合する。

既存の `review-common`、`review-gates.md`、`output-format.md` の ID、status、severity、gate、出力構成を優先する。Required Change は問題を解消する最小条件に留め、代替の内部設計や実装を完成させない。

## Severity と Gate

既存の重大度・Gate 定義を優先し、文章の好みだけで severity を上げない。正しさ、上流契約の適合、責務・境界、security / integrity / consistency、Implementation の推測負担、downstream blocking への影響で判断する。

`review-gates.md` の Gate を適用し、`Critical` の New / Open / Reopened がある場合だけ `REVISE DESIGN`、なければ `READY` とする。Major / Minor は必要な条件や引継ぎとして記録できるが、単独で Gate 不合格にしない。上流資料や checklist がないことだけでも不合格にしない。

## レビュー手順

1. 対象 Design の版、範囲、未確認範囲、適用可能な観点を確定する。
2. 承認済み Specification から Design が満たすべき外部契約、責任、制約、境界を抽出する。
3. Design responsibility、dependency、state / data ownership、主要フロー、failure / operation boundary を追跡する。
4. Specification gap、Design defect、Implementation detail、Out of Scope を分類し、Two-implementation test で反証する。
5. 過剰設計、根拠のない追加、下流からの逆生成がないか確認する。
6. 既存スキーマ、severity、status、Gate を適用し、根拠、影響、Required Change、再確認条件を記録する。

## セキュリティチェック

`security-checklist.md` は探索補助として、対象に適用される項目だけを使う。checklist の存在だけで Requirement、threat、Design Decision、finding を追加しない。具体的な security product、library、保存方式、認証方式を根拠なく要求せず、上流契約に必要な責務・境界・失敗分離を確認する。

## 自己確認

- 対象が特定プロジェクト固有の Skill になっていない。
- `Specification → Design → Implementation / Test` の方向が一貫している。
- Design より後に Specification を置く表現が残っていない。
- Specification gap と Design defect を区別している。
- Design defect と Implementation detail を区別している。
- Specification にない外部契約を Required Change で発明していない。
- Requirements / Concept を下流から逆生成していない。
- responsibility / dependency / ownership / boundary を必要な範囲で確認している。
- failure / lifecycle / trust boundary を適用可能な場合に確認している。
- 一般論や将来拡張だけを理由に過剰設計を要求していない。
- 好みの architecture を Required Change として押し付けていない。
- Out of Scope を Deferred finding にしていない。
- Implementation の具体的コードを Design finding として要求していない。
- severity / gate が review-common と整合している。
- finding が上流根拠または対象 Design へ追跡可能である。
- checklist の存在だけを理由に finding を作っていない。
