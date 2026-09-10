# Treasure Compass / Mob Compass 基本設計

| 項目 | 内容 |
| --- | --- |
| Status | Design Author Draft 001 |
| 対象 | Treasure Compass / Mob Compass v1 |
| 直接の上流 | [Specification](../specification/specification.md) |
| 文書の責務 | 承認済み Specification の外部契約を変えず、内部責務・状態所有・依存方向・失敗境界を定める |

## 1. 目的・対象・対象外

### 1.1 目的

本 Design は、Treasure Compass と Mob Compass v1 をブラウザ上で実現するための論理構造を定める。対象は、UI から受け取った入力を検証済みの周回状態へ変換し、マスターデータを参照してルートと進行を算出し、必要な状態を保存・復元し、Mob の案内を安全に生成・取り込むまでの内部責務である。

本書は、利用者から観測できる入力、出力、状態の意味、案内形式、世代判定を変更しない。特に、次の外部契約を Design 上の不変条件として扱う。

- Treasure はメンバーごとに同時点の現在対象を一つ持ち、次の順次対象は明示操作を経て一つずつ昇格する。
- Mob は一つのモブを完了単位とし、一つのモブに複数の候補地点を持つ。
- 候補集合への所属、マスター上の `confirmed | candidate`、`route-selected`、`user-confirmed`、`complete` は別の意味である。
- ルートの第一評価はマップ間遷移回数であり、同数の場合だけ料金とロード時間の Pareto 関係を用いる。高さや入力順は route ranking に用いない。
- 自動 route と手動順序は別状態であり、manual から auto への切替は明示的な再計算の成功時だけ成立する。
- `MOB-COMPASS/1` は一つの完全な snapshot として検証し、singleton の重複・欠落・余分な出現や行間不整合を全体拒否する。
- 保存データ、案内、利用者入力、静的 master data は検証前の外部データであり、部分的に正常状態へ昇格させない。

### 1.2 対象

- Treasure Compass の対象登録、順次対象、完了、手動順序、自動 route。
- Mob Compass のモブ対象、候補集合、master classification、採用・確認・完了、手動順序、自動 route。
- 通常入力、Treasure の複数行貼り付け、Mob の通常複数行入力、master/map からの選択。
- Mob の案内 snapshot の生成、解析、検証、通常取り込み、明示的な案内置換、再出力。
- ブラウザ内の現在周回の保存・復元と、保存時点と現在 master data の不整合の扱い。
- UI、application/session state、domain operation、route planning、master data access、persistence の責務境界。

### 1.3 対象外

参加者向けの共有 UI、サーバー、データベース、認証、権限移譲、リアルタイム同期、共同編集、ゲーム状態の自動取得、ゲーム内チャットへの自動投稿、長期履歴・統計・通知は設計しない。これらは Concept と Specification が定める v1 の責任境界の外側である。

Implementation の具体的なクラス名、関数シグネチャ、ファイル配置、React JSX/CSS、Zustand の具体的な slice、localStorage の新規 key 名、parser の実装方式、JSON schema の完成形、テストコードも本書では定めない。

## 2. 上流根拠・前提・既存制約

### 2.1 根拠と工程境界

直接の規範的根拠は [Specification](../specification/specification.md) である。[Requirements](../requirements/requirements.md) と [Concept](../concept/concept.md) は、Specification の意図、スコープ、責任境界を確認する補助根拠として用いる。[Specification Review 004](../reviews/specification/specification-review-004.md) は `READY` で、未解消の正式 finding はないため、本 Design はその approved Specification を対象とする。

Requirements が Design へ引き継いだ内部事項は、状態所有、検証責任、保存方式、route calculation、guide codec、master data access として具体化する。外部の受理/拒否、表示意味、世代判定、原子性の結果を Design の裁量で変更しない。

既存実装は現在構造、再利用可能性、互換性、移行影響を確認するための補助資料であり、上流契約や新しい Design requirement の根拠にはしない。既存実装との差がある場合は、approved upstream contract、現状実装、提案 Design、migration impact を分けて扱う。

### 2.2 前提と不変条件

- Treasure と Mob は別の公開単位であり、別々の session aggregate root を持つ。両者を一つの対象型へ変換して状態や保存を共有しない。
- 座標の内部表現はゲーム内マップ座標の正規化値を中心とし、画像表示のための座標変換があっても外部 identity と route semantics を変えない。
- X/Y の正規化、Unicode NFC、識別子照合、範囲検証は domain へ渡す前に一貫して適用する。高さは必要な場合のみ informational metadata として保持する。
- master data は地点分類や route 補助値の権威ある内容を供給するが、読み込み時の構造・型・参照は検証が必要な外部データである。
- ブラウザ内の localStorage は永続化先であって domain state の所有者ではない。読み書きは persistence boundary の内側に閉じ込める。
- current route と過去の成功した route 選択の記録を混同しない。計算失敗時に古い route を現在結果へ再利用しない。
- 新しい外部 enum、bit flag、複数値の地点意味 field は追加しない。内部では master classification、user confirmation、route selection、completion を別の責務・参照として保持するが、guide の地点の意味は現在 master の単一分類へ射影する。

## 3. System context / trust boundary

### 3.1 システムコンテキスト

