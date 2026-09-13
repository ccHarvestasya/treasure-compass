# Implementation Review 008

## 1. レビュー対象

- レビューサイクル: `008`
- Task ID: `TC-IMPLEMENT-20260913-SPEC-UPDATE`
- 実行モード: `CREATE_AND_REVIEW` の Reviewer フェーズ
- 確認時点: 2026-09-13 Asia/Tokyo
- 対象工程: Implementation / Test
- base commit / reviewed HEAD: `7ee2a0a63736c7da57cb0ce8067551766c9303ec`
- working tree 差分 fingerprint: `364620fa615c5581ec7acd16bfd73aa1de6037c5ab3ac330a51be8900d161026`。`git diff 7ee2a0a63736c7da57cb0ce8067551766c9303ec | sha256sum` の実測値と一致した。
- 対象範囲: 依頼記載の20変更ファイル。Treasure の連続主表示、登録、player、順序、v3保存・legacy移行、version projection、route/map/aetheryte 回帰、入力・保存安全性、テストおよび package/build 影響を差分レビューした。
- 未確認範囲: ブラウザ実機、320 CSS px の縦横表示、実 localStorage 容量超過、異なる配備 origin、Mob master の正確性、画像内容・出典・license、公開手順。未確認範囲を PASS とは扱わない。

## 2. 使用した根拠

- ユーザーの本依頼、`AGENTS.md`。
- `implement-review` Skill 全文、`review-common/review-playbook.md`、両 `output-format.md`、`reviewers.md`、`review-gates.md`、`security-checklist.md`。
- [Specification](../../specification/specification.md) Revision 007、[Specification Review 013](../specification/specification-review-013.md) `READY`。
- [Design](../../design/design.md) Revision 007、[Design Review 008](../design/design-review-008.md) `READY`。
- [Implementation Review 007](implementation-review-007.md)。過去版の履歴・既存確認範囲としてのみ参照した。
- 指定20ファイルの base 差分、現在のソース、テスト、package 設定、および関連する既存 route / macro / master-data 実体。

## 3. レビュー結果

**REVISE IMPLEMENTATION**

Open: HIGH 2件、MEDIUM 5件、LOW 1件。`IR-001` と `IR-002` が blocking Implementation Finding である。

## 4. 総評

v3 exact snapshot の基本形、現行 key 優先、下位世代への fallback 禁止、legacy write failure 時の旧値保持、cleanup failure 後の v3 marker、version projection、playlist と未完了 route の分離、listSelection / currentTarget の独立、次へ／戻る、個別完了／取消、手動順序、料金・ロード時間の非保持は実装されている。lint、64 unit tests、Treasure / Mob build も成功した。

一方、一括入力では UI が競合と判定した同名異地点を一件へ潰して store に渡すため、その競合地点を利用者選択なしで保存できる。さらに、構造的に有効だが現 master で unresolved となる current target を保持・診断する projection がなく、地図が別の正常 route へ fallback する。いずれも承認済み Specification / Design の主要な correctness / compatibility 契約に反するため、現版は READY ではない。

## 5. 指摘事項

### IR-001: 一括入力の競合・上限超過を未適用 proposal として保持できない

- 重大度 / 状態 / 分類: **HIGH / Open / Implementation defect + Test/validation defect**
- 対象箇所: `BulkInputTab.tsx:41-77, 103-137`、`useAppStore.ts:590-631`
- 事実と発生条件: UI の `byName` は同名異地点を `conflicts` に追加しても最後の候補を `values` に残し、登録時には `conflicts` を渡さず `proposals.values` だけを store へ渡す。store からは単一候補に見えるため、その地点を保存する。また、空き超過時は最初の新規超過で `break` するため、後続の既存メンバー更新まで捨て、上限超過行の診断を proposal に返さない。部分適用後は未適用行を残したまま dialog を閉じる。
- 根拠: Specification §4.2、SPC-AC-030〜031、および Design §7.2、§8.1、§10.2 は、同名異地点を利用者が一行選ぶまで適用せず、既存更新は空き数を消費せず、上限超過・未適用行と理由を proposal lifecycle に保持することを要求する。
- 影響: 「同名の候補が競合」と表示された地点が利用者の解決なしに現行 session と v3 へ確定し得る。満員時には適用可能な既存更新も入力順により失われ、結果件数だけでは何が未適用か判別できない。
- 必要な最小修正: 競合名を適用対象から除外し、上限判定後も既存更新を評価する。適用・未適用・理由を一つの proposal 結果として UI に返し、未解決／上限超過行を利用者が解決または修正できる状態で保持する。
- 再確認条件: UI から store までの結合テストで、同名同地点重複、同名異地点競合、満員時の新規＋後続既存更新、部分適用、保存失敗を確認し、競合・超過行が v3 に入らないことを確認する。

