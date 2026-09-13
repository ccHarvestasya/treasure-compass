# Treasure Compass / Mob Compass Design Review 011

## 1. レビュー対象

- レビューサイクル: 011
- 確認日: 2026-09-14（Asia/Tokyo）
- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `0426af84d1cb061fdfc2d4d3f3bd65405c07021f`
- 対象成果物: [Design](../../design/design.md) — Design Author Revision 009
- 直接の規範的上流: [Specification Revision 009](../../specification/specification.md)、[Specification Review 015](../specification/specification-review-015.md)（`READY`）
- 補助上流: [Requirements Revision 013](../../requirements/requirements.md)、[Requirements Review 013](../requirements/requirements-review-013.md)（`READY`）、[Concept](../../concept/concept.md)、[Concept Review 005](../concept/concept-review-005.md)（`READY`）
- 対象範囲: Design Revision 009 全体。特に Treasure 実装完了後の共通化境界、application / domain / UI / master / persistence の責務、Treasure と Mob の session root、Mob の target / candidate、route calculation / route state、manual / auto、stale result、B 探索、parser / guide 相当の境界、過剰設計および下流実装可能性を確認した。
- 補助確認: 現行の Treasure Implementation / Test、現行の workspace package、Mob の開発途中 scaffold、README、静的 master の配置。実装から Mob の新しい仕様は逆生成していない。
- 未確認範囲: Mob の正式 master 全件、出典・画像・license の承認、実ブラウザ・実端末、実 localStorage、Mob の完成 Implementation / Test、実配備および release readiness。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。今回の再レビュー目的、レビューのみの変更範囲、Source of Truth、Treasure 実装を共通基盤の補助証拠として扱う境界を確認した。`MEMORY.md` は正式文書に反する古い実装状況を上書きする根拠には用いていない。
- `design-review` Skill と `review-common/review-playbook.md`、`review-common/output-format.md`、`design-review/review-gates.md`、`design-review/reviewers.md`、`design-review/output-format.md`。責務、依存、state / data ownership、failure boundary、工程境界、Finding の重大度および Gate を適用した。
- [Concept Revision](../../concept/concept.md) と [Concept Review 005](../concept/concept-review-005.md)。Treasure / Mob の別アプリ、Mob のソロ / パーティ区分、共有を同じ意味の地図・地点・経路・進行へ限定する方針、チャット解析を Mob v1 に含めない境界を確認した。
- [Requirements Revision 013](../../requirements/requirements.md) と [Requirements Review 013](../requirements/requirements-review-013.md)。Mob の rank eligibility、一般モブと B の candidate、party の一地点選択、保存分離、route、manual / auto、B Next、guide / chat の対象外境界を確認した。
- [Specification Revision 009](../../specification/specification.md) と [Specification Review 015](../specification/specification-review-015.md)。入力、route の success / empty / failure、manual / auto、保存失敗、stale、Mob の登録・候補・B 探索・party replacement、共通 interaction の外部契約を直接の根拠とした。
- [Design Review 010](design-review-010.md)。DR-014 の metadata follow-up と、Design Revision 009 の既存責務・依存・state ownership・transaction のレビュー結果を確認した。
- [Treasure Implementation Review 016](../implementation/implementation-review-016.md)。完成した Treasure の最新実装・テストが `READY` であること、および parser 修正後も Treasure の application / domain / persistence / route 境界を補助的に確認した。
- 現行コード: `apps/treasure-compass/src/store/useAppStore.ts`、`apps/treasure-compass/src/store/routeProjection.ts`、`apps/treasure-compass/src/utils/distance.ts`、`apps/treasure-compass/src/components/MapCanvas/`、`apps/treasure-compass/src/components/AetheryteOverlay/`、`packages/treasure-domain/`、`packages/mob-domain/`、`packages/map-core/`、`packages/master-data/`、`apps/mob-compass/src/mobCatalog.ts`、`apps/mob-compass/src/mobCoordinator.ts`。実装上の共通化実体、責務の配置および Mob data gate の状態を確認した。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 2。DR-015 と DR-016 は、外部契約、session root、Mob 固有状態または安全境界を再設計する指摘ではなく、Implementation handoff 前に Design の記述を狭く整合させる非ブロッキング finding である。design-review Skill の Gate 規則では Critical がないため `READY` とする。ただし、ユーザー要求の三分類では「軽微な Design 修正後に Implementation に進める」と判定する。

