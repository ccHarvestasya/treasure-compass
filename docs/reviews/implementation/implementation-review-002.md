# Implementation Review 002

## 1. レビュー対象

- Task ID: `TC-DATA-20260912-MAP-MASTER-REVIEW`
- レビューサイクル: `002`
- 確認日: 2026-09-12
- 対象工程: Implementation / Test（共通 map master 候補データ）
- 対象成果物: `packages/master-data/data/map-master.v1.json`
- 対象SHA-256: `d8289693f04c37f77f9e3417448b466ed3cda3fec7a782af529b08af1b20f661`
- ベース実装コミット: `ea9fccde667cffe15beb09a2778809bb3f02c018`
- 依頼範囲: 共通 MapMasterV1 候補の形状、28 map、77件の T エーテライト、R/Z/g11 の境界、ID・参照・座標、travelEdges、source/license の未承認境界、legacy report との追跡可能性および検証証拠をレビューする。
- 今回の変更範囲: 上記 JSON の新規追加のみ。
- 保護変更: `MEMORY.md`（変更）および `apps/treasure-compass/public/img/aetheryte.png`（未追跡）。今回の対象・レビュー資料から分離し、内容や採用可否を評価しない。
- 除外範囲: runtime 接続、画像コピー・編集、legacy lookup 移行、travel fee/load time の確定、Mob/Treasure master、既存 legacy JSON の変更、UI・状態・テストコード・上流資料の変更。

## 2. 使用した根拠

- 最新のレビュー依頼: 対象 SHA、変更範囲、必須確認事項、cycle 002 および Gate 規則。
- Repository instructions / `AGENTS.md`: 静的データの検証、既存変更の保護、変更範囲、報告規則。
- `$implement-review` および `author-review-orchestrator`: Implementation / Test の適合性、Finding 分類、14セクション形式、レビュー資料の不変性と cycle 管理。
- Specification: commit `eaf1e7780cdd70afedc7173541cc3fa79c16c985`、SHA-256 `b80fbaf3448fff3448e5051ec751c468bc1760f298ed5c86c98059c6508eb993`。map master の外部境界、T のみの有効エーテライト、R 除外、canonical X/Y、画像・source/license 境界を確認した。
- Design: commit `9d34f25b2bebf1ede795f81f4eae988ac4bc70ff`、SHA-256 `83ae38aec491f294348663af4138c1c976851357e0f53b9393eda5ec42069d02`。§4.1–§4.2、§5.1、§6.1–§6.2、§14相当の責務・採用 gate を確認した。
- 既存棚卸し report: `packages/master-data/reports/legacy-treasure-inventory.v1.json`、SHA-256 `b1b2ddc7d9a545ee78cdd36257fbac9845a7e461997d46442f9e19cd9b65306e`。
- 対象 JSON: root（`:2-16`）、maps（`:18-1328`）、空の travelEdges（`:1329`）、sources（`:1330-1373`）、licenses（`:1374-1381`）。
- 実装 validator: `packages/master-data/src/validate.ts` の MapMasterV1 root、record allow-list、ID衝突、source/license、参照、bounds 検証。
- 補助検証: 現行 `apps/treasure-compass/public/json/g8.json`、`g10.json`、`g12.json`、`g14.json`、`g17.json`、`g11.json`、対応 `public/img/map_*.png`。

## 3. レビュー結果

`READY`

## 4. 総評

対象 JSON は MapMasterV1 の root allow-list と `schemaVersion: 1`、非空の `dataRevision`、必須 collection の形状を満たしている。configured な g8/g10/g12/g14/g17 の report 順に28 mapを保持し、正式名、shortName、mapSize から導いた bounds、対応画像参照を全件照合できた。g11 は含まれていない。

map に含まれる aetheryte は77件で、棚卸し report の `division=T` 77件と一対一に対応する。名称、所属 map、`posX/10`・`posY/10` の canonical 座標、sourceIds、bounds を全件突合でき、R 1件と Z 0件は混入していない。stable ID は明示値として保持され、legacy の dataset/mapNo/pointNo へ追跡できる。

travelEdges は未確認の料金・ロード時間を追加せず空配列である。source catalog と未レビュー license は、repo 内で確認できる legacy JSON、NOTICE、Copyright.txt までに根拠を限定し、正式な画像利用許諾・出典・runtime 採用を主張していない。runtime 接続や画像採用を行っていない点も今回のスコープに整合する。

