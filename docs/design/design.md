# Treasure Compass / Mob Compass 基本設計

| 項目 | 内容 |
| --- | --- |
| Status | Design Author Revision 005（動的エーテライト表示・ローカライズ境界を反映、Design Review 005 待ち） |
| 対象 | Treasure Compass / Mob Compass v1 |
| 直接の上流 | [Specification](../specification/specification.md) |
| 上流の承認状態 | [Specification Review 009](../reviews/specification/specification-review-009.md) は `READY` |
| 文書の責務 | 承認済み Specification の外部契約を変えず、モノレポ構成、内部責務、状態・データ所有、依存方向、失敗・復旧境界を定める |

## 1. 目的、対象、対象外

### 1.1 目的

本 Design は、独立した Treasure Compass と Mob Compass を一つのモノレポで構築し、両アプリが同じ意味の地図操作と巡回操作を提供するための内部構造を定める。Treasure の既存外部仕様を維持しながら、Mob のソロ／パーティを独立した状態境界として新設する。

本書は、次を Design 上の不変条件とする。

- Treasure と Mob は、利用者が異なるアドレスから直接開く別アプリである。具体的な URL 文字列と配備先は決めない。
- Treasure、Mob ソロ、Mob パーティは独立した session root と永続化境界を持つ。
- 地図表示、地点選択、二次元座標、巡回順、完了・取消の共通意味だけを共有する。対象登録や進行の固有規則は各アプリが所有する。
- Mob ソロは一般モブから B モブまで、Mob パーティは A モブ以上だけを扱う。
- Z は地点識別、表示、登録および経路評価に用いない。
- 手動順序は明示的な経路自動計算と保存の成功まで維持する。
- 保存失敗時は、操作前の最後に正常保存された状態を画面と保存先の双方で維持する。
- 静的 JSON、localStorage、利用者入力は、検証を通過するまで信頼しない。
- 通常の地図表示と地点選択表示は、同じ表示対象マップの全ての有効なエーテライトを、session state と独立した案内 overlay として継続表示する。
- エーテライト案内は共通 map master の検証済み projection だけから作り、案内アイコン・町名ラベルを操作対象または保存対象にしない。
- 初期リリースの表示名は日本語とし、内部の名称解決境界は安定 ID と言語別表示名の対応を維持する。

### 1.2 対象

- 二つのブラウザアプリと共有パッケージからなるモノレポの論理構成。
- Treasure、Mob ソロ、Mob パーティの状態所有と操作調停。
- 共通地図基盤、経路計算、マスターデータ読込、保存・復元の責務境界。
- 地図・エーテライト、Treasure、Mob の静的マスター形式、検証済み projection と参照関係。
- 現行 Treasure データと保存状態からの移行境界。
- 320 CSS px 以上を含むレスポンシブ UI の構造。

### 1.3 対象外

- 具体的な URL、ドメイン、配備先、CDN および公開手順。
- Mob のチャット解析、一括登録、専用マクロ、共有同期およびゲーム状態の自動取得。
- サーバー、認証、アカウント、外部送信、計測および長期履歴。
- 実装コード、具体的な React コンポーネント名、関数シグネチャ、CSS 値、テストコード。
- 現行データに存在するだけで利用目的を確認できない項目・レコードの新仕様化。

## 2. 根拠と現行資産の評価

### 2.1 根拠と工程境界

直接の規範的根拠は [Specification](../specification/specification.md) である。[Requirements](../requirements/requirements.md) と [Concept](../concept/concept.md) は意図と責任境界の確認に用いる。現行実装、テスト、JSON および画像は、互換性と移行可能性を調べる補助資料であり、新しい仕様を決める根拠にはしない。[Design Review 004](../reviews/design/design-review-004.md) までの DR-005〜DR-008 は既存設計の解消済み判断として維持する。

現行 JSON には実装から参照されない項目と設定から到達できないデータがある。そのため、既存形式をそのまま共通マスターへ昇格させず、参照実績、上流上の必要性、出典・利用条件を個別に確認してから移行する。

### 2.2 現行 JSON と実装の照合結果

現行 Treasure JSON は、概ね `mapSize`、`mapData[]`、各 map の属性、汎用 `point[]` からなる。同じ `point[]` に宝箱候補とエーテライト等が混在する。v1 の新マスターでは責務別に分離する。

| 現行要素 | 現行で確認できた用途 | 新マスターでの扱い |
| --- | --- | --- |
| `mapSize` | 画像への描画座標変換 | `minX/minY = 1`、`maxX/maxY = 1 + mapSize / 10` の座標範囲へ変換し、旧値自体は保持しない |
| `mapNo` | グレード内の map 識別 | 安定した map ID へ置換し、旧保存移行用の対応表だけを保持 |
| `mapName` / `mapNameShort` | 表示、Treasure チャット照合・出力 | map の正式名・短縮名として移行 |
| `pointNo` | グレード内の地点識別、表示 key | 安定した地点 ID へ置換し、旧保存移行用の対応表だけを保持 |
| `division=P` | 宝箱候補 | Treasure point として移行候補 |
| `division=T` | エーテライト | 検証後、共通 map master の aetheryte projection として移行候補 |
| `posX` / `posY` | 描画、入力照合、表示、経路 | 10 倍値をゲーム座標へ変換して移行 |
| `pointName` | 地点・エーテライトの表示 | 検証済み T の日本語表示名として移行候補 |
| `posZ` | 旧距離関数の高さ | 新マスターへ移行しない。v1 は X/Y のみ |
| `time` | 現行 JSON に値はあるが、現行経路処理からの参照なし | ロード時間へ転用しない。別の検証済み情報源から登録する |
| `region` / `block` / `posT` | 実行時参照を確認できない | 移行しない |
| `division=R` | `g10.json` に存在するが現行 UI・経路から到達しない | 検証済みでも v1 の共通地図情報へ移行しない |
| `division=Z` | 型には存在するが現行 JSON で実レコードを確認できない | 移行しない |

`GRADE_CONFIG` から参照される `g8`、`g10`、`g12`、`g14`、`g17` だけを Treasure の移行入力候補とする。`g11.json` と対応画像は現行設定から到達できず、`g12` との関係も外部契約から確定できないため、自動移行しない。後から採用する場合は、対応グレード、地点、画像、出典および重複関係を別途承認する。

現行 Mob 試作は `/json/mobs.json` を要求するが、対応ファイルは存在しない。また現行のチャット案内、地点分類、利用者確認、Z 入力は承認済み Specification に含まれない。新 Mob 設計への移行対象にしない。