```text
利用者
  │  手動入力・通常複数行・Treasure 貼り付け・明示操作・guide 貼り付け
  ▼
UI / Interaction boundary
  ▼  検証済み command と表示用 projection
Application / Session Coordinator
  ├── Treasure Session ── Treasure domain operations
  ├── Mob Session ─────── Mob domain operations
  ├── Input / Guide Validation
  ├── Route Planning
  └── Progress / Order Management
          │                       │
          ▼                       ▼
  Master Data Access        Persistence Adapter
  (static map/mob data)     (browser local storage)
```

Application / Session Coordinator が UI 操作を domain operation へ接続し、成功した状態だけを session state として採用する。Master Data Access と Persistence Adapter は外部データ境界を担当するが、UI を呼び出したり domain state を勝手に更新したりしない。Route Planning は読み取り専用の入力から計算結果を返し、状態の commit や保存を行わない。

### 3.2 信頼境界

次を untrusted input/resource として扱う。

- 手動入力、複数行テキスト、Treasure のチャット貼り付け、Mob guide の貼り付け。
- localStorage から読み出した保存文字列とデコード後の保存構造。
- `public/json/` などからロードする static master data。
- master data を参照して構成された地点・移動拠点の値。

これらは、構文、型、範囲、参照、重複、状態間整合性を通過した domain value だけが trusted session state へ入る。master data は内容の管理主体が管理する authoritative source だが、実行時にはファイル破損や想定外形状を含み得る入力として検証する。

外向きの境界では、文字列を HTML として解釈せず、画面表示用に escape された値だけを UI projection へ渡す。guide 出力は validated snapshot の明示的な serialize 結果であり、ゲーム内チャットへ送信する責務は持たない。

## 4. Architecture と責務境界

### 4.1 論理コンポーネント

| コンポーネント | 所有・責務 | 依存してよいもの | 依存しないもの |
| --- | --- | --- | --- |
| UI / Presentation | 入力欄、選択、一覧、地図表示、状態・エラー・同順位・未確認の表示、明示操作の起動。domain state の意味を独自に確定しない | Application command と表示 projection | localStorage、parser、route algorithm、master JSON の直接解釈 |
| Interaction Adapter | UI の入力を操作種別、raw value、対象 product、明示意図へ変換する。通常入力と guide import、通常取り込みと案内置換を混同させない | UI event、Application Coordinator | domain aggregate の直接変更 |
| Application / Session Coordinator | 操作の順序、working snapshot の作成、domain operation の呼出し、route result の採用、commit、保存、通知を調停する | Product session、validation、route planner、guide services、master/persistence boundary | React の表示実装、外部文字列の未検証解釈 |
| Treasure Session | メンバーごとの current target、sequential pending target、Treasure の完了と order の意味を所有する | Treasure domain rules、normalized location | Mob candidate semantics、Mob guide codec |
| Mob Session | モブ単位の対象、候補集合、master classification、user confirmation、completion、current route selection、manual order、run metadata を所有する | Mob domain rules、master resolution、route result、guide application | Treasure の 1:1 rules、UI、storage API |
| Input / Normalization | 構文解析、文字列正規化、座標の十進正規化、形式・範囲・master reference の検証、行別結果を返す | Domain-neutral validation rules、Master Data Access | session mutation、UI state |
| Route Planner | 有効な未完了対象から route candidate を列挙・比較し、success / tie / failure と計算結果を返す。Treasure と Mob の対象単位を尊重する | 正規化された domain read model、master の地点・移動情報 | session commit、mode の勝手な変更、persistence |
| Progress / Order Operations | 追加、削除、完了、次対象昇格、manual order 変更、route selection の明示操作を domain invariant に沿って適用する | Treasure/Mob session | UI の暗黙操作、guide text の直接変更 |
| Guide Codec / Snapshot Service | Mob guide の生成、LF/CRLF を含む解析、singleton 検証、percent decode/encode、item/candidate integrity 検証、semantic snapshot の比較・分類を担う | Guide grammar、normalized snapshot、master resolution | current session の直接変更、route calculation |
| Master Data Access | static data のロード、構造・型・参照・公開状態の検証、地図/モブ/候補/拠点の resolution を提供する | static resource boundary | 利用者周回の書換え、guide の世代判定 |
| Persistence Adapter | validated session snapshot の serialize / deserialize、ブラウザ永続領域への read/write/delete を隔離する | browser storage API | UI、route calculation、未検証データの部分復元 |

### 4.2 Dependency direction

依存方向は次の一方向とする。

```text
UI
  ↓
Interaction Adapter
  ↓
Application / Session Coordinator
  ↓
Product Session + Domain Operations
  ├── Input / Normalization ──→ Master Data Access
  ├── Route Planner ──────────→ validated domain read model + master data
  ├── Guide Codec ────────────→ validated Mob snapshot
  └── Persistence Adapter ────→ browser storage
```

Domain は React、Zustand、fetch、localStorage、clipboard、console などの環境 API を直接参照しない。Application が環境 API の結果を成功・失敗として受け取り、domain の commit 境界を管理する。Master Data Access と Persistence Adapter は、必要な validated value / failure reason を Application へ返す限定的な境界とし、汎用 repository、event bus、queue、server session は導入しない。

Treasure Session と Mob Session は相互に依存しない。共通化できるのは、正規化された location の検証、対象集合の read projection、明示操作を working state へ適用してから commit する考え方など、意味・lifecycle・invariant が同じ部分だけである。Treasure の現在対象と Mob の候補集合を同じ collection abstraction で表し、1:1 または 1:多を隠すことはしない。

