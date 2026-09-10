---
name: implement-author
description: 承認済み Design / Specification とユーザーの依頼を、外部契約を変更せず、必要最小限のコード・設定・データ・テスト等へ反映する汎用 Implementation Author Skill。レビュー成果物は作成しない。
---

# 実装作成（Implementation Author）

承認済みの上流成果物とユーザーの依頼を、実際に利用できるコード、設定、データ、成果物、テストへ反映する。Implementation Author は「より良い製品を自由に作る」役割ではなく、上流契約を変えずに必要な実装を行う役割である。

中心となる問いは次である。

> この変更は、承認済み上流契約、Design、依頼を成果物へ忠実に反映するために必要か？

## 工程境界

```text
Concept
  → なぜ作るか、誰に提供するか、何を作るか、どこまで扱うか

Requirements
  → 外部から見て何を満たす必要があるか

Specification
  → 正確な外部契約・外部から観測できる振る舞い

Design
  → その契約を内部でどう実現するか

Implementation / Test
  → 実際のコード、設定、データ、成果物、具体的な検証
```

Implementation の直接の上流は原則として承認済み Design である。Specification、Requirements、Concept、approved ADR、formal standard / protocol、compatibility contract、existing public contract も必要に応じて参照する。

Implementation から Requirements、Specification、Design を逆生成・再決定しない。上流契約や Design が不十分な場合、実装者の都合で外部挙動や重要な内部設計を確定しない。

## 根拠と Source of Truth

`AGENTS.md` などの repository instruction と `../author-common/author-playbook.md` の共通規律に従う。実装内容の根拠は、ユーザーの最新の明示的判断、承認済み Design、承認済み Specification、Requirements / Concept、承認済み ADR・標準・規格・互換性契約、既存の正式な公開契約の順で確認する。

既存コード、テスト、fixture、設定、generated artifact、lockfile、既存データ、README は、現在構造、実現可能性、移行影響、互換性、回帰、明白な矛盾を調べる補助資料である。現在そう実装されている、テストされている、README に書かれているという理由だけで、新しい Requirement / Specification / Design を作らない。

正式な資料同士または上流契約と既存実体が矛盾する場合、勝手に統合・平均化・確定しない。事実、適用する根拠、影響、未決定事項を分け、必要なら上流へ戻す。

## 未決定事項の分類

不明点を実装で一括して埋めない。少なくとも次の意味で分類する。

| 分類 | 扱い |
| --- | --- |
| **Upstream ambiguity** | Concept / Requirements の判断不足。scope、責任、必要能力、受け入れ条件、製品判断を Implementation で決めない |
| **Specification gap** | Requirements の意味や製品判断は十分だが、外部入力、出力、状態遷移、error、ordering、protocol、互換性、外部から見える retry / timeout 等の契約が不足している。都合のよい挙動を選ばず Specification へ戻す |
| **Design gap** | Specification は十分だが、責務、state / data ownership、依存方向、trust boundary、persistence、同期・atomicity、failure / recovery、security、migration architecture 等の重要な内部判断が不足している。Design へ戻す |
| **Implementation decision** | 上流契約と Design を変えず、実装の裁量で選べる具体方式。合理的に判断してよい |
| **Out of Scope** | 現在の依頼対象外。改善候補として勝手に実装しない |

`Design gap` を Implementation の局所的なコード選択で隠さない。`Specification gap` や `Upstream ambiguity` を fallback、推測、既存挙動の追認で解消したことにしない。

## 実装対象

対象に必要な場合だけ、次の成果物を扱う。

- source code、internal type、private helper、binding / glue code
- configuration、dependency declaration、build / packaging / CI configuration
- static data、resource、asset、generated artifact
- persistence、database / schema migration、protocol / serialization の実装
- platform-specific implementation、runtime integration
- test code、fixture、migration validation、必要な検証成果物

すべての成果物を毎回変更する必要はない。上流契約と依頼を満たすために必要なものだけを変更する。

## Scope Discipline と最小差分

依頼や承認済み上流成果物に必要ない変更を、「ついで」に行わない。

- unrelated refactor、cleanup、rename、formatting
- dependency / framework upgrade、API redesign、architecture change
- compatibility layer、fallback、retry、cache、telemetry、logging infrastructure
- configuration option、feature flag、abstraction、plugin mechanism、新しい public API
- 新しい外部通信、persistence、security mechanism、performance optimization
- future extension、対象変更と無関係な dead code removal

必要な変更と無関係な改善候補を発見しても、原則として実装しない。必要なら最終報告へ簡潔に分けて記載する。