blocking な CRITICAL/HIGH の実装指摘、必須証拠の欠落、必須 validation の未実行・実行不能は確認されなかった。

## 5. 指摘事項

なし。

正式な IR finding は、対象データまたは適用される上流根拠へ追跡でき、現工程で解決すべき具体的欠陥に限定した。runtime 未接続、画像の正式な出典・利用条件未確認、正式な拡張区分未確認、同一 map 統合未確認、travel cost 未確定は、依頼で明示された対象外または未承認境界であり、実装欠陥へ変換していない。

## 6. 解消済み指摘

なし。今回の map master 候補に対する過去の Implementation Review は確認されなかった。`implementation-review-001.md` は legacy inventory report 用の別成果物であり、上書きせず参照系列を分離した。

## 7. 上流へのフィードバック

今回の対象に関する新規の上流フィードバックはなし。

Design Review 005 の traceability 表に関する既存 Minor 指摘は、今回の候補 JSON のデータ適合性・参照整合性・採用境界を阻害しないため、今回の Implementation finding として再計上していない。

## 8. 保留した指摘

なし。次工程で確認すべき画像内容、埋め込み案内の除去、正式な画像出典・利用条件、拡張区分、同一 map の統合可否、runtime asset 採用、legacy lookup 移行および travel edge の料金・ロード時間は、今回のレビューで解決すべき指摘ではなく、依頼された除外範囲・採用 gate に記録された未確認境界である。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | 対象／検証証拠 |
| --- | --- | --- |
| root allow-list、schema、revision、各 collection | Design §4.1–§4.2、Specification の map/master 境界 | 対象 JSON `:2-16`、validator の `MAP_ROOT_KEYS` と直接実行結果 |
| configured g8/g10/g12/g14/g17、g11除外 | Design §6.1、依頼項目2 | report `configuredInputs` / `excludedInputs`（`:48-57`）、5 legacy JSON、対象 JSON の map 順・画像参照 |
| 28 map の名称、shortName、bounds、画像 | Design §4.2、§6.1 | 対象 JSON `maps`（`:18-1328`）、report `datasets[].maps`、mapSize/10 からの独立再計算、対応 PNG の存在確認 |
| T 77件の名称、座標、所属、source、bounds | Specification §2、Design §4.2・§5.1・§6.1 | 各 map の `aetherytes`、report `datasets[].records` の T 77件、全件独立突合 |
| R/Z の扱い | Specification §2、Design §4.2・§5.1・§6.1 | report の T/R/Z 78件（T=77、R=1、Z=0）、対象 JSON に R/Z がないことを確認 |
| ID 一意性と参照整合性 | Design §4.1–§4.2、§5.1 | expansion/map/aetheryte/source/license ID、sourceIds、expansionId、licenseId の独立検証および validator |
| travelEdges | Specification map/master 境界、Design §4.2・§6.1 | 対象 JSON `:1329` が空配列。未確認料金・ロード時間の水増しなし |
| source/license の権利境界 | Design §4.2、§6.1–§6.2、§14 | `sources` `:1330-1373`、`licenses` `:1374-1381`。未レビュー・未承認の明示と NOTICE/Copyright.txt への限定参照 |
| runtime 非採用と変更境界 | Design §3.1、§6.2、§7.1 | JSON のみ新規追加、runtime/code/legacy JSON/画像の採用変更なし、作業ツリー確認 |

## 10. 検証結果