## 3. システム構成と依存方向

### 3.1 モノレポの論理単位

```text
Treasure App ──┐
               ├── Application-shared contracts ── Map UI
Mob App ───────┘                 │                  │
       │                         ├── Route Core ────┘
       │                         ├── Master Data Model
       │                         └── Persistence ports
       └── Mob-specific domain

Treasure App ───── Treasure-specific domain

Static master assets ── validated adapters ── application/domain read models
Browser storage ─────── persistence adapters ── session snapshots
```

pnpm workspace の root から二つの Vite application を個別に build できる構成とし、次の workspace package へ分ける。

| 配置 / package | 責務 |
| --- | --- |
| `apps/treasure-compass` / `@treasure-compass/treasure-app` | Treasure の Vite entry、shell、登録入口、一括入力、session coordinator、永続化 adapter、表示 projection |
| `apps/mob-compass` / `@treasure-compass/mob-app` | Mob の Vite entry、shell、ソロ／パーティ切替、検索・フィルタ、登録、各 session coordinator、永続化 adapter、表示 projection |
| `packages/treasure-domain` / `@treasure-compass/treasure-domain` | 8 枠、地点置換、チャット入力適用、完了、順序の Treasure 固有規則 |
| `packages/mob-domain` / `@treasure-compass/mob-domain` | ランク別登録、候補集合、一般モブ採用、B 探索、パーティ地点置換の固有規則 |
| `packages/map-core` / `@treasure-compass/map-core` | map/座標 value、map group 順序、同一 map 内の二次元経路、同率判定を行う純粋計算 |
| `packages/map-ui` / `@treasure-compass/map-ui` | 地図画像、通常表示・地点選択表示の marker/route、共通エーテライト案内 overlay、地点選択 dialog、pan/zoom とレスポンシブ表示 |
| `packages/master-data` / `@treasure-compass/master-data` | repo 管理 JSON・画像、schema、validator、検証済み map projection、legacy lookup と移行 report。`division=T` の採用と `division=R` の除外を所有する |

Treasure application と Mob application は相互依存しない。`map-core` は他 workspace package に依存しない。`map-ui`、`master-data`、各 product domain は `map-core` の公開 value/contract だけへ依存できる。各 application は必要な共有 package と自 product domain に依存する。`treasure-domain` と `mob-domain` は相互依存しない。Map UI は検証済み map projection、overlay projection と明示的な UI event を扱い、JSON や session aggregate を直接解釈しない。案内 overlay から application coordinator へ状態変更 command を逆向きに発行しない。

master の正本は `packages/master-data/data/` の `map-master.v1.json`、`treasure-master.v1.json`、`mob-master.v1.json` に分ける。地図画像は `packages/master-data/assets/maps/`、旧保存用対応表は `packages/master-data/migration/legacy-treasure-map.v1.json`、変換 report は `packages/master-data/reports/` に置く。build 時に各 app が必要な検証済み JSON と画像だけを静的 asset として出力する。report と移行元 JSON は runtime asset に含めない。

### 3.2 実行時責務

| コンポーネント | 所有・責務 | 所有しないもの |
| --- | --- | --- |
| App shell / presentation | app・mode・tab の表示、入力収集、command 発行、結果表示 | domain 判定、JSON 解釈、storage 操作 |
| Session coordinator | working state の作成、domain operation、必要な経路計算、保存、公開 state の採用を順に調停 | route algorithm、描画、未検証値の補完 |
| Domain operation | 操作前後の invariant、対象・進捗・順序の状態遷移 | browser API、非同期処理、画面表示 |
| Route planner | 固定 snapshot から success / tie / failure を返す読み取り専用計算 | session commit、保存、UI 通知 |
| Master adapter | JSON の構文・schema・参照・範囲を検証し、共通 map projection と app 固有 read model を作る。T のみを aetheryte projection に通し、R と無効・重複 record を除外する | session 変更、欠損値の推測、表示上の配置 |
| Aetheryte overlay | map projection と viewport projection から、アイコンと町名ラベルの案内表示を組み立てる。通常表示と地点選択表示で同じ入力・配置責務を共有する | master 検証、route/session 状態、登録・選択 command |
| Persistence adapter | snapshot の serialize、検証、原子的な logical read/write/delete | domain の部分復元、route 計算 |

依存は presentation → application → domain/port の一方向とし、browser storage、fetch、React 等の環境依存は adapter に閉じ込める。domain と route core は環境 API を参照しない。

### 3.3 二つのアプリの公開単位

Treasure と Mob は別々の HTML/JavaScript entry を生成できる build target とする。各 target は、もう一方の shell や Zustand store を起動せず、必要な共有 package と自アプリの package だけを読み込む。配備設定が各 entry に異なるアドレスを割り当てる。具体的な文字列は本 Design の決定事項にしない。

v1 の Treasure entry は、運用中 Treasure が使用する localStorage と同じ browser origin から配備する。path や entry 名は変更できるが、origin を変更する release は、旧 key を読める別の承認済み移行 boundary が Design に追加されるまで行わない。Mob entry の origin は Treasure 保存の互換性に影響しないため、この制約の対象外である。

## 4. マスターデータ設計

### 4.1 分割原則

汎用 `point[]` は廃止し、次の三つの論理 master に分ける。

1. map master: 両アプリが使う map、座標範囲、画像、エーテライト、map 間移動補助値。
2. Treasure master: grade set と宝箱候補地点。
3. Mob master: モブ名、別名、rank、出現 map、候補地点。

各 JSON は `schemaVersion` と `dataRevision` を必須とする。`schemaVersion` は decoder の互換形式、`dataRevision` は同じ schema 内のデータ改訂を示す。v1 は `schemaVersion: 1` とする。未知フィールドを黙って保存・転送する拡張形式にはせず、各階層を allow-list で厳密に検証する。

ID は entity 種別内で一意な安定文字列とし、表示名、配列位置、座標から実行時に生成しない。名称・座標の訂正後も同一対象なら ID を維持する。別対象へ意味が変わる場合は新 ID とする。

### 4.2 map master

