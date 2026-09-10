---
name: design-author
description: 承認済み Specification を基に、外部契約を変えずに、アプリケーション、ライブラリ、サービス、CLI、プロトコル、ファイル形式、バッチ、組込みシステムなどの内部構造・責務・依存関係・状態所有・データフロー・失敗境界を基本設計へ整理する。実装コードや具体的なテストは作成しない。
---

# 基本設計作成（Design Author）

承認済み Specification を中心とする上流成果物を、実装者が共有できる内部構造、責務、依存関係、状態所有、データフロー、失敗境界へ落とし込む。

Design の中心は、**外部契約を変えずに「内部でどう実現するか」を決めること**である。Design は Implementation のコード詳細を先回りして決めず、承認済みの外部契約を勝手に拡張・変更しない。

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

Specification は Design の直接の上流である。Design 時点で外部から観測される入力、出力、error result、状態遷移、ordering、互換性、protocol behavior、timeout / retry semantics などが不足し、内部設計を安全に決められない場合、Design で勝手に補完せず、Implementation に押し流さない。`Specification の不足` または `Upstream ambiguity` として上流へ戻し、必要なら Requirements / Concept の不足として確認する。

同じ Specification に適合する二つの Design / Implementation が、同じ外部入力・状態に対して異なる観測可能な結果を返すなら、それは原則として内部 Design choice ではない。差を許容する正式な外部契約がない限り、Specification の不足または上流判断の不足として扱う。逆に、外部入力、出力、状態遷移、失敗結果、互換性、決定性が同じで内部方式だけが異なるなら、原則として Design / Implementation の責務である。

## 参照と根拠

ユーザーの最新の依頼・明示的判断を優先し、Design の直接の根拠には承認済み Specification を用いる。必要に応じて次を参照する。

1. `AGENTS.md` などのプロジェクト作業指示
2. `../author-common/author-playbook.md`
3. 承認済み Specification
4. 承認済み Requirements、Concept、ADR、正式な標準・規格、正式なアーキテクチャ判断
5. 既存の実装、テスト、設定、データなどの補助資料

既存実装・テスト・設定・データは、現在構造、実現可能性、移行影響、互換性、回帰影響を調べる補助資料に限る。実装されている、またはテストされているという理由だけで、新しい Design requirement、Specification、Requirements、Concept を逆生成しない。正式な外部契約や既存のアーキテクチャ制約と資料が矛盾する場合は、実装の都合で統合・確定せず、事実と未決定事項を分けて記録する。

特定の framework、database、library、deployment architecture などが承認済みの制約である場合は、その制約を継承してよい。ただし、制約の存在を超えて新しい外部契約や不要な内部構造を発明しない。

## Design で扱う内容

対象に必要な範囲で、次を設計する。すべての項目を毎回記載する必要はない。

- system / subsystem / component / module の責務境界と internal architecture
- dependency direction、internal interface、collaboration boundary、data ownership
- state ownership、internal state lifecycle、internal data flow、resource ownership
- trust boundary、validation responsibility、security responsibility allocation
- persistence strategy、cache strategy、concurrency / synchronization strategy
- transaction / atomicity boundary、failure containment、retry / recovery / restart strategy
- resource lifecycle、deployment / runtime boundary、operational responsibility
- observability responsibility、migration / compatibility architecture
- Implementation へ渡す design constraint、前提、検証可能な設計上の不変条件

必要な責務、境界、依存方向、失敗時の所有者、状態の正本を明確にする。テンプレートを埋めるためだけに component、subsystem、cache、queue、configuration、運用機能を追加しない。

## Specification・Design・Implementation の境界

同じ題材でも、外部契約、内部構造、コード詳細を分けて記述する。

| 外部契約（Specification） | 内部設計（Design） | コード・成果物（Implementation / Test） |
| --- | --- | --- |
| 外部 API の endpoint / request / response | どの component / service が担当するか | 実際の class / function / source file |
| 外部ファイルの field / encoding / validation result | 内部 model / parser / component の責務 | parser の具体的なコード |
| 外部から観測される state transition | state の所有、persistence / cache / synchronization strategy | store implementation、具体的な storage key |

外部 message / file / protocol の表現や error result を定めるのは Specification であり、それを処理する component の分割や内部データ変換は Design である。Design は外部結果を変える規則を新たに決めず、承認済み Specification の契約を満たす設計に留める。

## Design で決めてはいけない内容

### 上流へ戻すもの

次のような外部から観測される結果を変える判断が Specification に存在しない場合、Design で決めない。Implementation に押し流さず、`Specification の不足` または `Upstream ambiguity` として上流へ戻す。

- 外部入力の解釈、accepted representation、field semantics
- 外部出力、error result、拒否条件、外部から見える状態遷移
- ordering、conflict resolution、同率・同一時刻などの決定規則
- compatibility behavior、version semantics、protocol behavior
- externally visible timeout / retry / recovery semantics

Specification の意味を変えずに展開できる不足は Specification の不足として扱う。製品判断、範囲、責任、許容する外部結果の選択が不足する場合は Requirements / Concept へ戻す。

### Implementation / Test へ委譲するもの

Design の責務と constraint が十分に定まった後の具体化は、Implementation / Test へ委譲する。

- exact class name、function name / signature、private helper、variable
- source file / directory layout、exact configuration key、具体的な package version
- CSS、具体的な SQL / migration script、command、build step、CI implementation
- exact test case、test code、fixture implementation、具体的な検証手順

承認済み Specification、Requirements、正式な標準・規格、または既存の正式な設計制約が特定方式を要求する場合は、その制約を Design へ反映してよい。制約がない場合に、コード詳細を Design の契約として固定しない。

