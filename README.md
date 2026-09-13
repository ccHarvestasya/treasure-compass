# Treasure Compass

FFXIV のトレジャーハント巡回を支援するブラウザアプリです。Treasure Compass is an unofficial fan-made tool and is not affiliated with or endorsed by Square Enix.

Developed by Quarry Mill Applied Magitek Technologies (QMAT).

公開版: `0.1.0`

QMAT は公開上の開発組織・ブランド名であり、法人であることを意味しません。GitHub 上の repository owner / maintainer は `ccHarvestasya` です。この二つは同一の名義として扱いません。

このリポジトリには別アプリの Mob Compass も含まれますが、Mob Compass は開発途中です。この README は公開版 Treasure Compass の機能を説明します。

## 現在の機能

- **Version-based filtering**: `3.x`、`4.x`、`5.x`、`6.x`、`7.x` のバージョンを選んで、手動登録時の候補を絞り込めます。
- **メンバー登録**: メンバー名と宝の地図地点を `manual input` で登録できます。手動登録はすべての対象レイアウトで利用できます。
- **Bulk chat input**: パーティチャットを貼り付け、マップ名と座標を解析して登録できます。曖昧な候補は選択してから登録します。一括入力は広い画面向けの操作で、狭い画面では表示されない場合があります。
- **巡回経路計算**: 未完了の登録地点について、マップ間の移動回数を優先し、同じマップ内では X/Y 二次元距離を考慮して巡回順を計算します。テレポ料金やロード時間は順序評価に使用しません。
- **Map / route display**: 地図画像、宝の地図地点、現在の経路、エーテライト案内を表示します。
- **Current target / progress management**: 現在対象を表示し、`次へ`、`戻る`、個別の完了／取消、リスト選択、巡回順の並べ替えを扱えます。自動順序と手動順序を切り替えられます。
- **localStorage persistence**: 登録内容、巡回順、完了状態、現在対象などの巡回状態をブラウザの localStorage に保存し、再読み込み後に復元します。
- **Responsive UI**: デスクトップから狭い画面まで、登録、地図確認、経路確認、進捗操作を利用できるレスポンシブ UI です。

## 使い方

1. `手動登録` を開き、メンバー名、バージョン、マップ、地点を選択します。
2. 広い画面では `一括入力` を開き、パーティチャットを貼り付けます。登録可能な行と曖昧な候補を確認してから登録します。
3. 巡回リストから対象を選択し、地図と経路を確認します。必要に応じて順序を並べ替え、完了／取消や `次へ`／`戻る` で進捗を管理します。

## 技術スタック

| 分類              | 使用技術                         |
| ----------------- | -------------------------------- |
| フレームワーク    | React 19 + TypeScript            |
| ビルド            | Vite                             |
| スタイリング      | Tailwind CSS v4                  |
| UIコンポーネント  | shadcn/ui, Base UI               |
| 状態管理          | Zustand                          |
| ドラッグ&ドロップ | dnd-kit                          |
| Lint / 型検査     | Oxlint + tsgolint / TypeScript 7 |

## セットアップ

依存関係をインストールして Treasure Compass を起動します。

```bash
pnpm install
pnpm run dev:treasure
```
`pnpm run dev` でも Treasure Compass を起動できます。

Mob Compass の開発用アプリを起動する場合:

```bash
pnpm run dev:mob
```

Mob Compass は開発途中の別アプリであり、Treasure Compass と同等の公開機能を提供するものではありません。

ビルド:

```bash
pnpm run build
```

`pnpm run build` は Treasure Compass と Mob Compass をそれぞれ build します。個別に build する場合は `pnpm run build:treasure` または `pnpm run build:mob` を使用します。

検証:

```bash
pnpm run lint
pnpm run test
```

## ディレクトリ構成

```
apps/
├── treasure-compass/    # Treasure Compass の Vite アプリと unit test
└── mob-compass/         # 開発途中の Mob Compass アプリ
packages/
├── treasure-domain/     # Treasure Compass 固有のルール
├── mob-domain/          # Mob Compass 固有のルール
├── map-core/            # 共通の地図・座標計算
└── master-data/         # 検証済みの地図・地点データと画像
```

## ライセンスと帰属

[Apache License 2.0](LICENSE)

このリポジトリのオリジナルのソースコード、ドキュメント、その他のオリジナル資料は Apache License 2.0 の対象です。

FINAL FANTASY XIV の名称、商標、ゲームデータ、画像、アイコン、スクリーンショット、マップ、テキストおよびその他の関連素材は SQUARE ENIX CO., LTD. および／またはそれぞれの権利者に帰属し、Apache License 2.0 の対象ではありません。これらの帰属と利用条件については [NOTICE](NOTICE) を参照してください。

アプリの footer には Treasure Compass のバージョンと QMAT の公開上の開発主体表記に加え、次の Square Enix attribution を表示します。

```text
© SQUARE ENIX CO., LTD. All Rights Reserved.

FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.

Treasure Compass is an unofficial fan-made tool and is not affiliated with or endorsed by Square Enix.
```