```json
{
  "schemaVersion": 1,
  "dataRevision": "2026-09-11.1",
  "expansions": [
    {
      "id": "expansion-id",
      "name": "拡張名",
      "order": 1,
      "sourceIds": ["source-id"]
    }
  ],
  "maps": [
    {
      "id": "map-id",
      "name": "正式名",
      "shortName": "短縮名",
      "aliases": [],
      "expansionId": "expansion-id",
      "sourceIds": ["source-id"],
      "bounds": { "minX": 0, "maxX": 42, "minY": 0, "maxY": 42 },
      "image": { "asset": "relative-asset-name", "licenseId": "license-id" },
      "aetherytes": [
        {
          "id": "aetheryte-id",
          "name": "エーテライト名",
          "x": 10.5,
          "y": 20.5,
          "sourceIds": ["source-id"]
        }
      ]
    }
  ],
  "travelEdges": [
    {
      "fromMapId": "map-id",
      "toAetheryteId": "aetheryte-id",
      "fee": 100,
      "loadTime": 5,
      "sourceIds": ["source-id"]
    }
  ],
  "sources": [
    {
      "id": "source-id",
      "label": "出典名",
      "reference": "確認可能な参照",
      "verifiedAt": "2026-09-11"
    }
  ],
  "licenses": [
    { "id": "license-id", "name": "利用条件名", "notice": "必要な表示" }
  ]
}
```

上記および 4.3、4.4 の値は構造例であり、座標、料金、ロード時間、名称、revision を実データとして採用する根拠にはしない。各値は 6 章の移行 gate または新規データの確認を経て確定する。`sources` と `licenses` は結合 master context の共通 catalog であり、Treasure/Mob master の `sourceIds` もこの catalog を参照する。

この構造例の aetheryte `name` は master 入力側の名称表現を示すためのものであり、実行時には Master adapter が stable ID に対応する言語 keyed な表示名を含む aetheryte projection へ変換する。raw master の field 形状と projection の内部表現を混同しない。

各 expansion、map、aetheryte、travel edge、grade set、Treasure point、mob、mob candidate の `sourceIds` は必須かつ一件以上とし、同じ ID を重複させない。すべての ID は共通 `sources` catalog の有効 record を参照しなければならない。`sourceIds` は名称、分類、座標、参照関係等の意味情報を確認・訂正する根拠を表し、画像の利用条件を表す `licenseId` とは分離する。

- `bounds` は X/Y の包含範囲であり、有限数かつ `min <= max` とする。
- map の `name` と `shortName` は Treasure の既存チャット照合へ供給し、`aliases` は明示登録された別名だけを持つ。
- `image.asset` は実行時 asset への相対参照で、map ごとに一つの正規画像を参照する。同じ画像の再利用は、実データと利用条件を確認した場合だけ行う。
- aetheryte の X/Y は map bounds 内に置く。巡回地点を持つ map には一つ以上必要である。
- `travelEdges` は出発 map から到着 aetheryte への有向 edge である。`fee` は 0 以上の整数、`loadTime` は 0 以上の有限数で、比較単位を全レコードで統一する。
- 初回 map への到達は map 間遷移回数に含めない。異なる map group 間の移動だけが edge を消費する。必要な edge の欠落をゼロ値で補わない。

`loadTime` は経路比較用の同一基準による値であり、現行 JSON の `time` を転用しない。料金とロード時間は独立した軸として保持し、重み付け値を master に持たせない。

Master adapter は raw map record から、アプリが参照する検証済み map projection を一度だけ生成する。aetheryte projection は stable ID、所属 map ID、canonical X/Y、言語別表示名の対応を持ち、v1 では日本語表示名を必須とする。raw record の `division` は adapter 内の検証境界に留め、検証済み `division=T` だけを projection へ通し、`division=R` は検証済みでも projection、表示、参照および経路入力へ渡さない。stable ID が衝突した場合は衝突する全 record を除外し、別の有効 record の projection 生成を妨げない。

言語別表示名の解決は stable ID から projection の表示名集合を参照する責務とする。初期リリースの active language は日本語だけであり、表示名がない場合に別言語の文字列を翻訳・推測して補わない。map、aetheryte、Treasure および Mob の名称は、将来の追加言語を妨げない言語 keyed な read-model 境界で扱うが、言語選択や多言語 UI はこの Design の v1 実装対象に含めない。

地図画像は map projection の背景 asset であり、案内情報の正本ではない。configured な G8、G10、G12、G14、G17 の対応画像は、採用 gate の時点で埋め込み町名・エーテライト表示を除いた状態を確認し、同じ projection の案内表示と重複させない。画像の出典・利用条件は `licenseId` と source catalog の確認結果が揃うまで runtime asset として採用しない。

### 4.3 Treasure master

```json
{
  "schemaVersion": 1,
  "dataRevision": "2026-09-11.1",
  "gradeSets": [
    {
      "id": "grade-set-id",
      "label": "G14 / G15",
      "grades": [14, 15],
      "sourceIds": ["source-id"],
      "points": [
        {
          "id": "treasure-point-id",
          "mapId": "map-id",
          "label": "地点名",
          "x": 10.5,
          "y": 20.5,
          "sourceIds": ["source-id"]
        }
      ]
    }
  ]
}
```

Treasure master は map 名、画像、エーテライトを重複保持せず、map master の stable ID を参照する。`grades` は複数のゲーム内 grade が同じ候補集合を共有する現行ラベルを表現する。grade set ID、point ID、map ID の組を、旧保存データからの移行と新 session の参照に用いる。

### 4.4 Mob master

```json
{
  "schemaVersion": 1,
  "dataRevision": "2026-09-11.1",
  "mobs": [
    {
      "id": "mob-id",
      "name": "正式名",
      "aliases": ["別名"],
      "category": "regular",
      "rank": "normal",
      "mapId": "map-id",
      "sourceIds": ["source-id"],
      "candidates": [
        {
          "id": "mob-candidate-id",
          "x": 10.5,
          "y": 20.5,
          "sourceIds": ["source-id"]
        }
      ]
    }
  ]
}
```

- `category` は `regular | elite`、`rank` は `normal | b | a | s | ss` の閉じた集合とする。
- `regular` は `normal`、`elite` は `b | a | s | ss` と整合しなければならない。
- mode eligibility は rank から導出し、重複した `mode` 属性を保存しない。ソロは `normal | b`、パーティは `a | s | ss` である。
- 拡張エリアは参照 map の `expansionId` から導出し、Mob 側へ重複保持しない。
- candidate はすべて同じ「出現候補地点」である。旧試作の `confirmed | candidate` 分類、利用者確認フラグ、自由座標、Z は持たない。
- 一つの mob は一つの map に属し、一つ以上の有効 candidate を必要とする。

### 4.5 結合版と revision

アプリが route と session reconcile に使う validated master context は、読み込んだ map master と自アプリ固有 master の組である。結合版の identity は両方の `schemaVersion` と `dataRevision` の tuple から決める。片方だけ更新された場合も別 identity とし、旧計算結果を採用しない。