- 対象 JSON の SHA-256: `d8289693f04c37f77f9e3417448b466ed3cda3fec7a782af529b08af1b20f661`。依頼指定値と一致。
- 既存棚卸し report の SHA-256: `b1b2ddc7d9a545ee78cdd36257fbac9845a7e461997d46442f9e19cd9b65306e`。依頼指定値と一致し、レビュー中に不変。
- JSON 構文、root allow-list、schemaVersion、dataRevision、各階層の unknown field: 独立 Node.js 読み取り検証 PASS。
- `validateMapMaster`: Node.js の `--experimental-strip-types` による既存 validator の直接実行で `usable=true`、diagnostic 0件、map 28件、aetheryte 77件、travelEdges 0件 PASS。
- ID／参照／座標: expansion、map、aetheryte、source、license の ID 一意性、非空 sourceIds、参照解決、bounds の有限性と `min <= max`、aetheryte の bounds 包含を独立検証 PASS。
- legacy report との map 突合: configured 5 dataset、28 mapについて、report順、map名、shortName、mapSize 由来 bounds、`img/map_{grade}_{mapNo}.png` 参照を全件突合 PASS。
- legacy report との aetheryte 突合: T 77件について、stable ID、名称、dataset/mapNo/pointNo、所属 map、legacy `posX/10`・`posY/10`、canonical X/Y、sourceId を全件突合 PASS。
- R/Z/g11 境界: report の R 1件・Z 0件が対象 JSON の aetherytes にないこと、g11 が map・画像参照にないことを確認 PASS。
- 画像参照先: 対象 JSON の全 map image asset が既存 `apps/treasure-compass/public/` 配下の PNG へ解決 PASS。画像の埋め込み案内除去と利用条件の正式確認は未確認。
- source/license 内容: legacy JSON の SHA-256、repo NOTICE、既存 Copyright.txt に限定した参照と、`未レビュー`・`未承認` の明示を確認 PASS。権利承認を示す記載は確認されなかった。
- `travelEdges` の未水増し: 空配列を確認 PASS。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（9 test files、41 tests）。
- `pnpm run build`: PASS（Treasure Compass および Mob Compass）。
- `git diff --check`: PASS。
- 変更パス: `packages/master-data/data/map-master.v1.json` のみが今回の未追跡追加。`MEMORY.md` と `apps/treasure-compass/public/img/aetheryte.png` は保護変更として分離され、変更・採用していない。
- 未実行／未確認: ブラウザ runtime 表示、common master の runtime 接続、画像内の町名・エーテライト表示除去、正式な画像出典・license、拡張区分の確定、同一 map 統合、legacy lookup 移行、travel fee/load time。いずれも今回の依頼の除外範囲または未承認 gate であり、本判定に必須ではない。

## 11. レビューゲート

| ゲート | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | PASS | 変更は候補 JSON のみ。configured input、report、Specification、Design へ map/aetheryte の内容と境界を追跡できる。 |
| Correctness / State / Data | PASS | 28 map、77 T、R/Z/g11 境界、全 map metadata、全 T 名称・所属・座標・source・bounds、ID と参照を独立検証した。runtime state は変更されていない。 |
| Failure / Resource / Runtime Safety | PASS（適用範囲内） | 静的候補データのみで runtime effect はなく、未検証値の推測補完や travel cost の水増しもない。 |
| Compatibility / Integration | PASS（適用範囲内） | 既存 legacy JSON、コード、保存形式、runtime asset を変更せず、source hash と legacy record 追跡情報を保持している。 |
| Security / Trust Boundary | PASS（適用範囲内） | 新しい外部通信、実行コード、秘密情報、個人情報、権限境界変更はなく、権利未確認資産を承認済みと誤表示していない。 |
| Test / Validation / Regression | PASS | JSON shape、既存 validator、独立全件突合、参照先、report hash、lint、unit test、build、whitespace を確認した。 |
| Implementation Discipline | PASS | 対象 JSON だけを追加し、画像コピー、runtime 接続、lookup 移行、依存関係、既存データおよび上流資料へ範囲を拡張していない。 |

CRITICAL/HIGH の New/Open/Reopened は 0件。blocking な upstream issue、必須 evidence の unavailable、必須 validation の未実行・実行不能もない。MEDIUM/LOW の正式 finding もなく、Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- 対象は common map master の候補データであり、現時点で runtime の正本として採用されていない。
- `expansion-unconfirmed` は正式な拡張区分の承認を表さず、候補データ上の未確認境界である。
- `license-ffxiv-third-party-unreviewed` は利用許諾・出典・runtime 採用を承認する license record ではない。画像の正式確認前に runtime asset として採用してはならない。
- 既存画像に町名・エーテライト表示が残っていないこと、画像の正式出典・利用条件、同一 map の統合可否は未確認である。
- travelEdges が空のため、複数 map の料金・ロード時間を用いた経路比較は後続工程で追加確認が必要である。空配列自体は今回の未確認情報を水増ししない要件に適合する。
- legacy JSON または report が変更された場合は、対象 JSON の dataRevision、hash、map/aetheryte 全件突合を再実施する必要がある。
- stable ID は今回の legacy dataset/mapNo/pointNo に対して決定的で追跡可能だが、同一 map の統合や将来の訂正時に ID を維持できるかは後続の map identity review で確定する。

## 13. 自動変更

レビュー対象 JSON、既存 report、既存レビュー、コード、テスト、上流 docs、README、`MEMORY.md` および画像は変更していない。新規作成したレビュー成果物は本ファイルのみで、commit は実行していない。

## 14. 最終判定

`READY`
