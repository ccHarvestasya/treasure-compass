# Implementation Review 001

## 1. レビュー対象

- 確認日: 2026-09-12
- 対象工程: Implementation / Test（既存 legacy Treasure JSON の棚卸しレポート準備フェーズ）
- 実装対象: `packages/master-data/reports/legacy-treasure-inventory.v1.json`
- 対象SHA-256: `b1b2ddc7d9a545ee78cdd36257fbac9845a7e461997d46442f9e19cd9b65306e`
- ベース実装コミット: `9d34f25b2bebf1ede795f81f4eae988ac4bc70ff`
- 依頼範囲: g8/g10/g12/g14/g17 の既存JSONを棚卸しし、T/R/Zの個別記録、座標、入力ハッシュ、除外・採用境界を機械可読レポートへ記録すること。
- 除外範囲: common map master の作成、stable ID の割当、UI・状態・runtime連携、既存JSONの変更、画像の採用・編集、source/licenseの承認。
- 作業ツリーのprotected変更: `MEMORY.md`（変更）および `apps/treasure-compass/public/img/aetheryte.png`（未追跡）。これらは今回の実装対象に含めず、レビュー成果物でも内容を再掲しない。

## 2. 使用した根拠

- 最新のレビュー依頼: 対象ファイル、SHA、検証項目、inventoryフェーズの境界および判定規則。
- Repository instructions / `AGENTS.md`: 変更範囲、静的データ検証、protected変更、報告規則。
- Specification: `eaf1e7780cdd70afedc7173541cc3fa79c16c985`、SHA-256 `b80fbaf3448fff3448e5051ec751c468bc1760f298ed5c86c98059c6508eb993`。
- Design: `9d34f25b2bebf1ede795f81f4eae988ac4bc70ff`、SHA-256 `83ae38aec491f294348663af4138c1c976851357e0f53b9393eda5ec42069d02`。特に §6.1–§6.2 の入力allow-list、座標変換、R/Z除外、reportおよび採用gateを使用した。
- `apps/treasure-compass/src/constants/index.ts:28-58`: 現行 `GRADE_CONFIG` の到達可能なg8/g10/g12/g14/g17。
- `apps/treasure-compass/public/json/g8.json`、`g10.json`、`g12.json`、`g14.json`、`g17.json`、`g11.json`: 棚卸し元および明示的除外入力。
- `packages/master-data/src/legacy-report.ts:1-7,135-189`、`packages/master-data/tests/legacyReport.test.ts:12-56`: allow-list、bounds、座標式、divisionのdisposition、dropped fieldsおよび採用停止境界の補助確認。
- レビュー対象の内容と、実行したJSON／件数／座標／ハッシュ／build検証。

## 3. レビュー結果

`READY`

## 4. 総評

対象レポートは、設定対象をg8/g10/g12/g14/g17に限定し、g11を除外したうえで、28 maps、305 points、P=227、T=77、R=1、Z=0を入力JSONと一致する形で記録している。T/R/Zの全78件について、map metadata、legacy座標、`posX/10`・`posY/10` のcanonical座標、disposition、dropped fieldsを突合できた。

Rは `g10/map-5/point-9` の1件だけで、`excluded` として共通map master・表示・参照・経路計算への採用対象外であることが明示されている。runtime非採用、stable ID・map identity・image・source/license未確認も明示されており、次工程のmaster採用を先取りしていない。

blockingなCRITICAL/HIGHの実装指摘、必須証拠の欠落、必須検証の未実行・実行不能は確認されなかった。

## 5. 指摘事項

なし。

正式なIR findingは、対象レポートまたは適用される上流根拠に追跡でき、今回のinventoryフェーズで解決すべき具体的欠陥に限定した。common master未作成、stable ID未割当、source/license未承認は依頼された対象範囲外であり、指摘事項へ変換していない。

## 6. 解消済み指摘

なし。今回の対象に対する過去のImplementation Reviewは確認されなかった。

## 7. 上流へのフィードバック

今回の対象に関する新規の上流フィードバックはなし。

既存のDesign Review 005に記録された非blockingのMinor指摘（traceability表の節参照）は、本レポートのデータ正確性、runtime非採用境界および本レビューの判定を阻害しないため、今回のImplementation findingとして再計上していない。

## 8. 保留した指摘