JSON を一ファイルに bundle するか個別に fetch するかは Implementation で選べる。ただし論理的な revision と障害境界を失わず、Treasure master の障害が Mob 固有データを、Mob master の障害が Treasure 固有データを直接無効化しない構成にする。

## 5. マスター検証、読込、訂正

### 5.1 検証順序

Master adapter は次の順で検証する。

1. JSON 構文、root object、`schemaVersion`、`dataRevision`。
2. allow-list による field、型、有限数、enum、文字列および配列 cardinality。
3. 同じ entity 種別内の ID 一意性。
4. map、expansion、aetheryte、source、license の参照整合性と、各意味 record の一件以上の出典対応。
5. X/Y の map bounds 包含、rank/category 整合、巡回 map の aetheryte 必須条件。aetheryte は検証済み `division=T`、非空の日本語町名、有限 X/Y を満たすものだけを候補にする。
6. aetheryte の stable ID 衝突を全件除外し、その他の有効 record から共通 map projection を生成する。`division=R` はこの projection に入力しない。
7. app 固有 master と map master の結合整合性。

root envelope または未知 `schemaVersion` が不正なら、その論理ファイル全体を利用不可にする。record 単位の不正は、不正 record とそれに依存する record を除外し、他の独立した有効 record は利用できる。重複 ID は配列先頭を採用せず、衝突する全 record を除外する。未知参照、範囲外座標、非有限数、空の必須文字列を推測修正しない。

UI へは、利用不能なファイル、除外した対象または地点、理由を区別した diagnostic projection を渡す。内部 stack、JSON 全文、保存内容を表示・log しない。

Master adapter が生成した aetheryte projection は、grade set や product master の複製ではなく、正規 map ID に一つだけ属する read model とする。除外された R、無効、参照不能、範囲外または重複 record は diagnostic に理由を残すが、aetheryte projection や overlay の入力へ戻さない。

### 5.2 部分障害

- map master が利用不能なら両アプリの地点登録・経路を成立させられないため、既存 session を変更せず master 読込失敗を表示する。
- Treasure master だけが利用不能なら Treasure の登録・経路を停止するが、Mob app は map/Mob master が有効なら利用できる。
- Mob master だけが利用不能なら Mob の登録・経路を停止するが、Treasure app は map/Treasure master が有効なら利用できる。
- travel edge の不足・不正があっても、マップ間遷移回数の第一評価だけで全体経路が一意になる場合は、補助情報不足 warning を持つ route success とする。第一評価後に複数候補が残り、不足値なしでは Pareto 比較を完了できない場合だけ route failure とする。一つの map 内だけの経路まで無効にしない。
- 一部 record の除外後も利用可能な候補一覧を表示し、除外理由を利用者が識別できるようにする。
- aetheryte record の部分除外後も、同じ map の他の有効な aetheryte projection は overlay と route の入力として利用する。全件が除外され対象 map に有効な aetheryte がない場合だけ、既存の master 不備・経路計算不能境界へ渡す。

### 5.3 更新と既存 session の照合

Master 更新後は stable ID で session reference を解決する。解決できた対象は名称・座標を新 read model から表示し、登録、完了、探索を維持する。解決不能 reference は session 内に unresolved として保持し、route から除外する。近い座標や同名対象へ自動置換しない。

Master revision が変わった場合、coordinator は新しい map projection を overlay と route の入力へ切り替え、session の aetheryte 案内表示状態を保存・復元しない。session が参照する current location が解決不能になった場合は既存の reconcile 規則で unresolved とし、別のエーテライトへ自動置換しない。

一般モブまたは B モブを再選択した場合だけ、現行 master の候補集合と照合し、新 candidate を追加する。既存 candidate の探索状態は ID が同じなら維持する。消えた candidate は unresolved のまま残す。削除・全消去以外で利用者進捗を黙って失わない。

## 6. 現行静的データからの移行

### 6.1 対象と変換

移行 tool は、現在 `GRADE_CONFIG` から参照される `g8`、`g10`、`g12`、`g14`、`g17` だけを入力 allow-list として扱う。暗黙の glob で全 JSON を採用しない。

| 現行値 | 変換先 |
| --- | --- |
| grade 設定 | Treasure grade set |
| `mapNo` | 設計時に割り当てた stable map ID と legacy lookup |
| `pointNo` | 設計時に割り当てた stable point/aetheryte ID と legacy lookup |
| `division=P` | Treasure point |
| `division=T` | 検証後に共通 map master の aetheryte projection |
| `mapName` / `mapNameShort` / `pointName` | 対応する表示名 |
| `posX / 10`、`posY / 10` | canonical game X/Y |
| `mapSize / 10` | 旧描画領域を再現する map 座標範囲の変換根拠 |

現行描画の正規化位置は `u = (x - 1) / (mapSize / 10)`、`v = (y - 1) / (mapSize / 10)` で再現できることを migration fixture で確認する。新 master は 10 倍済み内部座標ではなく、表示と距離評価に使う game X/Y を canonical value とする。

`region`、`block`、`posT`、`posZ`、`time`、`division=R/Z` は変換しない。`division=R` は現行データ上の意味が確認できても v1 の共通 map projection から除外し、その理由を report に記録する。`g11` は対象外として report へ記録する。画像は設定から参照される実行時画像だけを候補とし、map identity、実参照、内容、出典、license を確認してから新 map asset に関連付ける。configured な G8、G10、G12、G14、G17 の対応画像では、埋め込み町名・エーテライト表示が残っていないことを確認する。

同じ map が複数の configured JSON に現れる場合、名称だけで自動統合しない。画像の同一性、座標範囲、正式名・短縮名、エーテライト ID・名称・X/Y が一致することを確認して初めて一つの stable map ID へ統合する。不一致は変換 report の conflict とし、解消されるまで関係 record を採用しない。Treasure point は同一座標でも grade set ごとの地点として扱い、明示的な根拠なしに統合しない。

### 6.2 変換 report と採用 gate

変換は、入力ファイル、各 record の採用／除外、stable ID 対応、重複、参照不能、座標変換、画像対応、出典・license 未確認を列挙する machine-readable report を生成する。衝突を first-wins で処理しない。

生成 master は次を満たすまで application asset として採用しない。

- 新 schema の全検証を通過する。
- configured grade ごとの map・P 地点・T 地点件数が、承認した変換 report と一致する。
- stable legacy lookup が旧 grade/mapNo/pointNo を一意に解決する。
- 画像参照と利用条件が確認される。
- 除外・未解決 record が report 上で明示的に承認または保留される。
- configured な地図画像が背景専用で、動的な町名・エーテライト案内と重複しないことが確認される。

