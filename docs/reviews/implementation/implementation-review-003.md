# Implementation Review 003

## 1. レビュー対象

- Task ID: `TC-DATA-20260912-IMAGE-REFS-REVIEW`
- レビューサイクル: `003`
- 確認日: 2026-09-12
- 対象工程: Implementation / Test（ラベルなし地図画像と map master 画像参照）
- ベース: commit `4a0fb87df72ab84009471cbeb8db0cd714e50300`
- 対象成果物: `packages/master-data/data/map-master.v1.json`
- 対象SHA-256: `aebc5247e2ba680fab3442ce11c2ef7ef9bd18952837fe56328506cd0488f225`
- 採用候補画像: `apps/treasure-compass/public/img/map_3_1.png`〜`map_3_4.png`、`map_4_1.png`〜`map_4_6.png`、`map_5_1.png`〜`map_5_6.png`、`map_6_1.png`〜`map_6_6.png`、`map_7_1.png`〜`map_7_6.png`
- 依頼範囲: 画像の存在・形式・寸法・内容確認、map master の参照更新、既存データ境界、出典・license 未承認境界、変更範囲および検証証拠をレビューする。
- 今回の変更範囲: map master の `dataRevision` と `image.asset` 参照、およびユーザー提供の28枚のPNG資産。
- 保護変更: 既存の `MEMORY.md`、既存のエーテライト画像、XCF作業資産および既存の `map_g*.png`・g11画像はレビュー対象外として分離し、変更していない。
- 除外範囲: runtime採用・UI接続、画像の再配置、画像編集・再圧縮、XCF採用、画像license承認、map identity統合、legacy lookup、`travelEdges` 確定、既存JSON・コード・テスト・README・上流資料の変更。

## 2. 使用した根拠

- 最新のレビュー依頼: Task ID、cycle 003、対象SHA-256、28画像の対応表、必須確認事項、変更禁止、Gate規則。
- Repository instructions / `AGENTS.md`: 静的データ・画像の検証、既存変更の保護、変更範囲および未実行検証の報告規則。
- `$implement-review` および `author-review-orchestrator`: Implementation / Test の適合性、Finding分類、14セクション形式、レビュー資料の不変性とサイクル管理。
- Specification: commit `eaf1e7780cdd70afedc7173541cc3fa79c16c985`、SHA-256 `b80fbaf3448fff3448e5051ec751c468bc1760f298ed5c86c98059c6508eb993`。§4.4、§10.1〜10.3、§13.2および画像・map master境界を確認した。
- Design: commit `9d34f25b2bebf1ede795f81f4eae988ac4bc70ff`、SHA-256 `83ae38aec491f294348663af4138c1c976851357e0f53b9393eda5ec42069d02`。§4.2、§5.1、§6.1〜6.2、§14相当の画像・採用gate・検証責務を確認した。
- 既存棚卸し report: `packages/master-data/reports/legacy-treasure-inventory.v1.json`、SHA-256 `b1b2ddc7d9a545ee78cdd36257fbac9845a7e461997d46442f9e19cd9b65306e`。
- 既存レビュー: `implementation-review-001.md` と `implementation-review-002.md`。いずれも別成果物の履歴として参照し、変更・上書きしていない。
- 対象実装: `map-master.v1.json` の root、28 map、aetheryte、`travelEdges`、sources、licenses、および `packages/master-data/src/validate.ts` の `validateMapMaster`。
- 補助証拠: 対応する legacy Treasure JSON、対象PNGの `file` / `identify` / SHA-256、PNG一覧の目視確認、Git差分、lint・unit test・build結果。

## 3. レビュー結果

`READY`

## 4. 総評

map master は `dataRevision` を `2026-09-12.2` に更新し、既存28 mapの画像参照だけを、version 3→g8、4→g10、5→g12、6→g14、7→g17の対応するPNGへ置き換えている。28参照は一意で、対象PNGへ一対一に解決できる。ベースとの差分は revision と `image.asset` に限定され、既存 map情報、77件のTエーテライト、R/Z/g11の境界、空の `travelEdges` は維持されている。

28枚すべてがPNGとして読み込み可能で、寸法は658×658または658×657だった。全28枚の接触シートと代表5枚の原寸表示を確認し、旧画像に見られた大きな町名・エーテライト案内の重ね書きは新画像では確認されなかった。地図本体の装飾、タイトルおよび背景内の地名は残っているが、依頼で除去対象とされたアプリ案内の重複とは区別され、これらを追加除去する要求は作成していない。

