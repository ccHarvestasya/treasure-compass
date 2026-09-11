# Treasure Compass / Mob Compass Specification Review 009

## 1. レビュー対象

- レビューサイクル: 009（SR-024 対応後の再レビュー）
- 対象フェーズ: Specification
- 確認日: 2026-09-12（Asia/Tokyo）
- ブランチ: `maintenance/add-mob-compass`
- 対象成果物: `docs/specification/specification.md`
- 対象 Specification SHA-256: `b80fbaf3448fff3448e5051ec751c468bc1760f298ed5c86c98059c6508eb993`
- 承認済み Requirements HEAD: `1211d936d48f8070b0e0c4566004b5f3dd6a0301f`
- 承認済み Requirements SHA-256: `30f91a210b44bc2e69422d6d807ac678e7b6ca52fa669301308bc7618554cba0`
- 前回レビュー資料（不変）: `docs/reviews/specification/specification-review-008.md`
- 前回レビュー資料 SHA-256: `068f61d2e28e17ca5054a8101bfdb24dfab18424da91e1dc31c63f0a1c930900`
- 前回対象 SHA-256: `984e3e4f9083f4128a5219ee8d234cad65394704bdfd4d0ea751b62e01996e9b`
- 前回 finding: `SR-024`（Critical / New）、`REVISE SPECIFICATION`
- レビュー範囲: Specification 全文、SR-024 の修正、動的エーテライト表示、共通地図情報、`division=T` / legacy `division=R` 境界、画像との重複除去、非操作性、初期日本語・将来ローカライズ境界、既存契約の回帰、Requirements traceability、two-implementation test、工程境界、安全性・相互運用性。
- 未確認範囲: 実装、テスト実行、静的マスターデータの実値、地図画像の編集結果、ブラウザ表示、マスターデータの正確性・完全性、出典・ライセンスの実査、仕様を実現する Design の実装可能性。

## 2. 使用した根拠

- 最新のユーザー判断: 通常地図・地点選択表示での全有効エーテライトの継続表示、実座標へのアイコン配置、町名ラベルの近接・重なり回避、コネクタ線なし、狭い・過密な表示でのアイコン優先、案内表示の非操作性、共通地図情報、検証済み `division=T` のみの採用、legacy `division=R` の不使用、背景画像との重複除去、既存アイコン資産の出典・利用条件確認、新しいラベルデザイン、初期日本語・将来ローカライズ境界。
- 承認済み上流: `docs/requirements/requirements.md` と `docs/reviews/requirements/requirements-review-009.md`。外部要求、Acceptance、Specification への明示的 handoff、責任境界を確認した。
- 上流コンセプト: `docs/concept/concept.md` と `docs/reviews/concept/concept-review-005.md`。目的、利用者、v1 範囲、対象外、責任境界との整合を確認した。
- レビュー対象: `docs/specification/specification.md` 全文。SR-024 対応差分、外部契約、適合条件、traceability、下流引継ぎおよび未決定事項を検査した。
- 前回レビュー: `docs/reviews/specification/specification-review-008.md`。SR-024 の事実、必須修正、再確認条件、判定および SR-019〜SR-023 の状態を確認した。前回資料は編集していない。
- 下流文脈: `docs/design/design.md`。外部契約との明白な矛盾、Design handoff および過剰な内部方式固定の有無の確認に限って参照した。
- 既存利用者向け契約・作業指針: `README.md`、`AGENTS.md`。既存 Treasure の継続範囲と文書レビューの検証境界を確認した。
- レビュー手順: `.agents/skills/spec-review/SKILL.md`、`reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`、`.agents/skills/review-common/review-playbook.md` および `output-format.md`。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。SR-024 は Resolved であり、New / Open / Reopened の finding はない。Specification は Design へ引き渡し可能である。

## 4. 総評

SR-024 の修正により、§4.4 はアイコンの実座標固定、表示可能領域、ラベル矩形、NFC 後の Unicode code point 数、8方向の候補位置、4 CSS px の間隔、ラベル間の正の面積による重なり判定、最大 8 件、安定識別子順・候補順の同率決定、ラベル省略およびアイコン優先を定義している。§10.2、`SPC-AC-023`、§13.3 も同じ契約を参照し、未決定事項としての `SPC-OPEN-001` を残していない。

CSS px、Unicode NFC / code point、8方向、4px、最大8件は、利用者から観測できる矩形・位置・表示数・表示／非表示結果を決める外部契約である。CSS の具体的な部品、フォント実装、配置ライブラリ、探索アルゴリズムを指定しておらず、Requirements が Specification に委譲した表示結果の明確化として適切である。表示可能な地図領域 `(W, H)` はラベル配置への外部入力として定義され、同じ領域と入力で通常地図・地点選択表示の規則が一致している。

