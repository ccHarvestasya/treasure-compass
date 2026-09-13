# Implementation Review 009

## 1. レビュー対象

- レビューサイクル: `009`
- Task ID: `TC-IMPLEMENT-20260913-SPEC-UPDATE`
- 実行モード: `CREATE_AND_REVIEW` の Reviewer フェーズ
- 担当: Sol / medium
- 確認時点: 2026-09-13 Asia/Tokyo
- 対象工程: Implementation / Test の再レビュー
- base commit / reviewed HEAD: `7ee2a0a63736c7da57cb0ce8067551766c9303ec`
- working tree 差分 fingerprint: `995860ca6f0bb1132879fdabfdf2df8e71aecba1d80a1fcbf02cc95129203ca5`。`git diff 7ee2a0a63736c7da57cb0ce8067551766c9303ec | sha256sum` の実測値と一致した。
- 前回レビュー: [Implementation Review 008](implementation-review-008.md)、SHA-256 `cfda9be41e6367f6e2ceac6e71822f1f443fa56e3e1883caa0f765316d53af4a`、Gate `REVISE IMPLEMENTATION`、IR-001〜IR-008 Open。
- 対象範囲: base からの20変更実装・テストファイル。未追跡の前回レビューは入力証拠としてのみ参照し、今回のレビュー対象差分には含めない。
- 未確認範囲: ブラウザ実機、320 CSS px の縦横表示、実 localStorage quota / SecurityError、実配備 origin、Mob master の正確性、画像内容・出典・license、公開手順。未確認範囲を PASS とは扱わない。

## 2. 使用した根拠

- ユーザーの本依頼、`AGENTS.md`。
- `implement-review` Skill 全文、`review-common/review-playbook.md`、両 `output-format.md`、`reviewers.md`、`review-gates.md`、`security-checklist.md`。
- [Specification](../../specification/specification.md) Revision 007（SHA-256 `e243915b9400b3a9f06891d3cb814212fc47fa5408f9d3219c462dc7bfc9db46`）、[Specification Review 013](../specification/specification-review-013.md) `READY`。
- [Design](../../design/design.md) Revision 007（SHA-256 `8721af6bc53bd542b0792fc3b38df28c4c399cc15205dc49b690280ec3db46b4`）、[Design Review 008](../design/design-review-008.md) `READY`。
- 前回 Review 008 の各 Finding、指定20ファイルの base 差分、現在のソース・テスト・package 設定、および関連する既存 route / macro / master-data 実体。
- Author / Manager の報告は開始点としてのみ用い、差分 fingerprint、コード経路、テスト内容および標準検証を独立に再確認した。

## 3. レビュー結果

**REVISE IMPLEMENTATION**

| Finding | 重大度 | サイクル009状態 | 要約 |
| --- | --- | --- | --- |
| IR-001 | HIGH | Resolved | 競合名の除外、容量超過後の既存更新、行番号付き結果保持を確認 |
| IR-002 | HIGH | Open | identity 差分だけで解決可能 ref まで unresolved 扱いし、一覧も正常完了表示を残す |
| IR-003 | MEDIUM | Resolved | marker 外文字の保持、複数座標・複数 map の曖昧化を確認 |
| IR-004 | MEDIUM | Resolved | 現 session と衝突しない ID 探索と保存成功後の counter 更新を確認 |
| IR-005 | MEDIUM | Open | clear、削除、並べ替えの保存失敗 UI 契約が未完 |
| IR-006 | LOW | Open | legacy cleanup が依然 publish 前 |
| IR-007 | MEDIUM | Open | stable tuple、tie 情報、開始地点の presentation 到達が未実装 |
| IR-008 | MEDIUM | Open | 世代別 exact decoder の table-driven 回帰テストが未追加 |

Open は HIGH 1件、MEDIUM 3件、LOW 1件。Reopened および新規 Finding はない。HIGH の IR-002 が blocking Finding である。

## 4. 総評