画像のlicense recordは `license-ffxiv-third-party-unreviewed` のままで、NOTICEおよび既存Copyright.txtを参照する未レビュー・未承認境界を明示している。正式な出典・利用許諾やruntime採用を承認済みと誤表示していない。レビュー中に対象・上流資料・既存レビュー・画像を変更せず、CRITICAL/HIGHの実装指摘、blocking condition、必須validationの未実行は確認されなかった。

## 5. 指摘事項

なし。

正式なIR findingは、対象または適用される上流根拠へ追跡でき、現在工程で解決すべき具体的な欠陥に限定した。runtime採用、正式な画像出典・利用許諾、画像の再配置、map identity統合、legacy lookup、`travelEdges` 確定は依頼で明示された対象外または未承認境界であり、実装欠陥へ変換していない。

## 6. 解消済み指摘

なし。`implementation-review-001.md` は legacy inventory report、`implementation-review-002.md` は map master候補データの別レビュー系列であり、今回の画像参照更新の過去findingとして再解釈していない。

## 7. 上流へのフィードバック

今回の対象に関する新規の上流フィードバックはない。画像の正式な出典・利用条件はSpecification / Designが採用gateとして扱う未確認境界を維持しており、今回の実装レビューが承認判断を補完していない。

## 8. 保留した指摘

なし。正式な画像出典・利用条件の確認、runtime assetとしての採用、画像の配置先・公開手順、map identity統合、legacy lookupおよび`travelEdges`は、今回の対象外または後続の採用gateであり、保留findingではなく除外範囲・残存境界として記録する。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | 対象／検証証拠 |
| --- | --- | --- |
| `dataRevision` と map master構造 | Design §4.2、§5.1、Specification §10.1 | 対象JSON `:2-3`、既存validator、対象SHA-256 |
| 28 mapと画像の対応 | Design §4.2・§6.1〜6.2、Specification §4.4・§13.2 | 対象JSON `maps` の全28 `image.asset`、version 3/4/5/6/7とg8/g10/g12/g14/g17の全件対応、PNG参照先検査 |
| 77 Tエーテライト | Specification §10.1〜10.2、Design §4.2・§5.1 | 対象JSONの全aetheryte件数、既存map masterからの不変部分比較、validator |
| R/Z/g11境界 | Specification §10.1〜10.2、Design §6.1 | map masterにR/Zレコードとg11参照がないこと、legacy report hash不変、旧参照混入検査 |
| `travelEdges` | Design §4.2・§6.1〜6.2 | 対象JSONの空配列を確認。未確認の料金・ロード時間を追加していない |
| PNG形式・寸法・存在 | Specification §4.4・§13.2、Design §6.1〜6.2 | 28ファイルの`file` / `identify`結果、全件存在、658×658または658×657 |
| 画像内容の背景専用境界 | Specification §4.4・§10.1、Design §4.2・§6.1 | 28枚接触シート、代表5枚原寸目視。大きな町名・エーテライト案内の重ね書きなし。装飾・タイトル・背景内地名は保持 |
| license・sourceの未承認境界 | Specification §10.1・§13.2、Design §4.2・§6.2・§14 | `license-ffxiv-third-party-unreviewed` の名称・notice、sources catalog、NOTICE / Copyright.txt参照 |
| 変更範囲・回帰 | AGENTS.md、依頼の変更禁止 | Git status・diff・diff check。対象JSON以外の既存tracked変更なし。保護変更は分離 |

## 10. 検証結果