## 4. 総評

Design Revision 009 の中核は現在も妥当である。Concept / Requirements / Specification が定める Treasure と Mob の別 app・別 session root、Treasure の 1:1 registration と Mob の 1:多 candidate membership、UI → Application → Domain → Master / Persistence の依存方向、route calculation と route state の分離、保存成功後だけの publish、manual → auto の成功時だけの切替、stale result の破棄、Mob の B candidate 探索および party の selected candidate replacement は、Treasure の現在実装を参照しても無理なく実現できる。

Treasure 実装から Mob に持ち込むべきなのは、write-before-publish、validated master、session snapshot、domain transition、route projection などの責務上の境界である。Treasure の member / bulk parser / current target、Treasure 専用の MapCanvas、Treasure の Zustand store、Treasure の registration workflow を Mob の target / candidate workflow へ流用する設計にはなっておらず、この分離は維持できる。Mob の chat parse、bulk registration、専用 guide generation も、Concept / Requirements の対象外境界に従い、Mob の実装へ追加してはならない。

一方、Treasure の完成実装では、汎用の `map-core` は座標・範囲・距離の基礎契約に留まり、route algorithm、route projection、地図描画および overlay は Treasure app 内に残っている。Design が `packages/map-ui` と `map-core` 内の共通 route 計算を固定配置として扱う箇所は、現在の共通化実体との handoff を曖昧にする。また、Design の warning 付き route success は Specification にない外部結果を導入している。この二点だけは、Mob Implementation の開始前に Design を狭く補正する必要がある。

## 5. 指摘事項

### DR-015: 固定された共通 package 境界が完成した Treasure の実体と一致しない

- Category: Design responsibility / implementation handoff
- Severity: Minor
- Status: New
- Location: Design §3.1 の workspace package 表・依存図、§3.2 の Route planner / Map UI / Master adapter、§8.1、§9、§11.1、§13.1、§14

#### 確認した事実

Design §3.1 は、`packages/map-core` が map group 順序・同一 map 経路・同率判定を所有し、`packages/map-ui` が地図画像・marker・route・overlay・selection dialog を所有する workspace package 構成を固定している。§16 も package 名・配置を確定 Design としている。

一方、現在の workspace に存在する共通 package は `map-core`、`master-data`、`treasure-domain`、`mob-domain` であり、`packages/map-ui` は存在しない。完成した Treasure は、route の計算と projection を `apps/treasure-compass/src/utils/distance.ts` / `src/store/routeProjection.ts` に、地図描画と overlay を `apps/treasure-compass/src/components/MapCanvas/` / `src/components/AetheryteOverlay/` に置いている。`map-core` は現状、座標・bounds・2D distance の基礎契約を提供している。Treasure の application orchestration も app 内 store にある。

これは Treasure 実装が Design に適合しないと機械的に判定する問題ではない。下流実装を正式仕様へ逆生成せず、ユーザーが指定した「現時点の実際のアーキテクチャ・共通基盤」の参照として確認した結果、Design の「固定された package 配置」と実際に確立した再利用境界の間に未解消の選択が残っている、という問題である。

#### 問題と影響

Mob 実装者は、(a) 完成済み Treasure を共通 package へ抽出・再編成するのか、(b) Treasure と同等の route / map UI を Mob 側へ別実装するのか、を Design から決められない。前者は依頼されていない Treasure の再編成と互換性確認を誘発し、後者は Design の共有 package 依存と衝突する。どちらも、Treasure 固有構造を Mob へ無理に流用しないという既存方針と、共通化を意味の同一性に限定する Concept の責任境界を不必要に揺らす。

#### 必要な最小修正

Design の package 表・依存図・実装 handoff を、次の二つを区別する記述へ整合させる。

