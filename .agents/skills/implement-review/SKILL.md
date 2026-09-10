---
name: implement-review
description: 承認済み Specification / Design と依頼に対する Implementation / Test を、適合性、正しさ、安全性、互換性、範囲、回帰、検証証拠の観点からレビューする汎用 Skill。コードや上流成果物は修正しない。
---

# 実装レビュー（Implementation Review）

承認済み Specification / Design とユーザーの依頼が、コード、設定、データ、migration、build、dependency、generated artifact、test その他の実装成果物へ正しく反映されているかを判定する。対象工程は `Implementation / Test` であり、より良い実装方法を提案したり、上流契約を作り直したりする工程ではない。

中心となる問いは次である。

> この Implementation は、承認済み上流契約と Design を変更せず、依頼された変更を正しく安全に実現しているか？

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

Implementation Review は Implementation / Test の適合性を判定する。Implementation から Requirement、Specification、Design を逆生成しない。テストや current code に存在する内容だけを、上流契約または Design とみなさない。Reviewer の好みを実装 requirement、Specification、Design に変換しない。

## 根拠と情報源

`AGENTS.md` などの repository instruction と `../review-common/review-playbook.md` の共通規律に従う。判定の根拠は、必要な範囲で次の順に確認する。

1. ユーザーの最新の明示的判断・レビュー依頼
2. repository instruction / `AGENTS.md`
3. 承認済み Design
4. 承認済み Specification
5. Requirements / Concept
6. approved ADR、formal standard / protocol、compatibility contract、既存の正式な公開契約
7. レビュー対象の Implementation / Test
8. 過去の正式な Implementation Review
9. 必要な補助資料

既存コード、test、fixture、configuration、generated artifact、lockfile、README、データは、現在の挙動、実現可能性、互換性、回帰、変更の影響、明白な矛盾を確認する補助資料である。「存在するから正しい」と判断せず、そこから新しい Requirement / Specification / Design を作らない。

レビュー中はレビュー対象、上流成果物、コード、テスト、設定、データを直接修正しない。レビュー成果物だけを作成・更新する。

## Review Scope

開始時に、必要に応じて次を記録する。

- reviewed revision / HEAD、base revision
- changed files、requested scope
- reviewed Implementation / Test と upstream artifacts
- excluded scope、unavailable evidence
- existing working tree changes

差分レビューと全体レビューを区別する。差分理解のために周辺コードを確認しても、無関係な既存問題を無制限に formal finding 化しない。確認できない範囲を PASS とみなさず、必要なら unavailable evidence または Deferred として記録する。

対象に source code、configuration、static data、generated artifact、build / packaging、dependency、lockfile、migration、protocol / serialization、resource、test、fixture、CI、platform-specific implementation、binding / glue code が存在する場合だけ、それをレビューする。存在しない concern を checklist のために要求しない。

## 問題の分類

上流問題と現在工程の欠陥を混同しない。意味上は次のように分類する。

```text
Upstream issue
├─ Upstream ambiguity
├─ Specification gap
└─ Design gap

Current Phase
├─ Implementation defect
└─ Test / validation defect

Implementation freedom
└─ Implementation decision

Outside
└─ Out of Scope
```

### Upstream ambiguity

Concept / Requirements の scope、responsibility、required capability、acceptance、product decision 等が不足している状態。Implementation Review が具体的な答えを作らない。

### Specification gap

Requirements の意味や製品判断は十分だが、外部契約が不足している状態。input interpretation、output contract、error result、external state transition、ordering、conflict resolution、protocol behavior、compatibility behavior、外部から見える retry / timeout semantics 等が該当し得る。実装がどちらを選ぶべきか契約から判定できない場合、Implementation defect と断定せず Specification へ戻す。

### Design gap

Specification は十分だが、Implementation を評価・実現するための重要な内部判断が Design に不足している状態。責務 ownership、state / data ownership、dependency direction、trust boundary responsibility、persistence strategy、synchronization / atomicity、failure / recovery、security responsibility、migration architecture 等が該当し得る。Reviewer が好みの architecture を作らず、Design へ戻す。