IR-001、IR-003、IR-004 の実装修正を確認した。一括適用は競合名を store 入力から除外し、容量超過後も既存名更新を継続し、適用行と未適用理由を返す。parser は列挙 marker 以外の名前文字を保持し、複数座標・複数正規 map を曖昧扱いする。新規 registration ID は現在の登録集合を走査し、保存失敗時に発行 counter を進めない。

一方、master identity が保存時と異なるだけで、現 catalog に stable tuple が存在する registration、currentTarget、mapCurrentLocation まで全件 unresolved とされ、自動 route 入力も空にされる。これは master 更新後に stable ID で再解決し、解決済み対象を維持する契約に反する。また、保存失敗 UI、migration の publish / cleanup 順、route tie / start projection、decoder の世代別回帰証拠も前回条件を満たしていない。標準検証は全て PASS したが、これらの到達条件は現行67テストで検出されない。

## 5. 指摘事項

### IR-002: master identity 差分と point reference 未解決を同一視している

- 重大度 / 状態 / 分類: **HIGH / Open / Implementation defect + Test/validation defect**
- 対象箇所: `useAppStore.ts:87-120, 300-317, 489-510`、`RouteProgressTab.tsx:23-40, 108-144`、`useAppStore.test.ts:280-297`
- 再確認事実: unresolved annotation と MapCanvas の currentTarget 非 fallback は追加された。しかし `unresolvedReferencesForRef` は `persistedMasterIdentity` と現 catalog identity が異なるだけで true を返し、`routeInputs` も同条件で全入力を空にする。したがって現 catalog で stable ref が完全一致して解決できる対象まで registration / currentTarget / mapCurrentLocation の全てが unresolved になる。追加テストは同一 identity で candidates を空にするケースだけで、identity 変更後の解決可能 ref を扱わない。さらに一覧は unresolved projection を参照せず、保存済み `completed` を通常のチェック表示と取消 control に使う。
- 根拠: Specification §9.1.1〜9.2、§10.3、SPC-AC-014 / 017、および Design §7.2、§8.3、§10.1、§12 は、identity が異なる保存状態を stable ID で reconcile し、解決できた対象を現 master の名称・座標で維持し、解決不能対象だけを正常な地図・完了・経路から除外することを要求する。
- 影響: 正常な master revision 更新だけで全 Treasure route と案内が消え、利用者には解決可能な登録まで「地点未解決」と見える。一方、真に未解決な completed registration は正常完了の外観を残す。
- 必要な最小修正: identity 差分は再照合の契機として扱い、各 `TreasurePointRef` の gradeSetId / mapId / pointId が現 catalog で解決できるかにより unresolved を決定する。解決済み ref は route / map / completion projection に採用し、真に未解決な登録だけを理由付きで除外・識別表示する。
- 再確認条件: identity が異なる fixture で、(a) 全 ref 解決、(b) registration のみ未解決、(c) currentTarget 未解決、(d) mapCurrentLocation 未解決を分け、保持・診断・route / completion 除外・地図非 fallback・近似置換なしを確認する。

### IR-005: 保存失敗時の clear・削除・並べ替え UI 契約が未完

- 重大度 / 状態 / 分類: **MEDIUM / Open / Implementation defect + Test/validation defect**
- 対象箇所: `App.tsx:103-110`、`useAppStore.ts:405-408, 625-647, 796-805, 859-884`、`RouteProgressTab.tsx:78-80, 97-103, 129-143`、`useAppStore.test.ts:299-308`
- 再確認事実: `setManualSort` と `playRegistration` は一つの成否を返す形へ修正され、clear の store-local draft 破棄も write 成功後へ移った。しかし `clearAllData` は void のままで、App は write 失敗時も dialog を閉じて成功 toast を出す。削除・並べ替えは boolean を返すが UI が戻り値を捨て、失敗を識別表示しない。追加された failure test は `selectListItem` だけで、前回の clear / auto / delete / reorder / row play 条件を網羅しない。
- 根拠: Specification §9.3〜9.4 と Design §8.1、§8.5、§12 は、保存失敗時に操作前表示・正常保存・再試行可能入力を維持し、失敗を識別表示し、成功通知または部分適用を行わないことを要求する。
- 影響: localStorage write failure 時、canonical state は維持されても利用者が消去成功を誤認し dialog を失うか、削除・並べ替えが無反応に見える。
- 必要な最小修正: clear の保存成否を UI まで返し、失敗時は dialog を開いたまま成功 toast を出さない。削除・並べ替えも既存の `run` 相当で false を識別表示する。
- 再確認条件: clear、auto切替、削除、並べ替え、対象行再生の write failure test で、state・保存・draft・dialog・通知が失敗契約を満たすことを確認する。

