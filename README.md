# Treasure Compass

FFXIV のトレジャーハントとモブハントを支援する、二つのブラウザアプリのモノレポです。Treasure Compass は運用中の機能を提供し、Mob Compass は独立したアプリ基盤を構築中です。

## 機能

- **バージョン対応**: 3.x（G8）・4.x（G10）・5.x（G12）・6.x（G14）・7.x（G17/G18）に対応
- **メンバー登録**: 手動入力またはパーティチャットからの一括貼り付けに対応
- **ルート最適化**: テレポコストを考慮した最短巡回順を自動計算
- **マップ表示**: 各マップ画像上にポイント・ルートをオーバーレイ表示
- **進捗管理**: 討伐済みポイントのチェックオフ
- **データ永続化**: グレードとメンバー情報を localStorage に自動保存

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

```bash
pnpm install
pnpm run dev:treasure
```

Mob Compass を起動する場合:

```bash
pnpm run dev:mob
```

ビルド:

```bash
pnpm run build
```

`pnpm run build` は Treasure Compass と Mob Compass をそれぞれ build します。個別に build する場合は `pnpm run build:treasure` または `pnpm run build:mob` を使用します。

## ディレクトリ構成

```
apps/
├── treasure-compass/    # 運用中の Treasure Vite app、静的データ、UI、保存 adapter
└── mob-compass/         # 独立した Mob Vite app の起動基盤
packages/
├── treasure-domain/     # Treasure 固有ルール
├── mob-domain/          # Mob 固有ルール
├── map-core/            # 共通の二次元座標・地図計算
└── master-data/         # 共通 master schema・validator・移行 report
```

## 新グレードの追加

`apps/treasure-compass/src/constants/index.ts` の `GRADE_CONFIG` に1行追加し、対応する JSON ファイルと画像を `apps/treasure-compass/public/` に配置します。

```ts
{ grade: 20, label: 'G20', jsonFile: '/json/g20.json', imagePrefix: '/img/map_g20_' },
```

## ライセンス

[Apache License 2.0](LICENSE)

Original source code and documentation in this repository are licensed
under the Apache License 2.0.

FINAL FANTASY XIV names, trademarks, game data, images, icons,
screenshots, maps, text, and other related materials are the property of
SQUARE ENIX CO., LTD. and/or their respective rights holders and are not
covered by the Apache License 2.0.

See [NOTICE](NOTICE) for details.