### Implementation defect

上流契約と Design が十分なのに、Implementation / Test がそれへ適合していない具体的な欠陥。wrong result、contract violation、incorrect state transition、error handling defect、required validation の欠落、ownership / lifecycle の誤り、race、atomicity violation、data corruption、resource leak、互換性回帰、security boundary violation、migration / build / packaging defect 等が該当し得る。

### Test / validation defect

必要な契約、invariant、regression、security property 等を検出するための Test / validation に、具体的で到達可能な未検出リスクがある状態。test 数や coverage 数値だけでは formal finding にしない。

### Implementation decision

承認済み Specification / Design を満たす複数の合理的な具体方式から、Implementation が選べる範囲。private helper の分割、local naming、equivalent な control flow、Design が固定していない局所的な実装方法などは、Reviewer の好みだけで finding にしない。

### Out of Scope

現在のレビュー対象外。Finding や Deferred に自動変換せず、必要なら Review Scope / Excluded Scope に記録する。

## Specification Conformance

承認済み Specification に対して、Implementation が正しい外部挙動を実現しているか確認する。対象に応じて input、output、error、state transition、ordering、validation result、persistence、compatibility、protocol / file representation、serialization / encoding、public API、CLI / UI behavior、外部から見える timing semantics 等を扱う。

Specification に契約がない場合、Implementation Review が新しい契約を発明しない。未定義が原因で正否を判定できない場合は `Specification gap` として `Upstream Feedback` へ分離する。

## Design Conformance

承認済み Design に対して、Implementation が重要な内部制約を守っているか確認する。対象に応じて responsibility、dependency direction、state / data ownership、trust boundary、persistence responsibility、concurrency / synchronization、atomicity、failure containment、resource lifecycle、migration architecture、security responsibility、runtime / deployment responsibility 等を扱う。

Design が具体的な実装方式を固定していない場合、その自由度を尊重する。内部コード構造が Reviewer の好みと異なるだけでは finding にしない。

## Correctness と failure

対象に必要な範囲で、計算、変換、分岐、状態、境界、数値、serialization、resource lifecycle、並行性、partial update、cleanup、API 利用の具体的な defect を確認する。

Specification / Design で決められた error / failure behavior に対して、Implementation が silent fallback、retry、ignore、partial success、default value、coercion、automatic repair、fail-open 等を勝手に追加・変更していないか確認する。ただし、これらが存在すること自体を defect とせず、上流契約との不一致または具体的な correctness / safety impact がある場合に finding とする。

## Security

Security は対象に適用される場合に深く確認するが、すべての対象で最優先・同じ粒度とはしない。必要に応じて trust boundary、authentication / authorization、input validation、sensitive data、secret lifecycle、integrity、privilege boundary、unsafe execution、memory / resource safety、concurrency safety、external communication、logging / error leakage、dependency / supply-chain impact、build boundary、fail-open / fail-closed、resource exhaustion を確認する。

既存の Specification / Design、repository instruction、正式な安全条件、言語・実行境界の具体的な安全性を到達可能な defect が破る場合、個別の防御方法が上流資料へ逐語的に書かれていないという理由だけで除外しない。一方、「security best practice だから」という理由だけで authentication、encryption、sandbox、rate limit、2FA、monitoring、dependency 等を要求しない。

`security-checklist.md` は探索補助であり、適用項目だけを使う。項目の存在だけで Requirement、Specification、Design Decision、finding、severity を作らない。

## Compatibility、Integration、Dependency、Migration

対象に該当する場合、public API、persisted data、file / protocol format、encoding、version handling、migration compatibility、platform support、dependency compatibility、cross-implementation interoperability を確認する。protocol や serialization がない対象に canonical encoding、byte order、known vector、differential test 等を要求しない。