### IR-002: master 未解決参照を診断 projection として扱わず、current target の地図が別地点へ fallback する

- 重大度 / 状態 / 分類: **HIGH / Open / Implementation defect + Test/validation defect**
- 対象箇所: `useAppStore.ts:147-197, 404-424`、`RouteProgressTab.tsx:108-143`、`MapCanvas.tsx:184-196`
- 事実と発生条件: v3 の stable ref が現 catalog で解決できない場合、`materializeMembers` と route は当該参照を落とすだけで unresolved annotation / reason を作らない。リストは `completed` を通常のチェック表示・完了／取消 control に使う。unresolved registration が `currentTarget` の場合、`targetCandidate` が得られず、MapCanvas は `route[0]` または最初の map へ fallback して正常な地図・案内を表示する。
- 根拠: Specification §9.1.1〜9.2、§10.3、SPC-AC-014 / 017、および Design §7.2、§8.3、§10.1、§12 は、構造的に正しい unresolved ref を情報と理由付きで保持し、正常な地図・経路・完了として扱わず、current target が解決できる場合だけ前面地図を表示することを要求する。
- 影響: master revision 更新後または参照欠落時に、利用者が current target と無関係な地図を現在案内として受け取り得る。未解決地点を正常完了として操作でき、互換性診断も失われる。
- 必要な最小修正: stable ref を session に保持したまま reconcile 結果へ unresolved reason を投影し、当該登録・current location を正常 route / completion から除外する。unresolved current target では別 route / 先頭 map に fallback せず、対象情報と未解決理由を表示する。
- 再確認条件: master identity が異なる有効 v3 fixtureで registration、currentTarget、mapCurrentLocations の各 unresolved 条件を検証し、保持・診断・route除外・地図非fallback・近似置換なしを確認する。

### IR-003: 一括 parser が未指定記号を名前から除去し、複数解釈可能行と曖昧 map を一意解決し得る

- 重大度 / 状態 / 分類: **MEDIUM / Open / Implementation defect + Test/validation defect**
- 対象箇所: `bulkParser.ts:27-35, 116-143`、`bulkParser.test.ts:85-96`
- 事実と発生条件: marker は正規表現の別 capture で処理済みだが、`normalizeName` がさらに先頭の `?` を削除する。テストもこの仕様外変換を期待する。正規表現は一行の全解釈数を検査せず最初の一致だけを採用する。また異なる正規 map が複数一致しても、座標近傍候補が一件なら resolved にする。
- 根拠: Specification §4.2 は列挙 marker 以外の先頭文字を暗黙に除去せず、一行に複数抽出があれば拒否し、異なる正規 map の複数一致を解決待ちにする。
- 影響: 入力名の identity が変更され、別メンバーの更新として保存され得る。曖昧入力を利用者確認なしに地点へ確定する。
- 必要な最小修正: 列挙 marker だけを構文位置で除去し、複数抽出と異なる map の複数一致を unresolved / ambiguous として返す。
- 再確認条件: 未指定先頭文字、列挙 marker、複数座標パターン、異なる map の曖昧部分一致を Specification の期待値でテストする。

### IR-004: 復元済み registrationId と新規 ID が衝突する

