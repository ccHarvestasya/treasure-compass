# Treasure Compass / Mob Compass Specification Review 003

## 1. レビュー対象

- Review cycle: 003
- 対象フェーズ: Specification
- 確認日: 2026-09-10（Asia/Tokyo）
- Reviewed branch: `maintenance/add-mob-compass`
- Starting HEAD: `5b60770e338742d97164e45d2ce613f0b2cc752f`
- Reviewed HEAD: `5b60770e338742d97164e45d2ce613f0b2cc752f`
- 対象成果物: `docs/specification/specification.md`
- Upstream baseline: Requirements baseline `09a41c6b008a14a1cb03d6c3539e335dad1adb89`
- 関連する Requirements Review: `docs/reviews/requirements/requirements-review-005.md`

本レビューでは、指定された Reviewed HEAD の Specification を、cycle 002 の修正結果確認と全体新規レビューの両方の対象とした。Specification、Concept、Requirements、過去の Specification Review 001/002、指定された Skill および review-common 資料は変更していない。

## 2. 使用した根拠と Review Board

次の資料を確認し、補助資料を Concept / Requirements より強い根拠として扱っていない。

- `AGENTS.md`
- `.agents/skills/spec-review/SKILL.md`
- `.agents/skills/spec-review/review-gates.md`
- `.agents/skills/spec-review/reviewers.md`
- `.agents/skills/spec-review/output-format.md`
- `.agents/skills/spec-review/security-checklist.md`
- `.agents/skills/review-common/review-playbook.md`
- `.agents/skills/review-common/output-format.md`
- `docs/concept/concept.md`
- `docs/requirements/requirements.md`
- `docs/reviews/requirements/requirements-review-005.md`
- `docs/specification/specification.md`
- `docs/reviews/specification/specification-review-001.md`
- `docs/reviews/specification/specification-review-002.md`

Review Board は、独立 fork の Reviewer A / B / C を実行し、Chair が根拠、工程境界、severity、重複を統合した。各 Reviewer はレビュー対象と資料を変更せず、commit / push も行っていない。

| Reviewer | 観点 | 実行結果 |
| --- | --- | --- |
| A | 契約完全性、handoff closure、determinism、Two-implementation test | 完了。singleton header、同一地点の複数意味、Treasure の duplicate/conflict、manual→auto 失敗、master 再解決、空状態案内を確認 |
| B | 利用価値、運用、state lifecycle、failure / recovery | 完了。Treasure の duplicate/conflict、manual→auto 失敗、空状態案内、案内置換後の revision 継続を確認 |
| C | Security / Interoperability、malformed / stale / replay、persistence / recovery | 完了。cycle 002 の closure を確認し、空状態・全完了状態の案内表現を確認 |
| Chair | 候補統合、重複排除、根拠・severity・gate の最終判定 | 完了。新規 6 件を採用、重複を統合し、master 再解決候補を却下 |

## 3. レビュー結果

**REVISE SPECIFICATION**

Critical 2件、Major 4件、Minor 0件。SR-001〜SR-012 はすべて cycle 003 では Resolved と判定した。新規 finding は SR-013〜SR-018 で、すべて Open である。

cycle 002 の修正により、run の保持、複数行の逐次適用、案内の item/candidate integrity、高さの非使用、auto 計算不能時の案内禁止、初回 auto mode は閉じた。しかし、Specification 全体の新規レビューで、案内表現・操作失敗・空状態・世代継続に関する外部結果の未定義が残っている。

## 4. 総評

Concept の目的、v1 scope、Treasure の同時点 1:1、Mob の 1:many、リーダー管理とチャット引継ぎ、マスターデータと周回情報の責任分離、ゲーム状態を自動取得・判定しない境界は維持されている。Requirements の第一評価（マップ間遷移回数）、料金とロード時間の Pareto 的な補助評価、地点意味の分離、保存破損の全体拒否も本文へ適切に反映されている。

