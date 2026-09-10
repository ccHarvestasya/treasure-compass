# Treasure Compass / Mob Compass Design Review 001

## 1. レビュー対象

- レビューサイクル: 001
- 対象フェーズ: Design
- 確認日: 2026-09-10（Asia/Tokyo）
- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `59bb6246769fa2910fccb6d8d6c5ac8a3a28042e`
- 対象成果物: `docs/design/design.md`
- 対象 Design SHA-256: `b923ccebf906c0b86428b468cd13e3041405411bcbc0256001ed6c1e1df9a4cf`
- 対象範囲: Design 全文。目的・範囲、System context、trust boundary、責務・依存、Treasure/Mob の state ownership、route state、lifecycle、guide、persistence、master data、failure containment、atomicity、security、traceability、Implementation / Test handoff を確認した。
- 未確認範囲: 実装コード、テスト実行、ブラウザでの localStorage / clipboard 挙動、static JSON・画像・master data の実値、実環境での保存・案内互換性。これらは Design の構造確認に必要な明白な矛盾がないかを除き、合否の根拠にはしていない。

対象 Design、上流成果物、既存レビュー、Skill、AGENTS.md は変更していない。今回作成する本資料だけをレビュー成果物とする。

## 2. 使用した根拠

- ユーザー依頼。Reviewed HEAD、Design 全文レビュー、重点確認項目、Review Board の役割、Gate、変更禁止範囲、commit / push 禁止、docs-only 検証を根拠とした。
- `AGENTS.md`。Source of Truth、Scope Discipline、Concept → Requirements → Specification → Design → Implementation / Test の工程境界、既存資料不変、docs-only validation を確認した。
- `.agents/skills/design-review/SKILL.md`。Design の責務、Specification との境界、finding 基準、Two-implementation test、工程分類、重大度と Gate の原則を適用した。
- `.agents/skills/design-review/reviewers.md`。Reviewer A（構造と責務）、B（Security）、C（フローと運用）、D（追跡と下流実装可能性）の観点と Chair による統合基準を適用した。
- `.agents/skills/design-review/review-gates.md`。8 Gate と、Critical の New / Open / Reopened があれば `REVISE DESIGN`、なければ `READY` とする規則を適用した。Major / Minor は単独で Gate failure に昇格させていない。
- `.agents/skills/design-review/output-format.md`、`.agents/skills/design-review/security-checklist.md`。成果物形式、`DR` finding ID、対象に該当する trust、validation、integrity、failure isolation、persistence、recovery、observability の確認範囲を適用した。
- `.agents/skills/review-common/review-playbook.md`、`.agents/skills/review-common/output-format.md`。根拠の優先順位、工程分類、重複統合、下流からの逆生成禁止、14章の成果物構成、未確認範囲と自動変更の扱いを適用した。
- [Specification](../../specification/specification.md)。Design の直接の上流として、Treasure/Mob の対象単位、候補と状態の意味、route、manual / auto、guide、run / revision / issued-at、persistence、master mismatch、failure / atomicity の外部契約を確認した。
- [Specification Review 004](../specification/specification-review-004.md)。Specification が `READY` であり、SR-001〜SR-018 に未解消の正式 finding がないことを確認した。
- [Requirements](../../requirements/requirements.md)。Design へ引き継がれた state、保存方式、内部構造、route algorithm、master、guide、validation の責務範囲を確認した。
- [Requirements Review 005](../requirements/requirements-review-005.md)。Requirements が Specification へ引き渡し可能で、Concept の製品判断と下流 handoff が確定していることを確認した。
- [Concept](../../concept/concept.md)。目的、v1 scope、Treasure 1:1 / Mob 1:多、共有周回の責任主体、対象外を確認した。
- 既存実装・テスト・設定・静的データは、必要性を検討したが、今回の Design 構造判定の正式根拠には使用していない。既存の実体だけから新しい Requirement / Design requirement は生成していない。

## 3. レビュー結果

**REVISE DESIGN**

Critical 1件、Major 3件、Minor 0件。すべて New / Open の Design finding である。Critical の `DR-001` があるため、review-gates.md に従い Gate は `REVISE DESIGN` とする。

また、persistence write failure の外部結果は Specification に定義されていないため、Design finding として具体的な rollback / keep 方針を発明せず、上流への `Specification gap` として記録する。これは上記の Design finding 件数には含めない。

