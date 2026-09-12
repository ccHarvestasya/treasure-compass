# Implementation Review 007

## 1. 対象

- 対象工程: Implementation / Test（Treasure Compass の現行実装全体）
- 確認日: 2026-09-12
- 対象 revision: `d976af5`
- 対象: Treasure の登録、一括入力、経路、進捗、保存・復元、マップJSON検証、master-data画像・map参照、unit test、build
- 除外: Mob Compass の機能実装、未承認のmasterデータ作成、料金・ロード時間の推測投入、ブラウザ実機E2E

## 2. 適合している範囲

- グレード表示、手動登録、チャット一括入力、マップ上の地点選択、経路表示、手動並べ替え、完了・取消、全消去を維持している。
- 一括入力は各行を検証してから一度のメンバー置換を行い、登録可能な行がない場合は既存登録を変更しない。曖昧なマップ名は採用しない。
- 自動順序の完了・取消では、完了地点を進捗一覧へ残し、未完了地点だけを保存済み現在地点から再計算する。手動順序は自動置換しない。
- localStorage は Treasure 専用の snapshot 境界を持ち、空表示名、旧形式移行、保存データの型・範囲・重複検証を行う。
- マップJSONは必須フィールド、有限値、グレード対応 `mapNo`、共通map masterのstable map ID・名称整合性を検証し、不正時は既存sessionを保持して読込エラーを表示する。

## 3. 検証結果

- `pnpm lint`: PASS
- `pnpm test`: PASS（12 files、62 tests）
- `pnpm run build`: PASS（Treasure / Mob）
- `git diff --check`: PASS
- 対応中の g8 / g10 / g12 / g14 / g17 について、legacy JSONのmapNo・名称と共通map masterの対応表を照合し、全件一致を確認した。

## 4. 残存する適合性境界

### Upstream / data preparation gate

- 正式Treasure masterのstable point ID、point source、legacy pointからの一意移行表は未承認である。現行Treasureは legacy point projection（`mapNo` / `pointNo`）を使用しており、Design §9.1・§9.2のstable visit referenceへは未到達である。
- map間の検証済み `travelEdges`、テレポ料金、比較可能なロード時間は存在しない。現行経路はマップ内X/Y距離とlegacy T recordを使うため、Specification §6の遷移数第一評価、Pareto補助評価、補助情報不足の結果を完全には実現していない。
- 上記の値を推測してproduction masterへ追加することは行っていない。正式出典・値・移行表が提供されるまで、これらは未完了のdata preparation gateとして扱う。

### Current implementation

- 正式master参照不能地点や有効エーテライト欠落時の計算不能理由を、経路結果として識別表示する専用状態は未実装である。現行UIのマップJSON読込失敗表示とは別の残存範囲である。
- 独立レビューのためのブラウザ実機操作、localStorage容量超過、実際のネットワーク失敗画面は未確認である。

## 5. 判定

`REVISE IMPLEMENTATION`（master準備および経路評価の必須証拠が未提供）

これは未確認料金・ロード時間を実装へ補完しないための境界であり、現行の登録・保存・進捗・基本経路の検証結果を否定するものではない。次の実装工程は、stable point masterとtravel dataの承認後に、legacy移行、正式route planner、計算不能診断を対象とする。