入力経路、座標の正規化、Treasure / Mob の状態意味、候補選択、同順位表示、manual mode の未確定遷移、通常複数行入力と正式案内の分離、revision / issued-at の分離、unknown master reference の保持も大部分は一意である。parser、探索アルゴリズム、保存技術、内部データ構造等の Design / Implementation handoff 自体は、外部契約を変更しない条件付きで妥当である。

ただし、以下の未閉包は単なる記述上の厳密化や実装方式の好みではない。同一の外部入力・状態に対して、案内の意味、malformed 判定、mode、遷移値、案内出力、revision 継続が異なる合理的な二実装を許すため、現時点では Specification を次工程へ確定済みとして渡せない。

## 5. 採用した新規 finding

### SR-013 — Critical / New / Open

- **Location**: `docs/specification/specification.md:161-170, 290-327`
- **Evidence / Fact**: §5.1 は、同一地点にマスターデータ上の「確定地点」と「候補地点」が同時に成立し得ると定める。一方、`candidate` 行の `<地点の意味>` は `confirmed` または `candidate` の単一値であり、同一 candidate identifier の行重複は禁止されている。candidate 行が候補集合の一地点を表すことは定められているが、同時に確定地点でもある場合に `<地点の意味>` をどの値で出力し、取り込み後に両方の意味をどう識別するかは明記されていない。
- **Problem**: 同じ map/X/Y が確定かつ候補である状態について、実装 A は `confirmed` を出力し、実装 B は `candidate` を出力できる。二行で表現する実装は duplicate candidate identifier として拒否され得る。出力・取り込み後に確定/候補の外部意味が失われる、または異なる。
- **Basis / upstream trace**: `REQ-F-004`、`REQ-F-007`、`REQ-F-012`、Requirements §9.2、Specification §5.1 / §8.1。これは新しい共有機能や parser 方式の要求ではなく、既に要求された地点意味の表現契約の未閉包である。
- **Why it matters**: リーダー交代で同一地点の確定情報と候補集合上の意味を同じ結果として復元できず、snapshot の互換性、表示、route candidate の解釈が分岐する。`candidate` 行の存在が候補集合を示すことと、地点意味 field の表現関係も検証できない。
- **Required Change**: 同一地点に確定/候補の複数意味が成立する場合、既存の行・field の組み合わせで両方を一意に表す規則、またはその状態の明示的な受理/拒否境界を定める。candidate identifier の重複禁止と item 参照規則は維持し、field の追加や新機能を前提にしない。
- **Retest / closure condition**: 確定かつ候補の同一地点、候補のみ、確定のみを含む block の出力・取り込みで、地点意味、candidate identifier、確認状態、item 参照、semantic snapshot equality が二実装で一致すること。

### SR-014 — Critical / New / Open

- **Location**: `docs/specification/specification.md:300-331, 337-354`
- **Evidence / Fact**: `run`、`revision`、`issued-at`、`mode`、`transitions` は必須 header とされるが、各 singleton header を一行だけ許可すること、重複 header を案内全体拒否とすることが明記されていない。malformed list は item / candidate の重複を列挙するが、header 重複を列挙していない。
- **Problem**: 同一 block に異なる `run` / `revision` / `issued-at` / `mode` / `transitions` が複数ある場合、実装 A は不正として全体拒否し、実装 B は最初または最後の header を採用できる。受理、run、世代、stale / duplicate / conflict / newer 判定が分岐する。
- **Basis / upstream trace**: `REQ-D-005`、`REQ-D-007`、`REQ-F-012`、Requirements §9.2、Specification §8.1〜8.3。外部入力の malformed / tampered fail-closed 契約の不足である。
- **Why it matters**: 改変された案内から run や revision を別値として採用でき、取り込み側の周回継続・replay 判定・atomicity を一意に検証できない。安全な全体拒否境界が singleton header だけ未定義のまま残る。
- **Required Change**: 製品識別、version、`run`、`revision`、`issued-at`、`mode`、`transitions` の各 singleton header は一行だけを許可し、重複・競合・余分な header を案内全体の不正として拒否する外部契約を明記する。parser の実装方式は定めない。
- **Retest / closure condition**: 各 singleton header の重複、同値重複、異値重複を含む block が、常に全体拒否・状態無変更・明示可能な malformed 結果になり、通常の valid block と区別できること。