変更に dependency、lockfile、build / packaging、CI、platform、generated artifact、resource が含まれる場合、requested scope への必要性、上流制約、runtime / build impact、compatibility、reproducibility、generator と生成物の正本、無関係な差分を確認する。「最新版ではない」だけで finding にしない。

Migration が対象にある場合は、approved migration / compatibility contract、migration code、partial failure、rollback / recovery、destructive behavior、version transition、data integrity を必要な範囲で確認する。方針そのものが不足している場合は `Specification gap` / `Design gap` とし、Implementation Review が方針を発明しない。具体的な migration implementation の誤りは `Implementation defect` とする。

## Test と validation の評価

Test / validation が Specification、Design invariant、Requirement、bug reproduction、regression risk のいずれかへ追跡できるか確認する。対象に応じて normal、boundary、failure、regression、compatibility、security を評価するが、全種類を全変更へ要求しない。

Missing test を finding とする場合は、次を説明できることを要求する。

> この test がないため、どの具体的な契約、invariant、regression、security property を、どの条件で検出できないのか？

coverage 数値、test 数、fixture の存在だけでは finding にしない。実装ロジックを複製した期待値や出典不明の fixture だけで独立検証済みと判断しない。Test から Specification や新しい Requirement を逆生成しない。

`AGENTS.md` 等の repository-defined validation を優先し、変更とリスクに比例した format、lint、static analysis、type check、unit / integration / system test、build、package、platform、migration、generated artifact validation 等を選ぶ。

## Existing failure と Regression

base revision や既知の CI ですでに失敗している test、lint、build、type check、platform validation と、今回の変更で新たに発生・悪化した regression を区別する。可能なら base revision、prior CI、再現条件、changed / unchanged comparison で確認する。

既存 failure は、今回の差分が原因でない限り current Implementation finding に自動変換しない。今回の変更が原因で悪化・露呈した場合は、到達条件、影響、修正範囲を評価する。

## Scope と過剰レビュー

requested scope と上流契約に必要な変更かを確認する。unrelated refactor、cleanup、rename、formatting、dependency upgrade、API redesign、architecture change、fallback、cache、telemetry、logging infrastructure、feature flag、新しい public API、persistence、future extension 等が含まれていても、差分が大きいことだけで finding にしない。必要性と具体的な risk、reviewability、regression impact がある場合に限り指摘する。

new abstraction、repository layer、plugin、queue、retry、new dependency、framework migration、compatibility layer、security mechanism、performance optimization 等を「一般的に良い」という理由で Required Change にしない。

## Upstream Feedback、Deferred、Finding

上流問題は次の発生源へ分けて `Upstream Feedback` とする。

```text
Concept / Requirements problem → Upstream ambiguity
Specification problem          → Specification gap
Design problem                 → Design gap
```

上流問題そのものを `Implementation defect` として二重計上しない。上流不足により Implementation の正否を安全に判定できない場合は、root cause を `Upstream Feedback` に記録し、必要なら「適合性を判定できない」という current phase への blocking impact を別に示す。ただし、欠陥があると推測して二重の formal finding を作らない。

`Deferred` は、後続検証、外部環境、運用、release、Implementation / Test の後続確認など、現在のレビューで解決しない事項に限定する。単に対象外である事項や、上流の不足・曖昧さを Deferred にしない。Out of Scope は Review Scope / Excluded Scope に記録する。

正式 finding は、reviewed Implementation / Test または適用される上流根拠へ追跡でき、Current Phase で解決すべき具体的な defect である場合だけ採用する。少なくとも location、upstream basis、observed problem、trigger / reachability、impact、classification、required change、severity、status、完了条件を記録する。Required Change は最小条件に留め、完成した修正コード、特定 library、好みの architecture を書かない。

## Severity と Gate

既存の `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` を維持し、影響、到達可能性、precondition、recoverability、affected scope、security / integrity effect、compatibility / operational effect で判断する。文章の好み、一般論、checklist 項目だけで severity を上げない。