動的エーテライトの表示対象、共通地図情報、検証済み `division=T` のみの採用、legacy `division=R` の除外、無効情報の拒否、画像の背景化、案内表示の非操作性、初期日本語および将来ローカライズ境界も Requirements と整合する。既存 Treasure の入力・互換性、Mob、経路、進行、保存、スマートフォンおよび安全性・相互運用性の契約に回帰は確認されなかった。

## 5. 指摘事項

なし。現行 Specification に対する新規、未解消または再発の正式 finding は確認されなかった。

## 6. 解消済み指摘

前回レビュー資料を変更せず、SR-024 と過去 finding の解消条件を対象版で確認した。

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| SR-024 | Resolved | §4.4 に CSS px の表示領域・矩形、NFC 後の code point 数、8方向・4px の候補、重なり判定、最大8件、安定識別子順・候補順の決定規則が定義された。§10.2、`SPC-AC-023`、§13.3 も同一契約へ揃えられ、`SPC-OPEN-001` の upstream 再委譲は除去された。 |
| SR-019 | Resolved（継続確認） | §6.2 の料金・ロード時間が相反する同率候補に対する同率表示と規定タプル列による採用経路の決定規則が維持されている。 |
| SR-020 | Resolved（継続確認） | §3.1、§5.2、§7.1〜7.2 の初回自動順序、手動順序への一般モブ追加時の候補選択および候補固定が維持されている。 |
| SR-021 | Resolved（継続確認） | §5.4 と §7.2 のソロ／パーティ、一般／B／A 以上の対象単位削除と候補・進捗・順序・現在地点への結果が維持されている。 |
| SR-022 | Resolved（継続確認） | §4.1 の未完了地点の訂正と完了済み地点の置換後の状態遷移が維持されている。 |
| SR-023 | Resolved（継続確認） | §4.2 と §10.1〜10.2 の指定記号、未知記号、非負かつ地図別範囲内の座標境界が維持されている。 |

過去 SR-001〜SR-018 のうち現 Requirements に継承された経路決定性、保存破損、保存失敗および既存 Treasure 互換性にも回帰は確認されなかった。新規 finding はなく、SR-024 を別 ID で重複計上していない。

## 7. 上流へのフィードバック

なし。`REQ-F-007` の意味、`AC-023`、Requirements §9.2 の handoff は対象 Specification の具体化に十分であり、Requirements / Concept の追加判断を必要としない。

## 8. 保留した指摘

正式な Deferred finding はなし。以下は仕様の外部契約を変更せず、後続工程で確認・実現する事項である。

- 実装、ブラウザ表示、レスポンシブ挙動、地図画像の編集結果および動的表示の実装適合性。
- T レコードの実値、共通地図情報の統合、参照整合性、座標、町名、legacy `division=R` の除外、重複・範囲外・町名なし等の実際の検証結果。
- G8、G10、G12、G14、G17 の全対応マップ画像が背景のみとなっていること、動的表示との重複がないこと。
- エーテライト視覚資産の採否、出典・利用条件および画像編集結果。仕様にある採用条件を満たすことを後続工程で確認する。
- 初期日本語名称の実データ整合および将来の言語別名称データの実体。v1 の英語等の翻訳、多言語 UI、Mob 名称・別名・検索語の多言語照合は対象外である。
- 具体的な JSON 配置、内部状態、保存媒体、UI 部品、ラベル配置の実現方式、ライブラリ、テストコードおよび画像編集手段。確定済み外部契約を満たす内部方式は Design / Implementation の責務である。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Specification | 判定 |
| --- | --- | --- | --- |
| 別アプリ・状態境界・Mob モード | REQ-F-001〜REQ-F-005、REQ-L-001〜REQ-L-005 | §1、§3、§9 | PASS |
| Treasure 登録・入力・既存互換性 | REQ-T-001〜REQ-T-003、REQ-Q-002 | §3.2、§4、§9.2 | PASS |
| Mob 登録・対象単位削除 | REQ-M-001〜REQ-M-008、REQ-D-001 | §5 | PASS |
| 自動経路・手動順序 | REQ-R-001〜REQ-R-008 | §6、§7 | PASS |
| 完了・取消・B モブ探索 | REQ-P-001〜REQ-P-005 | §7.3、§8 | PASS |
| 保存・復元・消去・保存失敗 | REQ-L-001〜REQ-L-006 | §3.1、§9 | PASS |
| 共通地図情報・T / legacy R 境界 | REQ-A-003〜REQ-A-004、REQ-D-002、REQ-S-005 | §2、§6.3、§10.1〜10.2 | PASS |
| 動的エーテライト表示・画像非重複・非操作性 | REQ-F-006〜REQ-F-008、REQ-A-003〜REQ-A-004 | §2、§3.3、§4.4、§10、§12 | PASS |
| 初期日本語・将来ローカライズ境界 | REQ-D-004、REQ-T-001、REQ-Q-002 | §10.3、§12、§15 | PASS |
| スマートフォン表示 | REQ-Q-001 | §11 | PASS |
| 責任・対象外・安全性境界 | REQ-S-001〜REQ-S-005 | §1.2、§8、§10 | PASS |