### 4.3 UI と domain の境界

UI は、選択された product、入力値、操作意図を command として Application へ渡す。UI は「地点をクリックしたから確認済み」「route に描画されたから採用済み」「表示順を並べたから auto route」といった昇格を行わない。確認、採用、完了、削除、次対象昇格、manual/auto 切替は、Specification が定める明示操作を Application が domain operation として実行する。

UI は domain state の投影を表示するだけであり、候補の master classification、採用地点、確認地点、完了状態、未確認、計算不能を一つの表示用フラグへ畳み込まない。入力結果の `valid`、`duplicate`、`invalid`、`conflict`、guide の `stale`、`duplicate`、`conflict`、`newer` も Application の結果を利用者へ区別可能に表示する。

## 5. Data / state ownership

### 5.1 Product session root

Application は選択中の product を明示的に管理し、Treasure と Mob の状態を別 root として保持する。product 切替は別 product の対象、route、completion、guide metadata を暗黙に流用しない。Persistence も product 境界を含む validated snapshot として扱い、相互変換を行わない。

#### Treasure session

Treasure Session は次を所有する。

- メンバー識別と、各メンバーの current Treasure target（0 または 1）。
- 同じメンバーに属する sequential pending target の順序。保留 target は current target と同時に route 対象にしない。
- 各 target の normalized map/location、未完了・完了・削除の domain 状態。
- current target の完了または削除後に、pending queue の先頭を一つだけ current へ昇格する lifecycle。
- Treasure の current route または manual order の参照と、完了済み情報の表示用 projection。

入力の受理順は manual order の明示契約に従うが、Treasure target を別メンバーの対象へ複製したり、current target を暗黙に上書きしたりしない。duplicate、conflict、explicit next target の判定は Treasure domain operation が行う。

#### Mob session

Mob Session は、概念を次の独立した所有物へ分ける。

| 所有物 | key / cardinality | 意味 |
| --- | --- | --- |
| Mob target | mob identity / 1 | 一つのモブと、その完了単位 |
| Candidate membership | mob identity → candidate identity / 0..多 | そのモブの候補集合。集合内の順序は意味を持たない |
| Master classification | candidate identity → 現在の `confirmed` または `candidate` | 現在 master が公開する地点分類。guide の `<地点の意味>` へ単一値として射影する |
| Route selection | Mob target ごとに 0 または 1 の current selection | 現在採用されている route の候補。route result の commit でのみ更新する |
| User confirmation | mob/candidate identity の明示記録 | 利用者が確認した地点。route selection、master classification、completion と独立 |
| Completion | mob identity ごとに未完了/完了 | モブ全体の進行。候補単位ではない |
| Selection history | Mob ごとの最後に成功した route selection の履歴 | manual 表示で参照できる過去の採用地点。current route として再利用しない |

Master classification は candidate membership から候補を除外する判定ではない。master の `candidate → confirmed` 更新は classification projection だけを更新し、candidate identity、membership、user confirmation、current route selection、completion、selection history を自動変更しない。参照不能になった場合は candidate identity を保持したまま unresolved / calculation-excluded projection とする。

Mob の通常入力や master 選択で同じモブの別地点を受け入れると、同じ Mob target の candidate membership へ追加する。同一 Mob・同一正規地点は duplicate として no-op にする。Treasure の 1:1 conflict 判定を Mob に適用しない。

### 5.2 Route state と calculation result

Route Planner の返す計算結果は、current session state そのものではない。少なくとも次の二段階を分離する。

1. `Route Calculation Result`: 対象集合の読み取り時点、選択候補、対象順、transitions、補助評価、同順位情報、または calculation failure reason を含む一回限りの結果。
2. `Route State`: 現在 mode（auto/manual）、current auto route または manual order、current transitions 表示、current route validity、Mob ごとの current route-selected location、最後に成功した selection history を含む session-owned state。

Application は calculation result の対象 version と current session version を照合してから adopt する。対象変更後の古い result、計算失敗 result、manual で未確定の selection history を current route として採用しない。Planner は state を直接 mutate せず、Application が mode ごとの採用規則を適用する。

### 5.3 Mob guide generation state

`run`、現在受理済み snapshot の `revision` / `issued-at` は Mob Session の application-owned metadata である。Guide Codec が生成する値ではなく、Application が次の lifecycle を管理する。

- 初期空状態では `run` と世代情報を持たない。
- 最初の valid Mob 登録または初回 valid guide import で `run` を成立させる。生成方法と内部 ID 型は Implementation に残す。
- 「新しい周回」は旧 session state を current root から除いた新しい `run` として開始する。
- guide を正常出力できたときだけ、現在値から次の `revision` と出力時点の `issued-at` を commit する。新しい run の最初の output は `revision: 0` とする。
- guide import または explicit replacement の成功時は incoming の `run` / `revision` / `issued-at` を一括で採用し、初期化しない。
- 保存・reload はこの metadata を保持し、時計時刻を世代判定や次 revision の根拠にしない。

Guide Codec は canonical semantic snapshot を返す。candidate/item 行の出現順ではなく、正規化後の値、`order`、所属、参照、状態、`issued-at` を含む意味上の snapshot を比較できるようにする。

### 5.4 派生状態と一時状態