- 重大度 / 状態 / 分類: **MEDIUM / Open / Implementation defect + Test/validation defect**
- 対象箇所: `useAppStore.ts:350, 576-583, 620-624`
- 事実と発生条件: `nextRegistrationNumber` は常に1から始まり、復元した v3 の既存 ID を考慮しない。通常 session が `registration-1` を保持して再読み込みされた後の新規登録は同じ ID を生成し、exact v3 validator に拒否される。counter だけ進むため再試行回数は既存 ID に依存する。
- 根拠: Specification §9.1.1 と Design §7.2 は新規登録へ既存項目と衝突しない registration reference を要求する。
- 影響: 正常復元後の手動／一括追加が最初の操作で失敗し、利用者には保存障害と区別できない。複数連番が存在すれば複数回失敗する。
- 必要な最小修正: 新規 ID を現在 session の全 registrationId と衝突しないよう発行し、失敗した working operation による発行状態の副作用も外部操作へ漏らさない。
- 再確認条件: current v3 復元後、削除後、legacy移行後の手動／一括追加で、一回目から一意 ID で保存成功することを確認する。

### IR-005: 保存失敗時に一部 UI が成功または無通知として扱う

- 重大度 / 状態 / 分類: **MEDIUM / Open / Implementation defect + Test/validation defect**
- 対象箇所: `App.tsx:105-110`、`useAppStore.ts:518-523, 532-538`、`RouteProgressTab.tsx:96, 128-134`
- 事実と発生条件: `clearAllData` は `publish` の結果を返さず、失敗しても draft / dialog state と undo chain を消し、App は確認 dialog を閉じて成功 toast を表示する。自動順序への切替も戻り値を捨てて常に成功扱いする。削除・並べ替えは false を UI で扱わない。行内再生は list select と play を二回の保存に分け、後段失敗時に選択だけが確定し得る。
- 根拠: Specification §9.3〜9.4 と Design §8.1、§8.5、§12 は、保存失敗時に操作前表示・正常保存・再試行可能入力を維持し、失敗を識別表示し、成功通知または部分適用を行わないことを要求する。
- 影響: localStorage write failure 時に利用者が消去・順序変更等の成功を誤認するか、複合操作の一部だけが保存される。
- 必要な最小修正: 各利用者操作が保存成否を一つの結果として UI に返し、失敗時は UI-local draft / dialog / undo を含む当該操作の成功表示を進めない。単一クリックの state 変更は一つの working snapshot と logical write にする。
- 再確認条件: clear、auto切替、削除、並べ替え、対象行再生の write failure test で、state・保存・draft・dialog・通知が失敗契約を満たすことを確認する。

### IR-006: legacy cleanup を migrated state の公開前に実行する

- 重大度 / 状態 / 分類: **LOW / Open / Implementation defect**
- 対象箇所: `storage.ts:542-546, 562-566`、`useAppStore.ts:24-25`
- 事実と発生条件: migration は v3 write の直後、`readPersistedTreasure` が snapshot を返して store が公開する前に legacy keys を削除する。
- 根拠: Specification §9.2 と Design §8.4 は、v3 の write と現行状態としての publish が成功した後だけ cleanup を試みる順序を固定する。
- 影響: 同期起動処理が write 後・store公開前に中断した場合、承認済みの非破壊移行順序を満たさない。v3 marker があるため通常再訪時の resurrection は防がれるが、順序契約自体は未実装である。
- 必要な最小修正: persistence write、coordinator publish、cleanup を分離し、publish 成功後だけ cleanup を実行する。
- 再確認条件: write成功／publish前中断、publish成功／cleanup成功、cleanup失敗の各段階を観測できるテストで旧値・v3・公開stateを確認する。

### IR-007: route の同率情報と仕様の stable tie-break が presentation へ到達しない