### Review Board の観点別確認

- Reviewer A（契約の明確性・完全性）: Requirement 53件と Acceptance 25件の追跡、SR-024 のラベル配置・省略契約、入力・出力・状態・validation・error、順序・決定性・互換性を確認した。ラベル配置は矩形、候補、上限および同率規則まで一意であり、追加 finding はない。
- Reviewer B（利用価値・運用適合性）: 通常地図・地点選択表示の全有効エーテライト継続表示、アイコン優先、狭い・過密な場合の町名省略、案内表示の非操作性、既存操作および保存・復元の利用結果を確認した。Requirements の利用価値・責任境界と整合する。
- Reviewer C（Security / Interoperability）: 利用者入力・マスター・保存データを未信頼情報として扱う境界、T のみ・legacy R 不使用、重複・参照不能・範囲外・町名なしの fail-closed 結果、HTML・命令解釈の禁止、既存 Treasure 互換性、NFC/code point による表示判定を確認した。未承認の認証・暗号・権限方式は追加要求していない。
- Chair: SR-024 を Resolved とし、過去 finding の状態を維持した。CSS px、8方向、4px、最大8件、Unicode NFC/code point は外部表示結果を決めるための仕様上の明確化であり、内部実装方式の固定や未承認要求の追加には当たらないと判定した。

### Two-implementation test

| ケース | 合理的な実装差 | 仕様から導ける共通結果 | 判定 |
| --- | --- | --- | --- |
| 動的ラベルの矩形・候補位置 | CSS / Canvas 等の表示技術、内部の候補列挙方法が異なる | 同じ `(x, y)`、`W/H`、NFC 後の `n`、8方向・4px 規則から同じ矩形候補を導く | PASS |
| ラベルの重なり・過密時省略 | 組み合わせ探索・枝刈りの内部方式が異なる | 非重複候補から表示数最大8件を選び、安定 ID の表示／非表示ベクトルと候補順位で同じ集合・候補を導く | PASS |
| 狭い表示・地点選択表示 | パネル配置・UI 部品が異なる | 同じ表示可能領域 `(W, H)` と有効エーテライト集合なら同じ配置・省略結果を返し、アイコンは全件を実座標に維持する | PASS |
| T と legacy R、無効・重複エーテライト | マスター表現・validator が異なる | 検証済み `division=T`、参照解決済み、町名あり、有限かつ bounds 内のレコードだけを採用し、legacy R・無効・重複情報は表示・参照・経路から除外する | PASS |
| アイコン・ラベルへのクリック／タップ・再描画 | UI イベントの内部接続が異なる | 地点、順序、進捗、現在地点、保存状態その他の周回状態を変更しない | PASS |
| 初期日本語・将来ローカライズ | 名称データの内部保持形式が異なる | v1 は日本語のみで、翻訳・多言語 UI・Mob 名称の多言語照合を提供せず、将来の言語別名称を安定 ID に対応付ける意味境界を維持する | PASS |
| 経路同率、手動順序、保存失敗 | 経路列挙・状態保存の内部方式が異なる | 既定の同率順、手動順序保持、最後の正常保存状態および部分適用禁止の同じ外部結果となる | PASS |

## 10. 検証結果