入力欄の未送信文字列、選択中の modal、loading、copy の一時通知、検証結果の表示通知は UI / Interaction 層の transient state とする。登録済み target、candidate、route、order、confirmation、completion、run metadata は session state とする。UI の transient state を保存対象へ含めず、domain state から表示 projection を再構成する。

画像上の描画位置、色、折りたたみ、現在表示タブ、toast は derived / presentation state であり、route identity、candidate membership、completion を所有しない。

## 6. 内部 lifecycle と主要内部フロー

### 6.1 起動・復元

1. Application が選択 product と対応する master data を要求する。
2. Master Data Access は resource の構造、型、range、参照、公開状態を検証し、利用可能な read model または load failure を返す。
3. Persistence Adapter は product 単位の保存値を読み、syntax、shape、required fields、normalized location、重複、order、candidate/item、completion/confirmation/selection、Mob の `run` / `revision` / `issued-at` を検証する。
4. 保存全体が有効なら session root へ一括復元する。保存全体の一項目でも検証に失敗すれば、部分復元せず、その product の空 current state と復元失敗結果を作る。
5. 保存構造が有効で master 参照だけが解決不能なら、保存された identity、order、completion、confirmation、route selection、run metadata を保持し、該当地点だけを未確認・計算対象外 projection とする。
6. 復元後、current mode に応じて route projection を検証する。必要な auto route が再計算されていない場合、古い route を成功結果として再利用せず、current route validity を明示する。

Corrupt persistence の復元失敗と master mismatch は異なる結果である。前者は保存 snapshot 全体を採用せず、後者は周回 state を保持する。

### 6.2 入力の受理と逐次適用

Interaction Adapter は入力経路を command の種別へ固定する。通常 Mob 行は guide 行にならず、guide block は通常 `mob:` 行の集合へ分解されない。Treasure paste と Mob normal multi-line は、入力経路ごとの parser で解析する。

各 command は次の段階を通る。

1. 構文解析と raw value の length / control character 境界を確認する。
2. Unicode / identifier / coordinate を Specification どおりに normalize する。
3. 対応する master reference、範囲、対象 product、grade を確認する。
4. product domain operation が current session に対する valid / duplicate / conflict / invalid を判定する。
5. 複数行では空行を除く上から下へ working copy へ適用し、後続行から前行の結果を見えるようにする。
6. 行別の結果を保持したまま、実行環境の容量不足等で受理済み行を追加できない場合だけ operation-level rollback を行う。
7. 操作全体が commit 可能なら session state を一度に commit し、current mode に応じた route handling と persistence を行う。

Treasure の完全一致 current target は conflict 判定より duplicate を先に適用する。同一メンバーの異地点は explicit next target でない限り conflict とし、explicit next target だけを sequential queue の規則へ渡す。Mob は同一候補 identity の no-op と別地点の candidate membership append を分ける。UI はこの分類を domain の結果として表示する。

### 6.3 自動 route

自動 route の再算出は、対象変更、master 更新、初回登録などの Application operation から呼び出される。Planner へ渡すのは、未完了かつ有効な対象とその候補集合、必要な master movement data だけである。

- Treasure は各 current target を一つの地点として扱う。
- Mob は各有効 Mob について候補を一つ選ぶ組み合わせとして扱う。
- Planner は map transition count を第一評価とし、同数候補に対して fee と load time の Pareto 関係を適用する。
- 同順位が残れば、Specification の deterministic presentation rule により表示順を安定化するが、表示順を優劣や user confirmation として扱わない。
- 有効な訪問先を一つでも成立できない未完了対象がある場合、部分 route を成功結果にしない。

計算成功時だけ、Application が calculation result を current route、route-selected、transitions、order へ採用する。計算失敗時は失敗理由と該当対象を route status として保持し、失敗した route を current result にしない。登録・削除などの domain mutation と同時に起きた場合、valid な target state の commit と、current route が未算出であることの表示は分けて扱う。最後に成功した selection history は参照用に保持するが、現在の自動 route として出力しない。

### 6.4 Manual order と manual → auto

手動並べ替えは、Progress / Order Operations が current order を manual order として採用する。manual order への追加は既存順を壊さず末尾へ置き、削除・完了は該当 target だけへ適用する。Mob の候補を一つに絞るための暗黙操作は行わない。

手動表示の transitions は、各地点が解決済みのときだけ計算する。採用地点のない Mob、または current master で解決不能な採用地点がある場合、部分的な数字を出さず `unknown` を返す。manual state の最後に成功した route selection は表示上参照できるが、失敗した auto route の結果を新たな selection として採用しない。

「最短ルートを再計算」は two-phase operation とする。

1. 現在の manual snapshot を read-only base として保存する。
2. Planner が全対象・候補を計算し、成功した candidate result を用意する。
3. 成功した場合だけ auto mode、route、route-selected、transitions、order を一括 commit する。
4. 失敗した場合は operation failure とし、manual mode、manual order、candidate membership、user confirmation、completion、manual state の selection、transitions 表示、`revision` / `issued-at`、保存済み state を一切変更しない。

この境界により、失敗した auto result が manual state を破壊せず、既存 manual state が guide 可能なら guide 可能なまま残る。利用者には failure reason を表示する。

### 6.5 Mob guide output

Guide output は、Mob Session の current state と current route validity を Application が検査してから開始する。