### SR-015 — Major / New / Open

- **Location**: `docs/specification/specification.md:118-129, 105-106`
- **Evidence / Fact**: §3.3 表は、同じ対象識別情報・マップ・座標・順次位置の Treasure 再入力を `duplicate` とする。同時に、同じメンバーの現在対象を「次の地図」と示さず再入力する場合を `conflict` とする。完全一致する現在対象は両条件に該当し得る。複数行の valid / duplicate / invalid / conflict の分類は利用者へ区別して返す契約である。
- **Problem**: 現在対象と完全一致する Treasure 行について、実装 A は duplicate、実装 B は conflict と分類できる。状態は不変でも、行別結果、件数、通知、後続行の表示が分岐する。
- **Basis / upstream trace**: `REQ-F-003`、`REQ-F-008`、`REQ-D-001`、`REQ-D-007`、Specification §3.2 / §3.3。Mob の同一地点 duplicate や Treasure の異なる地点 conflict とは別の、重複条件の重なりである。
- **Why it matters**: 同じ複数行貼り付けに対する利用者可視の結果が一意でなく、cycle 002 で確定した逐次適用順序を使っても、行の外部分類と操作結果を同じにできない。
- **Required Change**: Treasure の完全一致再入力と、同一メンバーの別座標または次順指定なし入力に対する duplicate / conflict の適用条件を排他的にするか、優先順位を定める。状態変更禁止と次順明示の意味は維持する。
- **Retest / closure condition**: 現在対象の完全一致、同一メンバーの異なる座標、次の地図を明示した同一座標、複数行内の組み合わせについて、duplicate / conflict、件数、状態、後続行の判定が二実装で一致すること。

### SR-016 — Major / New / Open

- **Location**: `docs/specification/specification.md:236-240, 260-266, 429, 433`
- **Evidence / Fact**: §7.2 は「最短ルートを再計算」で manual から auto へ戻る操作と、自動 route 表示への切替を定める。しかし、その再算出が候補不足、master reference 不足、補助値不足等で失敗した場合に、mode、既存手動順序、採用地点、遷移値、案内出力可否を定めていない。§6.4 / §11.1 の計算不能 auto 契約は、既に auto mode の現在 route が計算不能な場合を対象とする。
- **Problem**: 同じ manual 状態で明示再計算が失敗したとき、実装 A は `mode: auto` の calculation failure へ遷移して案内を出力せず、実装 B は失敗した切替を状態へ反映せず manual mode、手動順序、`transitions: unknown` を保持して案内を出力できる。利用者可視 state と leader handoff が分岐する。
- **Basis / upstream trace**: `REQ-F-007`、`REQ-F-008`、`REQ-F-012`、`REQ-D-007`、Specification §6.4 / §7.2 / §11.2。これは明示操作の失敗境界という外部結果であり、state machine の内部方式ではない。
- **Why it matters**: route 計算不能時の stale route 防止は定義済みでも、manual の利用可能な順序を維持するか auto failure とするかが不明なため、案内出力、復旧操作、保存後の状態が実装ごとに異なる。
- **Required Change**: manual→auto の明示再計算失敗について、mode、手動順序、最後の採用地点、遷移値、表示する失敗理由、案内出力可否、保存結果を一意に定める。`transitions: unknown` を auto failure の代替にしない境界を維持する。
- **Retest / closure condition**: manual 状態で候補不足、未知 master、補助値不足を発生させた明示再計算について、状態、表示、案内の可否、revision / issued-at、保存・reload 後の結果が二実装で一致すること。