- `sha256sum docs/specification/specification.md` を実行し、指定された対象 SHA-256 `b80fbaf3448fff3448e5051ec751c468bc1760f298ed5c86c98059c6508eb993` と一致することを確認した。
- `sha256sum docs/requirements/requirements.md` を実行し、指定された承認済み Requirements SHA-256 `30f91a210b44bc2e69422d6d807ac678e7b6ca52fa669301308bc7618554cba0` と一致することを確認した。
- `sha256sum docs/reviews/specification/specification-review-008.md` を実行し、前回レビュー資料 SHA-256 `068f61d2e28e17ca5054a8101bfdb24dfab18424da91e1dc31c63f0a1c930900` と一致することを確認した。前回資料は変更していない。
- Requirements の Requirement ID 53件、Acceptance ID 25件を抽出し、Specification 内の Requirement 参照 53件、`SPC-AC` 25件を確認した。新規 `REQ-F-006〜008`、`REQ-A-003〜004`、`REQ-D-004`、`AC-022〜025` は本文・適合条件・traceability へ追跡されている。
- `SPC-OPEN-001` が対象 Specification に残っていないこと、SR-024 の契約項目が §4.4、§10.2、`SPC-AC-023`、§13.3、§15 の間で整合していることを確認した。
- 対象 Specification、Requirements、Concept、前回レビューおよび README が参照する確認対象の存在、対象文書の章構成および相対リンクを確認した。
- `git diff --check`: PASS（レビュー資料作成後に再確認済み）。
- レビュー資料の末尾空白: なし。指定された共通章 1〜14 の順序と必須項目を確認した。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。Specification とレビュー資料のみを対象とする文書レビューで、アプリコード変更を検証する作業ではない。
- 実装、テスト実行、静的マスターデータの実値、画像編集結果、ブラウザ表示、出典・ライセンスの実査、将来ローカライズ用データの実体: Not validated。本レビューの対象外または後続工程で確認する事項である。
- 開始時から存在する `MEMORY.md` の変更、`apps/treasure-compass/public/img/aetheryte.png` の未追跡状態および前回レビュー 008 は、採用・修正・ステージしていない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Treasure / Mob、ソロ／パーティ、動的案内表示、対象外、利用者責任および初期ローカライズ境界を一意に理解できる。 |
| 2. 要件追跡と契約（handoff closure） | PASS | 53 Requirements と 25 Acceptance が本文・適合条件・traceability へ追跡され、SR-024 のラベル詳細も Specification で閉じている。 |
| 3. 処理と例外 | PASS | 通常・地点選択表示、ラベル配置・省略、無効／重複エーテライト除外、画像非重複、非操作性、既存の登録・経路・保存失敗結果を一意に判定できる。 |
| 4. 内部整合性 | PASS | §4.4、§10.2、`SPC-AC-023`、§13.3、§15 のラベル契約、`division=T` / legacy R 境界、画像・ローカライズ境界に矛盾を確認しなかった。 |
| 5. 検証可能性 | PASS | 同じ有効エーテライト集合、座標、表示可能領域および viewport 条件に対する矩形、重なり、候補順、表示数、省略対象、非操作性を独立して検証できる。 |
| 6. 安全性・信頼境界・相互運用性 | PASS | 未信頼入力・マスター・保存データの拒否境界、T / legacy R の採用境界、HTML・命令解釈の禁止、状態分離、破損・保存失敗、既存 Treasure 互換性、決定的な名称・表示規則を確認できる。 |
| 7. 上流整合性と工程境界 | PASS | Requirements の機能範囲・責任境界を維持し、ラベルの外部結果を Specification で確定した。CSS 部品、フォント実装、配置ライブラリ、JSON 配置、保存方式、画像編集手段等は下流へ残している。 |

Critical 0 / Major 0 / Minor 0。Critical の New / Open / Reopened はなく、すべての Gate を通過したため最終判定は `READY` とする。

## 12. 残存リスクと未決定事項

- T レコードの実データ、共通地図情報の統合、参照整合性、座標、町名、legacy `division=R` の除外、重複・範囲外・町名なし情報の実際の検証結果は未確認である。
- G8、G10、G12、G14、G17 の全対応マップ画像から埋め込み町名・エーテライト表示が除去され、動的表示と重複しないことは未確認である。
- エーテライト視覚資産の採否、出典・利用条件、画像編集結果および将来ローカライズ用データの実体は未確認である。
- 具体的な URL・配備先、JSON 配置、内部状態、保存媒体、UI 部品、フォント・描画技術、ラベル配置の実現方式およびテストコードは Design / Implementation / Test の責務であり、仕様上の未決定事項ではない。
- `MEMORY.md` と `apps/treasure-compass/public/img/aetheryte.png` は本レビューの根拠・対象に含めていない。

## 13. 自動変更

なし。レビュー対象の Specification、Requirements、Concept、Design、README、前回レビュー 008、`MEMORY.md`、コード、テストおよび画像は変更していない。本サイクルで指定出力先のレビュー資料だけを新規作成した。コミットは実施していない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。SR-024 は Resolved、SR-019〜SR-023 は解消継続確認済みであり、Specification は Design へ引き渡し可能である。
