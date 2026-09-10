---
name: spec-author
description: 承認済み Requirements を基に、内部設計や実装方法を決めず、アプリケーション、ライブラリ、サービス、CLI、ファイル形式、プロトコル、バッチ処理、組込みコンポーネントなどの外部 Specification を、実装・検証可能な契約へ具体化・更新する。
---

# 仕様書作成（Specification Author）

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
  → コンポーネント / モジュール分割、内部アーキテクチャ、内部状態 / API、アルゴリズム、永続化 / キャッシュ / 並行処理方式、ライブラリ / フレームワーク、配備、ソース構成

Implementation / Test
  → コード、設定、マイグレーション、具体的な依存関係の更新、ビルド / CI、成果物、具体的なテスト実装・検証手順
```

迷ったときは、次で判定する。

> 実装内部を知らない第三者が、振る舞いの正しさを判定するために必要な情報か？

はいなら Specification の候補である。次への回答なら原則として Design である。

> その振る舞いを内部でどう実現するか？

外部から観測できる結果、制約、失敗、安全性、互換性を定めることは Specification に含める。実現方式、責務分割、使用技術は Design に残す。

## 参照

1. `AGENTS.md` などのプロジェクト作業指示（存在する場合）
2. `../author-common/author-playbook.md`
3. 登録済みの Phase Context（フェーズコンテキスト。提供されている場合だけ。正式根拠ではない）
4. 承認済み Requirements、Concept、正式な参照資料、既存の正式契約
5. 必要な補足資料

## 根拠と優先順位

ユーザーの最新の依頼・明示的判断は、作業範囲と優先順位を定めるものとして常に優先する。Specification の各契約の根拠は、原則として次の順で扱う。

1. **承認済み Requirements**（直接の主たる根拠）
2. **承認済み Concept**（目的、価値、スコープ、責任、対象外の継承）
3. **承認済み ADR、標準、規格、その他の正式な参照資料**
4. 互換性 Requirement が存在する場合の、既存の正式な外部契約
5. 補足資料

コード、既存の実装、テスト、試作版、README、未承認の設計案は、現在の挙動、互換性、実現可能性、回帰リスクを確認するための補足資料にとどめる。それらに存在する挙動だけを、意図された正式 Specification として昇格させない。

正式資料同士が矛盾する場合は勝手に統合せず、優先順位、影響、未決定事項を記録する。承認済み Requirements が存在しない、または要求の意味を確定できない場合は、推測で Specification を完成させず、`unresolved`（未解決）、`upstream feedback`（上流へのフィードバック）、`clarification needed`（確認が必要）として扱う。

## 仕様に含める契約

対象に必要なものだけを選び、各契約を外部から観測・検証できる形で記述する。すべての項目や見出しを強制しない。

- 適用範囲、対象外、用語、外部主体、責任境界
- 入力、出力、外部インターフェース、データ・ファイル・メッセージ形式
- 状態、状態遷移、ライフサイクル、操作の順序、外部から見える不変条件
- 入力検証（validation）、正規化、拒否条件、エラー条件、失敗時の外部結果
- 境界値、空・未知・不正・重複・部分入力など、要求上必要な境界条件
- 互換性（compatibility）、相互運用性（interoperability）、バージョン、migration、後方互換などの外部ルール
- 同じ入力に対する決定性、順序、丸め、時刻その他の結果に影響する規則
- セキュリティや信頼境界（trust boundary）に関して Requirements が要求する、公開範囲、権限結果、入力の扱い、改変・破損時の結果、拒否側に倒す扱い（fail-closed）などの観測可能な契約
- 必要な受入・適合条件、例、未決定事項、Requirements への追跡性（Traceability）

「適切に処理する」「安全に扱う」「エラーを返す」「有効な値」「必要に応じて」「互換性を維持する」だけで終えない。必要な場合は、入力・条件、観測可能な結果、状態への影響、拒否・失敗条件、境界、決定性を第三者が合否判定できる粒度まで定める。ただし、上流で未決定の製品判断を埋めてはならない。

外部のファイル形式、プロトコル、API、データスキーマは、Requirement または正式な参照資料が必要とする外部契約なら Specification の対象になり得る。内部データベーススキーマ、コレクション / テーブル構成、内部保存形式は、外部互換契約でない限り Design の対象である。

規範性を表す場合は、`MUST` / `SHOULD` / `MAY` または同等の語の意味を文書内で一意にし、必須・推奨・任意を混同させない。単なる文体上の強調を規範性として扱わない。

## Requirements からの handoff を完結させる

Requirements を読むときは、次の事項を先に抽出する。

- Specification で決めると明示された事項
- 後工程で外部契約を定義するとされた事項
- 正確な形式、状態遷移、互換性、version、error result、parsing result を Specification へ引き継ぐ記述
- Acceptance を成立させるために必要な外部契約
- `unresolved`、`TBD`、`later phase` などの未決定事項

Requirements が目的、制約、責任、許容範囲を与えており、その範囲内で一意な外部契約へ展開できる場合は、単なる Specification-level clarification である。具体的な値や形式が Requirements に書かれていないだけで、Design / Implementation へ再委譲してはならない。製品判断が不足していて一意に決められない場合だけ `upstream feedback` / `clarification needed` とし、外部契約が同じで内部実現だけが異なる場合だけ Design choice として引き継ぐ。

## 外部結果を決める規則と内部方式を分離する

同じ Specification に適合する二つの Design / Implementation が、同じ外部入力または同じ外部状態に対して異なる観測可能な結果を返せるなら、その差を許容する承認済みの Requirements、Concept、formal reference、互換性契約などがない限り、外部契約が不足している可能性が高い。逆に、内部実現が異なっても外部から観測される入力、出力、状態遷移、失敗結果、互換性、決定性が同じなら、その違いは原則として Design / Implementation の責務である。

次のように、結果を決める規則と実現方式を分ける。

Specification で定める候補:

- accepted representation、外部 message / file / protocol format、field semantics、version semantics
- ordering、deterministic tie-break、rounding、normalization、timestamp interpretation
- replay / stale / duplicate の判定、compatibility / migration rules、same-input same-result に必要な評価規則
- failure 時に外部から見える状態、partial recovery / full rejection の条件、externally visible atomicity

Design / Implementation に残す候補:

- algorithm、parser の内部実装、storage engine、persistence strategy、internal schema、internal representation
- module decomposition、caching、indexing、optimization、threading / concurrency model
- concrete library、framework、依存関係、配置方式

`algorithm`、`parser`、`schema`、`persistence`、`serialization`、`encoding`、`ranking`、`scoring`、`cache`、`timestamp`、`version` という語だけで所属工程を決めない。その選択が外部結果を変える場合は、承認済みの根拠と許容範囲に沿って外部契約を Specification に残し、根拠が不足する場合は `upstream feedback` / `clarification needed` とする。外部結果を変えない内部方式だけを Design / Implementation に送る。例えば、経路探索アルゴリズムの選択は Design だが、同率結果の決着規則は Specification である。parser の実装方法は Design / Implementation だが、外部メッセージの delimiter の escape 規則は Specification である。特定の保存技術とデータベースの選択は Design だが、破損した永続データを全拒否するか部分復元するかは Specification であり、部分復元処理をどの関数で実装するかは Implementation である。

## Design handoff の自己監査

Specification を完成させる前に、Design / Implementation へ送った各事項について次を確認する。

1. その違いによって外部結果は変わらないか。
2. 同じ Specification に適合する二つの実装が、差異を許容する承認済みの根拠なく異なる外部結果を返す余地を作っていないか。
3. Requirements がその事項を Specification に明示的に委譲していないか。
4. 外部 interoperability / compatibility / determinism に必要な情報ではないか。

該当するなら Design に送らず Specification に残す。製品判断が不足する場合に限り `upstream feedback` / `clarification needed` とし、内部実現だけの選択であることを確認できた場合だけ Design handoff とする。

## 曖昧さの分類

曖昧さを見つけたら、決定前に所属工程を分類する。

| 分類 | 判定 | 扱い |
| --- | --- | --- |
| **Specification-level clarification（仕様レベルの明確化）** | Requirements の意味・スコープ・責任を変えず、一意な外部契約へ展開できる | Specification で決めてよい |
| **Upstream ambiguity（上流の曖昧さ）** | 選択によって利用者体験、機能要求、責任、範囲などの製品判断が変わる | Requirements / Concept へ戻し、`upstream feedback`（上流へのフィードバック）または `clarification needed`（確認が必要）とする |
| **Design choice（設計上の選択）** | 外部契約が同じで、内部実現方法だけが変わる | Specification では決めず Design へ引き継ぐ |

## 過剰仕様（Over-specification）を防ぐ

以下の内部方式を Specification で新たに決定しない。これらに関係する外部契約を Specification に記載する場合でも、根拠と優先順位で定めた承認済み Requirements、ユーザーの明示的な最新判断、承認済み Concept から直接継承される範囲・責任・対象外、適用が承認された ADR / standard / formal reference、または互換性 Requirement が参照する既存の正式な外部契約に明確に追跡できなければならない。

「外部契約として不可欠そう」という作成者自身の判断だけでは根拠にならない。根拠がなく、必要そう・不可欠そうに見える事項は正式 Specification にせず、内容に応じて `upstream feedback`、`clarification needed`、`unresolved` へ送る。

- クラス、モジュール、パッケージ構成、ソースファイル構成
- 非公開 / 内部 API、内部関数シグネチャ、内部状態表現
- データベーススキーマ、コレクション / テーブル構成、キャッシュ実装、キュー実装
- スレッド / 並行処理モデル、アルゴリズムの選択、最適化方式
- フレームワーク、ライブラリ、依存関係、配備トポロジー
- ログ実装、監視実装、運用上の内部方式
- 将来拡張用の抽象化、追加設定、追加 API、追加状態、フォールバック、互換性層、運用 / セキュリティ機能

既存方式の踏襲、一般的なベストプラクティス、便利さ、将来性、再利用性、拡張性、スケーラビリティ、一般的なセキュリティ強化だけでは追加の根拠にならない。外部から見えるセキュリティ、監査、ログ、永続化、性能の結果が上流で要求される場合は、その観測可能な契約だけを定め、実装方式は定めない。

## 作成手順

1. 依頼、対象範囲、承認済み Requirements / Concept、正式な参照資料、互換性要求を確認する。
2. Requirements から Specification への handoff、未決定事項、Acceptance に必要な外部契約を抽出する。
3. Requirement ID、またはそれに相当する上流根拠を各重要契約へ対応付ける。形式的な表は、役に立つ場合だけ作る。
4. 必要な外部入力・出力・状態・ライフサイクル・失敗・境界・互換性・決定性を抽出し、観測可能な結果へ展開する。
5. 未決定事項を Specification-level clarification / Upstream ambiguity / Design choice に分類し、Design handoff の自己監査を行う。
6. 対象に必要な契約だけを記述し、内部方式、将来拡張、実装・テストの詳細を除く。
7. 自己確認し、既存の文書配置・命名・レビュー運用がある場合はそれに従う。依頼がなければ他成果物やコードを変更しない。

## 構成の選択

固定テンプレートを全章埋めしない。対象に応じて、次のうち必要なものだけを使う。

- 適用範囲 / 用語 / 責任境界
- 外部主体、入力 / 出力、インターフェース / データ契約
- 状態 / ライフサイクル
- 入力検証 / エラー / 境界条件
- 互換性 / 相互運用性 / 決定的な振る舞い
- セキュリティ上外部から見える振る舞いと不変条件
- 適合条件または例
- 未解決事項、下流引継ぎ、追跡性 / 参照資料

受入条件（Acceptance criteria）は外部から判定できる契約として扱い、具体的なテストコード、テスト用固定データ（fixture）、テストフレームワーク、DOM、ソースレベル検証は Implementation / Test へ送る。

## 自己確認

- 各重要契約が Requirements または許可された正式な参照資料へ追跡できる。
- Requirements が Specification へ明示的に委譲した外部判断を、正当な理由なく Design / Implementation へ再委譲していない。
- Requirements にない機能、利用者、責任、制約、保存、互換性、セキュリティ要求を追加していない。
- 第三者が実装内部を知らなくても、入力・結果・状態・失敗・境界の合否を判定できる。
- 同じ入力・状態に対する合理的な二実装の外部結果が、承認済みの根拠なく分岐しない。
- 曖昧さを推測で埋めず、Specification / 上流 / Design の境界へ正しく送っている。
- algorithm、parser、persistence、schema などの語だけで Design に分類していない。
- 内部構造、技術選択、アルゴリズム、実装・テスト方式を固定していない。
- 対象に不要な章、フォールバック、将来拡張、一般論を追加していない。
- 文書がアプリケーション、ライブラリ、サービス、CLI、ファイル形式、プロトコル、バッチ処理、組込みコンポーネントのいずれにも適用可能な一般原則に留まっている。