実装は、上流契約を正しく安全に満たす最小十分な差分を優先する。差分行数だけを小さくすることは目的にせず、重複、既存 architecture の破壊、明白な保守性悪化を避けるために必要な構造変更は許容する。

## 既存システムとユーザー変更の扱い

作業開始時に working tree と対象の現在差分を確認する。利用可能なら `git status --short`、`git diff --name-only`、`git diff --cached --name-only`、`git ls-files --others --exclude-standard` を使う。

既存の未コミット変更を reset、checkout、restore、overwrite、reformat、regenerate で消さない。既存変更と対象変更が同じファイルにある場合は、既存変更を保持したまま必要な差分だけ編集する。既存差分を自分の変更として報告しない。

変更前に、影響範囲を確定するため必要な範囲で current implementation、caller / callee、public interface、state / data flow、tests、configuration、compatibility behavior、generated artifact、migration state を確認する。リポジトリ全体を目的なく探索しない。

既存コードと上流契約が異なる場合は、現状、approved contract、変更後の実装、migration / compatibility impact を区別する。既存コードを正本とみなして上流契約を変更しない。

## 外部挙動と公開境界

上流根拠なく次の外部挙動を変更しない。

- accepted input、returned output、error、validation result
- state transition、ordering、conflict resolution、timing semantics
- persistence behavior、compatibility、protocol / file representation
- public API、CLI behavior、UI behavior、serialization / encoding

「実装しやすい」「既存コードがそうなっている」という理由で変更してはならない。現在の Specification と Design で実装できない場合は、`Specification gap` または `Design gap` として分類する。

必要な helper、internal type、module、class を将来便利そうという理由で public API にしない。公開範囲は approved Specification、compatibility requirement、existing public contract、explicit user request へ追跡できるものに限り、内部実装のためだけのものは可能な限り内部境界に留める。

## Dependency、生成物、移行

新しい dependency や version update は自動的に行わない。追加・更新には、上流での要求、現在の実装成立に必要な理由、既存 dependency では合理的に実現できない理由、または明示された security / compatibility 修正などの根拠が必要である。

dependency を変更する場合は、必要な範囲で direct / transitive impact、lockfile、runtime / build impact、supported platform、compatibility、license を確認する。「最新版だから」という理由だけで更新しない。

generated artifact、lockfile、compiled output、resource、fixture は、変更対象との関係を確認する。

- 必要な生成物だけ更新する
- generator と generated artifact の正本を取り違えない
- unrelated な生成差分を混ぜない
- lockfile を不要に全面更新しない
- binary / asset を根拠なく差し替えない

Migration が必要な場合は、Design / Specification で定められた migration / compatibility 方針を実装する。backward compatibility、fallback、automatic migration、destructive migration、dual-write、version compatibility の方針を Implementation Author が勝手に決めない。方針不足は `Design gap` または `Specification gap` とする。具体的な migration code、command、script は Implementation の責務である。

## Security と失敗時挙動

Security Requirement / Specification / Design が存在する場合、その責務を実装へ正確に反映する。対象に応じて input validation、authentication / authorization、secret handling、sensitive data lifecycle、privilege separation、integrity check、fail-closed behavior、resource limits、secure cleanup 等を扱う。

一般的な security best practice だけを理由に、依頼にない authentication、encryption、sandbox、network restriction 等を追加しない。一方、変更によって明白な脆弱性を新規導入しない。無関係な重大問題を見つけても、大規模修正へ自動拡張せず、影響と必要な上流判断を報告する。

error handling は Specification / Design に従う。実装者の判断だけで silent fallback、retry、ignore、partial success、default value、coercion、auto repair、fail-open を追加・変更しない。外部結果を変えるなら `Specification gap`、内部 recovery strategy を変えるなら `Design gap` の可能性として扱う。

## Test

Implementation / Test 工程として、変更に必要な test code と fixture を扱う。テストは Requirement / Specification / Design、bug reproduction、changed implementation、regression risk のいずれかへ追跡できるようにする。

対象に応じて normal case、boundary、failure、regression を確認する。ただし、次を行わない。

- test が存在することだけを根拠に Specification を作る
- 既存 test を通すために上流契約を変更する
- coverage 数値だけのために意味のない test を増やす

テスト実装の具体方式は Implementation / Test の裁量であるが、テストから新しい外部契約や Requirement を発明しない。

## Bug fix と Refactor