1. 有効な `run` と、mode に応じた guide 可能性を確認する。auto の計算不能 state は拒否し、stale route を取り出さない。manual の未確定地点は `unknown` の既存契約に従う。
2. 空 state、全完了 state、通常の未完了 state を区別して canonical snapshot を組み立てる。対象 0 件と全完了は `transitions: 0` とし、全完了 Mob の item と candidate を契約どおり残す。
3. current generation があれば次 revision、初回 output なら `0`、今回 output 時点の UTC timestamp を snapshot に設定する。
4. Guide Codec が singleton、row integrity、percent encoding、order、candidate reference、mode/transitions、全体の grammar を検証し、平文へ serialize する。
5. serialize と clipboard への引渡しが output 成功を返したときだけ、revision / issued-at を session state と persistence へ commit する。失敗時は状態と世代を変更しない。

Codec は block 外の非空文字列、空行、複数 block、singleton の欠落・重複・余分な marker を受け入れない。`candidate` 行の `<地点の意味>` は、candidate identity を current master へ resolve した結果が確定地点なら `confirmed`、それ以外なら `candidate` の一値にする。candidate membership と route selection などを一つの field へ合成しない。

### 6.6 Mob guide import / explicit replacement

Import は text を current session へ直接渡さず、次の段階で扱う。

1. Guide Codec が開始・終了 marker、singleton、line grammar、percent encoding、revision / issued-at の形式を検証する。
2. Snapshot Validator が item/candidate の所属、参照、重複、order、mode、completion、空/全完了例外、候補と identity の一致を検証する。
3. Master Data Access が現在 master へ照合し、解決不能な参照を unresolved / calculation-excluded として注記する。別地点への推測置換はしない。
4. `run` / `revision` と current accepted snapshot の関係を、issued-at の時計順ではなく semantic snapshot と revision で分類する。
5. 通常 import は異なる run を黙って置換しない。異なる run は明示的な「案内で置換」command がある場合だけ次へ進める。
6. 検証済み incoming snapshot を working session として構成し、全体を一括 adopt する。部分的な item/candidate、order、confirmation、completion の反映はしない。

同一 run では lower revision を stale、same revision + same semantic snapshot を duplicate、same revision + different semantic snapshot を conflict、higher revision を newer candidate とする。explicit replacement の成功後は incoming run/revision/issued-at を current accepted generation とし、次回 output は incoming revision + 1 から始める。import 後の再出力は run を変えず、現在 mode と snapshot を出力する。

### 6.7 Completion・empty state・新しい周回

対象の追加、削除、完了、次対象昇格は Progress / Order Operations が行う。route planner や UI の描画結果だけで complete を成立させない。

- run のない初期空 state で最初の valid Mob 登録または初回 guide import が成立したとき、run と初期 auto mode を作る。
- run がある状態で対象 0 件になっても run と mode を保持する。
- 「新しい周回」は旧状態を current から除き、対象 0 件・新 run・auto mode の状態を commit する。
- run のある対象 0 件、または全対象完了は route calculation failure ではない。guide serializer は transitions 0 の valid snapshot を生成する。
- 全完了では各完了 Mob の item を order `-` で残し、未完了 order を作らない。candidate membership も契約どおり保持する。

## 7. Failure containment / atomicity / recovery

### 7.1 操作種別ごとの commit 境界

| 操作 | prepare | 失敗時 | 成功時 |
| --- | --- | --- | --- |
| 単一入力 | parse、normalize、master resolve、domain validation | session を変更しない | domain mutation と必要な route handling を commit |
| 複数行入力 | working copy へ上から下に逐次適用 | 容量等で accepted rows を追加不能なら operation 全体 rollback。通常の invalid/duplicate/conflict 行は no-op として結果を記録 | accepted rows を一括 commit。行別結果は保持 |
| 自動 route 再算出 | 現在 snapshot version を固定して Planner 実行 | failed route を current route にしない。stale result も採用しない | result と version が一致した場合だけ route state を一括更新 |
| manual → auto | manual state を base に候補 route を計算 | mode、order、selection、表示、世代、保存を保持 | auto mode と計算結果を一括採用 |
| guide output | guide-able 検査、revision/timestamp 仮決定、serialize | state、revision、issued-at、保存を保持 | serialized guide と generation metadata を一括 commit |
| guide import | parse、全体検証、master reconciliation、generation 判定 | current state を変更しない | verified incoming snapshot を一括採用 |
| persistence load | raw read、全体検証、master reconciliation | corrupt 全体を採用せず、部分復元しない | validated snapshot を root へ一括復元 |

### 7.2 Calculation failure と stale route

Route failure は、入力・master・補助値・候補不足等の理由を識別できる failure result として Application へ返す。Planner は計算できた対象だけの部分 route を成功と報告しない。

対象変更に伴う auto re-calculation が失敗した場合、登録済み target/candidate と completion 等の domain state は成功した mutation の結果として保持し、current auto route は invalid / uncalculated と表示する。ただし、最後に成功した selection history や既存の確認・完了情報を破棄しない。過去 route は現在 route として表示・guide 出力・completion 更新へ使用しない。

auto state が guide 不可能な場合、Guide Output は失敗し、revision、issued-at、対象、order、confirmation、completion、selection を出力操作の結果として変更しない。manual state は、再計算 failure だけで guide 不可能へ降格させない。