1. 現在実体として共有されている map primitive / validated master / product-independent contract。
2. 共通化が必要な意味上の interaction / route 責務と、その実装配置。

そのうえで、route planner と Map UI が現状の app-local 実装のままなのか、Treasure を変更せずに別途抽出する前提なのかを Design 上で一意にする。Mob は Treasure の store、MapCanvas、member registration、bulk parser に依存せず、Mob 固有の registration / candidate / progress を自 domain と application が所有する境界を維持する。これは新しい外部仕様や新 package の追加を求める指摘ではなく、既存 Design の固定配置と現在の handoff を一致させるための修正である。

#### 再確認条件

Mob 実装者が、Treasure の再編成または Treasure 固有 UI / state の流用を仮定せず、Design に明示された shared contract と Mob 固有責務だけで implementation plan を作れること。Treasure / Mob の app、domain、session root、persistence key が相互依存せず、route calculation と route state の ownership が引き続き分離されていること。

### DR-016: Specification にない warning 付き route success を Design が外部結果として追加している

- Category: Specification conformance / external-result overreach
- Severity: Minor
- Status: New
- Location: Design §8.1、§9.1〜§9.2、§12 の `route success with warning` 行、§13 の route failure 境界

#### 確認した事実

Specification §6.4 は、必要な情報が不足して経路を成立させられない場合を、理由と対象を表示する計算不能として扱い、既存順序・manual / auto 区分・現在地点・進捗を変更しないと定めている。正常な空経路、経路成功および経路失敗の外部結果も §6.1〜§6.4 と §9.3 に定義されている。

Design §8.1、§9.1、§12 はこれに加えて `success` に 0 件以上の `warning` を含め、補助情報が利用できない場合も warning として route と一緒に保存・公開し、warning を failure に昇格させたり捨てたりしない、と定めている。Requirements / Specification にはこの warning result、保存対象、表示契約はない。現行 Treasure の route projection も、warning contract を確立した根拠ではない。

#### 問題と影響

Implementation が、同じ「情報不足」を route failure として既存順序を保持するのか、warning success として新しい route result を保存・公開するのかを推測しなければならない。これは表示文言だけでなく、route の採用、保存、manual / auto 状態、失敗時の atomicity に影響する。Design が Specification の外部契約を補完・拡張している状態であり、Mob に新しい warning 機能を追加する根拠にもなり得る。

#### 必要な最小修正

Specification にない warning success を Design の外部結果・保存結果・必須表示として扱わない。既存 Specification に従い、経路成立に必要な情報が不足する場合は failure と理由・対象を扱い、working state を保存・公開しない。warning を内部 diagnostic に限定する場合も、外部 result や session state へ漏らさないことを明記する。

warning success を製品契約として必要と判断する場合は、先に Specification の正式変更とレビューを行う必要があるが、今回その新仕様は提案しない。

#### 再確認条件

Design の route result が Specification の success / empty / failure の契約だけで実装可能であり、計算不能時の既存順序・manual / auto・現在地点・進捗の非変更と write-before-publish が一意に追跡できること。Mob 固有の candidate unresolved と Treasure の route failure が同じ未定義 warning 分岐へ流れないこと。

## 6. 解消済み指摘

- DR-001〜DR-013: Resolved を維持。今回の再レビューで、責務、依存方向、session state ownership、保存、migration、unresolved、responsive、parser、Map UI の既存設計に対する新しい回帰は確認されない。
- DR-014: Resolved。Design Revision 009 の冒頭、§2.1、§16 は Specification Review 015（`READY`、SR-029 resolved）および Requirements Review 013（`READY`）を参照しており、前回の metadata 不整合は解消されている。
- Specification Review 015 の SR-029、Requirements Review 013、Treasure Implementation Review 016: 各レビューの `READY` を確認した。これらを Mob の新しい仕様や実装済み能力として逆生成していない。

## 7. 上流へのフィードバック

なし。Concept、Requirements、Specification は、Treasure / Mob の分離、Mob の candidate と mode、route、保存、manual / auto、B 探索、chat / bulk の対象外および共通化境界を、今回の Design 再レビューに必要な範囲で定めている。DR-016 は上流へ新しい warning 契約を要求するものではなく、Design 側の過剰記述を除くことで解消する。