Mob master は現行試作から生成しない。名称、rank、map、全候補地点、別名、出典を新規データとして準備し、同じ validation gate を通す。

## 7. Session state と所有権

### 7.1 共通の状態原則

Treasure、Mob ソロ、Mob パーティは別々の aggregate root である。各 root は単調増加する内部 revision、参照する master identity、order mode、visit order、map 別 current location、progress を持つ。Mob の最後に選択した mode は独立した小さな preference record とする。

エーテライト案内 overlay は aggregate root に含めない。master adapter の検証済み aetheryte projection と、Map UI が管理する現在の viewport 投影から導出する一時的な表示 projection とし、アイコン・ラベルの採否、候補順位、viewport の変化を session の revision、progress、order、current location または localStorage へ反映しない。通常表示と地点選択表示は同じ overlay 責務を利用し、地点選択用 marker の選択 event だけを application coordinator へ渡す。

route に並べる単位は `visitId` とする。同じ target に複数候補がある B モブは candidate ごとに別 visit を持つ。一方、完了と進捗表示は `targetId` 単位とする。進捗一覧の位置と未完了 route の位置を混同せず、`progressOrder` と `visitOrder` を分ける。

### 7.2 Treasure session

Treasure Session は次を所有する。

- 選択 grade set ID。
- 最大 8 枠の stable slot ID、表示名、現在の Treasure point reference。
- 各枠の未完了／完了、完了取消用の直前位置。
- `progressOrder`、未完了 `visitOrder`、`auto | manual`。
- map ID ごとの current location reference。

枠の地点変更は同じ slot/target を更新する。完了済み枠の変更では旧完了対象を新しい未完了対象へ置換し、旧取消 snapshot を破棄する。一括入力は validation 後の最大 8 件から root 全体の working state を作り、一回の保存が成功した場合だけ置換する。

### 7.3 Mob root と mode state

Mob application は次を別々に所有する。

| root | 主な状態 |
| --- | --- |
| Mob preference | 最後に正常保存された `solo | party` |
| Solo Session | 一般/B target、候補集合、候補探索、一般採用地点、完了・未発見、順序、current location、直前の Next 取消 snapshot |
| Party Session | A/S/SS target、選択報告地点、完了、順序、current location |

mode 切替は preference だけを更新し、両 session の state を変えない。初回は `solo` を使う。preference 保存に失敗した場合は表示 mode を切替前へ戻す。

### 7.4 Solo target

Solo target は mob ID、登録時の candidate ID 集合、各 candidate の `unexplored | explored | unresolved`、完了 snapshot を持つ。

- 一般モブは route planner が採用した一 candidate ID を current visit として持つ。他候補は集合に残す。
- B モブは全 `unexplored` candidate が個別 visit になる。全有効候補が `explored` なら `unfound` を導出する。
- `unfound` は完了と別状態であり、時間経過や reload で解除しない。
- B の完了 snapshot は完了直前の候補状態と visit 位置を持ち、完了取消時だけ使用する。
- Next 取消 snapshot は操作直前の B candidate 状態、visit order、map 別 current location を一段だけ保持する。次の状態変更が成功した時点で失効する。

### 7.5 Party target

Party target は mob ID と一つの selected candidate ID を持つ。同じ mob の再選択は target を増やさず candidate reference を置き換える。手動順序では visit の位置と完了状態を維持する。自由座標は session に入らない。

Map UI の案内 overlay は、Treasure の grade set、Mob の target、登録地点および完了状態を所有しない。grade 変更、target 登録、route 更新、完了・取消、再描画は、共通 map ID と master revision が変わらない限り同じ aetheryte projection を参照する。表示領域や zoom/pan の変化は viewport-local な再投影だけを起こす。

## 8. Application transaction と永続化

### 8.1 操作 transaction

状態変更 command は次の順で処理する。

```text
current published state
  → immutable working state
  → domain validation / transition
  → 必要なら route calculation
  → persistence write
  → write success のときだけ published state を置換
```

route planner と domain operation は current published state を直接 mutate しない。保存に失敗した working state は破棄し、成功通知、順序・mode・進捗の変更を公開しない。この方式で UI rollback のための逆操作に依存しない。

一つの利用者操作が一つの root を変更する場合、その root の完全 snapshot を一つの logical record として serialize し、一回の localStorage write で置換する。複数 root を一操作で変更する機能は設けない。Mob mode 切替は preference record だけを変更する。

### 8.2 保存 record

保存媒体は browser の origin ごとの localStorage とし、次の四つを別 logical record とする。

| 対象 | localStorage key |
| --- | --- |
| Treasure session | `treasure-compass:treasure-session:v2` |
| Mob Solo session | `mob-compass:solo-session:v1` |
| Mob Party session | `mob-compass:party-session:v1` |
| Mob last-mode preference | `mob-compass:last-mode:v1` |

session record の JSON envelope は次とする。

```json
{
  "schemaVersion": 1,
  "sessionRevision": 1,
  "masterIdentity": {
    "mapSchemaVersion": 1,
    "mapDataRevision": "revision",
    "appSchemaVersion": 1,
    "appDataRevision": "revision"
  },
  "state": {}
}
```

`state` は 7 章で対象 root に定めた状態を欠落なく持つ。map/object collection は stable ID を明示した配列として encode し、JSON object の key 順序に意味を持たせない。順序は `progressOrder` と `visitOrder` の ID 配列だけで表す。未定義値、非有限数、関数、UI-local state は保存しない。全 field を allow-list で検証し、未知 field、重複 ID、存在しない順序参照は root 全体の復元失敗とする。

preference record は `{ "schemaVersion": 1, "revision": 1, "mode": "solo" }` の形とし、`mode` は `solo | party` だけを受理する。storage key の末尾 version は key generation、record 内の `schemaVersion` はその key 内の形式を表す。

### 8.3 復元

起動時は master を先に検証し、その後に該当 app の保存 record を decode・検証・参照解決する。不正 record を部分採用しない。復元失敗時は保存原文を上書きせず、該当 root を初期状態で公開し、理由を表示する。他 root の正常復元は妨げない。

master identity が異なる保存状態は stable ID で reconcile する。解決できない参照を unresolved として保持できる構造上の整合性がある場合は復元し、route から除外する。snapshot 自体の型、重複、rank/mode、順序参照等が不整合なら root 全体を拒否する。