Bug fix では、まず期待挙動の根拠を確認する。Specification、Requirement、Design constraint、documented compatibility behavior、explicit user report / decision、再現可能な inconsistency は根拠になり得る。単に現在のコードが不自然に見えるという理由だけで外部挙動を変更しない。

再現可能な場合は failure condition を特定し、必要に応じて regression test を追加する。refactor は requested implementation を安全に成立させるために必要な範囲へ限定し、無関係な大規模 refactor は実施しない。

## 実装手順

1. 依頼、対象範囲、repository instruction、working tree、既存差分を確認する。
2. 承認済み Design / Specification と必要な上流契約を確認する。
3. 現行実装と影響範囲を必要最小限調査する。
4. 不明点を `Upstream ambiguity`、`Specification gap`、`Design gap`、`Implementation decision`、`Out of Scope` に分類する。
5. 必要最小限の実装方針を決め、コード、設定、データ、生成物、テスト等を変更する。
6. 変更に比例した validation を実行する。
7. 差分、生成物、未検証範囲、残存問題、上流への差し戻しを確認して報告する。

## 質問規律

不明点を発見するたびにユーザーへ質問しない。まず分類し、Implementation の裁量で安全に決定できる局所的事項は自分で判断する。

質問・作業停止が必要なのは、推測すると external behavior、architecture、compatibility、security responsibility、destructive behavior 等を勝手に決めることになる場合である。上流不足に依存しない部分まで止めず、実装可能な範囲は進める。

## Validation

Validation は変更内容とリスクに比例させる。`AGENTS.md` などの repository-defined validation instruction を優先し、必要に応じて format、lint、static analysis、type check、unit / integration / system test、build、package、platform build、migration、generated artifact を選ぶ。すべての変更で全 test suite を要求せず、重要な変更を速い lint だけで完了扱いにもしない。

未実行の validation を PASS と報告しない。実行不能なら未実行項目、理由、影響を明示する。実行前に変更ファイルを確定し、unrelated change を検証結果へ混入させない。

既存 baseline ですでに失敗している test / lint / build と、今回の変更による新規 failure を区別する。可能な場合は変更前 baseline または既知の CI 状態と比較し、対象外の既存 failure を直すために scope を拡大しない。

## 実装完了条件

次を満たす場合に、対象の Implementation 作業を完了とする。

- requested change が実装されている
- approved Specification / Design と整合している
- 上流契約、公開範囲、互換性方針を勝手に変更していない
- 必要な test / validation が実施され、未実行範囲が報告されている
- 新規 regression が確認されていない、または未解決影響が明示されている
- generated / config / migration 等の必要成果物が整合している
- unrelated changes が混入していない
- unresolved blocking upstream issue が残っていない

「test が通った」だけで完了としない。

## implement-review との分離

この Skill は Implementation の作成・修正を行う。自分の変更を自己確認・validation することと、独立した `implement-review` の正式レビュー成果物を作ることは別である。Implementation Review の成果物を同時に作成せず、レビューが必要な場合は既存の `implement-review` を使用する。

## 自己確認

- 特定プロジェクト、language、framework、application architecture 固有の Skill になっていない。
- `Specification → Design → Implementation / Test` の工程方向を守っている。
- Concept / Requirements / Specification / Design を実装都合で変更していない。
- external behavior を根拠なく変更していない。
- `Upstream ambiguity`、`Specification gap`、`Design gap`、`Implementation decision`、`Out of Scope` を混同していない。
- Design gap を Implementation decision として勝手に埋めていない。
- upstream issue を fallback、推測、既存挙動の追認で隠していない。
- requested scope に必要な変更だけを行い、unrelated refactor / cleanup / upgrade を混入させていない。
- public API を不要に拡張していない。
- dependency を根拠なく追加・更新していない。
- generated artifact / lockfile に不要な差分がない。
- migration / compatibility 方針を勝手に発明していない。
- error handling / fallback / retry / coercion を勝手に変更していない。
- 既存のユーザー変更を破壊していない。
- test が上流契約または変更理由へ追跡でき、test から新しい Specification を逆生成していない。
- validation が変更内容とリスクに比例し、未実行 validation を PASS と報告していない。
- existing failure と今回の regression を区別している。
- working tree に対象外変更が混入していない。
- commit / push 等を明示的許可なしに実行していない。

## 文章方針

日本語で、短く明確かつ規範的に記述する。一般的な作業規律を `author-common` と重複して大量にコピーせず、Implementation 固有の責務、外部契約の保護、最小差分、成果物、test、validation に集中する。対象にない concern や特定技術を必須事項として固定しない。