## 過剰設計（Over-design）を防ぐ

次の要素は、承認済み Specification / Requirements を満たすため、既存の正式な architecture constraint を守るため、または明確な設計上の問題を解決するために必要な場合だけ採用する。

- 将来拡張用 abstraction、plugin architecture、unnecessary interface、generic repository layer
- event bus、queue、cache、fallback、compatibility layer
- distributed architecture、microservice、追加 configuration option
- security mechanism、observability infrastructure、scalability mechanism

一般論、ベストプラクティス、好み、将来便利そう、再利用性、拡張性、スケール性だけを理由に追加しない。採用しないことが外部契約を破る場合は、その根拠と外部影響を示し、内部方式ではなく必要な制約を設計する。

## Design Decision

重要な設計判断を記録する場合は、必要に応じて次を含める。

- decision
- upstream constraint / problem
- alternatives considered
- rationale
- consequences / trade-offs
- assumptions
- revisit condition

軽微な判断すべてを ADR 化しない。判断の根拠が承認済み Specification、正式な制約、または明確な設計上の問題へ追跡できない場合は、推測で確定せず `Design decision pending` として扱う。

## Traceability

追跡の基本方向は次である。

```text
Specification
      ↓
Design responsibility / decision
      ↓
Implementation constraint / handoff
```

必要に応じて Requirements / Concept まで上流へ追跡する。Design 文書内の component や章を Requirement ID と1対1対応させること、形式的な Traceability 表を埋めること自体を目的にしない。下流の実装やテストから上流契約や Design の必要性を逆生成しない。

## 未決定事項の分類

未決定事項を一括して下流へ投げない。

| 分類 | 扱い |
| --- | --- |
| **Upstream ambiguity** | Specification / Requirements / Concept の判断不足。Design で決めず、必要なら上流へ差し戻す |
| **Specification の不足** | Requirements が求める外部契約が Specification に不足している。Design で補完せず、Specification の修正を依頼する |
| **Design decision pending** | 外部契約を変えず Design の裁量で選択できるが、Design 完了に必要な判断。Design 工程で解決する |
| **Implementation detail** | Design の責務・constraint が十分で、具体的な実装方法だけが未決定。Implementation / Test へ委譲する |
| **Out of Scope** | 現在の対象外。未決定事項や Implementation handoff として蓄積しない |

## 質問規律

不明点を見つけるたびに質問しない。まず `Upstream ambiguity`、`Specification の不足`、`Design decision pending`、`Implementation detail`、`Out of Scope` に分類する。

Design を成立させるために外部契約や上流判断が本当に必要な場合だけ確認する。Implementation で決められる内容を Design Author が質問して確定しない。

## 既存システムの扱い

既存実装と新しい Design が異なる場合は、次を区別して記録する。

- 現状の構造と挙動
- approved upstream contract
- proposed design
- migration / compatibility impact

「既存コードがそうなっているから」というだけで新 Design として固定しない。正式な互換性 Requirement / Specification がある場合は、それを破らない設計とし、移行が必要なら外部影響、段階、責任を設計する。

## 作成手順

1. 依頼、対象、変更範囲、承認済み Specification、Requirements、Concept、正式な制約を確認する。
2. Specification の外部契約と、Design が満たすべき非機能・責任・境界を抽出する。
3. system context、trust boundary、component / data / state ownership、dependency direction を整理する。
4. 主要な内部フロー、失敗 containment、transaction / atomicity、retry / recovery、runtime / operation boundary を必要な範囲で設計する。
5. 各 Design Decision を根拠、代替案、影響、前提、見直し条件へ追跡する。
6. 未決定事項を上流、Design、Implementation / Test、対象外へ分類する。
7. 外部契約を勝手に変更せず、不要な内部構造やコード詳細を除き、自己確認と対象範囲の検証を行う。

## 標準構成

固定テンプレートを全章埋めしない。既存の正式テンプレートがある場合は意味的に対応させ、対象に必要な章だけを使う。候補は次のとおりである。

1. Design の目的・適用範囲・対象外
2. 上流契約・前提・制約・用語
3. System context / trust boundary
4. Architecture / component responsibilities
5. Dependency / collaboration boundaries
6. State / data ownership and lifecycle
7. Major internal flows
8. Failure / recovery / concurrency / atomicity boundaries
9. Persistence / external resource / runtime / operational design
10. Security / observability responsibilities
11. Design decisions / trade-offs
12. Upstream ambiguities / Specification gaps
13. Implementation / Test handoff
14. Traceability / references

章数や component 数を増やすことを目的にしない。標準構成にない内容を必要に応じて追加する場合も、上流根拠または明確な設計上の理由を示す。

## 自己確認

- 承認済み Specification の外部契約を変更していない。
- Specification にない外部挙動を Design で発明していない。
- Requirements / Concept を下流の実装・テストから逆生成していない。
- component / state / data / dependency の責務が必要な範囲で明確である。
- trust / failure / lifecycle boundary が必要な箇所で明確である。
- Design decision に承認済み契約、正式な制約、または明確な設計上の問題への根拠がある。
- 一般論や将来拡張だけを理由に過剰設計していない。
- Implementation detail を固定しすぎていない。
- Implementation に必要な constraint は十分である。
- Upstream ambiguity や Specification の不足を Implementation に押し流していない。
- Out of Scope を unresolved item や Implementation handoff と混同していない。
- Specification から Design、Design から Implementation への追跡が可能である。
- 対象固有の技術を汎用 Skill の必須事項として固定していない。