## 4. 総評

Design は全体として、承認済み Specification を実現するために必要な論理責務をよく分離している。Treasure Session と Mob Session の root、Treasure の current / sequential と Mob の candidate membership、master classification・route selection・user confirmation・completion の区別、UI → Application → Domain → Master / Persistence の依存方向は明確である。

Route Planner を read-only とし、Application が calculation result の adoption / commit を担う構造も、stale route 禁止、manual→auto の success-only、通常複数行の逐次適用と guide import の全体 atomicity を支える。empty / all-complete snapshot、explicit replacement、generation continuity、corrupt persistence と master mismatch の分離、untrusted input の fail-closed 境界も Specification へ追跡できる。

ただし、初回 guide import の mode lifecycle、master read model 更新と非同期 route result の整合、guide output の時間・clipboard・commit の線形化、selection history の保存責務が Design 上で閉じていない。これらは implementation のクラス名や方式の好みではなく、実装によって ownership / consistency / recovery または利用者可視結果が分岐する問題である。

## 5. 指摘事項

### DR-001 — Critical — New / Open

- **対象箇所**: `docs/design/design.md` §6.6（276–287行）、§6.7（289–297行）、§5.3（189–200行）
- **上流根拠**: Specification §7.4、§8.1〜8.3（特に `mode` を含む snapshot、初期 run の成立、valid guide の受理と snapshot adoption）
- **事実**: Design §6.7 は、run のない初期空 state で最初の valid Mob 登録または初回 valid guide import が成立したときに「run と初期 auto mode」を作ると記載している。一方、§6.6 は検証済み incoming snapshot を working session として全体 adopt すると記載し、§5.3 は guide import 成功時に incoming metadata を採用すると記載している。Guide snapshot 自体には `mode`、route/order、transitions が含まれる。
- **問題**: 初回 guide が `mode: manual` の場合、incoming snapshot 全体を保持して manual とする実装と、§6.7 の「初期 auto mode」を優先して auto へ上書きする実装が成立する。初回 guide を受理した後の mode、order、transitions、route adoption、以後の追加・再出力・generation の扱いが一意にならない。
- **影響**: guide を用いた管理継続という Specification の主要経路で、同一の初期状態・同一の valid guide に対して利用者可視の mode と route / order が分岐する。Implementation が incoming mode を保持するか、初期 auto を優先するか推測する必要があり、guide snapshot の全体 adoption と lifecycle が矛盾する。
- **分類**: Design defect。Specification は初期 valid guide の受理、guide snapshot の mode、incoming snapshot の一括扱いを定めており、Design 内の lifecycle の接続が不足している。新しい外部契約を作る指摘ではない。
- **最小修正**: 初期 auto mode の規則を、run のない状態での最初のローカル valid 登録および「新しい周回」の開始へ限定する。run のない状態への初回 valid guide import は、検証済み incoming snapshot の `mode`、route/order、対象、候補、confirmation、completion、run/revision/issued-at を上書きせず一括採用すること、また同一 run の accepted snapshot がまだない場合の baseline adoption を Application responsibility として明記する。
- **再確認条件**: run のない初期空 state に `mode: manual` と `mode: auto` の valid guide をそれぞれ取り込み、incoming mode、order、transitions、対象、route / candidate selection、generation metadata が保持されること。初回ローカル登録は auto、新しい周回直後は auto、初回 guide import は incoming snapshot adoption として区別され、save / reload 後も同じ結果になること。

### DR-002 — Major — New / Open