### SR-017 — Major / New / Open

- **Location**: `docs/specification/specification.md:232, 276-282, 315-317, 321`
- **Evidence / Fact**: §6.3 は空の対象集合に route を表示しないとする。§7.4 は既存 `run` の対象 0 件、全削除後、全完了後、新しい周回直後を有効な lifecycle state とする。一方、auto guide は現在の成功した auto route と非負整数の `transitions` を要求し、manual guide の `unknown` は未確定地点がある場合に限るが、対象 0 件・全完了状態の出力可否、`transitions`、空の item/candidate 表現を定めていない。
- **Problem**: 同じ auto の対象 0 件または全完了状態について、実装 A は案内出力を失敗し、実装 B は `transitions: 0` の空/完了 snapshot を出力できる。manual では `0` と `unknown` の選択も分岐し得る。revision 増加、issued-at 更新、leader handoff 結果が異なる。
- **Basis / upstream trace**: `REQ-F-009`、`REQ-F-011`、`REQ-F-012`、`REQ-F-014`、`REQ-D-005`、Specification §6.3 / §7.4 / §8.1。これは calculation failure そのものではなく、route を必要としない空・完了 state の protocol 表現である。
- **Why it matters**: run を保持する空周回を案内で引き継げるか、全完了結果を共有できるか、次の revision を進めるかが一意でない。SR-011 の「計算不能 auto state では案内禁止」とも区別した判定ができない。
- **Required Change**: auto / manual の対象 0 件および全完了状態について、案内出力の可否、`transitions` の値または拒否、item/candidate の空集合・完了表現、revision / issued-at の更新を明記する。新機能や別 protocol を追加しない。
- **Retest / closure condition**: 全削除後、全完了後、新しい周回直後、reload 後の auto/manual state で、案内出力、内容、`transitions`、revision、issued-at、取り込み・再出力結果が二実装で一致すること。

### SR-018 — Major / New / Open

- **Location**: `docs/specification/specification.md:341, 356, 372, 384`
- **Evidence / Fact**: 異なる `run` の案内は明示的な「案内で置換」のときだけ、案内の run、mode、対象、進行へ一括置換すると定める。しかし、置換された案内の `revision` / `issued-at` を現在の受理済み snapshot として保持するか、次の出力 revision をどこから開始するかが明記されていない。§8.3 の `revision + 1` は通常の同一 run の取り込み後を記述し、§9.1 は保存対象を定めるが、置換の採用結果を明示していない。
- **Problem**: 同じ explicit replacement に対し、実装 A は入力案内の revision / issued-at を保持して次回を `revision + 1` とし、実装 B は世代情報を初期化して次回を `0` とできる。以後の stale / duplicate / conflict / newer 判定と reload 後の continuity が分岐する。
- **Basis / upstream trace**: `REQ-F-012`、`REQ-D-005`、`REQ-F-014`、Specification §8.2 / §8.3 / §9.1。run の置換契約とは別の、世代情報の採用契約の不足である。
- **Why it matters**: 明示操作で異なる周回へ移る場合でも、案内引継ぎの世代順序と replay 判定が実装依存になる。`issued-at` を世代へ流用しない SR-006 の分離も、置換後にどの値を保持するか不明なままでは検証できない。
- **Required Change**: explicit replacement 後に入力案内の `revision` / `issued-at` を現在の世代情報として採用するかを定め、採用する場合の次回出力 `revision + 1`、保存・reload、同 revision の比較結果を明記する。run 生成方式は Design / Implementation に残す。
- **Retest / closure condition**: 別 run の案内を明示置換した後、再出力、保存・reload、同 revision duplicate/conflict、低い stale、高い newer の結果が二実装で一致すること。

