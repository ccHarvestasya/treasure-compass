# Implementation Review 007

## 1. レビュー対象と範囲

- 対象工程: Implementation / Test
- 確認日: 2026-09-12
- 対象 revision: `d976af5`
- 対象アプリ: Treasure Compass
- 対象成果物: 登録、一括入力、経路、進捗、保存・復元、マップJSON検証、master-data画像・map参照、unit test、build
- 除外: Mob Compassの機能、未承認masterデータの作成、料金・ロード時間の推測投入、ブラウザ実機E2E

## 2. 使用した根拠

- `AGENTS.md`
- `docs/requirements/requirements.md`
- `docs/specification/specification.md`
- `docs/design/design.md`
- Treasureの現行実装、テスト、`packages/master-data/data/map-master.v1.json`
- 直近の実装コミットおよび検証結果

## 3. 適合確認

### 3.1 利用者操作

- グレード表示、手動登録、チャット一括入力、マップ上の地点選択、経路表示、手動並べ替え、完了・取消、全消去を維持している。
- 一括入力は行ごとのマップ・座標検証後に一度だけメンバーを置換する。登録可能な行がない場合は既存登録を変更しない。曖昧なマップ名は採用しない。
- 自動順序では、完了地点を進捗一覧に残し、未完了地点だけを保存済み現在地点から再計算する。手動順序は完了・登録変更を理由に自動置換しない。

### 3.2 保存・入力境界

- Treasure専用snapshot境界、旧形式移行、空表示名、保存データの型・範囲・重複検証を実装している。
- マップJSONは必須フィールド、有限値、グレード対応`mapNo`、共通map masterのstable map ID・名称整合性を検証する。不正時はsessionを採用せず、読込エラーを表示する。

### 3.3 master-data参照

- g8 / g10 / g12 / g14 / g17について、legacy JSONのmapNo・名称と共通map masterの対応表が全件一致することを確認した。
- 地図画像とエーテライト画像は`packages/master-data/assets/`配下を参照する。

## 4. 検証証拠

- `pnpm lint`: PASS
- `pnpm test`: PASS（12 files、62 tests）
- `pnpm run build`: PASS（Treasure / Mob）
- `git diff --check`: PASS

## 5. Findings

正式なCRITICAL / HIGH / MEDIUM / LOW findingはない。

現行実装に残る経路上の不足は、未承認のmasterデータを実装で補完しないための工程境界として、以下の上流フィードバックへ分類する。

### Upstream Feedback: Treasure master準備

- stableなTreasure point ID、point source、legacy pointからの一意移行表が未承認である。
- 現行実装はlegacy `mapNo` / `pointNo` projectionを使用しており、Design §9のstable visit referenceへ移行していない。
- 解消条件: stable point master、出典、移行対応表の承認。

## 6. 未検証範囲

- 正式master参照不能地点・有効エーテライト欠落時の計算不能理由を、経路結果として識別表示する専用UI。
- ブラウザ実機での入力、localStorage容量超過、実ネットワーク失敗画面。

これらは今回のunit test・静的buildでは証明していない。未確認料金・ロード時間を推測して成功扱いにはしていない。

## 7. 判定と引継ぎ

`REVISE IMPLEMENTATION`

現行の登録・保存・進捗・基本経路は検証済みだが、正式Treasure masterのstable point IDとlegacy移行対応表がないため、Treasure全体を仕様適合済みとは判定できない。データ準備gateの承認後、stable ID移行、正式route planner、計算不能診断を再レビュー対象とする。料金・ロード時間はTreasure v1の評価対象外であり、完了条件に含めない。