- 対象JSONのSHA-256: `aebc5247e2ba680fab3442ce11c2ef7ef9bd18952837fe56328506cd0488f225`。依頼指定値と一致。
- ベースHEAD: `4a0fb87df72ab84009471cbeb8db0cd714e50300`。現在HEADも同一で、対象JSONは作業ツリー変更としてレビューした。
- ベースとの差分: `dataRevision` 1箇所と28個の`image.asset`だけ。map、aetheryte、source、license、`travelEdges`の他フィールドに差分なし。
- JSON構文、root形状、既存`validateMapMaster`: PASS（`usable=true`、diagnostic 0件）。
- map master件数: 28 map、77 aetheryte、`travelEdges` 0件。PASS。
- 対応関係: version 3→g8（4件）、4→g10（6件）、5→g12（6件）、6→g14（6件）、7→g17（6件）。28参照が一意で、対応PNGへ全件解決。PASS。
- 旧`map_g*`参照・g11参照: 対象map master内になし。PASS。
- R/Z: map master内に混入なし。既存reportのR=1、Z=0、T=77の境界と整合。PASS。
- 既存棚卸しreportのSHA-256: `b1b2ddc7d9a545ee78cdd36257fbac9845a7e461997d46442f9e19cd9b65306e`。依頼指定値と一致し、レビュー中不変。PASS。
- license境界: `license-ffxiv-third-party-unreviewed` が正式な利用許諾・出典確認・runtime採用を未レビュー・未承認として明示。PASS。
- 画像形式・寸法: 28枚すべてPNG / RGBA。`map_3_1`〜`map_3_4`、`map_4_1`、`map_6_1`〜`map_7_6`等は658×658、`map_4_2`〜`map_5_6`は658×657。全件許容範囲内。PASS。
- 画像の個別SHA-256:

  | ファイル | SHA-256 |
  | --- | --- |
  | `map_3_1.png` | `eb8eac8a7e6fee5566368e6edf593fe2abf81a475694b128dd87f7625cd41ba3` |
  | `map_3_2.png` | `0373fe6294d26fd2d95d71ec749c421fe2f740062ace25af7e44624dc725e94c` |
  | `map_3_3.png` | `c9599a53b9abd4eaed00caafb1badb96b27fb34ffa9a2378caa977a7a9ad8ad5` |
  | `map_3_4.png` | `546a0940d88f58a9bfe8e36d88f7fdd763e6d3011da9aa2d7b1e9283e48d00b1` |
  | `map_4_1.png` | `5f95be7473637fe74606679a31d6e8ea5ca842a0b17336903f3f4fc26212b512` |
  | `map_4_2.png` | `0a3afae1d4354dfdc54710fae5f55c8004b003618fda8d5b1639de2807140dab` |
  | `map_4_3.png` | `e1ee969ca35fabbc13df51df7b61bcf6d23035090cf24757d9630ee746d8dbc7` |
  | `map_4_4.png` | `490561a8b3c994c7b7bf89ce8fd7e1e184be7549066b641d72f915dc033246c2` |
  | `map_4_5.png` | `1c9b9ca9bddc337f6ad8e07c5e15217bfc50fead28def7d656f98b4a7d709536` |
  | `map_4_6.png` | `440d2bb370aa7f9e4e263c63eed7c204001bedacf7132f459360276ccabcdaee` |
  | `map_5_1.png` | `f57ba895333527a7c3ea7813dc3968257050a7a7a979585c7a7019a68e729c50` |
  | `map_5_2.png` | `53a4dafa7e371b57f3482355f1bb391ffdb7d7e832dcd6740f5d572c2aa0140d` |
  | `map_5_3.png` | `ada6ab9fe374e9601dbcaa2bd0baa34617515a0fabb5664a19e0776563fd1bed` |
  | `map_5_4.png` | `ef3a83b0037ef38408c2ee6be04ebbed5a390a49438fe66a2b883e2c01fa623e` |
  | `map_5_5.png` | `21eeff6aa0945b7b3daa6532396620802e32fdef148021e121c4bdd74ce78200` |
  | `map_5_6.png` | `94370b8828e83b9478c92785a54c116f48eac754cc28066c804a7d5db8cc7075` |
  | `map_6_1.png` | `c66d2ba37fb0f9f7b74c3064cdf4d212650e4a99628dce4bac95205df65e18cd` |
  | `map_6_2.png` | `2903845e06a6c8be1a01b83f47fc289ec7160ac678bd6797ed9048f0da1cfaf3` |
  | `map_6_3.png` | `7a15f4b891a85dbe83fac9b0e2bfb9b7e4d79f0240a50ee488db92f21f8119e4` |
  | `map_6_4.png` | `da97bcbdf98e531b20b34f41fb41a4e11b2f8ad8496a0d22666429aa659056a5` |
  | `map_6_5.png` | `c2b61d27d213bce831769f7bf8a28c1c839f3146884f969242b29b74b6a8513c` |
  | `map_6_6.png` | `fb4bf4a775acae006611917c94b5728e8e0f8ddd16d2dedd8bcb7f6a3f690458` |
  | `map_7_1.png` | `73dd418a248d5a59cf83c837c95b9d23146cab0950ba804ac6a24cdc601bb55c` |
  | `map_7_2.png` | `0ba8b01efa8cabdf5f3cb109c351fafc64c98d06094fba4b5510486cc9eef90e` |
  | `map_7_3.png` | `e018d3b4b821bb598c32d2ce10c5162c22e581c8cbfa16b0b5f9c15ed8ea41ce` |
  | `map_7_4.png` | `d8e4217433d5e14cea1aef086b1d77b88bf2adc0708f9ecd789166aec2f457a8` |
  | `map_7_5.png` | `1b0d4e9d8eba5a102a072d5bde7dd29448f4e22950b242bef553b483904d1e8f` |
  | `map_7_6.png` | `4d561beb3af1bc6d467a5c29c7bef5889f47738ee4a1cedb0daea3e48875ac2a` |

