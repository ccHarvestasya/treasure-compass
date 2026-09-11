# Treasure Compass / Mob Compass Design Review 005

## 1. レビュー対象

- Task ID: `TC-DESIGN-20260912-AETHERYTE-LOCALIZATION`
- レビューサイクル: 005
- 対象フェーズ: Design
- 確認日: 2026-09-12（Asia/Tokyo）
- ブランチ: `maintenance/add-mob-compass`
- レビュー開始時 HEAD: `eaf1e7780cdd70afedc7173541cc3fa79c16c985`
- 対象成果物: `docs/design/design.md`
- 対象 Design SHA-256: `83ae38aec491f294348663af4138c1c976851357e0f53b9393eda5ec42069d02`
- 承認済み Specification: `eaf1e7780cdd70afedc7173541cc3fa79c16c985`、SHA-256 `b80fbaf3448fff3448e5051ec751c468bc1760f298ed5c86c98059c6508eb993`
- Specification Review 009: SHA-256 `5c7d5d3813a53dd6db4f3b3c87ab28cd8367b60a84e141cfeab516282c192e63`、判定 `READY`
- 前回レビュー: [Design Review 004](design-review-004.md)、対象 Design SHA-256 `b2c0cdc417d60459236acd3b030589bc411a8b82c6aac86cb33b4305b29f621c`、判定 `READY`
- 対象範囲: Design 全文。特に Specification との追跡、共通 map projection、`division=T` の検証・`division=R` の除外、overlay の責務・状態境界、画像資産境界、将来ローカライズ境界、失敗・復旧、下流実装可能性および DR-005〜DR-008 の回帰を確認した。
- 未確認範囲: 実装、テスト、ブラウザ、実配備、静的データの実値、画像の実内容・出典・利用条件、Mob master、料金、ロード時間、migration report。これらは Design の責務・引継ぎ境界の確認に限り参照し、実値の検証は行っていない。
- レビュー中の既存変更: `MEMORY.md` の変更と `apps/treasure-compass/public/img/aetheryte.png` の未追跡状態は無関係な変更として扱い、採用・修正・ステージしない。

## 2. 使用した根拠

- ユーザー指定。レビュー対象、ハッシュ、重点観点、変更禁止範囲、Gate、確認日および未追跡変更の扱いを適用した。
- `AGENTS.md`。Source of Truth、工程境界、既存変更の保全、docs-only 検証および Git 規約を適用した。
- `design-review` Skill、`reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md` および review-common。4観点、Finding の分類、Two-implementation test、8 Gate、14章形式、Critical による Gate 規則を適用した。
- [Specification](../../specification/specification.md) と [Specification Review 009](../specification/specification-review-009.md)。直接の承認済み上流として、動的エーテライト表示、ラベル配置、非操作性、T only、背景画像、ローカライズおよび既存 Treasure 互換性を確認した。
- [Requirements](../../requirements/requirements.md) と [Requirements Review 009](../requirements/requirements-review-009.md)。要件、受入条件、責任境界の補助根拠として確認した。
- [Concept](../../concept/concept.md) と [Concept Review 005](../concept/concept-review-005.md)。目的、対象および対象外の補助根拠として確認した。
- [Design Review 001](design-review-001.md)〜[Design Review 004](design-review-004.md)。DR-001〜DR-008 の履歴、状態および再発有無を確認した。
- README、現行実装、設定、JSON および画像は、既存互換性と移行・資産確認境界の補助資料として必要な範囲だけを確認した。下流の存在から新しい要求や設計責任は逆生成していない。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 1。`DR-009` は Minor の New / Open だが、Critical の New / Open / Reopened はないため、review-gates.md に従い Gate は `READY` とする。

## 4. 総評

Revision 005 は、承認済み Specification の動的エーテライト契約を、共通 map projection、Master adapter、Aetheryte overlay、Map UI、coordinator の責務へ分解している。検証済み `division=T` のみを投影し、`division=R`、無効、重複、参照不能、範囲外および町名なしの record を除外しながら他の有効 record を継続利用する境界も定義されている。