### IR-006: legacy cleanup を migrated state の公開前に実行する

- 重大度 / 状態 / 分類: **LOW / Open / Implementation defect**
- 対象箇所: `storage.ts:504-566`、`useAppStore.ts:26-27, 433-438`
- 再確認事実: `readPersistedTreasure` は v3 write の直後に `removeLegacyRecords` を呼び、その後に migrated snapshot を返す。store の現行 state 公開は return 後の module 初期化であり、write → cleanup → publish の順は前回から変わっていない。cleanup failure 後に v3 marker が legacy resurrection を防ぐテストは追加されたが、publish 後 cleanup の順序は検証していない。
- 根拠: Specification §9.2 と Design §8.4 は、v3 write と現行状態としての publish が成功した後だけ旧 key cleanup を試みる順序を固定する。
- 影響: write 後・store公開前に初期化が中断した場合、旧値を先に失い、承認済みの非破壊移行順序を満たさない。
- 必要な最小修正: migration candidate の decode / v3 write、coordinator publish、legacy cleanup を分離し、publish 成功後だけ cleanup を実行する。
- 再確認条件: write成功／publish前中断、publish成功／cleanup成功、cleanup失敗の各段階を観測できるテストで旧値・v3・公開stateを確認する。

### IR-007: route の stable tie、tie 情報、開始地点が session / presentation へ到達しない

- 重大度 / 状態 / 分類: **MEDIUM / Open / Implementation defect + Test/validation defect**
- 対象箇所: `distance.ts:23-42, 113-156`、`useAppStore.ts:243-263, 346-366`、`RouteProgressTab.tsx:23-159`
- 再確認事実: tie 用 key は追加されたが、map 内比較は `memberNo` 列、全体比較は `mapNo, X, Y, memberNo, pointNo, stableId` の順であり、仕様の `(正規map識別子, X, Y, 対象stable識別子)` 列ではない。route result は tie の有無・候補を保持しない。`calcShortestRoute` の `teleportPoint` も `calculateSession` が registrationId 順へ縮約し、`buildRoute` が再生成する際に失われるため、開始地点と tie は RouteProgressTab へ到達・表示しない。
- 根拠: Specification §6.2〜6.3、SPC-AC-008〜009、および Design §9.1〜9.2 は、同率候補の保持・表示、stable tuple による表示採用順、map ごとの採用開始地点を route result に含めることを要求する。
- 影響: 同距離時の順序が登録位置や legacy 数値に依存し、同率であることと採用開始地点を利用者が確認できない。
- 必要な最小修正: 対象 stable ID を route input / result に保持して仕様 tuple で比較し、tie と開始地点を coordinator から presentation まで欠落なく渡して表示する。
- 再確認条件: 登録順と legacy mapNo / memberNo を変えた同率 fixture、および複数 aetheryte fixture で、採用順・tie表示・開始地点表示を確認する。

### IR-008: 世代別 exact decoder の required / extra / fallback 回帰証拠が不足する

