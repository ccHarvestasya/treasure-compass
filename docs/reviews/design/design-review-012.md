# Design Review 012: Mob Design 再レビュー

## 1. レビュー対象

- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- 確認日: 2026-09-14
- 対象工程: Mob Design の再レビュー
- 対象 Design: [Design Revision 010](../../design/design.md)
- 前回レビュー: [Design Review 011](./design-review-011.md)
- 対象指摘: DR-015、DR-016
- 対象外: Concept / Requirements / Specification の再検討、Implementation / Test の変更およびレビュー、Treasure 実装の変更
- 確認した基準コミット: `3e0a8272c37ffd084f81bd30e813f2bbe3cf75de`

本レビューは Design Revision 010 に対するフォローアップであり、前回解消済みの DR-001〜DR-014 は再オープンしない。今回の修正による実質的な回帰がないかだけを確認した。

## 2. 使用した根拠

- ユーザー依頼: DR-015 / DR-016 の再確認条件、レビュー範囲および handoff 条件。
- [AGENTS.md](../../../AGENTS.md): 文書の正本、工程境界、変更範囲、検証および報告の規則。
- [Design Review Skill](../../../.agents/skills/design-review/SKILL.md) と同 Skill の review gate / output format: Design レビューの観点、正式 Finding、ゲートおよび成果物形式。
- [Concept](../../concept/concept.md): Treasure / Mob の責任境界と共通化の範囲を確認するために使用。
- [Requirements Revision 013](../../requirements/requirements.md) と [Requirements Review 013](../requirements/requirements-review-013.md): Mob の candidate membership、session 分離、route、manual / auto、保存および対象外を確認するために使用。
- [Specification Revision 009](../../specification/specification.md) と [Specification Review 015](../specification/specification-review-015.md): route の success / empty / failure、failure 時の状態維持、stale、保存および共通 interaction の外部契約を直接の根拠として使用。
- [Design Revision 010](../../design/design.md): 今回のレビュー対象。特に §§3.1〜3.2、8.1、9.1〜9.3、11.1、12、14、16 を確認。
- [Treasure Implementation Review 016](../implementation/implementation-review-016.md) と現行ソース: 完成した Treasure の共通基盤と app-local 責務の実体を補助的に確認。Treasure 実装から Mob の仕様は逆生成していない。

## 3. レビュー結果

**READY**

- DR-015: **Resolved**
- DR-016: **Resolved**
- Critical: 0
- Major: 0
- Minor: 0
- 新規 Finding: なし

DR-015 / DR-016 の再確認条件を満たし、Design は Mob Implementation へ引き渡せる状態である。

## 4. 総評

Design Revision 010 は、現在実際に存在する shared package と、Treasure / Mob が意味として共有する論理責務を区別している。`packages/map-core` は座標・bounds・距離等の shared primitive と contract に限定され、route planner と Map UI / overlay の物理 package、source directory、抽出先を固定していない。現行 Treasure の route calculation / projection と Map UI / overlay が app-local にあることも明記され、Treasure の refactor、新しい shared package、Treasure 固有 store / UI / registration / parser の流用を Mob Implementation の前提にしていない。

また、route result を Specification の `success` / `empty` / `failure` に戻し、`route success with warning` を外部 result、session state、保存 snapshot の契約から除いている。経路成立に必要な情報不足は failure とし、working state を保存・公開せず、既存順序、manual / auto、現在地点および進捗を維持する責任が Design から追跡できる。

今回の修正による上流契約の拡張、Treasure / Mob の session root の混同、route calculation と route state の責務逆転は確認されなかった。

## 5. 指摘事項

なし。

今回の修正に起因する新規の Critical / Major / Minor Finding はない。

## 6. 解消済み指摘

### DR-015: 固定された共通 package 境界が完成した Treasure の実体と一致しない

- 重大度: Minor
- 前回状態: New
- 今回状態: **Resolved**
- 対象: Design §§3.1〜3.2、14、16

再確認結果:

- Design は、現行の物理 package を `map-core`、`master-data`、`treasure-domain`、`mob-domain` として記述し、存在しない `packages/map-ui` を要求していない。
- `map-core` の責務は map / 座標 value、bounds、2D distance 等の shared primitive と contract に限定され、route algorithm、route planner の package 配置を `map-core` の実装責務として固定していない。
- `logical Map UI / overlay responsibility` と `logical Route planner responsibility` は、外部契約と interaction の意味を示す論理責務であり、workspace package や source directory の指定ではないと明記されている。
- 現行 Treasure の app-local な route calculation / projection と MapCanvas / overlay を、Treasure の refactor によって抽出する前提がない。新しい shared package の追加も前提にしていない。
- Treasure application と Mob application は相互依存せず、Mob は Treasure app の source、session aggregate、JSON raw data、Zustand store、MapCanvas、member registration workflow、bulk parser、Treasure 固有 state / UI に依存しない境界になっている。
- Route planner と Map UI / overlay の物理配置は、明示された contract と責務を満たす範囲で各 application が決める構造であり、Mob 側の実装可能性を Treasure の物理構造に拘束していない。