## 6. Resolved findings（cycle 002 からの再確認）

| ID | Status | 再確認結果 |
| --- | --- | --- |
| SR-001 | Resolved | 座標の意味・受理形式・正規化、route comparison / tie、message version / escape、保存破損結果が外部契約化されている。 |
| SR-002 | Resolved | 初期空状態は run なし、最初の valid 登録/案内で成立し、対象 0 件・全削除・全完了・reload 後も保持される。異なる run は通常取り込みで置換せず、新しい周回または明示置換だけが遷移を成立させる。 |
| SR-003 | Resolved | manual order に未採用 Mob を保持し、遷移回数を未確定とし、明示的な再計算まで自動採用しない。 |
| SR-004 | Resolved | 保存構造・整合性の破損は部分復元せず全体拒否し、master mismatch は周回情報を保持して未確認化する。 |
| SR-005 | Resolved | 手動、通常 Mob 複数行、Treasure 貼り付け、master/map 選択、正式 `MOB-COMPASS/1` 取り込みが分離されている。 |
| SR-006 | Resolved | revision は世代、issued-at は UTC の出力時刻であり、時計ずれは stale / newer 判定に影響しない。出力時 +1、世代飛び、別リーダー再出力、保存後継続も定義されている。 |
| SR-007 | Resolved | 5.2 の ASCII map id、数値 X/Y、Unicode code point による同順位表示規則を 6.3 が正しく参照している。 |
| SR-008 | Resolved | Mob / Treasure の複数行は空行を除き上から下へ逐次評価・適用し、前行の結果を次行へ反映し、manual order の追加順と auto ranking を分離している。 |
| SR-009 | Resolved | item / candidate の所属、識別子と map/X/Y、item 参照、order の 1..N / `-`、duplicate / missing / extra / dangling の全体拒否、行順非依存が定義されている。 |
| SR-010 | Resolved | 高さは informational metadata に限り、identity、duplicate、route、tie-break、通常入力、chat、保存・復元の必須条件へ影響しない。 |
| SR-011 | Resolved | auto route の計算不能時は案内出力不可、revision / issued-at / 現在状態不変、過去 route の再利用禁止で、`unknown` を代用しない。 |
| SR-012 | Resolved | run なし初期空状態と新しい周回直後の最初の valid 登録は auto mode となり、成功時は route / selected candidate / transition / order を表示し、失敗時は auto calculation failure とする。既存 run の全削除・全完了・reload 後の追加は現在 mode と run を維持する。 |

過去 finding を根拠なく再発行していない。SR-013〜SR-018 は cycle 002 の finding そのものではなく、cycle 003 の全体新規レビューで見つかった別の未閉包である。

## 7. Requirements → Specification handoff closure

| 委譲元 | 結果 |
| --- | --- |
| `REQ-D-001` 入力形式・正規化・入力経路 | 座標、名前、master/map 選択、Mob 通常複数行、Treasure 貼り付けの外部契約は閉じている。ただし Treasure の完全一致再入力が duplicate か conflict かは SR-015 が未閉包。 |
| `REQ-F-006` / `REQ-F-007` route、candidate、tie | マップ間遷移回数第一、料金と load time の Pareto 補助評価、tie の deterministic presentation、missing auxiliary、candidate selection、高さ非使用は閉じている。 |
| `REQ-F-008` / `REQ-F-009` state lifecycle | run が残る空周回、初回 auto、複数行順、manual order、完了・削除後の追加は閉じている。manual→auto 再計算失敗と空/全完了 guide の表現は SR-016 / SR-017 が未閉包。 |
| `REQ-F-012` / `REQ-D-005` guide interchange | version、block、encoding、run/revision/issued-at、item/candidate integrity、stale / duplicate / conflict / newer、atomic import は閉じている。地点の同時意味、singleton header duplicate、空 state、replacement 後の世代は SR-013 / SR-014 / SR-017 / SR-018 が未閉包。 |
| `REQ-F-014` persistence / compatibility | 保存対象、reload、Treasure/Mob 非互換、破損全体拒否、master mismatch の未確認化、run/revision continuity は通常 lifecycle で閉じている。explicit replacement 後の revision / issued-at continuity は SR-018 が未閉包。 |
| `REQ-F-013` / `REQ-D-007` master / invalid data | master mismatch は保持・未確認・route 除外、保存破損は全体拒否、auto failure は案内禁止として閉じている。master が後から同一 stable identifier を公開した場合も、§10.2 が利用者の再選択・再登録まで route へ含めないと定めているため、Reviewer A の再解決候補は採用しなかった。 |

