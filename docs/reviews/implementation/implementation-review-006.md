# Implementation Review 006

## 1. 対象

- 対象工程: Implementation / Test（未使用 travelEdges の入力省略化）
- 確認日: 2026-09-12
- ベース: commit `1a7ec943688901405757e5870f92a84aa3536d74`
- 対象: map master JSON、master-data validator / type、validator test

## 2. 確認結果

- 現行 `map-master.v1.json` から `travelEdges` を削除し、`dataRevision` を `2026-09-12.4` に更新した。
- 現在の地図表示・エーテライト overlay・既存経路処理は `travelEdges` を参照していない。
- validatorは入力に `travelEdges` がない場合を許容し、検証済み結果では空配列を返す。旧形式の配列が入力された場合の検証処理は互換のため残している。
- `sources`、`sourceIds`、`licenses` は今回削除していない。これらは表示計算ではなく、出典・画像利用条件の検証と将来のmaster間参照に使われるためである。
- JSONの手動修正時は、地図・エーテライトの内容だけを編集でき、未使用の移動edgeを記述する必要がなくなった。

## 3. 検証

- `pnpm lint`: PASS
- `pnpm test`: PASS（10 files、48 tests）
- `pnpm build`: PASS（Treasure Compass、Mob Compass）
- `git diff --check`: PASS
- map master: 28 maps、77 aetherytes、画像参照の欠損なし

## 4. 指摘・残存範囲

正式なCRITICAL / HIGH / MEDIUM / LOW findingはなし。料金・ロード時間を使う厳密な経路計算は現行アプリの対象外であり、必要になった時点で別途仕様・設計・データを追加する。`sources` の簡略化または別ファイル化は、出典検証と将来のTreasure/Mob master参照への影響を確認したうえで別工程とする。

## 5. 最終判定

`READY`