再確認条件をすべて満たすため、DR-015 は Resolved とする。

### DR-016: Specification にない warning 付き route success を Design が外部結果として追加している

- 重大度: Minor
- 前回状態: New
- 今回状態: **Resolved**
- 対象: Design §§8.1、9.1〜9.2、12

再確認結果:

- Design の route result は `success`、`empty`、`failure` の三契約だけを示している。`success` に warning を含める記述はない。
- 経路成立に必要な情報が不足する場合は、`missing aetheryte` や `unresolved visit` 等を理由・対象とする `failure` になる。
- failure は route と working state の保存・公開へ進まず、既存順序、`manual / auto`、現在地点および進捗を維持する。
- manual から auto への切替は、明示的な自動計算の成功、保存成功および publish 後にだけ成立し、failure では既存 mode と order を維持する。
- stale result は session revision と master identity の不一致で破棄され、現在の state を変更しない。
- 内部の補助診断を扱う余地が記述されている場合も、それを外部 result、session state、保存 snapshot の追加 field として公開しない境界になっている。
- Design §12 の route failure 行も、result を session へ採用せず、理由・対象を表示し、既存 order / mode / progress を維持する契約に整合している。

再確認条件をすべて満たすため、DR-016 は Resolved とする。

なお、warning 付き success を Specification へ追加する判断や、Mob 固有の warning 機能は行っていない。

## 7. 上流へのフィードバック

なし。

Concept / Requirements / Specification に対する不足、曖昧さ、矛盾は今回の修正に起因して発生していない。DR-016 は上流契約を変更せず、Design の外部契約に見えていた過剰な warning 分岐を除くことで解消されている。

## 8. 保留した指摘

なし。

なお、現行 Mob scaffold の catalog が空であること、正式な Mob master data の準備、Mob の実動作および Test による candidate eligibility・B 探索・party replacement・保存分離・route failure・manual / auto・B Next の検証は、Design Review の保留 Finding ではなく下流 Implementation / Test の確認事項である。Design の今回の修正不備とは扱わない。

## 9. 対象範囲と追跡

| 確認項目                                                             | 上流の根拠                                                                          | Design の確認箇所            | 判定 |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- | ---- |
| 実在する shared package と論理責務の区別                             | Concept の共通化境界、Requirements の共通地図能力、Specification の共通 interaction | §§3.1〜3.2、14、16           | PASS |
| route / Map UI の物理配置を不要に固定しない                          | Concept / Requirements の責任境界、現行 Treasure は補助証拠                         | §§3.1〜3.2、11.1、14、16     | PASS |
| Treasure refactor / 新 shared package を前提にしない                 | ユーザー制約、Concept の app 分離                                                   | §§3.1、14、16                | PASS |
| Mob が Treasure 固有 store / UI / registration / parser に依存しない | Concept の対象外・責任境界、Requirements Mob 境界、Specification §5                 | §§1.1、3.1〜3.2、8.1、14、16 | PASS |
| 別 session root と Mob の candidate membership                       | Requirements Mob state、Specification Mob session 契約                              | §§1.1、3.1、3.3、4、10       | PASS |
| route calculation と route state の分離                              | Requirements route / state、Specification §§6〜9                                    | §§3.2、8.1、9.1〜9.3、10.2   | PASS |
| success / empty / failure と failure 時の状態維持                    | Specification §§6.1〜6.4、§9.1、§9.3                                                | §§8.1、9.1、12               | PASS |
| manual → auto の成功時 commit                                        | Requirements REQ-R-006、Specification §§7.1、8.1                                    | §§7.1、8.1、9.3              | PASS |
| stale route の破棄                                                   | Specification §9.1、保存・再計算境界                                                | §§8.1、9.1、12               | PASS |
| guide generation と parser の責任境界                                | Concept / Requirements の Mob 対象外、Specification §13.1                           | §§3.2、8.1、14               | PASS |