通常地図と地点選択表示の双方で全有効エーテライトを表示し、アイコンを実座標へ固定し、ラベルの CSS px・8方向・重なり・最大8件・安定順、非操作性および session 非所有を維持している。画像を背景専用とし、既存アイコン資産の source/license 確認と新ラベルデザインを data preparation gate へ分離した点も Specification と整合する。初期日本語と将来の言語 keyed な名称境界、Treasure の既存日本語照合・一括登録・旧保存移行の共通 map master 参照も下流へ引き継げる。

唯一の正式指摘は、見出し追加後の §15 追跡表に旧節番号が残っていることである。設計責務や外部契約を変更する欠陥ではないため Minor とし、修正前でも Gate は `READY` とする。

## 5. 指摘事項

### DR-009 — Revision 005 の追跡表に旧節番号が残っている — Minor — New / Open

- **対象箇所**: `docs/design/design.md:652,655,661-662`（§15「追跡性」）。
- **事実**: Revision 005 で主要フローに `10.2 エーテライト案内 overlay` が挿入され、既存の Mob ソロ、Mob パーティ、後続フローは `10.3`〜`10.6` になった。しかし追跡表には存在しない `6.3` が残り、`REQ-M-001〜008` の参照に overlay の `10.2` が含まれて `10.4` の Mob パーティ登録が明示されていない。また `SPC-AC-025` / `REQ-D-004` の参照先に、ローカライズ節ではない `10.2` が記載されている。
- **根拠**: Design §5.1〜§6.2、§10.2〜§10.6、§15。承認済み Specification §5、§10.3、§12 および `SPC-AC-025`。§15 は Specification / Requirement から Design の具体化箇所を追跡可能にする責務を持つ。
- **影響**: 実装者・レビュアーが存在しない §6.3 や別責務の §10.2 を参照し、Mob パーティ登録または名称・ローカライズ境界の実際の設計箇所を見落とす可能性がある。設計本体の責務・依存・状態所有や外部契約を直接変更するものではないが、追跡性と下流確認の精度を低下させる。
- **分類**: Design defect。承認済み外部契約の不足や変更ではなく、現行 Design 内の追跡参照の不整合である。
- **最小修正**: §15 の参照を Revision 005 の実在する節と対応する責務へ更新し、存在しない節番号を残さない。少なくとも `REQ-A-003〜004` の移行参照、Mob の `10.3`〜`10.6`、`SPC-AC-025` / `REQ-D-004` の名称・ローカライズ責務が正しい節へ到達することを確認する。代替の内部実装を指定する必要はない。
- **再確認条件**: Design の全追跡表参照が実在する見出しへ解決し、各対象 ID から対応する責務・フロー・引継ぎを辿れることを確認する。対象 Design のハッシュと既存レビュー資料を再取得し、他の DR-005〜DR-008 の解消状態に回帰がないことを確認する。

## 6. 解消済み指摘

### DR-005〜DR-008 — Resolved 継続確認

- **DR-005**（旧 Treasure 保存へ到達する配備境界）: §3.3、§8.4、§16 の same-origin と旧 key 到達性は Revision 005 でも維持されている。Mob entry は Treasure 保存境界から分離されている。PASS。
- **DR-006**（補助情報不足時の route result）: §5.2、§9.1〜§9.2、§12 の warning 付き success、必要時の failure、revision 整合および既存状態維持は維持されている。PASS。
- **DR-007**（master の意味情報と出典の対応）: §4.2〜§4.4、§5.1、§6.2 の source catalog、license 分離、record 除外、変換 report は維持されている。動的エーテライトの invalid / duplicate / R exclusion も既存の integrity 境界を弱めていない。PASS。
- **DR-008**（package 名・配置の確定状態）: §3.1 と §16 の確定 package 境界と Implementation 委譲範囲は維持されている。overlay は `map-ui` の責務として追加され、依存方向を逆転させていない。PASS。

DR-001〜DR-004 は過去レビューで `Resolved` であり、Revision 005 による再発は確認しなかった。

## 7. 上流へのフィードバック

なし。動的エーテライトの表示、ラベル配置、T only、R exclusion、非操作性、背景画像、初期日本語および将来ローカライズ境界は承認済み Specification に定義されており、Design で外部契約を発明する必要はない。DR-009 は Design 内の追跡表修正で解消できる。

## 8. 保留した指摘