- 重大度 / 状態 / 分類: **MEDIUM / Open / Implementation defect + Test/validation defect**
- 対象箇所: `distance.ts:23-42, 55-69, 134-156`、`useAppStore.ts:269-288`、`RouteProgressTab.tsx:23-159`
- 事実と発生条件: route result に tie 情報がなく、UI に同率表示がない。tie-break は正規 map ID と対象 stable ID の tuple ではなく `mapNo`、`memberNo`、`pointNo` を先に比較するため、同距離候補で入力／登録位置由来の順を採用し得る。選択した teleport start も `calculateSession` が registrationId 列だけへ縮約するため presentation route から失われる。
- 根拠: Specification §6.2〜6.3、SPC-AC-008〜009、および Design §9.1〜9.2 は tie の保持・表示と stable tuple による表示順、mapごとの開始地点を route result に含めることを要求する。
- 影響: 同じ幾何条件で登録順に依存した仕様外順序となり、同率であることと選択開始地点を利用者が確認できない。
- 必要な最小修正: 仕様の stable tuple で同率表示順を決め、tie と採用開始地点を route result から presentation まで保持・表示する。
- 再確認条件: 登録順と legacy mapNo を変えた同率 fixture、複数 aetheryte fixture で順序・tie表示・開始地点が仕様どおりであることを確認する。

### IR-008: v3 / legacy decoder の exact shape 検証が必須 field 欠落を単体で網羅していない

- 重大度 / 状態 / 分類: **MEDIUM / Open / Test/validation defect**
- 対象箇所: `persistence.test.ts:107-194`
- 事実と発生条件: 実装は主要必須 field の型条件で欠落を拒否するが、テストは主に v3 の余分 field、一部 migration、write / cleanup failure だけである。v3 の各入れ子必須 field、二種類の v2 root exact alternative、v2 state の余分／欠落 field、統合 v1 の opaque mob と root extra、separate の片側欠落・不正、および世代優先の各組合せを検出する証拠がない。
- 根拠: Specification §9.1.1、SPC-AC-014 / 017 と Design §8.2〜8.4 は世代ごとの exact field、上位不正時の fallback 禁止、部分移行禁止を明示し、Implementation handoff はこれらの検証を要求する。
- 影響: decoder の allow-list / required-field / 優先順位回帰が現在の64テストを通過し得る。保存互換の中心契約に対する回帰検出力が不足する。
- 必要な最小修正: 世代別 exact shape と優先順位の正負 fixture を追加し、各境界全体の拒否、旧値保持、下位非採用を独立に検証する。
- 再確認条件: v3、v2各schema/envelope、統合v1、separateについて、必須欠落・余分field・不正参照・候補競合の table-driven test が PASS することを確認する。

## 6. 解消済み指摘

- 過去 Implementation Review 007 に formal ID 付き Open Finding はない。
- 同レビューの Treasure master 準備に関する Upstream Feedback は、今回も stable point ID と legacy lookup 実体が存在することを確認した。今回の Finding と重複しない。

## 7. 上流へのフィードバック

なし。今回の主要問題は Specification Revision 007 / Design Revision 007 で結果と責務が十分に確定しており、Implementation / Test で解消可能である。

## 8. 保留した指摘

- ブラウザ実機での localStorage quota / SecurityError、320 CSS px 縦横、orientation change、pointer / touch 操作は後続の実機検証へ引き継ぐ。現 Finding の静的に到達可能な原因をこれらへ委譲しない。
- 実配備が既存 Treasure と同一 origin になることは release configuration で確認する。現在コードが browser localStorage 以外へ越境する実装は確認されなかった。

## 9. 対象範囲と追跡