## 8. 保留した指摘

- Mob の正式 master がまだ repository にないこと、`apps/mob-compass/src/mobCatalog.ts` が map master のみを検証して Mob 値を空集合にしていることは、Design §16 の data-preparation gate と一致する。これは現時点の production Mob data の未完了であり、Design が Mob 仕様を欠く finding とはしない。
- `apps/mob-compass/src/mobCoordinator.ts` と `packages/mob-domain/` の現行 scaffold は、独立 key、mode preference、Mob target / candidate 型および placeholder route を確認する補助資料として扱った。Mob の route algorithm、eligibility、persistence validator、UI の完成適合性は Implementation / Test Review で、承認済み Specification を直接根拠に検証する。scaffold の現在値だけで Design や Specification を更新しない。
- 実際に route / Map UI を shared package へ抽出するか app-local に保つかの最終変更内容は、DR-015 解消時に Design Author が確定する。今回、Treasure の refactor、Mob 用の複製実装、新しい共通 package のいずれも提案・実施していない。
- 実ブラウザの map marker、candidate selection dialog、responsive layout、B Next、保存失敗・破損復元、stale calculation の動作は下流で確認する。これらは現在の Design の責務不足としては扱わない。

## 9. 対象範囲と追跡

| 確認項目                                         | Concept / Requirements / Specification                                               | Design / 現行実装の確認                                                                                                                                                                                                                                   | 判定            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Treasure / Mob の別 root・別 app・別保存         | Concept §6、REQ-F-001〜004、Specification §§1〜3、§9                                 | Design §§1、3.1、7、8.2。Treasure の persistence と Mob の `solo-session` / `party-session` / `last-mode` key は分離され、相互 app / domain import はない。                                                                                               | PASS            |
| Treasure 1:1 と Mob 1:多 candidate               | Concept §§3〜5、REQ-M-001〜008、Specification §§5.2〜5.3、§8                         | Design §§1.1、4.3、7.3〜7.5、10.2。Treasure member / point registration と Mob target / candidate / selected candidate を分離し、Treasure の 8 枠・bulk workflow を Mob に要求していない。                                                                | PASS            |
| UI → Application → Domain → Master / Persistence | Specification §13.1、Design §§3.1〜3.2、8                                            | Treasure の `useAppStore` / `routeProjection`、`treasure-domain`、`master-data`、storage boundary はこの論理責務に対応する。Mob の `MobCoordinator` は application boundary の scaffold であり、Mob UI が Treasure store を直接使う設計にはなっていない。 | PASS            |
| 再利用境界                                       | Concept §6、REQ-F-005、Specification §§3.1〜3.3、Design §§1.1、3.1                   | `map-core` / `master-data` / domain package は分離されているが、Design が固定する `map-ui` と共通 route package は現行 workspace に存在せず、Treasure の MapCanvas / route は app-local。                                                                 | FINDING DR-015  |
| Treasure 専用構造の Mob 流用防止                 | Concept の対象外・責任境界、REQ-M-002、Specification §5、Design §§1.1、3.1、10.2     | Treasure parser、member identity、Zustand store、currentTarget / listSelection、Treasure MapCanvas を Mob の登録モデルへ共有する記述はない。Mob chat / bulk / guide pipeline も対象外として保持されている。                                               | PASS            |
| route calculation と route state                 | REQ-R-001〜008、Specification §§6〜7、Design §§7、9                                  | `visitOrder` / `playlistOrder` を session の状態、route planner / projection を read-only 計算として分離する。Treasure の実装も `playlistOrder` / `incompleteRoute` と route projection を別責務で扱う。                                                  | PASS            |
| manual → auto の commit                          | REQ-R-006、Specification §7.1、§8.1、Design §§7.1、8.1、9.3                          | 明示的 auto calculation と計算・保存の成功後だけ auto へ戻す。失敗時は working state を publish しない。                                                                                                                                                  | PASS            |
| stale route                                      | Specification §9.1、Design §8.1、§9.1                                                | session revision / master identity に結び付かない結果を採用しない。現行 Treasure は同期計算だが、Design の stale invariant と矛盾せず、非同期実装を必須にする外部契約とは扱っていない。                                                                   | PASS            |
| current location・完了・B Next                   | REQ-P-001〜005、Specification §§6.1、6.4、8、Design §§7.3〜7.5、9.3、10.3            | Mob の candidate progress、map current location、B Next の一段 undo、research を Treasure player / undo chain と分離している。                                                                                                                            | PASS            |
| warning / failure boundary                       | Specification §6.4、§9.1、§12、Design §§8.1、9.1、12                                 | Design の warning success は Specification にないため、route result と保存・表示の外部境界を狭く修正する必要がある。                                                                                                                                      | FINDING DR-016  |
| parser / guide の責任境界                        | Concept Mob 対象外、REQ-M-002、REQ-D-004、Specification §§5、13.1、Design §§3.2、8.1 | Treasure の parser / proposal lifecycle は Treasure 専用。Mob は manual selection と direct registration の契約で、Mob chat parse・bulk・guide generation を追加していない。                                                                              | PASS            |
| master / data gate                               | REQ-A-001〜004、Specification §§4、5、10、12、Design §§4〜6、16                      | `master-data` の map validation と Mob の空 catalog scaffold は、正式 Mob master が未提供という Design の未決定事項と整合する。正式データ追加・出典承認は下流 data gate。                                                                                 | PASS / Deferred |
| 過剰設計・仕様越境                               | Requirements §9、Specification §13.1、Design §§3、8、9、13                           | 大部分は internal responsibility として許容されるが、固定 package 配置と warning success は current handoff / external-result の過剰記述として DR-015 / DR-016 に限定した。                                                                               | FINDINGS        |