- 画像内容の目視: 全28枚の7×4接触シートと、`map_3_1`、`map_4_5`、`map_5_4`、`map_6_1`、`map_7_6`の原寸画像を確認。大きな町名・エーテライトアイコンのアプリ案内は確認されず、地図の装飾・タイトル・背景内の地名は残存。依頼の背景専用境界に照らしてPASS。
- PNG自体の変更: レビュー中に対象PNGの再圧縮・変形・上書きは行っていない。XCF、既存画像、UI/runtimeは変更していない。PASS。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（9 test files、41 tests）。
- `pnpm run build`: PASS（Treasure CompassおよびMob Compass）。
- `git diff --check`: PASS。
- 変更パス確認: 今回のレビュー対象に属するtracked差分は `packages/master-data/data/map-master.v1.json` のみ。`MEMORY.md` は保護された既存差分であり、採用候補画像・その他の保護対象も既存の作業ツリー状態として分離され、レビュー中に変更していない。

## 11. レビューゲート

| ゲート | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | PASS | revision、28参照、5 version/grade対応、Specification・Design・reportへ追跡でき、対象外をruntime採用へ拡張していない。 |
| Correctness / State / Data | PASS | 28 map、77 T、R/Z/g11境界、空の`travelEdges`、一意な参照および既存意味データの不変性を確認した。 |
| Failure / Resource / Runtime Safety | PASS（適用範囲内） | 静的参照と画像資産のみで、未確認の値を補完せず、runtime接続や状態変更を行っていない。 |
| Compatibility / Integration | PASS（適用範囲内） | map masterの参照形式を維持し、旧JSON・legacy report・既存コードを変更していない。 |
| Security / Trust Boundary | PASS（適用範囲内） | 新しい実行コード・通信・秘密情報はなく、未確認の画像licenseを承認済みと表示していない。 |
| Test / Validation / Regression | PASS | JSON、validator、参照先、全画像形式・寸法・hash、目視、report hash、lint、unit test、build、whitespaceを確認した。 |
| Implementation Discipline | PASS | 対象JSONと採用候補画像の境界を守り、画像・上流資料・既存レビュー・保護変更を改変していない。 |

CRITICAL/HIGHのNew/Open/Reopenedは0件。blockingなupstream issue、必須evidenceのunavailable、必須validationの未実行・実行不能もない。MEDIUM/LOWの正式findingもなく、Gateは`READY`とする。

## 12. 残存リスクと未決定事項

- `map-master.v1.json` と28画像は、今回の作業ツリーではruntime採用前の候補として扱う。runtime接続は後続工程で確認する。
- `license-ffxiv-third-party-unreviewed` は正式な利用許諾・出典・runtime採用を示さない。画像の正式な出典・利用条件が確認されるまで採用gateを通過しない。
- 目視確認は全28枚の接触シートと代表5枚の原寸確認であり、表示環境を変えたブラウザ上のruntime確認ではない。runtime表示は今回の対象外である。
- 地図本体の装飾、タイトルおよび背景内の地名は残存する。これらは今回の「動的な町名・エーテライト案内との重複」から除外しており、追加除去の判断はしていない。
- 正式なmap identity統合、legacy lookup、画像再配置、`travelEdges`、公開手順は未確定のままである。
- legacy JSON、棚卸しreportまたは画像が後から変更された場合は、対象JSONのSHA-256、28参照、全画像hash、report hashおよびvalidatorを再確認する必要がある。

## 13. 自動変更

レビュー対象のmap master、28 PNG、既存report、既存レビュー、コード、テスト、上流docs、README、保護変更および対象外画像は変更していない。新規作成したレビュー成果物は本ファイルのみで、commit・push・tag・publishは実行していない。

## 14. 最終判定

`READY`