| 確認対象 | 主な根拠 | 判定 |
| --- | --- | --- |
| 連続主表示、手動／一括入口、登録後復帰 | Spec §3.2、§4.1〜4.2、Design §10.2 | PARTIAL。主表示と入口は実装、部分適用 proposal は IR-001 |
| playlist、selection / target、player、完了／取消、手動順序 | Spec §4.3〜4.3.1、§7 | PASS（未解決参照と保存失敗を除く） |
| v3 exact snapshot、stable refs、version projection | Spec §9.1.1〜9.2 | PARTIAL。基本形は適合、IR-002 / IR-004 / IR-008 |
| v2／統合v1／separate migration、優先順位、resurrection | Spec §9.1.1〜9.2、Design §8.4 | PARTIAL。優先 marker・write failure・cleanup failure は適合、publish順は IR-006 |
| G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17/G18→7.x | Spec §4.3、§9.2 | PASS。G18はprojectionのみでデータ採用なし。利用者UIに `Gxx` 表示なし |
| route / map / aetheryte / fee・loadTime非保持 | Spec §6、§10、Design §9 | PARTIAL。X/Y・T起点・R非採用・fee/loadTime非保持は確認、tie/result projection は IR-007 |
| JSON / localStorage / input validation、HTML / eval | Spec §9〜10、Design §12 | PARTIAL。dangerous HTML / eval と新外部通信なし。parserは IR-003、decoder testは IR-008 |
| Mob / state separation / package / build | Spec §3.1、Design §3 | PASS（差分回帰の静的確認とbuild範囲）。Mob機能・master正確性の全体再レビューではない |
| 画像・license・Mob master | Design §16 | OUT OF SCOPE / Not validated。未確認情報を補完していない |

Review Board 観点では、Reviewer A が IR-001 / 003 / 005 / 007、Reviewer B が IR-002 / 005 / 006、Reviewer C が IR-002 / 004 / 006 / 008、Reviewer D が全 Finding の回帰検出力を確認し、Chair が重複を8件へ統合した。

## 10. 検証結果

- 差分 fingerprint: PASS。指定値と一致。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（12 files / 64 tests）。ただし IR-001〜IR-008 の未検出条件があり、契約適合 PASS の代用にはしない。
- `pnpm run build`: PASS（Treasure / Mob）。
- `git diff --check`: PASS。
- 変更範囲: 指定20ファイルと一致。依存追加・lockfile変更なし。`packages/master-data/package.json` は既存 migration JSON export の追加だけで、fee / loadTime field の追加なし。
- `dangerouslySetInnerHTML`、`eval`、動的 script 実行: 対象実装で検出なし。
- 新しい外部通信、認証、server、telemetry: 対象差分で検出なし。
- ブラウザ実機、実 origin、画像内容・license、Mob master、公開手順: Not validated。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | FAIL | IR-001、IR-002、IR-003、IR-007 |
| Correctness / State / Data | FAIL | IR-001、IR-002、IR-004 |
| Failure / Resource / Runtime Safety | FAIL | IR-005、IR-006 |
| Compatibility / Integration | FAIL | IR-002、IR-004、IR-006 |
| Security / Trust Boundary | PARTIAL | HTML/eval・外部通信なし。入力・保存 integrity は IR-001〜003、IR-005 |
| Test / Validation / Regression | FAIL | 各 Finding の到達条件が現行64テストで未検出、IR-008 |
| Implementation Discipline | PASS | 指定差分内、不要依存・lockfile変更・fee/loadTime保持なし |

HIGH の Open Finding が2件あるため、最終 Gate は **REVISE IMPLEMENTATION** とする。blocking review condition を別途追加する unavailable evidence はない。

## 12. 残存リスクと未決定事項

- IR-001 / IR-002 の修正と再レビューまでは、一括入力結果および master 更新後の案内を release-ready と扱えない。
- Mob master、画像内容・出典・license は本差分で補完・採用判断しておらず、Out of Scope のままである。
- 同一 origin の実配備条件と mobile / browser 実機結果は後続確認を要するが、今回の blocking Finding の根拠ではない。

## 13. 自動変更

本レビューで新規作成したのは `docs/reviews/implementation/implementation-review-008.md` のみ。既存レビュー、上流文書、コード、テスト、設定、データ、README は変更していない。commit / push は実施していない。

## 14. 最終判定

**REVISE IMPLEMENTATION**

HIGH 2件、MEDIUM 5件、LOW 1件が Open。`IR-001` と `IR-002` を解消し、関連する保存・parser・identity・migration・route の回帰条件を再検証した後に再レビューする。