Two-implementation test: session coordinator、Mob domain transition、route planner、persistence adapter を別々の module 配置で実装しても、Mob の target / candidate state と Treasure の registration stateを交差させず、route result を read-only に扱い、save-before-publish と revision / master identity を守る限り同じ外部結果になる。Map UI の描画方式や Mob の登録画面を別実装にしても、共通 map projection / interaction contract と Mob 固有 candidate selection を満たせる。DR-015 はこの複数実装可能性を Design の package 記述が明示できていない点、DR-016 は result の選択肢を Specification 外へ広げている点に限定される。

## 10. 検証結果

- `git status --short --branch`（開始時）: PASS。作業ツリーは clean で、対象 branch は `maintenance/add-mob-compass`、Reviewed HEAD は `0426af84d1cb061fdfc2d4d3f3bd65405c07021f` だった。
- 対象 Design Revision 009、Concept、Requirements、Specification、各上流 Review、Design Review 001〜010、Treasure Implementation Review 016 を確認した。
- 現行 workspace package、Treasure の domain / application / route / map UI / persistence 配置、Mob の catalog / coordinator / domain scaffold、README の公開範囲を静的に確認した。
- Design Revision 009 の SHA-256: `b33b729f76002caf75262508caf08021f261e2186f615932dba840f9585045a1`。
- Markdown の章構成、相対リンクおよび本レビューから参照する対象資料の存在を確認した。
- `git diff --check`: レビュー成果物作成前の clean tree では問題なし。レビュー成果物作成後は同コマンドを再実行して確認する。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。今回は Design Review とレビュー成果物のみで、アプリコード、設定、テスト、静的データを変更していないため。
- Mob の実動作、正式 master、ブラウザ操作、localStorage 実データ、画像・license、配備: Not validated。本レビューの下流・data preparation・release 範囲であり、Design Gate の根拠にはしていない。

## 11. レビューゲート

