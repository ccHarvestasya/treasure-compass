---
name: spec-author
description: Create or update an implementation- and verification-ready external Specification from approved Requirements without deciding internal design or implementation. Applies to applications, libraries, services, CLIs, file formats, protocols, batch processes, and embedded components.
---

# Specification Author

承認済み Requirements を、利用者・外部システム・実装者・検証者が同じ合否を判定できる、観測可能な外部契約へ具体化する。

Specification の中心は、**「システムが外部からどのように振る舞えば正しいと判定できるか」**である。内部実装方法を決める工程ではない。

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

迷ったときは、次で判定する。

> 実装内部を知らない第三者が、振る舞いの正しさを判定するために必要な情報か？

Yes なら Specification の候補である。次への回答なら原則として Design である。

> その振る舞いを内部でどう実現するか？

外部から観測できる結果、制約、失敗、安全性、互換性を定めることは Specification に含める。実現方式、責務分割、使用技術は Design に残す。

## 参照

1. `AGENTS.md` などのプロジェクト作業指示（存在する場合）
2. `../author-common/author-playbook.md`
3. 登録済みの Phase Context（提供されている場合だけ。正式根拠ではない）
4. 承認済み Requirements、Concept、formal reference、既存の正式契約
5. 必要な補足資料

## 根拠と Source hierarchy

ユーザーの最新の依頼・明示的判断は、作業範囲と優先順位を定めるものとして常に優先する。Specification の各契約の根拠は、原則として次の順で扱う。

1. **approved Requirements**（直接の主たる根拠）
2. **approved Concept**（目的、価値、スコープ、責任、対象外の継承）
3. **approved ADR、標準、規格、その他の formal reference**
4. 互換性 Requirement が存在する場合の、既存の正式な外部契約
5. 補足資料

コード、既存の実装、テスト、prototype、README、未承認の設計案は、現在の挙動、互換性、実現可能性、回帰リスクを確認するための補足資料にとどめる。それらに存在する挙動だけを、意図された正式 Specification として昇格させない。

正式資料同士が矛盾する場合は勝手に統合せず、優先順位、影響、未決定事項を記録する。approved Requirements が存在しない、または要求の意味を確定できない場合は、推測で Specification を完成させず `unresolved`、`upstream feedback`、`clarification needed` として扱う。

## 仕様に含める契約

対象に必要なものだけを選び、各契約を外部から観測・検証できる形で記述する。すべての項目や見出しを強制しない。

- 適用範囲、対象外、用語、外部主体、責任境界
- 入力、出力、外部インターフェース、データ・ファイル・メッセージ形式
- 状態、状態遷移、ライフサイクル、操作の順序、外部から見える不変条件
- validation、正規化、拒否条件、error condition、失敗時の外部結果
- 境界値、空・未知・不正・重複・部分入力など、要求上必要な境界条件
- compatibility、interoperability、version、後方互換などの外部ルール
- 同じ入力に対する決定性、順序、丸め、時刻その他の結果に影響する規則
- security や trust boundary に関して Requirements が要求する、公開範囲、権限結果、入力の扱い、改変・破損時の結果、fail-closed などの観測可能な契約
- 必要な受け入れ・適合条件、例、未決定事項、Requirements への Traceability

「適切に処理する」「安全に扱う」「エラーを返す」「有効な値」「必要に応じて」「互換性を維持する」だけで終えない。必要な場合は、入力・条件、観測可能な結果、状態への影響、拒否・失敗条件、境界、決定性を第三者が合否判定できる粒度まで定める。ただし、上流で未決定の製品判断を埋めてはならない。

外部の file format、protocol、API、data schema は、Requirement または formal reference が必要とする外部契約なら Specification の対象になり得る。内部 database schema、collection / table layout、内部保存形式は、外部互換契約でない限り Design の対象である。

規範性を表す場合は、`MUST` / `SHOULD` / `MAY` または同等の語の意味を文書内で一意にし、必須・推奨・任意を混同させない。単なる文体上の強調を規範性として扱わない。

## 曖昧さの分類

曖昧さを見つけたら、決定前に所属工程を分類する。

| 分類 | 判定 | 扱い |
| --- | --- | --- |
| **Specification-level clarification** | Requirements の意味・スコープ・責任を変えず、一意な外部契約へ展開できる | Specification で決めてよい |
| **Upstream ambiguity** | 選択によって利用者体験、機能要求、責任、範囲などの製品判断が変わる | Requirements / Concept へ戻し、`upstream feedback` または `clarification needed` とする |
| **Design choice** | 外部契約が同じで、内部実現方法だけが変わる | Specification では決めず Design へ引き継ぐ |

## Over-specification を防ぐ

Requirements に根拠がなく、外部契約として不可欠でもない限り、次を決めない。

- class、module、package structure、source file layout
- private / internal API、internal function signature、内部 state representation
- database schema、collection / table layout、cache implementation、queue implementation
- threading / concurrency model、algorithm choice、optimization strategy
- framework、library、dependency、deployment topology
- logging implementation、monitoring implementation、運用内部方式
- 将来拡張用の abstraction、extra configuration、extra API、extra state、fallback、compatibility layer、operational / security feature

既存方式の踏襲、一般的な best practice、便利さ、将来性、再利用性、拡張性、スケーラビリティ、一般的な security hardening だけでは追加の根拠にならない。外部から見える security、audit、logging、persistence、performance の結果が上流で要求される場合は、その観測可能な契約だけを定め、実装方式は定めない。

## 作成手順

1. 依頼、対象範囲、承認済み Requirements / Concept、formal reference、互換性要求を確認する。
2. Requirements ID、またはそれに相当する上流根拠を各重要契約へ対応付ける。形式的な表は、役に立つ場合だけ作る。
3. 必要な外部入力・出力・状態・ライフサイクル・失敗・境界・互換性を抽出し、観測可能な結果へ展開する。
4. 未決定事項を Specification-level clarification / Upstream ambiguity / Design choice に分類する。
5. 対象に必要な契約だけを記述し、内部方式、将来拡張、実装・テストの詳細を除く。
6. 自己確認し、既存の文書配置・命名・レビュー運用がある場合はそれに従う。依頼がなければ他成果物やコードを変更しない。

## 構成の選択

固定テンプレートを全章埋めしない。対象に応じて、次のうち必要なものだけを使う。

- scope / terms / responsibility
- external actors、input / output、interface / data contract
- state / lifecycle
- validation / errors / boundary conditions
- compatibility / interoperability / deterministic behavior
- security-visible behavior and invariants
- conformance criteria or examples
- unresolved items、downstream handoff、traceability / references

Acceptance criteria は外部から判定できる契約として扱い、具体的なテストコード、fixture、テスト framework、DOM、source-level verification は Implementation / Test へ送る。

## 自己確認

- 各重要契約が Requirements または許可された formal reference へ追跡できる。
- Requirements にない機能、利用者、責任、制約、保存、互換性、security 要求を追加していない。
- 第三者が実装内部を知らなくても、入力・結果・状態・失敗・境界の合否を判定できる。
- 曖昧さを推測で埋めず、Specification / upstream / Design の境界へ正しく送っている。
- 内部構造、技術選択、アルゴリズム、実装・テスト方式を固定していない。
- 対象に不要な章、fallback、将来拡張、一般論を追加していない。
- 文書が application、library、service、CLI、file format、protocol、batch、embedded component のいずれにも適用可能な一般原則に留まっている。