- **対象箇所**: `docs/design/design.md` §5.2（180–187行）、§6.3（237–247行）、§7.2（313–321行）、§8.2（345–349行）
- **上流根拠**: Specification §6.4（更新後 master での auto route 再評価と古い結果の不採用）、§10.2（master 更新、不整合、route 再評価）
- **事実**: Design は route calculation result に対象 snapshot version を付け、current session version と一致する場合だけ採用すると定めている。Planner は master の地点・移動情報を入力とし、master 更新時は再計算すると定めている。しかし、result がどの validated master read model に基づくか、master の更新・reload・不整合検出によってその result が無効になる条件は定義されていない。
- **問題**: session state が変わらないまま master read model が更新され、旧 master に基づく非同期 result が返った場合、session version だけを検査して旧 result を採用する実装と、master read model の世代・snapshot identity も検査して破棄する実装が成立する。
- **影響**: master 更新後に stale な地点有効性、移動負荷、route-selected candidate、transitions、order が current route として表示される可能性がある。Specification の「更新後の値で再評価」「古い route を current result として残さない」が、非同期または遅延した計算で保証できず、master と route state の consistency responsibility を実装者が推測する。
- **分類**: Design defect。Specification は master 更新後の外部結果と古い route の禁止を定めているため、Design の current-result adoption boundary の不足である。具体的な revision counter、hash、class、function は要求しない。
- **最小修正**: Route Calculation Result が参照した validated master read model の identity / generation を result に関連付け、session snapshot と master read model の双方が current である場合だけ adoption する責務を明記する。master 更新、reload、mismatch の検知時に旧 read model に基づく実行中 result を current route へ採用不可とする境界を定める。
- **再確認条件**: master の地点有効性、分類、移動負荷を更新した状態で旧 master の遅延 result が返っても採用されず、新 master に基づく結果だけが current route / route-selected / transitions / order へ反映されること。classification の `candidate → confirmed` 更新では candidate membership、user-confirmed、completion、selection history が変わらず、master mismatch では identity・順序・確認・完了が保持されること。

### DR-003 — Major — New / Open

- **対象箇所**: `docs/design/design.md` §5.3（189–200行）、§6.5（264–274行）、§7.2〜7.3（313–327行）
- **上流根拠**: Specification §8.1（guide output と出力時点）、§8.3（generation metadata）、§11.1〜11.2（auto failure / output failure 時の無変更）
- **事実**: Design §6.5 は `issued-at` を serialize 前の step 3 で決め、step 4 で serialize、step 5 で serialize と clipboard handoff が成功したときだけ revision / issued-at を commit すると記載している。Guide output と他の state-changing operation の同時実行時に、どの snapshot を出力 operation として線形化するかは記載されていない。
- **問題**: clipboard handoff が遅延する間に対象や order が更新された場合、先に取得した guide と後の session state に対して generation metadata を commit する実装が可能である。また、`issued-at` は Specification の「案内出力操作が完了した実時刻」ではなく、serialize / clipboard より前の時刻になり得る。serialize、clipboard、state commit の順序だけでは、guide と current generation の対応を保証できない。
- **影響**: 同じ外部状態・入力でも、guide の内容、`issued-at`、revision 更新、次回の stale / duplicate / conflict 判定の基準が実装ごとに異なり得る。過去 snapshot と現在 state の混在、または output failure 時の generation 不変条件を実装者が推測する必要がある。
- **分類**: Design defect。Specification の output time と snapshot / generation semantics を実現する Application の operation boundary が不足している。具体的な lock、mutex、clipboard API、関数 sequence は要求しない。
- **最小修正**: Application が guide output の snapshot取得、generation 仮決定、serialize、外部 output、generation metadata の commit を一つの線形化された operation として管理し、guide・session state・generation metadata が同じ snapshot に対応する責務を明記する。`issued-at` は Specification の出力完了時点の意味に対応させ、clipboard handoff をその境界に含めるか否かを既存契約と矛盾なく明確化する。output failure 時は revision / issued-at と current state を変更しない既存契約を維持する。
- **再確認条件**: 遅延する output 中に対象変更を試みても、guide と generation metadata が別 snapshot にならないこと。serialize / output failure 時に state、revision、issued-at が変更されず、成功時の `issued-at` が Specification の output completion semantics に対応し、二実装で同じ snapshot / generation 結果になること。

### DR-004 — Major — New / Open