| Gate                              | 判定             | 根拠                                                                                                                                                                                                           |
| --------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 目的と範囲                     | PASS             | Concept / Requirements / Specification の Mob scope、Treasure / Mob 分離、共通化の限定、今回の Design 再レビュー範囲を一意に確認できる。                                                                       |
| 2. コンテキストと責任             | PASS             | application、domain、master、persistence、route、Map UI、Treasure input pipeline の責任が概ね明確で、Mob 固有 target / candidate を Treasure member model から分離している。DR-015 は package 配置の整合のみ。 |
| 3. 依存方向                       | PASS             | UI → Application → Domain / Port の方向、app / domain の相互非依存、overlay の非 command、Treasure parser の session 外 boundary を維持する。                                                                  |
| 4. 主要フローと失敗               | PASS             | Mob registration、party replacement、B Next / cancel / research、manual / auto、route failure、save-before-publish、stale discard の責任が追跡できる。DR-016 は warning branch の除去で解消可能。              |
| 5. 状態・データ所有               | PASS             | Treasure / Solo / Party の root、Mob candidate progress、visit order、current location、preference、Treasure undo chain の ownership と persistence boundary が分離されている。                                |
| 6. セキュリティ・整合性・運用境界 | PASS             | JSON / master / localStorage を検証し、自由座標・未検証入力・部分保存・古い結果の採用を避ける境界がある。不要な外部通信、認証、logging、HTML 解釈を追加していない。                                            |
| 7. 上流整合性と工程境界           | PASS with DR-016 | Mob の外部契約を変更していない。warning success だけが Specification にない Design 記述であり、Design から除くべきである。                                                                                     |
| 8. 下流実装可能性                 | PASS with DR-015 | session / route / candidate / persistence の主要責務は実装可能。現行 Treasure の実体に対する fixed package 配置の読み方だけを、Mob 着手前に明確化する必要がある。                                              |

Critical 0 / Major 0 / Minor 2。Critical の New / Open / Reopened はなく、design-review Skill の規則に従い正式 Gate は **READY** とする。DR-015 / DR-016 は `READY` を妨げないが、ユーザー要求の Implementation handoff 判定では軽微な Design 修正を先行させる。

## 12. 残存リスクと未決定事項

- DR-015 が残る間、Mob 実装者は route / Map UI の shared package 抽出と app-local 実装の境界を Design から一意に判断できない。Treasure の refactor や Treasure 固有構造の流用を暗黙に始めないことが必要である。
- DR-016 が残る間、経路成立に必要な情報不足の扱いで、Specification の failure と Design の warning success が衝突する。warning success を Mob へ追加する判断はしない。
- Mob の正式 master、候補地点、rank / category、出典および画像・license は未確定である。Design §16 の data-preparation gate が解消されるまで、具体的な Mob 値を正常データとして仮定しない。
- 現行 Mob scaffold は空 catalog のため、Design が定める Mob の外部契約が実動作で検証済みになったことを意味しない。Mob Implementation / Test では、正式 master を根拠に candidate eligibility、all-candidate B route、party replacement、保存分離、route failure、manual / auto、B Next を検証する。
- 現行 Treasure の route 計算は同期的だが、stale 防止の設計不変条件は維持する。非同期化、route worker、cache、追加共有 package などを将来拡張として今回の Design に追加しない。

## 13. 自動変更

Design、Specification、Requirements、Concept、Implementation、Test、README、設定、master data および画像は変更していない。本レビューで作成した変更は [design-review-011.md](design-review-011.md) のみであり、commit / push は実施していない。

## 14. 最終判定

**軽微な Design 修正後に Implementation に進める**

Design Revision 009 の Mob の中核設計は、現在の Treasure 実装を参照しても実装可能であり、Treasure 専用構造を Mob へ強制していない。session root、candidate membership、route calculation / route state、manual / auto、stale、B progress、parser / guide の責任境界も維持できる。

ただし、Implementation 着手前に次の二点を Design へ反映する。

1. DR-015: 現在確立している共通 package と、論理的に共通な責務・実装配置を区別し、Mob が Treasure の再編成や固有 UI / state の流用を仮定しない handoff にする。
2. DR-016: Specification にない warning 付き route success を外部結果・保存結果から除き、必要情報不足は既存の route failure / 非公開境界へ合わせる。

この二点は要件・仕様の再検討や Treasure 実装の作り直しを要求しない。修正後は Mob の正式 master / data-preparation gate を満たしたうえで Implementation に進める。