なし。common map master作成、stable ID対応、map identity・重複・画像・source/licenseの確認は、今回のinventoryフェーズの対象外であり、保留指摘ではなく明示された次工程境界として扱う。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | レポート／補助証拠 |
| --- | --- | --- |
| g8/g10/g12/g14/g17のallow-list、g11除外 | Design §6.1 | レポート `generatedFrom`／`configuredInputs`／`excludedInputs`（`legacy-treasure-inventory.v1.json:10-58`）、`GRADE_CONFIG` |
| 28 maps、305 points、P/T/R/Z集計 | Design §6.1、依頼項目2 | レポート `totals`（`:59-67`）、入力JSONとの独立再集計 |
| map metadata、mapSize、bounds、入力SHA-256 | Design §6.1 | レポート各datasetの `inputSha256`、`mapSize`、`bounds`、`maps`、入力JSONとの全件突合 |
| T/R/Zの個別records、座標、disposition、dropped fields | Design §6.1–§6.2 | レポート `datasets[].records`、`fieldTreatment`（`:69-96`）、全78件の独立突合 |
| Rの除外、Zの不存在 | Specification §5.1、Design §6.1 | レポート `exclusions`／`adoption`（`:2608-2637`）、g10のRレコードとの突合 |
| runtime・master・source/license採用境界 | Design §6.2 | レポート `runtimeAdoption`（`:6-8`）、`adoption`／`adoptionBlockedBy`（`:2625-2644`） |
| 変更範囲 | 依頼、AGENTS.md | `git status --short` と変更パス一覧。対象レポート以外はprotected変更のみ |

## 10. 検証結果

- 対象レポートのSHA-256: `b1b2ddc7d9a545ee78cdd36257fbac9845a7e461997d46442f9e19cd9b65306e`。依頼された値と一致。
- JSON shape／構文: `jq` によるroot、schemaVersion、reportType、datasets、maps、recordsの検証 PASS。
- source/report比較: Node.jsの一時的な読み取り専用比較で、5入力のファイルSHA-256、mapSize、map metadata、bounds、map/point件数、divisionCounts、T/R/Z全78件のidentity・名称・legacy座標・canonical座標・disposition・dropped fieldsを突合 PASS。
- 集計: configured 5 dataset、28 maps、305 points、P=227、T=77、R=1、Z=0を入力JSONから再集計し、レポートと一致 PASS。
- 除外境界: g11の入力SHA-256、g10/map-5/point-9のR、Zレコードなし、runtime非採用および採用未承認状態を確認 PASS。
- `git diff --check`: PASS。対象レポートの末尾空白チェックもPASS。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（9 test files、41 tests）。
- `pnpm run build`: PASS（Treasure CompassおよびMob Compassのbuild）。
- 変更パス: `MEMORY.md`、`apps/treasure-compass/public/img/aetheryte.png`、対象レポートのみ。既存JSON、UI、状態、実行時画像の既存ファイル、上流文書は変更されていない。
- 未実行／未確認: ブラウザ上の表示確認、画像内容・licenseの採用確認、common masterの検証。いずれも本レビューの除外範囲であり、今回の判定に必須ではない。

## 11. レビューゲート

| ゲート | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | PASS | 依頼されたreportだけが対象で、allow-list、g11除外、R/Z境界およびruntime非採用を上流根拠へ追跡できる。 |
| Correctness / State / Data | PASS | 集計、全map metadata、全T/R/Z record、座標、disposition、dropped fields、入力hashを独立突合した。状態・runtime採用は変更されていない。 |
| Failure / Resource / Runtime Safety | PASS（適用範囲内） | 静的なinventory reportのみでruntime effectはなく、runtimeAdoption=falseが明示されている。 |
| Compatibility / Integration | PASS（適用範囲内） | 既存JSONを変更せず、レポートはruntime assetへ採用されない。入力ファイルのpathとhashが記録されている。 |
| Security / Trust Boundary | PASS（適用範囲内） | 外部通信、認証、実行コード、秘密情報、個人情報の追加はなく、入力JSONをruntime採用する境界も追加されていない。 |
| Test / Validation / Regression | PASS | JSON shape、独立再集計・全件突合、lint、unit test、build、差分確認を実行し、すべてPASSだった。 |
| Implementation Discipline | PASS | 新規ファイルは対象reportのみで、既存JSON、UI、状態、画像、依存関係および上流文書を変更していない。 |

CRITICAL/HIGHのNew/Open/Reopenedは0件。必須evidenceおよび必須validationにblockingなUnavailableはなく、Gateは`READY`とする。

## 12. 残存リスクと未決定事項

- このレポートは棚卸し証跡であり、runtimeおよび共通map masterには採用されていない。stable ID、map identity、重複解消、画像内容、source/licenseは未確定である。
- 入力JSONが変更された場合、記録済みSHA-256と集計・個別recordが古くなるため、master検討前に再生成または再突合が必要である。
- g11にはデータが存在するが、現行 `GRADE_CONFIG` の到達対象外として今回のconfigured inputに含めていない。採用する場合は別途承認が必要である。
- Rは1件のみで、座標は入力値 `0,0` から記録された `0,0` だが、dispositionはexcludedであり採用候補ではない。Zは今回の入力JSONに存在しない。
- protected変更の`MEMORY.md`と未追跡の`apps/treasure-compass/public/img/aetheryte.png`は今回の対象外であり、採用可否・内容・licenseのレビュー結果を示すものではない。

## 13. 自動変更

レビュー対象、既存JSON、コード、上流文書、既存レビュー、`MEMORY.md`および画像は変更していない。新規作成したレビュー成果物は本ファイルのみで、commitは実行していない。

## 14. 最終判定

`READY`