- 重大度 / 状態 / 分類: **MEDIUM / Open / Test/validation defect**
- 対象箇所: `persistence.test.ts:107-194`
- 再確認事実: persistence test は8件で、追加分は cleanup failure 後の v3 marker / resurrection 防止である。v3 各入れ子必須 field、二種類の v2 root alternative、v2 state の余分／欠落 field、統合 v1 の root exact shape と opaque mob、separate keys の片側欠落・不正、上位候補不正時の下位 fallback 禁止を世代別表で検査するテストは追加されていない。
- 根拠: Specification §9.1.1、SPC-AC-014 / 017 と Design §8.2〜8.4 は、各世代の exact field、上位候補が存在して不正な場合の fallback 禁止、部分移行禁止を要求する。
- 影響: decoder の allow-list、required field、alternative 判別、候補優先順位の回帰が現行67テストを通過し得る。
- 必要な最小修正: v3、v2各 schema / envelope、統合v1、separate keys について required 欠落、extra field、不正参照、候補競合、fallback 禁止の table-driven 正負 fixture を追加する。
- 再確認条件: 各世代の table-driven test が、全体拒否、旧値保持、下位非採用まで独立に検証して PASS すること。

## 6. 解消済み指摘

### IR-001: Resolved

- `BulkInputTab` は利用者が一候補を明示するまで競合名を `values` へ含めず、store は独立にも同名異地点を conflict として拒否する。
- `applyBulkProposal` は上限超過後も走査を継続し、既存名更新を適用する。適用行番号と conflict / capacity / save-failure の行番号・理由を返し、未適用があれば dialog を閉じない。
- store 回帰テストで同名競合が v3 に入らないこと、満員後の既存更新と上限超過行が確認されている。

### IR-003: Resolved

- parser は列挙 marker を構文 capture だけで除き、`?Question` の `?` を保持する。
- 一行に複数座標表現がある場合を ambiguous / parse拒否とし、異なる正規 map が複数一致する場合は候補数にかかわらず ambiguous とするテストを確認した。

### IR-004: Resolved

- `allocateRegistrationId` は現在 session の全 registrationId を走査して空き ID を選ぶ。手動、bulk、legacy互換経路の各新規発行で既存集合を考慮し、counter は publish 成功後だけ更新される。
- 復元専用 fixture は未追加だが、復元 session をそのまま allocator 入力にする経路と write failure 時に counter を進めない制御をコード上で確認した。専用回帰 test の不足は残存リスクとして記録するが、前回の衝突原因自体は除去されている。

## 7. 上流へのフィードバック

なし。Open Finding の期待結果と責務は Specification Revision 007 / Design Revision 007 で確定しており、Implementation / Test で解消可能である。

## 8. 保留した指摘

- ブラウザ実機での localStorage quota / SecurityError、320 CSS px 縦横、orientation change、pointer / touch 操作は後続の実機検証へ引き継ぐ。
- 実配備が既存 Treasure と同一 origin になることは release configuration で確認する。対象コードに origin 越境保存や新規外部送信通信は確認されなかった。
- Mob master、画像内容・出典・license は今回のコード・テスト再レビューで補完せず、Out of Scope / Not validated とする。

## 9. 対象範囲と追跡

| 確認対象 | 主な根拠 | 判定 |
| --- | --- | --- |
| 連続主表示、手動／一括入口、登録後復帰 | Spec §3.2、§4.1〜4.2、Design §10.2 | PASS。IR-001 の競合・容量・結果保持を再確認 |
| playlist、登録集合、selection / target、player、完了／取消、手動順序 | Spec §4.3〜4.3.1、§7 | PARTIAL。基本遷移は適合、unresolved と保存失敗は IR-002 / 005 |
| v3 exact snapshot、master identity / stable refs | Spec §9.1.1〜9.2 | PARTIAL。基本 envelope と IR-004 は適合、reconcile と decoder 証拠は IR-002 / 008 |
| v2／統合v1／separate migration、優先順位、resurrection | Spec §9.1.1〜9.2、Design §8.4 | PARTIAL。write failure と marker は適合、publish順と世代別 test は IR-006 / 008 |
| G8→3.x、G10→4.x、G12→5.x、G14→6.x、G17/G18→7.x | Spec §4.3、§9.2 | PASS。legacy grade 数値を Treasure 一覧へ表示せず、G18は projection のみでデータ採用なし |
| route / map / aetheryte / fee・loadTime非保持 | Spec §6、§10、Design §9 | PARTIAL。X/Y、T起点、R非採用、fee/loadTime非保持は確認。tie / start projection は IR-007 |
| JSON / localStorage / input validation、部分適用、HTML / eval | Spec §4.2、§9〜10、Design §12 | PARTIAL。IR-001 / 003 は解消、dangerous HTML / eval なし。保存失敗・decoder証拠は IR-005 / 008 |
| Mob / state separation / package / build | Spec §3.1、Design §3 | PASS（差分回帰の静的確認と build 範囲）。Mob master 正確性の全体再レビューではない |
| 画像・license・Mob master | Design §16 | OUT OF SCOPE / Not validated |