正式な Deferred finding はなし。Mob master、料金、ロード時間、画像 source/license、configured 5 dataset の背景画像除去、stable ID 対応表および migration report の実値は、Design §6、§14、§16 に記載された data preparation gate または Implementation / Test で検証すべき下流事項である。具体的な CSS 実装、画像編集手段、テスト fixture、package 内部 source 構成も Implementation / Test の責務である。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Design | 判定 |
| --- | --- | --- | --- |
| 動的エーテライト表示、全件継続表示 | Specification §4.4、`SPC-AC-022` | §1.1、§3.1〜§3.2、§10.2、§11.1 | PASS |
| T only、R exclusion、invalid / duplicate / reference / range / town name boundary | Specification §10.1〜§10.2、`REQ-A-004` | §2.2、§4.2、§5.1〜§5.2、§6.1〜§6.2、§12 | PASS |
| アイコン座標、ラベル配置、上限、同率、非操作性 | Specification `SPC-AC-023`〜`SPC-AC-024` | §10.2、§11.1、§12、§14 | PASS |
| session / state / persistence 非所有と marker event 境界 | Specification §4.4、`SPC-AC-024` | §3.2、§7.1、§7.2、§7.5、§8、§10.2 | PASS |
| 背景画像、資産 source/license、G8/G10/G12/G14/G17 移行 gate | Specification §4.4、§10.1、`SPC-AC-022` | §4.2、§6.1〜§6.2、§12、§14、§16 | PASS（実資産は未確認） |
| 初期日本語、将来言語 keyed 名称、Treasure 互換 | Specification §9.2、§10.3、`SPC-AC-025` | §3.3、§4.2、§5.3、§6、§8、§10.2、§16 | PASS |
| architecture、dependency、ownership | Specification §12〜§13 | §3、§4、§7〜§8、§13 | PASS |
| failure、recovery、atomicity、trust / security boundary | Specification §6、§9〜§10 | §5、§8〜§9、§12 | PASS |
| Design → Implementation / Test handoff | Specification §12〜§13 | §14、§16 | PASS（DR-009 の追跡表修正を除く） |

### Review Board の独立確認

- Reviewer A（構造と責務）: `map-ui`、`master-data`、coordinator、domain、route core の責務と依存方向を確認した。overlay は session mutation や地点選択 command を所有せず、循環依存や責任逆流はない。DR-009 は追跡表の参照不整合として統合した。
- Reviewer B（Security）: JSON、localStorage、利用者入力、diagnostic、source/license、未確認画像および過大計算の trust / integrity / failure isolation を確認した。HTML 解釈、不要なログ、未検証値の fallback を禁止する境界は上流契約に沿っている。checklist 単独の追加 finding はない。
- Reviewer C（フローと運用）: 起動、master validation、record 単位の部分除外、revision reconcile、overlay 再投影、保存・復元・route failure、画像採用 gate の責任を確認した。overlay の再描画は session state と保存を変更せず、部分障害時に他の有効 record を継続利用できる。
- Reviewer D（追跡と下流実装可能性）: Specification Review 009 の承認範囲、Design の動的表示追加、Implementation / Test 引継ぎおよび §15 の参照を確認した。重大な ownership / consistency / failure decision の推測は残っていないが、§15 の旧節番号を DR-009 とした。
- Chair: 同じ根本原因の候補を統合し、DR-009 以外の New / Open / Reopened finding は採用しなかった。

### Two-implementation test

| ケース | 合理的な実装差 | 共通して導ける結果 | 判定 |
| --- | --- | --- | --- |
| raw record の検証と projection | validator / adapter の内部分割が異なる | 検証済み T のみを projection へ渡し、R・無効・重複等を除外し、独立した有効 record を継続利用する | PASS |
| 通常地図と地点選択表示 | Map UI の表示部品構成が異なる | 同じ map projection と viewport 入力に同じ overlay 結果を適用し、全アイコンを固定表示する | PASS |
| ラベル過密・狭い viewport | 配置計算の内部表現が異なる | Specification の候補、矩形、重なり、最大8件、安定順を満たし、アイコンを省略せずラベルだけを省略する | PASS |
| overlay の操作 | pointer event の内部処理が異なる | 案内 event が registration / selection / session command や persistence write へ到達しない | PASS |
| master revision 更新 | read model の再構築タイミングが異なる | session reference は stable ID で reconcile し、overlay と route は新 projection、案内表示状態は保存しない | PASS |
| 旧 Treasure 互換と共通 map master | decoder / lookup の内部方式が異なる | 同一 stable map 参照と旧保存境界を維持し、Treasure の既存日本語照合・一括登録を壊さない | PASS |