- **対象箇所**: `docs/design/design.md` §5.1（162–178行）、§5.2（180–187行）、§6.1（210–219行）、§8.1（337–343行）
- **上流根拠**: Specification §7.2（手動順序で最後に成功した採用地点を参照する規則）、§9.1〜9.2（route-selected、manual order、completion、確認、selection の保存・reload）
- **事実**: Design は Mob ごとに最後に成功した route selection を `selection history` として current route から分離し、manual 表示や失敗後の参照に用いる state と定義している。しかし、persistence payload では `selection` とだけ記載され、起動・復元の手順も current route selection は列挙するが selection history の保存・復元・master mismatch 時の保持を明示していない。
- **問題**: selection history を保存して reload 後も表示・manual transitions に使う実装と、current selection だけを保存して history を失う実装が、Design の文面上は成立する。current route と履歴を別概念にした結果、どちらが persistence の source of truth かが不明である。
- **影響**: auto route 成功後の manual order、route failure / master mismatch、save → reload 後に、手動順序の地点、transitions、採用地点の履歴表示、guide 再出力へ異なる結果が現れ得る。Specification が保持を求める「最後に成功した採用地点」と、Design が導入した selection history の recovery responsibility の間を実装者が推測する必要がある。
- **分類**: Design defect。これは具体的な storage key や schema の不足ではなく、Design が current route として再利用してはならない履歴を session state として所有しながら、その persistence / recovery owner を閉じていない問題である。
- **最小修正**: manual state の復元に必要な「最後に成功した route selection」を selection history として保存・復元するか、保存済み current selection と manual state から lossless に再構成できることを明記する。master mismatch、route failure、manual→auto failure、reload 後もその履歴を current route と混同せず保持する責務を persistence / Application に割り当てる。
- **再確認条件**: auto route 成功後に manual mode へ移行し、route failure または master mismatch を発生させて保存・reload した場合、manual order、最後に成功した selection の表示・transitions、guide output、current route validity が保存前後で一致し、履歴が stale current route として採用されないこと。

## 6. 解消済み指摘

本レビューサイクルが Design の初回正式レビューであるため、過去の Design Review finding はない。解消済み指摘はなし。

## 7. 上流へのフィードバック

### Persistence write failure — Specification gap

これは formal Design finding ではなく、Design Review → Specification の上流フィードバックである。

- **対象箇所**: Design §7.3（323–327行）、§8.1（337–343行）
- **根拠**: Specification §9.1〜9.2、§11.2
- **事実**: Design は persistence write failure を保存成功として扱わない方針を示すが、write failure 後の in-memory state を rollback するのか保持するのか、guide output 成功後の revision / issued-at をどう扱うのか、失敗後 reload で何が復元されるのかを定めず、具体的な再試行・通知を Implementation / Test に委譲している。Specification は保存対象、保存構造の破損時の全体拒否、guide output failure 時の無変更は定義しているが、永続領域への write failure の外部結果を定義していない。
- **影響**: `write` 前に memory を commit する実装と、write 成功後だけ memory を commit する実装が、失敗直後・次回操作・reload 後に異なる外部結果を返し得る。これは Design だけで rollback / keep のどちらかを選ぶべき問題ではなく、Specification に外部結果が不足している。
- **対応**: Specification で write failure 時の操作結果、in-memory state、保存状態、revision / issued-at、利用者表示、retry の扱い、reload 後の結果を一意に定める。その後、Design で Application / Persistence の commit・rollback・recovery 境界を確定する。本レビューでは具体動作を発明していない。
- **再確認条件**: 更新された Specification に対して、Design が一つの consistency / recovery responsibility を示し、失敗直後と reload 後の外部結果を Test が検証可能であること。

Upstream ambiguity はない。Concept / Requirements の目的、scope、責任主体、Treasure/Mob の対象単位は確定しており、今回の write failure は Requirements の意味不足ではなく Specification の外部契約不足である。

## 8. 保留した指摘

正式な Deferred finding はない。以下は Design の責務・境界が定まっており、Implementation / Test へ委譲可能な事項である。

- concrete class / function / private helper、TypeScript interface の完成コード、exact source file / directory layout、Zustand の具体 slice。
- parser の regex / lexer、validation library、route の graph / exploration algorithm / optimization、内部 score / cache。
- localStorage の具体 key、serialization envelope、migration / deletion API、clipboard API の具体実装。
- React JSX / CSS、地図画像座標変換、exact error message、test fixture / test code / CI。
- 実際の static JSON / 画像 / master data、browser localStorage / clipboard の実環境挙動、性能、既存実装からの migration の実作業。