Review Board 観点では、Reviewer A が IR-001 / 003 / 005 / 007、Reviewer B が IR-002 / 005 / 006、Reviewer C が IR-002 / 004 / 006 / 008、Reviewer D が各修正の回帰検出力、Chair が severity・重複・Gate を確認した。

## 10. 検証結果

- 差分 fingerprint: PASS。指定値と一致。
- `pnpm lint`: PASS。
- `pnpm test`: PASS（12 files / 67 tests）。ただし IR-002 / 005 / 006 / 007 / 008 の未検出条件があり、契約適合 PASS の代用にはしない。
- `pnpm run build`: PASS（Treasure / Mob）。
- `git diff --check`: PASS。
- 変更範囲: 指定20ファイルと一致。前回レビュー008は既存の未追跡資料として保持。依存追加・lockfile変更なし。`packages/master-data/package.json` は既存 migration JSON export の追加だけで、fee / loadTime field の追加なし。
- `dangerouslySetInnerHTML`、`eval`、`new Function`、動的 script 実行: 対象実装で検出なし。
- 新しい外部通信、認証、server、telemetry: 対象差分で検出なし。
- ブラウザ実機、実 origin、画像内容・license、Mob master、公開手順: Not validated。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | FAIL | IR-002、IR-007 |
| Correctness / State / Data | FAIL | IR-002、IR-005、IR-007 |
| Failure / Resource / Runtime Safety | FAIL | IR-005、IR-006 |
| Compatibility / Integration | FAIL | IR-002、IR-006 |
| Security / Trust Boundary | PARTIAL | HTML/eval・外部通信なし。保存 integrity の利用者表示は IR-005、decoder証拠は IR-008 |
| Test / Validation / Regression | FAIL | IR-002、IR-005〜008 の再確認条件が未充足 |
| Implementation Discipline | PASS | 指定差分内、不要依存・lockfile変更・fee/loadTime保持なし |

HIGH の Open Finding が1件あるため、最終 Gate は **REVISE IMPLEMENTATION** とする。blocking review condition を別途追加する unavailable evidence はない。

## 12. 残存リスクと未決定事項

- IR-002 の修正と再レビューまでは、master revision 更新後の Treasure 登録・route・現在案内を release-ready と扱えない。
- IR-004 の発行経路はコード上解消したが、current v3 復元後、削除後、legacy移行後の一回目追加を固定する専用回帰 test はない。
- Mob master、画像内容・出典・license は Out of Scope / Not validated。同一 origin の実配備条件と mobile / browser 実機結果は後続確認を要するが、今回の blocking Finding の根拠ではない。

## 13. 自動変更

本レビューで新規作成したのは `docs/reviews/implementation/implementation-review-009.md` のみ。既存レビュー、Design、Specification、コード、テスト、設定、データ、README は変更・上書き・削除・改名していない。commit / push は実施していない。

## 14. 最終判定

**REVISE IMPLEMENTATION**

IR-001 / IR-003 / IR-004 は Resolved。IR-002 / IR-005 / IR-006 / IR-007 / IR-008 は Open、Reopened は0件。Open は HIGH 1件、MEDIUM 3件、LOW 1件であり、HIGH の IR-002 が解消されるまで READY へ進めない。
