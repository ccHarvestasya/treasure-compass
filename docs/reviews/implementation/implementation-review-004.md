# Implementation Review 004

## 1. レビュー対象

- 対象工程: Implementation / Test（動的エーテライト案内表示）
- 確認日: 2026-09-12
- ベース: commit `0f83092d76654d6f7fb62bbc88ba600163c39b86`
- 上流: Specification `eaf1e7780cdd70afedc7173541cc3fa79c16c985`、Design `9d34f25b2bebf1ede795f81f4eae988ac4bc70ff`
- 対象: MapCanvas、AetheryteOverlay、配置計算、配置計算テスト、master-data のJSON export、treasure app依存関係・TypeScript設定・lockfile、提供アイコン
- 保護対象: `MEMORY.md`、`map_g14_*_nolabel.xcf` および既存の旧画像・legacy JSONは変更・採用対象から除外

## 2. 確認した根拠

AGENTS.md、承認済み Specification §4.4・§10.1〜10.3・§13.2、Design §1.2・§4.2・§5.1・§6.1〜6.2、既存 Implementation Review 001〜003、現在の実装・テスト・map master・package設定・Git差分を確認した。

## 3. 結論

`READY`

## 4. 適合性の要約

- `map-master.v1.json` を workspace package のJSON exportから静的に読み込み、`validateMapMaster` を通過したデータだけを使用している。
- master の `image.asset` は全28マップで実在する `map_3_*`〜`map_7_*` PNGを参照している。G17を含む現行グレード設定は維持し、旧JSON・旧画像は削除していない。
- 通常の `MapCanvas` と `PositionModal` が同じ `MapCanvas` を使用するため、同一のoverlay責務と配置規則が適用される。
- map master の有効なTレコード全件についてアイコンを返し、ラベルは候補不足・衝突・最大8件制限により個別に省略できる。
- ラベル配置はNFC後のUnicode code point幅、24px高、4px gap、8方向候補、viewport内判定、正の面積重複判定、最大8件、安定ID・候補順位の同率規則を実装している。
- overlayは `pointer-events-none` で、既存のP地点クリック、登録、route、Zustand/localStorageの処理を変更していない。

## 5. 指摘

なし。CRITICAL / HIGH / MEDIUM / LOW の正式findingは確認しなかった。

## 6. テスト・検証

- `pnpm lint`: PASS
- `pnpm test`: PASS（10 test files、47 tests）
- `pnpm build`: PASS（Treasure Compass、Mob Compass）
- `pnpm run build:treasure`: PASS
- `git diff --check`: PASS
- map master: schemaVersion 1、dataRevision `2026-09-12.2`、28 maps、77 aetherytes、画像参照の欠損なしを確認
- アイコン: `apps/treasure-compass/public/img/aetheryte.png` のPNG形式・35×35 RGBAを確認
- 配置テスト: NFC幅、8方向、4px gap、辺接触、viewport境界、最大8件、安定ID、アイコンのみ表示を確認

## 7. 互換性・範囲

既存のlegacy Treasure JSON、旧 `map_g*` 画像、localStorageキー、入力解析、P地点登録、経路状態および保存処理は変更していない。`GRADE_CONFIG` の旧画像prefix実行時参照だけをmaster画像参照へ置き換えた。現段階ではTreasure地点データ自体のmaster移行やlegacy削除は行わず、後続工程へ残している。

## 8. 残存リスク・未検証範囲

- 提供アイコンおよび地図画像の正式な出典・利用許諾は未確認であり、既存license recordの未確認・未承認境界を維持する。今回のユーザー明示依頼により実装上はアイコンを使用したが、公開前の資産採用gateは別途必要である。
- ブラウザ実機での目視表示、ResizeObserver発火、クリック操作のE2E確認は未実施。型検査・build・純粋配置テストで確認できる範囲を検証した。
- `MEMORY.md` と作業用XCFは既存の保護変更として未コミットのまま残る。

## 9. 最終判定

`READY`