### 8.4 旧 Treasure 保存の初回移行

新 Treasure record が存在しない場合だけ、Treasure entry と運用中 Treasure が共有する origin の localStorage に対し、次の優先順で legacy decoder を使う。Persistence adapter はこの origin 内での読込と新 key への write を所有し、Mob app や別 origin へ旧値を渡さない。

1. 現行統合 key `treasure-compass:sessions:v1` の `treasure.grade` と `treasure.members`。廃止する `product` と `mob` は移行しないが、Treasure 部分と envelope 自体は独立に検証する。
2. それが存在しない場合、旧 key `treasure-compass:grade` と `treasure-compass:members`。

legacy lookup により grade、mapNo、pointNo を stable ID へ一意に解決できる有効データだけを、新 Treasure の未完了・自動順序・current location なしの working state にする。保存成功後に新 state を公開する。先順位の保存が存在するが不正な場合、古い別 key へ fallback して不整合を隠さず、復元失敗とする。

移行手順は次の安全条件を満たす。

- 新 record が有効なら旧 record を読まない。
- 読取不能、曖昧、未知参照が一つでもあれば部分移行せず、旧 record を変更しない。
- 新 record の write 成功前に旧 record を削除・変更しない。
- 移行後および全消去後に旧 state が復活しないよう、新 record の存在を移行済み marker とする。旧 key の削除は新 record の正常保存後に限る。削除に失敗しても新 record を優先し、旧 key を再移行しない。
- Mob の旧試作 state は移行しない。

### 8.5 全消去

確認 dialog は Treasure、Mob ソロ、Mob パーティのいずれを消すか明示する。空の初期 snapshot を対象 root の同じ key へ正常保存できた場合だけ published state を初期化する。key 自体を remove しないため、Treasure の旧保存が再移行されることはない。別 root と Mob preference は変更しない。保存失敗時は消去前 state を維持する。

## 9. 経路計算

### 9.1 入力と出力

Route planner は、固定した session revision、master identity、未完了の有効 visit、map 別 current location、共通 map projection に含まれる有効なエーテライトおよび travel data、order mode を入力する。返り値は次のいずれかである。

- success: visit order、一般モブの採用 candidate、map group order、各 map の開始地点、利用可能な料金・ロード時間、tie 情報、0件以上の warning。
- empty: 有効な未完了 visit がない正常結果。
- failure: 対象と、missing aetheryte、unresolved visit、missing travel data 等の理由。

Application は result の session revision と master identity が現在値に一致する場合だけ採用する。非同期計算中の入力変更や master reload により stale になった result は破棄する。success の warning は route と同じ result の一部として presentation へ渡し、補助情報が利用できない対象を識別可能に表示する。warning を failure へ昇格させたり、表示せず捨てたりしない。

### 9.2 計算の段階

1. 完了、探索済み、unresolved を除外し、一般モブの候補選択を含む有効 visit 集合を作る。
2. visit を map group に分け、異なる map group が隣接する回数が最小となる group order 候補を求める。
3. 第一評価で全体経路が一つに決まった場合は、補助値を採用条件に使わない。不足・不正な料金またはロード時間があれば、該当 edge と値種別を warning にして success とする。
4. 第一評価後に複数候補が残る場合は、必要な全 travel edge の料金合計とロード時間合計による Pareto 優越を判定する。比較に必要な値が不足・不正なら補助情報不足 failure とし、部分的な比較結果を採用しない。
5. 優越されない候補が複数なら tie を保持し、Specification の stable tuple 列で表示採用順を一つ決める。
6. map ごとに、保存済み current location があればそれを、なければ共通 map projection の各有効 aetheryte を開始候補として、X/Y 直線距離合計が最小の visit order を求める。raw record や `division=R` は route planner に渡さない。
7. 一般モブは全 candidate のうち map 内巡回全体を最短にする一地点を同時に選ぶ。B は全未探索 candidate を visit とする。

料金とロード時間を加算して一つの score にしない。Z、帰還距離、入力順を評価軸にしない。同率の最終順は Specification の Unicode code point、数値、stable ID の規則を用いる。

探索アルゴリズムは候補数に応じて完全探索と、同じ最適性を保証できる動的計画法等を選べる。近似解を成功結果として返さない。上限超過や計算資源不足は既存順序を維持する calculation failure とする。

### 9.3 自動順序と手動順序

自動順序中の成功した対象追加、置換、削除、完了、取消、B Next、Next 取消、再探索は、変更後 working state から再計算する。計算または保存の失敗時は操作全体を採用しない。

手動順序中は既存 visit の相対順序を固定する。新 Treasure、一般、パーティ visit は末尾、新 B の全候補は既存末尾からの最短順でまとまって末尾へ追加する。一般モブの採用 candidate と B の追加順だけは Specification の手動追加規則で決め、その後は明示的な自動計算まで固定する。B candidate は追加後に一件ずつ任意位置へ移動できる。

「経路自動計算」は current state から working result を作り、保存成功時だけ `auto` と新 order を公開する。失敗時は `manual` と既存 order を維持する。

## 10. 主要フロー

### 10.1 起動

1. app shell が map master と自アプリ固有 master を要求する。
2. master adapter が検証済み context または診断を返す。
3. persistence adapter が該当 root を decode する。Treasure では必要な場合だけ旧保存移行を試す。
4. coordinator が master と session reference を reconcile する。
5. 有効 state、unresolved 情報、master/session failure を presentation projection として公開する。

### 10.2 エーテライト案内 overlay

1. master adapter は app 固有 master や grade set から独立した共通 map projection を coordinator へ提供する。
2. coordinator は表示対象 map の projection と、地点選択用なら選択対象 marker の projection を Map UI へ渡す。案内 overlay には全ての有効 aetheryte を渡し、登録対象や完了状態で絞らない。
3. Map UI の Aetheryte overlay は、現在の viewport へ X/Y を投影し、全件のアイコンを固定アンカーへ置く。町名ラベルは Specification の矩形、4 CSS px、8方向、重なり、最大数、安定 ID・候補順の制約を満たす配置結果だけを描画し、採用できないラベルを省略する。通常表示と地点選択表示は同じ projection 入力に対して同じ結果を返す。
4. overlay の描画、再描画、pan/zoom およびラベル省略は、application command、session mutation、persistence write を発生させない。案内 icon/label の pointer event は Map UI 内で消費し、地点選択 coordinator へ転送しない。
5. master revision または表示対象 map が変わった場合だけ新しい共通 projection から再構築し、viewport の変更時は表示 projection だけを再計算する。Master adapter の検証失敗は §12 の failure boundary へ渡し、Map UI は未検証値や座標・名称の推測 fallback を作らない。