総合すると、Requirements が委譲した事項の多くは Specification で閉じているが、SR-013〜SR-018 により handoff closure は未完了である。「Design に引き継ぐ」とのみ記載して未閉包を通過させてはいない。

## 8. Two-implementation test

同じ Specification に適合する合理的な二つの Design / Implementation を、同じ外部入力・外部状態へ適用した。`PASS` は本文が外部結果を一意に拘束するもの、`FAIL` は正式な根拠なく分岐を許すものを示す。

| ケース | 結果 | 確認した外部結果 |
| --- | --- | --- |
| run あり対象 0 件へ別 run 案内 | PASS | 通常取り込みは拒否、明示 replacement のみ許可 |
| run なし初期空状態への初回 valid 案内 | PASS | incoming run を採用 |
| 同一 Mob / Treasure 複数行の順序 | PASS | 上から下へ逐次適用、同一入力に対する state が一致 |
| duplicate / conflict を含む複数行 | **FAIL** | Treasure 完全一致行の分類が duplicate / conflict で分岐（SR-015） |
| duplicate order / missing order | PASS | guide 全体拒否、状態無変更 |
| dangling candidate reference | PASS | guide 全体拒否、状態無変更 |
| 他 Mob candidate 参照 | PASS | guide 全体拒否、状態無変更 |
| 同一 map/X/Y で高さだけ異なる candidate | PASS | 同一 candidate identity、height は結果へ影響なし |
| 高さ欠落 | PASS | X/Y が有効なら高さ欠落だけで拒否しない |
| auto route calculation failure | PASS | auto failure 表示、stale route を current として扱わない |
| calculation failure 後の案内出力 | PASS | 出力不可、revision / issued-at / state 不変 |
| 初回 valid 登録 | PASS | auto mode、算出開始、成功/失敗結果が規定どおり |
| 全完了後の追加 | PASS | run と現在 mode を保持して追加 |
| 全削除後の追加 | PASS | run と現在 mode を保持して追加 |
| reload 後の対象 0 件への追加 | PASS | 保存された run / mode を継続 |
| 同一地点が confirmed かつ candidate | **FAIL** | candidate row の地点意味 field の表現が分岐（SR-013） |
| singleton header の重複 | **FAIL** | reject / first / last header の解釈が分岐（SR-014） |
| manual→auto 再算出失敗 | **FAIL** | auto failure 遷移か manual 保持かが分岐（SR-016） |
| auto/manual の対象 0 件・全完了 guide | **FAIL** | output 可否、transitions、空表現が分岐（SR-017） |
| explicit guide replacement 後の revision | **FAIL** | 入力 revision 継続か初期化かが分岐（SR-018） |
| unknown master reference の後続更新 | PASS | §10.2 により再選択・再登録まで route 除外 |

route comparison、tie、normalization、SR-002/003/004/005/006/007 のケースでは、合理的な二実装による正式根拠のない外部結果分岐を確認しなかった。

## 9. Scope / traceability / Design handoff

Concept の目的・対象ユーザー・v1 scope・責任境界に逸脱はない。Requirements の意味・強さを変更せず、v1 対象外の参加者画面、同期、認証、サーバー共有、自動投稿、ゲーム状態連携を復活させていない。高さの非使用は Requirements が Specification へ委譲した解釈を閉じるものであり、新しい route 評価軸や機能の追加ではない。