これらは、上流外部契約、Design の責務・ownership、failure / atomicity / security boundary を変更しない条件で下流が決める。既存実装の構造をそのまま採用することは要求しない。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Design の追跡先 | 判定 |
| --- | --- | --- | --- |
| Treasure / Mob の公開単位、Treasure 1:1、Mob 1:多 | Specification §1、§4〜5、REQ-F-001〜004 | §1.1、§4.1〜4.2、§5.1、§10.1 | DR-001〜004 を除き責務分離は明確 |
| candidate membership、master classification、route-selected、user-confirmed、complete | Specification §2、§5.1〜5.3、§10、REQ-F-004 / 007 / 009 / 013 / 014 | §4.1、§4.3、§5.1、§6.3、§7.4、§8.2 | 分離と master 更新時の非昇格は PASS |
| UI / Application / Domain / Master / Persistence の依存 | Specification §3、§9〜11、Requirements §9.3 | §3、§4.1〜4.3、§8、§9 | Domain の環境 API 非依存、adapter 境界は PASS |
| route result、current route、manual order、selection history、failure | Specification §6〜7 | §5.2、§6.3〜6.4、§7.2 | current/history の persistence は DR-004、master generation は DR-002 |
| 通常複数行の逐次 semantics と guide import の全体 atomicity | Specification §3.2、§8.2、§11.2 | §6.2、§6.6、§7.1、§7.3、§10.4 | 相互の混同はなし |
| guide parse / validation / semantic snapshot / apply | Specification §8.1〜8.3、REQ-F-012 / REQ-D-005 / 007 | §5.3、§6.5〜6.6、§7.3、§10.2 | singleton、integrity、generation、replacement の責務は概ね PASS。output boundary は DR-003、initial import は DR-001 |
| empty / all-complete、初回登録、新しい周回、explicit replacement | Specification §7.3〜7.4、§8.1〜8.3 | §6.5〜6.7、§7.1、§8.1 | empty/completed と replacement continuity は PASS。初回 guide mode は DR-001 |
| persistence corruption と master mismatch | Specification §9.1〜9.2、§10.2、REQ-F-014 / REQ-D-007 | §6.1、§7.3〜7.4、§8.1〜8.2、§9.1 | 全体拒否と state 保持の分離は PASS。write failure は上流 gap |
| master update、route failure、stale result | Specification §6.4、§10.2、§11.1 | §6.3、§7.2、§8.2 | master read-model generation が DR-002 |
| Security / trust / validation / no HTML / no eval / logging | Requirements REQ-D-007、REQ-S-001〜006、Specification §11、AGENTS.md | §3.2、§7、§8、§9 | 適用範囲の責務は PASS |
| downstream feasibility | Requirements §9.3、Specification §13 | §12、§13、§14.2〜14.4 | DR-001〜004 と上流 gap 解消後に Implementation / Test へ進める |

Review Board の独立観点は次のように統合した。

- Reviewer A: master read model の世代と route result adoption を DR-002 として提示した。
- Reviewer B: formal Security finding なし。untrusted input、fail-closed、integrity、master mismatch、sensitive data / logging boundary は PASS とした。persistence write failure は Specification gap 候補として提示した。
- Reviewer C: 初回 guide import lifecycle を DR-001、guide output boundary を DR-003、selection history の recovery を DR-004、persistence write failure を Specification gap として提示した。
- Reviewer D: guide output の timestamp / clipboard / commit を DR-003、selection history の persistence を DR-004、persistence write failure を Specification gap として提示した。

同じ根本原因である guide output の timestamp・clipboard・commit・線形化は DR-003 に統合し、selection history の保存責務は DR-004 に統合した。exact implementation の不足や一般的な hardening は finding にしていない。

## 10. 検証結果