### 10.3 Mob ソロ登録

検索 projection は Unicode NFC とラテン文字の case-fold を行い、正式名・明示 alias の部分一致と、map 由来 expansion、category/rank filter を AND/OR 規則で適用する。候補行の明示選択でのみ command を発行する。

選択した一般/B target へ現 master の全 candidate reference を登録する。一般は現在 order mode の規則で一 candidate、B は全未探索 candidate を visit 化する。保存成功後も登録 tab と検索・filter の UI-local state を維持する。検索文字列と filter は session 永続化対象にしない。

### 10.4 Mob パーティ登録

A/S/SS の選択で Map UI の選択 dialog を開く。dialog には対象 mob の map と有効 candidate marker だけを渡す。marker の click/tap は candidate ID を返し、coordinator が即時登録または置換して保存する。成功時だけ dialog を閉じ、登録 tab に戻る。閉じる操作と無効 marker は state を変えない。

### 10.5 完了、取消、B 探索

完了 command は target を完了し、その全 visit を route から外すが、progress order に残す。取消は当該 target の完了直前 state と位置だけを戻す。

B Next は current candidate を explored にし、その map の current location を当該 candidate に更新する。直前 snapshot を一段だけ保存し、残りを order mode に従って更新する。Next 取消はその snapshot だけを復元する。全候補探索済みなら unfound を導出し、明示的な再探索で全 candidate を unexplored へ戻す。一般とパーティには Next を発行しない。

### 10.6 対象削除

削除は target とその candidate/visit/progress/取消情報を一単位で除く。map 別 current location は戻さない。手動では残りの相対順序を維持し、自動では残りを再計算する。削除操作自体の undo snapshot は持たない。

## 11. UI とレスポンシブ構造

### 11.1 共通操作感

両 app は共通 Map UI と共通 interaction contract を使い、marker 選択、pan/zoom、route 表示、現在地点、完了表示、並べ替え、完了・取消、全消去確認の結果を揃える。見た目の theme を完全共有する必要はないが、同じ意味の control label、状態色、feedback、確認 dialog を shared design token と interaction pattern で提供する。

共通 Map UI は、地点登録用 marker と案内 overlay を別の表示・イベント境界として扱う。案内 overlay は全有効エーテライトのアイコンを実座標へ固定し、町名ラベルだけを表示領域と他ラベルとの関係で省略できる。ラベル配置は Map UI 内の純粋な表示 projection とし、4 CSS px、8方向、矩形、正の面積の重なり、最大8件、安定 ID と候補順の全制約を満たす。overlay の視覚資産と新ラベルデザインは地図背景と別の表示責務にする。

Treasure は既存の一括入力、手動入力、巡回経路への到達性を維持する。Mob は上部にソロ／パーティ switch、その下に登録／巡回経路 tab を持つ。mode と tab を一つの selector に混在させない。登録後は登録 tab に留まる。

### 11.2 画面領域

広い画面では、操作・進捗領域と地図領域の二領域を基本とする。狭い画面では縦積みまたは明示的な panel/map 切替を使い、横方向 page scroll を主要操作にしない。Map 選択 dialog は viewport 内に収まる bounded dialog、狭い画面では full-viewport surface とする。

幅 320 CSS px 以上で、主要 button、検索、filter、mode/tab、候補 marker、完了・取消、B Next、並べ替え、全消去をタップで操作できるようにする。並べ替えは drag だけに依存せず、移動 button 等の同等操作を提供する。画面向きの変更で domain state や編集中の UI-local 入力を初期化しない。

## 12. 失敗境界と安全性

| 失敗種別 | 内部処理 | 外部結果 |
| --- | --- | --- |
| master fetch/envelope failure | 該当 master context を作らない | 対象 app の登録・経路を停止し、既存 state を変更しない |
| master record failure | 不正 record と依存 record を除外 | 利用可能分と除外理由を区別表示 |
| route success with warning | result と warning を同じ revision で採用 | 経路を表示し、利用できない補助情報と対象を識別可能に表示 |
| route failure | result を session へ採用しない | 理由と対象を表示し、既存順序・mode・進捗を維持 |
| stale calculation | result を破棄 | 現在 state を維持し、必要なら現 revision で再要求 |
| save failure | working state を破棄 | 操作前表示と最後の正常保存を維持 |
| restore failure | root 全体を採用しない | 該当 root を初期表示し、元保存を上書きしない |
| legacy migration failure | 新 record を作らない | 旧保存を保持し、部分移行しない |
| aetheryte record failure / R exclusion | invalid・重複・参照不能・範囲外 record と R を projection から除外し、diagnostic へ理由を渡す | 他の有効な案内を継続し、全件無効時だけ既存の master 不備・経路計算不能を適用 |
| image source / license 未確認 | 背景 asset としての採用を停止し、動的案内の正本とは分離する | 未確認画像や埋め込み案内を runtime の正常 asset として表示しない |

利用者入力、名称、diagnostic は文字列として rendering し、HTML として解釈しない。`dangerouslySetInnerHTML`、`eval`、動的 script 実行を使わない。JSON、localStorage、入力全文、個人名を不要に console、例外、telemetry へ出さない。新しい外部通信は静的 asset の取得以外に導入しない。

計算前に候補数、有限数、配列長、参照 graph を検証する。循環・過大入力・不正値による無限処理を防ぎ、処理上限に達した場合は推測結果でなく failure を返す。

## 13. 設計判断とトレードオフ