## 10. 検証結果

- 対象 Design SHA-256: `83ae38aec491f294348663af4138c1c976851357e0f53b9393eda5ec42069d02`。レビュー中に対象 Design を変更していない。
- 承認済み Specification SHA-256: `b80fbaf3448fff3448e5051ec751c468bc1760f298ed5c86c98059c6508eb993`。照合時に不変だった。
- Specification Review 009 SHA-256: `5c7d5d3813a53dd6db4f3b3c87ab28cd8367b60a84e141cfeab516282c192e63`。照合時に不変だった。
- Design Review 004 の対象 Design SHA-256および DR-005〜DR-008 の解消状態を確認した。既存レビュー資料は変更していない。
- Markdown の見出し、表、code fence、相対リンク、14章のレビュー構成を確認した。
- `git diff --check`: レビュー資料作成前 PASS。作成後に再実行する。
- `pnpm lint`: SKIPPED。docs-only のレビュー成果物であり対象外。
- `pnpm test`: SKIPPED。docs-only のレビュー成果物であり対象外。
- `pnpm run build`: SKIPPED。docs-only のレビュー成果物であり対象外。
- Not validated: 実装、unit test、ブラウザ、実 master data、画像実内容・license、配備、性能、migration の実行結果。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Design の目的、対象、対象外、承認済み Specification、移行・data preparation 境界が明確 |
| 2. コンテキストと責任 | PASS | app、master adapter、overlay、coordinator、Map UI、session、storage、利用者および資産確認の責務を分離 |
| 3. 依存方向 | PASS | app → shared/domain/adapter の方向、`map-ui` の projection/event 境界、app 間非依存を維持 |
| 4. 主要フローと失敗 | PASS | 起動、検証、部分除外、overlay 再投影、revision reconcile、route、保存、復元、資産採用 gate を確認 |
| 5. 状態・データ所有 | PASS | master projection、viewport-local projection、session root、current location、persistence の ownership と lifecycle を確認 |
| 6. セキュリティ・整合性・運用境界 | PASS | input validation、source/license、R exclusion、衝突全除外、HTML 非解釈、ログ抑制、failure isolation を確認 |
| 7. 上流整合性と工程境界 | PASS | 外部契約を変更・弱化・拡張せず、Specification gap を Design で補完していない |
| 8. 下流実装可能性 | PASS | overlay、validation、state、event、reconcile、migration、asset gate の責務と制約を実装へ引継ぎ可能。§15 の参照修正は残る |

Critical の New / Open / Reopened は 0 件であるため、Major / Minor の DR-009 だけでは Gate を不合格にしない。最終 Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- `DR-009` は Minor / New / Open。Design Review の Gate は通過するが、Implementation 着手前に §15 の追跡参照を修正することが望ましい。
- 具体的 URL と配備先は未決定だが、Treasure の same-origin 制約、別 app、独立 session root を満たす必要がある。
- Mob master、移動補助値、画像の source/license、configured 5 dataset の背景画像除去、変換 report および stable ID 対応表は未検証であり、data preparation gate を通るまで production data として扱えない。
- exact code、package 内部 file、route algorithm、UI component、test fixture、画像編集手段は Implementation / Test の詳細である。

## 13. 自動変更

レビュー中は対象 Design、Specification、Requirements、Concept、README、MEMORY、コード、テスト、JSON、画像および既存レビューを変更していない。本サイクルで新規作成したのは `docs/reviews/design/design-review-005.md` だけである。`MEMORY.md` の既存差分と `apps/treasure-compass/public/img/aetheryte.png` の未追跡変更は採用・修正・ステージしていない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 1。`DR-009` は追跡表の旧節番号に関する Minor / New / Open である。DR-005〜DR-008 は `Resolved` を維持し、Critical の New / Open / Reopened はないため、Design は承認済み Specification を実現する責務・境界を備え、Implementation / Test へ進行可能である。