- レビュー開始時に `git status --short`、branch、HEAD、対象 Design の版を確認した。branch は `maintenance/add-mob-compass`、HEAD は `59bb6246769fa2910fccb6d8d6c5ac8a3a28042e` で、ユーザー指定の Review target HEAD と一致した。
- 対象 Design の SHA-256 は `b923ccebf906c0b86428b468cd13e3041405411bcbc0256001ed6c1e1df9a4cf` である。
- 指定された AGENTS、design-review の SKILL / reviewers / gates / output-format / security-checklist、review-common の playbook / output-format、Concept、Requirements、Requirements Review 005、Specification、Specification Review 004 を確認した。
- 相対参照先の Concept、Requirements、Requirements Review 005、Specification、Specification Review 004、対象 Design の存在を確認した。
- 対象 Design の見出し構造、component table、dependency diagram、traceability table、finding 対象箇所を確認した。
- Reviewer A〜D の独立確認結果を受領し、Chair が根本原因の重複を統合した。Reviewer B は Security scope の formal finding なしと判定した。
- `git diff --check`: PASS。レビュー成果物は作成前の対象 Design に whitespace error がなく、成果物作成後の差分でも whitespace error はない。
- `git diff --name-only`: なし（レビュー開始時）。`git diff --cached --name-only`: なし（レビュー成果物作成前）。成果物作成後の changed file は本 review artifact のみ。
- `pnpm lint`: SKIPPED。docs-only review であり、コード変更を伴わないため対象外。
- `pnpm test`: SKIPPED。docs-only review であり、コード変更を伴わないため対象外。
- `pnpm run build`: SKIPPED。docs-only review であり、コード変更を伴わないため対象外。
- 実装、unit test、browser、static JSON / 画像の実値、実環境の storage / clipboard、性能、migration の実行結果は Not validated。未実行を PASS としていない。
- commit / push は実施していない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | §1〜2 が approved Specification の目的、scope、対象外、工程境界を追跡している。 |
| 2. コンテキストと責任 | PASS | §3 と §4 が利用者、UI、Application、Product Session、master、persistence、untrusted resource の責任を分けている。 |
| 3. 依存方向 | PASS | §4.2 が `UI → Interaction → Application → Domain → Master / Persistence` を定め、Domain の環境 API 直接依存を禁止している。 |
| 4. 主要フローと失敗 | REVISE DESIGN | DR-001 が初回 guide import lifecycle、DR-003 が guide output の線形化・完了時刻・commit 境界を未閉包にしている。 |
| 5. 状態・データ所有 | REVISE DESIGN | DR-001 が incoming mode adoption と初期 mode の責任を衝突させ、DR-002 が master read model の世代、DR-004 が selection history の persistence ownership を未確定にしている。 |
| 6. Security・整合性・運用境界 | REVISE DESIGN | untrusted / fail-closed / integrity は PASS だが、DR-002 の master-result consistency と DR-003 の snapshot/generation consistency が残る。persistence write failure は Specification gap として上流へ返す。 |
| 7. 上流整合性と工程境界 | REVISE DESIGN | Design は多くの外部契約を維持しているが、DR-001〜003 は Design 内の接続不足であり、persistence write failure は Specification で外部結果を定める必要がある。 |
| 8. 下流実装可能性 | REVISE DESIGN | exact code は適切に Implementation / Test へ委譲されている一方、DR-001〜004 は mode、consistency、recovery、generation の推測を残している。 |

Critical の New / Open は DR-001 の 1件であるため、最終 Gate は `REVISE DESIGN`。Major 3件だけを理由に Gate を不合格へ変更したものではない。

## 12. 残存リスクと未決定事項

- DR-001: runless 初回 guide import が incoming `mode` を保持する snapshot adoption と initial auto lifecycle のどちらに従うかが Design 内で矛盾している。
- DR-002: master read model の更新と遅延 route result の stale 防止に必要な adoption boundary が未確定である。
- DR-003: guide output の snapshot / timestamp / clipboard / commit の線形化が未確定である。
- DR-004: current selection と selection history の persistence / recovery source of truth が未確定である。
- Persistence write failure の rollback / keep / reload semantics は Specification gap であり、上流判断なしに Design で決定してはならない。
- Upstream ambiguity はない。Concept と Requirements の製品判断、scope、責任境界は確定している。
- Design decision pending は DR-001〜DR-004 の解消に必要な内部責務判断としてあり、具体的なコード詳細は pending ではなく Implementation / Test handoff である。

## 13. 自動変更

なし。Reviewer は対象 Design、Concept、Requirements、Specification、既存レビュー、Skill、AGENTS.md、実装、テスト、設定、static data、画像を変更していない。commit、push、対象 Design の修正も行っていない。本サイクルで新規作成したのは `docs/reviews/design/design-review-001.md` のみである。

## 14. 最終判定

**REVISE DESIGN**

Critical 1 / Major 3 / Minor 0。`DR-001`〜`DR-004` は New / Open。特に、初回 valid guide import の mode lifecycle を一意化し、master read model と route result の世代整合、guide output の timestamp・clipboard・commit の線形化、selection history の persistence / recovery ownership を Design で閉じる必要がある。

Persistence write failure は Specification gap として上流へ返す。Specification が外部結果を定めるまで、Design だけで rollback / in-memory keep / retry / reload semantics を追加してはならない。上記の Design findings と Specification gap の整理後、Design Review を再実施できる。