Planner が非同期または将来の実装上遅延する場合も、result に対象 snapshot version を付与し、現在 version と一致しない結果を破棄する。古い計算結果を current state へ適用するための自動再試行や last-wins は採用しない。

### 7.3 Guide と保存の全体原子性

Guide の解析と保存復元は、単一 item や candidate を先に session へ入れず、検証済み snapshot を作成してから一度に適用する。singleton の一つの重複でも、item/candidate の dangling reference 一つでも、block または保存全体を拒否する。

Explicit replacement も同じ全体 commit 境界を使う。incoming run を先に作ってから rows を追加するような部分反映はしない。保存の write failure は「保存成功」として扱わず、Application は persisted state と in-memory state の差異を誤って正常表示しない。具体的な再試行・通知文言は Implementation / Test で検証する。

### 7.4 Master mismatch recovery

保存・guide の構造が有効で、現在 master の map/mob/location/movement reference だけが欠落・更新・不正の場合、Master Data Access は mismatch を返し、Application は元の identity と利用者周回情報を保持する。該当地点を unresolved / calculation-excluded として表示し、別の map、候補、拠点へ推測置換しない。

master classification の更新が candidate から confirmed になった場合は、Mob candidate record の classification projection だけを更新する。candidate membership、user-confirmed、route-selected、complete はその更新だけでは変えない。新たな master candidate は利用者が明示登録・選択するまで既存周回へ追加しない。

## 8. Persistence / master data / runtime responsibility

### 8.1 Persistence boundary

Persistence Adapter は browser persistent storage の読み書きだけを担当する。保存する logical snapshot は product、grade（必要な場合）、対象、normalized location、Treasure の順次関係、Mob の candidate membership/classification/selection/confirmation、completion、current route/manual order、Mob の run/revision/issued-at を含む。初期空状態の run 無しも有効な保存状態として表現できる。

保存しないものは master data 自体、ゲーム内の討伐・開封・移動の事実、chat 投稿結果、参加者情報、認証情報である。具体的な key、serialization envelope、version migration、削除方式は Implementation で定め、product 間の自動変換は行わない。

Write は、domain invariant と保存構造を検証済みの snapshot に対して行う。Read は raw value を untrusted として扱い、構文・shape・semantic invariant の全体検証後だけ root へ渡す。破損データを正常化して書き戻したり、一部だけを旧 state と混ぜたりしない。

### 8.2 Master data boundary

Master Data Access は、地図、stable map/mob identifier、正規別名、位置、候補分類、移動拠点、料金、ロード時間、出典、利用条件を読み取り用の validated data として提供する。static resource のロード失敗、schema mismatch、範囲外、参照切れ、公開前情報は、route や valid target へ昇格させず、該当対象を識別可能な failure / unresolved result とする。

Master data は利用者周回 state を所有しない。master の classification、表示名、画像、補助値の更新は、identity が維持される場合に既存周回を削除・完了解除・確認変更しない。更新後の値で auto route を再評価し、manual order は保持しながら表示可能な補助情報だけを更新する。

### 8.3 Runtime / deployment

v1 の runtime は既存の React / TypeScript / Vite / browser localStorage という browser-only 構成を前提とする。UI と state binding の具体実装は下流へ残すが、server、database、同期通信、認証、participant-facing UI は追加しない。clipboard への copy は利用者の明示操作の補助であり、game chat への送信ではない。

既存実装の確認結果として、現状は Treasure 寄りの Zustand store、Treasure chat parser、距離計算 utility、static JSON loader を中心に構成されている。これは approved Design の根拠ではない。Implementation では、既存 Treasure の互換挙動を検証しつつ、Mob session、guide lifecycle、full snapshot persistence、失敗原子性を product 境界の内側へ追加・再編成する必要がある。既存の部分的な保存情報を Mob state として流用せず、既存 Treasure 保存の扱いは validation と compatibility 方針を明示したうえで実装する。

## 9. Security responsibility と observability

### 9.1 Security responsibility

- Parser は許可した文字、区切り、行数・値の範囲を検証し、未知行、制御文字、malformed percent-encoding、未対応形式を fail closed にする。
- guide は block 全体を検証し、singleton の first-wins / last-wins、部分 import、推測変換を行わない。
- 保存データと static JSON は parse 後に型・参照・domain invariant を検証し、異常時に code execution や partial trusted state を作らない。
- 利用者入力、mob name、map name、guide field は text として表示し、HTML、script、`eval` 相当の解釈を行わない。
- percent encoding の encode/decode は field boundary を維持し、区切りや改行を decoded field から再び構文へ混入させない。
- master mismatch は未確認・計算対象外に留め、別地点の自動選択や完了・確認への昇格を行わない。
- localStorage や guide に認証情報、server session、cryptographic credential を導入しない。

### 9.2 利用者向け error と内部診断

Application は、invalid/conflict/duplicate、guide malformed/stale/conflict/newer、master mismatch、route calculation failure、persistence restore failure、manual→auto failure を利用者が区別できる結果へ変換する。エラー表示は raw input 全文、保存 payload、不要な個人情報を再掲しない。

内部診断は、操作種別、対象の安定 identifier、failure category、snapshot version など最小限の情報に限定する。clipboard や browser storage の内容を無制限にログへ出さない。具体的な logging API、画面文言、計測基盤は導入せず、必要な診断は UI 通知と開発時検証の範囲に留める。