- `CRITICAL`: 現実的に到達可能で、重大な security boundary compromise、任意の code / command execution、catastrophic integrity failure、不可逆または広範な data loss / corruption、認証・認可の根本破綻、core safety property の実質的崩壊等を招く defect。
- `HIGH`: realistic condition で、approved Specification の重大違反、重大な correctness / security / integrity / compatibility failure、major state corruption、serious migration failure、安全な release / operation を阻害する regression、重大な defect を必要な validation で検出できない Test gap 等。
- `MEDIUM`: concrete だが影響が限定された correctness、robustness、compatibility、failure-path、test / validation の defect。
- `LOW`: 影響・到達可能性が限定された concrete defect / hygiene issue。一般論や任意改善だけでは採用しない。

`CRITICAL` / `HIGH` の New / Open / Reopened が1件以上ある場合は `Required Change` とし、`REVISE IMPLEMENTATION` とする。`MEDIUM` / `LOW` のみ、または解決済み・Deferred のみの場合は `READY` とできる。`READY` と `Required Changes: HIGH` の組み合わせは成立しない。上流問題や unavailable evidence の扱いは、現在工程への blocking impact と既存 Gate policy に従い、severity を自動生成しない。

## レビュアーの役割

Reviewer は Author ではない。レビュー対象、Specification、Design、Requirements、Concept、コード、テストを直接修正せず、Required Change に完成した代替実装を書かない。reviewer preference、将来拡張、optional hardening、checklist を埋めるための finding、特定 library / pattern の採用を要求しない。

複数 Reviewer が同じ根本原因を発見した場合は Chair が統合する。Security は Reviewer B が主担当でも、他 Reviewer が担当領域で concrete な security implication を見つけた場合は cross-check できる。

## レビュー手順

1. 対象 revision、base、scope、変更ファイル、除外範囲、未確認根拠を確定する。
2. 承認済み Design / Specification と依頼から、実装が満たすべき契約・制約・検証条件を抽出する。
3. Implementation / Test、設定、生成物、依存、migration、検証証拠を必要な範囲で確認する。
4. 上流問題、Implementation defect、Test / validation defect、Implementation decision、Out of Scope を分類する。
5. concrete な reachability、impact、既存 baseline、回帰、scope、security / compatibility を確認する。
6. 重複を統合し、最小の Required Change、severity、status、Gate、未検証範囲を記録する。

## 自己確認

- 特定 project、language、framework、browser、crypto、wallet、application architecture 固有の Skill になっていない。
- `Specification → Design → Implementation / Test` の工程方向を守っている。
- Implementation から Requirement、Specification、Design を逆生成していない。
- `Upstream ambiguity`、`Specification gap`、`Design gap`、`Implementation defect`、`Test / validation defect`、`Implementation decision`、`Out of Scope` を区別している。
- 上流問題を Implementation defect と二重計上していない。
- Specification にない外部契約や Design にない architecture を Reviewer の好みで発明していない。
- current code や test の存在だけを正しさの根拠にしていない。
- concrete impact / reachability のない theoretical concern を finding にしていない。
- scope 外の既存問題を無制限に finding 化していない。
- Out of Scope を Deferred にしていない。
- unrelated refactor、upgrade、future extension、optional hardening を Required Change にしていない。
- test から Specification を逆生成していない。
- missing test の具体的な未検出リスクを説明している。
- existing baseline failure と今回の regression を区別している。
- security checklist を機械的に適用していない。
- applicable な dependency、migration、generated artifact、compatibility を確認している。
- Required Change で完成した代替実装や特定方式を指定していない。
- severity / gate が実際の impact と既存 policy に整合している。
- 未実行 validation を PASS としていない。
- reviewer が code、test、upstream artifact を直接変更していない。

## 文章方針

日本語で、短く明確かつ規範的に記述する。`review-common` と重複する一般規律を大量にコピーせず、Implementation Review 固有の適合性、具体的 defect、scope、回帰、検証証拠、上流問題の分類に集中する。対象にない concern を checklist やテンプレートのために発明しない。
