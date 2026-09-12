# Treasure Compass / Mob Compass Specification Review 010

## 1. レビュー対象

- レビューサイクル: 010（grade/version 表示対応表反映後）
- 対象フェーズ: Specification
- 確認日: 2026-09-12（Asia/Tokyo）
- 対象成果物: `docs/specification/specification.md` Revision 004
- 対象範囲: §4.3 のグレード表示契約、`SPC-AC-026`、既存互換性境界、および本文全体との整合
- 未確認範囲: UI・実装・README・master data・ブラウザ表示・既存保存データでの実表示、G18 の実データ提供時期

## 2. 使用した根拠

- ユーザーの明示判断: G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17→7.x、G18→7.x。
- 承認済み Requirements: `docs/requirements/requirements.md` および Requirements Review 009。既存 Treasure の継続利用と保存互換性を確認した。
- 承認済み Concept: `docs/concept/concept.md` および Concept Review 005。製品範囲・責任境界を確認した。
- 対象 Specification Revision 004 と前回 Specification Review 009。
- `spec-review` のレビュー手順、共通出力形式、ゲート、security checklist。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。新規・未解消・再発の正式 finding はない。

## 4. 総評

ユーザーが確定した対応表は、利用者向け表示という外部契約として §4.3 と `SPC-AC-026` に一意に記載されている。G17 と G18 が同じ `7.x` 系列であることも明記され、内部 grade 数値、legacy JSON ファイル名、既存保存値を変更しない互換性境界が定義されている。

同じ入力・状態に対する表示結果は対応表から一意に決まり、内部実装方式を拘束していない。Requirements の既存 Treasure 継続性と矛盾せず、G18 の実データや UI 実装を仕様から推測していない。

## 5. 指摘事項

なし。

## 6. 解消済み指摘

なし（今回の変更に対応する新規指摘は発生していない）。過去レビューの未解消 Critical は確認されなかった。

## 7. 上流へのフィードバック

なし。対応表はユーザーの最新の明示判断で確定しており、Requirements / Concept の追加判断は不要である。

## 8. 保留した指摘

- UI、README、master label、既存保存データの実表示への反映は Implementation / Documentation の後続作業。
- G18 の実データ追加可否・時期は master data preparation の後続判断。

## 9. 対象範囲と追跡

| 確認対象 | 根拠 | Specification | 判定 |
| --- | --- | --- | --- |
| grade/version 表示対応表 | ユーザー明示判断、REQ-Q-002 の既存継続性 | §4.3、`SPC-AC-026` | PASS |
| 内部値・legacy 保存互換性 | REQ-Q-002、既存保存互換性契約 | §4.3、§9.2、`SPC-AC-026` | PASS |
| G17/G18 同系列 | ユーザー明示判断 | §4.3、`SPC-AC-026` | PASS |

## 10. 検証結果

- `git diff --check`: PASS。
- Specification の対応表、互換性境界、適合条件の相互参照を目視確認: PASS。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE（文書レビュー）。
- UI、README、master data、ブラウザ表示、既存保存データの実表示: Not validated。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | 表示契約と互換性境界の対象が明確。 |
| 2. 要件追跡と契約 | PASS | ユーザー判断および既存継続性へ追跡可能で、対応表が一意。 |
| 3. 処理と例外 | PASS | 表示変更と内部値・保存値の非変更条件を確認可能。 |
| 4. 内部整合性 | PASS | §4.3 と `SPC-AC-026` の値・意味が一致。 |
| 5. 検証可能性 | PASS | 各 grade の表示値と非変更対象を独立検証可能。 |
| 6. 安全性・相互運用性 | PASS | 既存保存互換性を維持し、外部形式の無断変更を要求しない。 |
| 7. 上流整合性と工程境界 | PASS | 内部実装を固定せず、後続 UI / README / master 作業へ適切に委譲。 |

Critical 0 / Major 0 / Minor 0 のため、最終ゲートは `READY`。

## 12. 残存リスクと未決定事項

- 対応表の UI・README・master label への反映は未実施。
- G18 が実際に選択可能になる時期・データ範囲は未決定。

## 13. 自動変更

なし。レビュー成果物のみを追加し、Specification、Requirements、Concept、Design、コード、テスト、README、画像および `MEMORY.md` は変更していない。コミットは実施していない。

## 14. 最終判定

**READY**

grade/version 対応表は外部から検証可能で、Specification は次工程へ引き渡し可能である。