| 判断 | 採用理由 | 受け入れるコスト |
| --- | --- | --- |
| 二つの app shell と別 session root | 外部上の別アプリと状態独立を構造で保証する | entry/build 設定が二系統になる |
| 地図基盤だけを共有 | 操作感と座標・marker の意味を揃え、固有 workflow の混線を防ぐ | 共通 UI の input contract を維持する必要がある |
| master を map/Treasure/Mob に分割 | 汎用 point の曖昧さと未使用 field の継承を避ける | 参照検証と revision 結合が必要になる |
| game X/Y を canonical にする | 表示・入力・距離の単位を揃え、Z と 10 倍内部値を排除する | 現行 data と描画の移行確認が必要になる |
| strict schema、必須 source 対応、衝突全除外 | 不明な field、出典なし情報、first-wins による誤登録を防ぐ | 一部データ不備が明示的な除外になる |
| 共通 map projection と overlay の分離 | grade/product master の重複を避け、通常表示と地点選択表示の案内を同一化する | map projection の revision と viewport 投影を連携する必要がある |
| overlay を session root 外に置く | 案内表示の再描画・省略が周回状態や保存を変更しないことを保証する | 表示時に master と viewport から再投影する必要がある |
| 地図背景と案内資産を分離 | 画像内の町名・アイコンとの重複と未確認資産の採用を防ぐ | 既存画像の除去確認と資産 provenance gate が必要になる |
| 言語 keyed な表示名境界 | 初期日本語を維持しながら stable ID を将来言語へ引き継ぐ | v1 では言語選択・翻訳・Mob 多言語検索を提供しない |
| complete snapshot の write-before-publish | 保存失敗時の非部分適用を単純に保証する | state が大きくても操作ごとに serialize が必要になる |
| visit order と progress order を分離 | B 候補単位の並べ替えと対象単位の完了を両立する | projection と復元検証が増える |
| 旧データの allow-list 移行 | 未使用 `g11` や不明 field の誤採用を防ぐ | 新データ準備時に人手の承認が必要になる |

## 14. Implementation と Test への引継ぎ

Implementation は、まずモノレポの二 entry と共有 package 境界を作り、次に master schema/validator と移行 report、session/persistence、route core、各 app UI の順で統合する。既存 Treasure を一度に置換せず、旧挙動との fixture 比較ができる単位で進める。

検証は少なくとも次を含む。

- 各 JSON の unknown field、重複 ID、空・未知 source 参照、未知 entity 参照、範囲外・非有限 X/Y、aetheryte なし、rank/category 不整合。
- 各 map の T/R 混在、検証済み T のみの aetheryte projection、R・無効・重複 record の除外と diagnostic、他の有効 record の継続利用。
- configured 5 dataset の変換件数、legacy lookup、座標・動的 overlay marker の一致、背景画像からの埋め込み案内除去、`g11` と未使用 field の除外 report。
- 通常の地図表示と地点選択表示の共通 map projection、全有効エーテライトの継続表示、アイコン固定、町名ラベルの8方向配置・重なり回避・最大8件・省略、案内表示の非操作性と session 非変更。
- アイコン視覚資産の出典・利用条件確認、新ラベルデザインの地図画像由来でないこと、未確認 asset が採用されないこと。
- 初期日本語表示、安定 ID から言語別表示名を解決する境界、未提供言語を翻訳・推測しないこと、Mob 多言語名称照合を提供しないこと。
- Treasure の手動・一括入力、8 枠、置換、grade 変更、旧保存移行、legacy resurrection 防止。
- Mob の正式名・alias 検索、filter、mode eligibility、全候補登録、一般一地点、B 全候補、パーティ即時登録・置換。
- マップ間遷移最小、料金／ロード時間 Pareto、第一評価で一意な場合の補助値不足 warning、補助値が必要な場合の failure、複数 aetheryte、二次元最短、同率 stable order。
- 手動順序の末尾追加・位置維持・候補単位並べ替え、自動計算成功時だけの切替。
- 完了・取消、B Next・一段取消・unfound・再探索、対象削除、map 別 current location。
- 各 root の独立保存・復元・全消去、破損保存、write failure、stale calculation。
- 320 CSS px 以上の縦横 viewport、touch marker、非 drag の並べ替え、dialog、orientation change。

静的データの正確性、Mob の実データ、料金、ロード時間、出典、画像利用条件は Implementation 開始前の data preparation gate で確認する。値を確認できない状態では仮値を production master に入れず、該当機能を正常扱いしない。

## 15. 追跡性

| Specification / Requirement | Design の具体化 |
| --- | --- |
| §1、§3 / REQ-F-001〜005 | 1、3、7.3、8.2、11 |
| §4 / REQ-T-001〜003 | 4.3、6、7.2、8.4、10.1 |
| §5 / REQ-M-001〜008 | 4.4、7.3〜7.5、10.2、10.3、10.5 |
| §6 / REQ-R-001〜005 | 4.2、5、9.1、9.2 |
| §7 / REQ-R-006〜008 | 7.1、9.3、11 |
| §8 / REQ-P-001〜005 | 7.2〜7.5、10.4 |
| §9 / REQ-L-001〜006 | 7、8、10.1、12 |
| §10 / REQ-A-001〜002、REQ-D-001〜003 | 2、4〜6、12 |
| §11 / REQ-Q-001 | 3.1、11、14 |
| §1.2 / REQ-S-001〜005 | 1.3、4、12 |
| §12 / SPC-AC-001〜021 | 3〜14 の責務・flow・failure・test 引継ぎ |
| §4.4、§10.1〜10.3 / SPC-AC-022〜024、REQ-F-006〜008、REQ-A-003〜004 | 1.1、3.1〜3.2、4.2、5、6、7.1、9.1、10.2、11.1、12、13、14 |
| §10.3 / SPC-AC-025、REQ-D-004 | 1.1、4.2、10.2、13、14、16 |

## 16. 未決定事項と参照資料

上流へ戻す必要がある製品判断はない。具体的な URL 文字列と配備先は未決定だが、二つの build entry と state boundary により後から割り当てられる。ただし Treasure の origin 維持は §3.3 の確定した配備制約である。§3.1 の workspace package 名・配置は確定 Design とし、各 package 内の source file、探索アルゴリズムの具体実装、UI component 分割は、本 Design の責務・外部結果を維持して Implementation で決める。

一方、次は未決定値を仮定して実装してはならない data preparation 項目である。

- Mob の正式 master 全件、別名、rank、候補地点と出典。
- map 間 teleport 料金、比較可能な load time と出典。
- map/地点画像の利用条件、既存アイコン視覚資産の出典と利用条件、および map 単位で再利用できることの確認。
- configured な G8、G10、G12、G14、G17 の地図画像から埋め込み町名・エーテライト表示を除去したことの確認。新しいラベルデザインは地図画像から再利用しない。
- 現行設定対象データの変換 report と stable ID 対応表の承認。

参照資料:

- [Specification](../specification/specification.md)
- [Specification Review 009](../reviews/specification/specification-review-009.md)
- [Requirements](../requirements/requirements.md)
- [Requirements Review 009](../reviews/requirements/requirements-review-009.md)
- [Concept](../concept/concept.md)
- [Concept Review 005](../reviews/concept/concept-review-005.md)
- [README](../../README.md)
- [Project Memory](../../MEMORY.md)

本 Design は独立した Design Review の対象である。レビュー完了前に Implementation の承認済み根拠として扱わない。