Acceptance と本文は、SR-001〜SR-012 の closure について整合している。`SPC-AC-015` / `020` / `021` は高さ、逐次入力、item/candidate integrity、run/revision、計算不能案内、初回 lifecycle を追跡している。ただし、現行 Acceptance に次の未閉包を補う判定条件はなく、既存 Acceptance の参照だけで SR-013〜SR-018 を閉じたことにはできない。

Design handoff は次の内部事項に限って妥当である。

- UI の具体配置、parser の分割、探索アルゴリズム、内部スコア、データ構造。
- run ID の生成方式、保存キー・保存技術・内部シリアライズ、モジュール構成。
- ただし、地点意味の表現、singleton header の拒否、duplicate/conflict 分類、manual→auto 失敗、空 state guide、replacement 後 revision は外部契約であり、Design へ再委譲できない。

## 10. 却下・merged・deferred の記録

| Reviewer 候補 | Chair の最終結果 | 理由 |
| --- | --- | --- |
| A: 同一地点の confirmed / candidate 表現 | **採用: SR-013** | §5.1 の同時成立と §8.1 の単一地点意味 field の組み合わせに、出力規則がない。 |
| A: singleton header 重複 | **採用: SR-014** | malformed/tampered block の受理・拒否と run/revision 解釈が分岐する。 |
| A / B: Treasure duplicate と conflict の重複 | **採用: SR-015** | 同一 root cause として統合。 |
| A / B: manual→auto 再計算失敗 | **採用: SR-016** | 同一 root cause として統合。 |
| A / B / C: 空・全完了 state の guide | **採用: SR-017** | 対象 0 件 lifecycle と guide 表現の同一 root cause として統合。 |
| B: explicit replacement 後の revision continuity | **採用: SR-018** | 空 state や通常 import とは別の世代採用 root cause。 |
| A: unknown master reference の後続再解決 | **Rejected** | §10.2 が、既存参照が無効化された場合は利用者が再選択・再登録するまで route に含めないと既に定めている。自動再解決を要求する上流根拠はない。 |
| 一般的な crypto、signing、checksum、auth、同期サービス、parser / algorithm preference | **Rejected** | Concept / Requirements に根拠がなく、Design / Implementation preference または speculative hardening である。 |

正式な Deferred finding はなし。下流へ残すのは、外部結果を変えない内部方式・実装の具体化だけである。

## 11. 検証結果

- `git rev-parse HEAD`: `5b60770e338742d97164e45d2ce613f0b2cc752f`。Reviewed HEAD と一致した。
- Reviewed branch: `maintenance/add-mob-compass`。指定 branch と一致した。
- `docs/specification/specification.md` は変更していない。Review 001 / 002、Concept、Requirements、Skill、Design、Implementation、source code、tests も変更していない。
- Review Board A / B / C は独立に完了し、各 Reviewer の作業結果で対象資料の変更、commit、push はなかった。
- Specification 本体、Concept、Requirements、Requirements Review 005、Review 001 / 002、指定 Skill / review-common を確認した。
- SR-001〜SR-012 を個別に再確認し、すべて Resolved とした。
- Requirements → Specification handoff closure を入力、状態、route、guide、persistence、master、Acceptance / Traceability ごとに再評価した。SR-013〜SR-018 のため総合 closure は未完了である。
- Two-implementation test を指定された cycle 002 の 15 ケースと、全体レビューで得た追加ケースへ適用した。FAIL は SR-013〜SR-018 に対応し、PASS のケースを finding へ拡張していない。
- Security / Interoperability checklist を malformed、tampered、stale、replay、deterministic representation、atomic import、persistence / recovery、compatibility に適用した。認証・署名等は根拠がないため要求していない。
- Acceptance / Traceability を本文と照合し、SR-001〜SR-012 の追跡を確認した。SR-013〜SR-018 は未閉包として明記した。
- `git diff --check`: 成果物作成後に実行し、PASS を確認した。
- `pnpm lint`: SKIPPED。docs-only でコード・設定・テストを変更していないため対象外。
- `pnpm test`: SKIPPED。docs-only でコード・設定・テストを変更していないため対象外。
- `pnpm run build`: SKIPPED。docs-only でコード・設定・テストを変更していないため対象外。
- 実装、テスト実行結果、ブラウザ挙動、静的 JSON / 画像の実値、実環境の保存・チャット互換性は Not validated。これらを Specification の合否根拠や PASS の推測には使用していない。

