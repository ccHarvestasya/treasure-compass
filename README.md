# Treasure Compass

FFXIV トレジャーハント支援ツールです。パーティメンバーのマップ情報を登録し、最短巡回ルートを自動計算・可視化します。

## 機能

- **グレード対応**: G8・G10・G12・G14/G15・G17/G18 に対応
- **メンバー登録**: 手動入力またはパーティチャットからの一括貼り付けに対応
- **ルート最適化**: テレポコストを考慮した最短巡回順を自動計算
- **マップ表示**: 各マップ画像上にポイント・ルートをオーバーレイ表示
- **進捗管理**: 討伐済みポイントのチェックオフ
- **データ永続化**: グレードとメンバー情報を localStorage に自動保存

## 技術スタック

| 分類 | 使用技術 |
|------|----------|
| フレームワーク | React 19 + TypeScript |
| ビルド | Vite |
| スタイリング | Tailwind CSS v4 |
| UIコンポーネント | shadcn/ui, Base UI |
| 状態管理 | Zustand |
| ドラッグ&ドロップ | dnd-kit |

## セットアップ

```bash
pnpm install
pnpm run dev
```

ビルド:

```bash
pnpm run build
```

## ディレクトリ構成

```
src/
├── components/
│   ├── GradeSelector/   # グレード切り替えUI
│   ├── MapCanvas/       # マップ描画・ルート表示
│   ├── PositionModal/   # ポイント手動選択モーダル
│   ├── SideBar/         # メンバー登録・ルート進捗パネル
│   └── ui/              # 共通UIコンポーネント (shadcn/ui)
├── constants/           # グレード設定テーブル・定数
├── hooks/               # useMapData (マップJSONフェッチ)
├── store/               # Zustand ストア
├── types/               # 型定義
└── utils/               # 一括解析・距離計算・マクロ生成
public/
├── json/                # グレード別ポイントデータ (g8.json など)
└── img/                 # グレード別マップ画像
```

## 新グレードの追加

`src/constants/index.ts` の `GRADE_CONFIG` に1行追加し、対応する JSON ファイルと画像を `public/` に配置するだけです。

```ts
{ grade: 20, label: 'G20', jsonFile: '/json/g20.json', imagePrefix: '/img/map_g20_' },
```

## ライセンス

[Apache License 2.0](LICENSE)

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