## 10. Design decisions と trade-off

### 10.1 Product ごとの aggregate root を分ける

Treasure の 1:1 current target と Mob の 1:多 candidate membership は、同じ lifecycle と invariant を持たない。そのため、共通の画面 shell や location normalization は共有しても、Treasure Session と Mob Session は別 root とする。これにより product 間の誤変換を防げる代わりに、共通 UI から各 product command への接続を個別に持つ必要がある。

### 10.2 Candidate の意味を分離して guide で一値へ射影する

候補集合、master classification、route selection、user confirmation、completion を別の state ownership とし、Guide Codec が current master classification だけを candidate row の単一の地点の意味へ射影する。これにより confirmed 地点も candidate set に残ること、classification 更新が他 state を変更しないことを保持できる。新しい複合 enum で統合する案は、外部意味と更新 lifecycle を隠すため採用しない。

### 10.3 Planner を read-only、Application を commit owner とする

Route algorithm が session を直接書き換えると、計算 failure、stale result、manual state 保持、route-selected と history の分離を保証しにくい。Planner は候補を比較して result を返すだけにし、Application が snapshot version、mode、成功条件を確認して adopt する。これにより failure containment が明確になる一方、Application 側に adopt 判定の責務が集約される。

### 10.4 Plan-then-commit を複数行・guide・再計算に共通適用する

複数行入力の逐次 semantics と operation-level atomicity、guide の全体拒否、manual→auto の失敗保持は、raw input を直接 store へ逐次書込みする方法では守りにくい。working snapshot と検証済み result を作り、commit 可能な場合だけ公開 state と persistence を更新する。通常 multi-line の invalid/duplicate/conflict を個別 no-op とする契約は working copy の row result へ残し、容量等の operation failure だけ全体 rollback とする。

### 10.5 現在 route と選択履歴を分ける

Spec は最後に成功した Mob の採用地点を manual state で参照可能にしつつ、計算失敗した route を現在 route として再利用することを禁じる。current route state と selection history を分けることで、履歴の保持と stale route 禁止を同時に満たす。履歴は display provenance であり、未確認地点の自動採用や guide の成功を意味しない。

### 10.6 Persistence を単一の外部境界に閉じ込める

v1 は browser-only であり、server persistence や同期を必要としない。Storage API を Application/domain から隔離し、validated product snapshot の read/write に限定する。既存 storage の key や envelope は下流で決めるが、Treasure/Mob の非互換境界と corrupt 全体拒否は設計制約として固定する。

## 11. Upstream ambiguity / Specification gap

### 11.1 判定

現時点で、Design を完了するための `Upstream ambiguity` または `Specification gap` はない。Specification Review 004 が `READY` であり、外部結果を一意に判定するための主要契約（master classification の guide 表現、singleton、Treasure duplicate/conflict precedence、manual→auto failure atomicity、empty/completed snapshot、explicit replacement の revision continuity）が確定しているためである。

Design 中に「合理的な二つの実装が同じ入力・状態から異なる利用者可視結果を返す」不足が新たに見つかった場合は、本書で内部都合により補完せず、次の文書工程へ戻す。既存実装との差や exact algorithm の選択は、それだけでは upstream gap とは扱わない。

## 12. Design decision pending

論理責務、state ownership、依存方向、failure/atomicity boundary に未決定の Design decision はない。下記は Design pending ではなく、承認済み契約を保ったまま Implementation / Test で決める実装詳細である。

- concrete module/file/class/function names、TypeScript の完成 interface、Zustand の具体 slice と action code。
- parser の具体的な正規表現・lexer、JSON schema の完成形、validation library の選択。
- route の探索アルゴリズム、内部 graph/combination 表現、計算量最適化、cache の有無。ただし外部評価順・tie・failure semantics は変更しない。
- localStorage の具体 key、serialization envelope、migration/read-write API、clipboard API の実装。
- React component の JSX/CSS、地図画像座標の具体変換、exact error message、テスト fixture/code、CI。

## 13. Implementation / Test handoff

### 13.1 Implementation handoff

Implementation は、まず Application が product-specific session root と operation commit boundary を所有する構造を用意する。そのうえで次を実装する。

- Treasure の current target と sequential pending queue、および 1:1 duplicate/conflict/next-target rules。
- Mob の Mob target、candidate membership、current master classification、selection、confirmation、completion の分離。
- normalization、master resolve、通常 multi-line の上から下の逐次適用、row result と operation-level rollback。
- route planner の candidate selection と map transition / fee / load time / tie semantics、route state の採用処理、snapshot version による stale 防止。
- manual order の保持、manual→auto の success-only commit、failure reason の表示、failed route の history/current 分離。
- Guide Codec の singleton、marker、percent-encoding、canonical semantic snapshot、item/candidate integrity、empty/all-complete snapshot、generation comparison、explicit replacement。
- Persistence Adapter の全体 validation、product separation、run/revision/issued-at continuity、master mismatch reconciliation。
- UI は Application の projection と operation result を表示し、domain state を直接確定しない。

既存の Treasure-centric store/parser/route utility は再利用可能性を個別に評価する。既存実装が approved Specification に反する場合、その挙動を Design の根拠にせず、必要な変換・互換 adapter・置換を Implementation で決める。Treasure の既存保存を Mob snapshot として読む migration は行わない。