## 12. レビューゲート

`.agents/skills/spec-review/review-gates.md` の現行 7 Gate と、Critical が 1 件以上なら `REVISE SPECIFICATION` とする規則をそのまま適用した。

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Concept の目的、v1 scope、対象外、責任境界を維持している。 |
| 2. 要件追跡と契約（handoff closure） | FAIL | 案内の同時地点意味、header duplicate、Treasure duplicate/conflict、manual→auto failure、empty guide、replacement revision が一意に閉じていない。 |
| 3. 処理と例外 | FAIL | malformed block の header 解釈、操作失敗後の mode、空 state の出力、replacement 後の世代処理が分岐する。 |
| 4. 内部整合性 | FAIL | §5.1 の同時地点意味と §8.1 の単一意味 field、§6.3 / §7.4 の空 state と §8.1 の auto guide 条件、§8.2 の replacement と §8.3 / §9.1 の revision 継続に未定義境界がある。 |
| 5. 検証可能性 | FAIL | 同じ外部入力・状態から案内内容、受理分類、mode、transitions、revision を一意に期待できないケースがある。 |
| 6. 安全性・信頼境界・相互運用性 | FAIL | duplicate header、同時地点意味、空周回案内、replacement 世代の malformed / replay / interoperability 境界が未定義である。一般的 hardening の不足ではない。 |
| 7. 上流整合性と工程境界 | FAIL | Concept / Requirements の目的・強さは整合するが、外部結果を決める未閉包事項を Design / Implementation へ渡せない。内部方式の handoff 自体は妥当。 |

Gate 判定は Critical 2 件（SR-013 / SR-014）により `REVISE SPECIFICATION` となる。Major 4 件だけを理由に Critical へ昇格したものではない。

## 13. 残存リスク・未決定事項

- SR-013〜SR-018 は Specification Author が外部契約を確定した後、再レビューが必要である。
- UI 配置、parser 構造、route 探索方式、内部 score、run ID 生成、保存技術・内部表現は Design / Implementation に残る。ただし本レビューで採用した外部結果を変更してはならない。
- unknown master reference を後で自動再解決するかという A の候補は、現在の §10.2 の「再選択・再登録まで route へ含めない」により未決定事項ではないと判定した。
- 暗号学的真正性、認証、サーバー同期、共同編集、ゲーム状態連携は Concept / Requirements の対象外であり、残存要求ではない。

## 14. 自動変更

レビュー中に Specification、Concept、Requirements、過去 review artifact、Skill、Design、Implementation、source code、tests、README、静的データ、画像を変更していない。本サイクルで新規作成する成果物は本ファイルだけであり、レビュー対象の外部契約を修正していない。

## 15. 最終判定

**REVISE SPECIFICATION**

Critical 2 / Major 4 / Minor 0。SR-001〜SR-012 は Resolved、SR-013〜SR-018 は New / Open である。Requirements → Specification handoff closure と Two-implementation test は SR-013〜SR-018 のため未完了であり、Design handoff は内部方式に限って妥当である。Specification Author がこれらを解消し、次の Specification Review で再確認するまで、次工程へ進めない。