Two-implementation test: 現行 Treasure と独立した Mob の各 application が、route planner と Map UI / overlay をそれぞれ app-local または別の実装単位へ配置しても、shared primitive / contract、read-only route calculation、session coordinator の保存前 working state、write-before-publish、Mob 固有 domain state の境界を満たせる。Treasure の source、store、MapCanvas、registration workflow、bulk parser を Mob が共有しなくても、Specification の外部契約を実現できるため、Design の責務配置は単一の実装形態に過度に拘束されていない。

## 10. 検証結果

### 実行した確認

- `git status --short --branch`: 対象 branch と基準コミットを確認した。
- `git diff HEAD^ HEAD -- docs/design/design.md`: Design Revision 009 から Revision 010 への変更が DR-015 / DR-016 の範囲に限定されていることを確認した。
- `find packages -maxdepth 2 -type f`: `map-core`、`master-data`、`treasure-domain`、`mob-domain` の物理 package を確認した。
- 現行ソースの参照確認: Treasure の route calculation / projection、MapCanvas / AetheryteOverlay、Zustand store、bulk parser が Treasure app-local にあり、Mob source が Treasure 固有 module を参照していないことを確認した。
- Design の全文検索: `packages/map-ui`、`map-ui`、`route core`、`route success with warning`、route の warning success を示す記述がないことを確認した。
- Design の route 記述確認: `success` / `empty` / `failure`、failure 時の非保存・非公開、既存 order / mode / 現在地点 / progress の維持、stale discard を確認した。

### 未実行・未確認

- `pnpm lint`、`pnpm test`、`pnpm run build`: docs-only の Design Review であり、Implementation / Test を変更していないため実行していない。`NOT APPLICABLE / SKIPPED`。
- Mob のブラウザ実動作、正式 Mob master data、保存破損・保存失敗、route 計算の実行結果および UI の実装適合性: Mob Implementation / Test で確認する。

## 11. レビューゲート

| Gate                              | 判定 | 根拠                                                                                                                                           |
| --------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 目的と範囲                     | PASS | §§1〜2 で Mob Design の対象、対象外、承認済み Specification および今回の修正範囲を識別できる。                                                 |
| 2. コンテキストと責任             | PASS | Treasure / Mob app、別 session root、Mob 固有 domain、共通 map/master contract、Map UI / route の論理責務を分離している。                      |
| 3. 依存方向                       | PASS | UI → Application → Domain / Port の方向、app 相互非依存、Treasure 固有 module の Mob 非依存が確認できる。                                      |
| 4. 主要フローと失敗               | PASS | route calculation、stale discard、failure 時の working state 非保存・非公開、保存成功後 publish の境界が追跡できる。                           |
| 5. 状態・データ所有               | PASS | route calculation と session route state を分離し、failure 時に order / mode / 現在地点 / progress を保持する責任が明確である。                |
| 6. セキュリティ・整合性・運用境界 | PASS | validated master、raw JSON 非共有、write-before-publish、stale の revision / master identity 検証を維持している。                              |
| 7. 上流整合性と工程境界           | PASS | `route success with warning` を外部契約へ追加せず、Specification の success / empty / failure に整合している。上流変更や実装詳細の追加はない。 |
| 8. 下流実装可能性                 | PASS | 実在 package と論理責務の境界が明確で、Treasure refactor や新 package 抽出を前提にせず Mob の独立実装へ引き渡せる。                            |

正式な Finding はなく、Critical もないため、Review Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- 正式な Mob master data が準備されるまで、Mob Implementation の実動作と候補集合の全経路は検証できない。これは Design の未解決事項ではなく、Implementation / Test の前提確認である。
- route planner と Map UI / overlay の具体的な source file、component 分割、algorithm 実装は Design が不要に固定せず、承認済み contract と責務に従って Implementation で決める。
- 現行 Treasure の route calculation は app-local であるが、Mob 実装時に Treasure を抽出・再編成する必要はない。
- route の内部診断を実装で扱う場合も、Specification にない warning result、session field、保存項目へ拡張しない。

## 13. 自動変更

Design、Concept、Requirements、Specification、Implementation、Test および Treasure 実装は変更していない。レビュー成果物として本ファイルだけを追加する。

## 14. 最終判定

**READY**

- DR-015 の Status: **Resolved**
- DR-016 の Status: **Resolved**
- Critical / Major / Minor 件数: **0 / 0 / 0**
- Review Gate: **READY**
- Mob Implementation へ進めるか: **進めてよい**

Design Review としては Mob Implementation へ進める状態である。正式な Mob master data の準備および Implementation / Test における外部契約適合の確認は、既存の下流工程として実施する。