### 13.2 Test handoff

Test は Specification の Acceptance と次の内部境界を外部結果へ結び付けて検証する。

- Treasure 1:1、sequential promotion、完全一致 duplicate 優先、異地点 conflict、explicit next target。
- Mob 1:多、同一地点 duplicate、別地点 append、master confirmed/candidate、candidate→confirmed 更新後の他 state 保持、確認・採用・完了の非昇格。
- normalization、height 非依存、master mismatch、候補不足、計算不能、同順位、transition-first evaluation。
- manual order の追加・削除・完了、未確定 Mob の `unknown`、manual→auto success/failure の atomicity と reload。
- 複数行の上から下の逐次適用、valid/duplicate/invalid/conflict の混在、容量不足時の operation rollback。
- guide の singleton 重複・欠落・複数 marker、row integrity、empty/all-complete snapshot、auto failure の output prohibition。
- same run の stale/duplicate/conflict/newer、different run の通常拒否と explicit replacement、replacement 後の output `revision + 1`、save/reload continuity、clock skew 非依存。
- corrupt persistence の全体拒否と master-only mismatch の state 保持。

具体的な unit/integration/browser test、fixture、性能測定、test framework は Test/Implementation で定める。docs-only の本作業ではアプリ本体の lint、unit test、build を実行しない。

## 14. Out of Scope / Traceability

### 14.1 Out of Scope

本 Design では、Specification の対象外に加えて、次を設計判断として追加しない。

- protocol v2、別の共有方式、server session、account/authentication、署名・checksum・暗号化。
- 3D/height-based routing、新しい route 評価軸、database schema、generic repository、state machine class、event bus、plugin architecture。
- 参加者向け共有画面、game client integration、chat auto-post、telemetry/analytics。
- Specification にない新しい input、public field、state meaning、fallback、cross-product conversion。

### 14.2 Specification → Design traceability

| Specification | Design での受け皿 | downstream handoff |
| --- | --- | --- |
| §1 適用範囲・責任境界 | §1、§2、§3、§4.2 | UI/配備は v1 boundary を保持 |
| §2 用語・状態意味 | §5.1、§5.2、§4.3 | presentation は意味を合成せず表示 |
| §3 入力・正規化・複数行原子性 | §6.2、§7.1、§9.1 | parser、schema、具体 error は Implementation/Test |
| §4 Treasure 1:1・順次対象 | §5.1、§6.2、§6.7 | concrete domain model と UI は Implementation |
| §5 Mob 候補集合・分類・確認・完了 | §4.1、§5.1、§6.3、§7.4、§8.2 | candidate record/projection の実装と表示検証 |
| §6 route 評価・同順位・計算不能 | §5.2、§6.3、§7.2、§10.3/10.5 | 探索 algorithm と performance は Implementation/Test |
| §7 lifecycle・manual/auto・empty/completed | §6.4、§6.7、§7.1/7.2 | UI command と transition test |
| §8 guide output/import/revision/replacement | §5.3、§6.5/6.6、§7.3、§10.2 | codec/parser と interoperability test |
| §9 保存・互換性・reload | §6.1、§7.3/7.4、§8.1 | concrete key/envelope/migration と persistence test |
| §10 master data・更新・不整合 | §3.2、§6.1、§7.4、§8.2 | static data schema/loader と mismatch test |
| §11 error・security・禁止動作 | §3.2、§7、§9 | sanitization、fail-closed、failure UI の test |
| §12 Acceptance | §13.2 の test handoff | Acceptance ごとの実装・検証を行う |
| §13 下流引継ぎ | §12、§13 | Design choice と Implementation detail を分離 |

### 14.3 Requirement traceability

主要な Requirement との対応は次の通りである。

| Requirement | Design の対応 |
| --- | --- |
| REQ-F-001 / REQ-F-003 / REQ-F-004 | §4.2、§5.1、§10.1。product root と Treasure 1:1 / Mob 1:多を分離 |
| REQ-F-006 / REQ-F-007 | §5.2、§6.3、§7.2。Planner、route state、tie、failure を分離 |
| REQ-F-008 / REQ-F-009 | §5.1、§6.2、§6.4、§6.7、§7.1。progress/order と atomic commit |
| REQ-F-010 / REQ-S-003 / REQ-S-004 | §1.3、§8.3、§14.1。共有 UI、同期、chat auto-post を対象外 |
| REQ-F-011 / REQ-F-012 / REQ-D-005 | §5.3、§6.5/6.6、§7.3、§9.1。guide codec と generation state |
| REQ-F-013 / REQ-S-005 / REQ-S-006 | §3.2、§7.4、§8.2。master access、検証、管理データの非所有 |
| REQ-F-014 / REQ-D-007 | §6.1、§7、§8.1、§9。保存全体拒否、mismatch 保持、untrusted boundary |
| REQ-D-001 | §2.2、§6.2、§8.2。location normalization と master resolve |

### 14.4 参照資料

- [Concept](../concept/concept.md)
- [Requirements](../requirements/requirements.md)
- [Requirements Review 005](../reviews/requirements/requirements-review-005.md)
- [Specification](../specification/specification.md)
- [Specification Review 004](../reviews/specification/specification-review-004.md)
- `AGENTS.md` と `design-author` Skill は作業ルールであり、外部契約の追加根拠ではない。
