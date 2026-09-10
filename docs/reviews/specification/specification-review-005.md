# Treasure Compass / Mob Compass Specification Review 005

## 1. レビュー対象

- Review cycle: 005
- 対象フェーズ: Specification
- 確認日: 2026-09-10（Asia/Tokyo）
- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- 依頼記載の Starting HEAD: `fb53ebc8820d707418a15169a366437ef8242472`
- 実測したレビュー開始時 HEAD / Reviewed HEAD: `0a3bdf9fdde17d3cefbb4235a48e2fc3aacaaf35`
- 対象成果物: `docs/specification/specification.md`
- 対象仕様 SHA-256: `0ce9690e4544eca7bd0a4c810ebd13b53fca74f4882b42380096da1bdd488f26`
- レビュー開始時の working tree: clean。依頼記載の「対象 Specification の未コミット変更」は実測できず、変更は `0a3bdf9` に既にコミットされていた。
- レビュー範囲: 更新後 Specification の全文。特に、persistence write failure、通常状態変更、自動 route、manual → auto、guide generation、reload、Acceptance、Requirement Traceability、既存 resolved finding の回帰を確認した。
- `docs/reviews/design/design-review-001.md` は persistence write failure gap の発見経緯と再確認条件に限って参照した。DR-001〜DR-004 を Specification finding として取り込まず、Design から外部契約を逆生成していない。
- 実装、テスト、ブラウザ、実環境の storage / clipboard の実行結果は本レビューの判定根拠にしていない。

## 2. 使用した根拠

- `AGENTS.md`: Source of Truth、文書工程境界、Scope Discipline、docs-only 検証、既存変更の保全、commit / push 制約を確認した。
- `.agents/skills/spec-review/SKILL.md`: Specification の責務、Requirements handoff closure、外部契約と下流 Design の境界、finding 採用基準、Two-implementation test、重大度、Gate 判定を適用した。
- `.agents/skills/spec-review/reviewers.md`: Reviewer A〜D の独立観点と Chair による重複統合の規則を適用した。
- `.agents/skills/spec-review/review-gates.md`: 現行7 Gate、Critical の New / Open / Reopened がある場合の `REVISE SPECIFICATION`、それ以外の `READY` 規則を適用した。
- `.agents/skills/spec-review/output-format.md`: `SR` finding ID、レビュー成果物の構成、判定値、報告項目を適用した。
- `.agents/skills/spec-review/security-checklist.md`: untrusted input、malformed / tampered / stale / replay、fail-closed、atomicity、persistence / recovery、deterministic representation、version / compatibility の適用範囲を確認した。
- `.agents/skills/review-common/review-playbook.md`: 根拠の優先順位、工程分類、独立レビュー、過去 finding の lifecycle、下流からの逆生成禁止を適用した。
- `.agents/skills/review-common/output-format.md`: finding、追跡、未確認、自動変更、最終判定の記録形式を適用した。
- `docs/concept/concept.md`: 目的、v1 scope、Treasure 1:1 / Mob 1:多、利用者と管理者の責任境界、対象外を確認した。
- `docs/requirements/requirements.md`: REQ-F-008、REQ-F-009、REQ-F-011、REQ-F-012、REQ-F-014、REQ-D-005、REQ-D-007 を中心に、全 Requirement と下流 handoff を確認した。
- `docs/reviews/requirements/requirements-review-005.md`: Requirements の READY 判定、製品判断、Specification へ渡された責任境界を確認した。
- `docs/reviews/specification/specification-review-004.md`: 直前の READY、SR-001〜SR-018 の Resolved 状態、再オープン条件を確認した。レビュー開始時点の記述値と、今回実測した HEAD / working tree の差は区別した。
- `docs/reviews/design/design-review-001.md`: Persistence write failure が Specification gap と判定された根拠と再確認条件だけを確認した。DR-001〜DR-004 は下流 Design finding として扱った。
- `docs/specification/specification.md`: 更新後の本文、Acceptance、Requirement Traceability、Design / Implementation handoff を全文確認した。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。現行版に New / Open / Reopened の正式 finding はない。Design Review 001 で報告された persistence write failure の Specification gap は、§9.3、§8.1、§11.2、`SPC-AC-022` および Requirement Traceability によって閉じられていると判定する。

## 4. 総評

更新後 Specification は、保存書込み失敗を操作失敗として扱い、失敗前の current state と最後に正常保存された state を保持し、部分状態・pending state・Mob の世代情報を成立させない外部契約を定めている。通常の状態変更、自動 route adoption、manual → auto、guide generation、reload、retry / 後続操作の基準が同じ規則へ接続されており、「memory だけを更新する」別解釈は残っていない。

Guide output についても、generation metadata の保存失敗を成功出力とせず、`revision` / `issued-at` を進めず、次回出力を失敗前の受理済み世代から行う契約がある。clipboard API の呼び出し順や transaction mechanism は下流へ残しつつ、成功出力としての外部意味は固定されている。外部へ渡った可能性がある文字列を受け手が取り込む場合も、出力元の保存結果を持ち越さず、通常の guide validation / generation 判定を独立適用するため、受け手の判定は曖昧にならない。

既存の Treasure / Mob の product boundary、通常複数行の逐次 semantics、Treasure duplicate / conflict precedence、Mob の candidate membership と master classification、manual failure atomicity、空・全完了 snapshot、`run` / `revision` / `issued-at`、保存破損と master mismatch の区別、auto calculation failure 時の guide output 禁止も維持されている。Acceptance と Traceability に未追跡の新しい product requirement は確認されなかった。

## 5. 指摘事項

正式な指摘事項はなし。

| ID | Severity | Status | 確認結果 |
| --- | --- | --- | --- |
| なし | — | — | persistence write failure を含め、同じ入力・同じ状態から合理的な二実装が異なる利用者可視結果を返す、正式根拠のある未解消問題は確認されなかった。 |

## 6. 解消済み指摘

### Persistence write failure — Specification gap

Design Review 001 が上流へ返した gap であり、DR-001〜DR-004 の Design finding とは区別する。

| 再確認項目 | Specification の追跡先 | 判定 |
| --- | --- | --- |
| 状態変更の write failure は操作失敗である | §9.3、§11.2、`SPC-AC-022` | Resolved |
| failure 直後の current state は操作前のままである | §9.3、`SPC-AC-008`、`SPC-AC-022` | Resolved |
| persisted state は最後に正常保存された状態である | §9.3、`SPC-AC-012`、`SPC-AC-022` | Resolved |
| 部分書込み、pending state、implicit retry は成功状態にならない | §9.3、`SPC-AC-022` | Resolved |
| persistence write failure を他の failure と識別できる | §9.3、`SPC-AC-022` | Resolved |
| manual → auto の calculation success 後に write が失敗した場合も manual state を保持する | §9.3、`SPC-AC-008`、`SPC-AC-022` | Resolved |
| guide generation metadata の write failure は成功出力でなく、世代を消費しない | §8.1、§9.3、`SPC-AC-010`、`SPC-AC-022` | Resolved |
| retry / 後続操作は失敗前の current state を基準にする | §9.3、`SPC-AC-022` | Resolved |
| failure 後の reload は最後に正常保存された state を復元する | §9.3、§9.2、`SPC-AC-012`、`SPC-AC-019`、`SPC-AC-022` | Resolved |
| write failure と保存データの構造・意味の corruption を区別する | §9.2〜9.3、`SPC-AC-019`、`SPC-AC-022` | Resolved |

### SR-001〜SR-018

SR-001〜SR-012 および cycle 003 の SR-013〜SR-018 は、今回の persistence semantics 追加による回帰を確認しなかった。過去 review artifact の status を書き換えず、再オープンもしていない。

- X/Y normalization と height の informational metadata 境界は維持されている。
- route の第一評価、fee / load time の Pareto 比較、deterministic tie presentation は維持されている。
- Mob の通常複数行入力と上から下への逐次適用、Treasure の item integrity は維持されている。
- `run` / `revision` / `issued-at` の分離、clock skew 非依存、explicit replacement 後の revision continuity は維持されている。
- auto calculation failure 時の guide output 禁止、manual order の未確定地点契約、corrupted persistence の全体拒否、master mismatch の未確認化、initial auto lifecycle は維持されている。

## 7. 上流へのフィードバック

なし。Design Review 001 はこの問題を Requirements gap ではなく Specification gap と判定しており、現行 Requirements の目的・scope・責任主体を変更する必要はない。今回の更新は、REQ-F-008、REQ-F-009、REQ-F-011、REQ-F-012、REQ-F-014、REQ-D-005、REQ-D-007 が委譲している外部失敗結果を具体化したもので、新しい product requirement、Concept 判断、v1 scope の変更を発明していない。

したがって `Upstream ambiguity` はない。

## 8. 保留した指摘

正式な Deferred finding はない。以下は Specification の外部契約が閉じたため、Design / Implementation / Test へ委譲できる事項であり、finding にはしていない。

- localStorage の具体 key、保存技術、内部 schema、serialization、migration、transaction、rollback mechanism、retry mechanism。
- guide parser の class / function / regex、clipboard API の呼び出し方式、UI の具体的通知表示。
- route planner の探索アルゴリズム、内部 score、cache、内部 state 構造。
- exact error message、test fixture、test code、browser automation、性能測定。

これらは、§3〜11 と `SPC-AC-001`〜`SPC-AC-022` の外部結果、失敗境界、保存・復元契約を変えないことが条件である。特に clipboard API の処理順を指定しないことは、guide output を成功出力として扱わない外部契約と、外部へ渡った可能性がある文字列を受け手が独立検証する契約によって許容される。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Specification の追跡先 | 判定 |
| --- | --- | --- | --- |
| 通常の状態変更と persistence write failure | REQ-F-008 / 009 / 014、REQ-D-007 | §3.2、§4.2、§5.3、§7.1〜7.4、§9.3、§11.2、`SPC-AC-007/008/012/022` | PASS。操作失敗、操作前 state、最後の正常保存 state、識別可能な failure が一意。 |
| route calculation success 後の persistence failure | REQ-F-006 / 008 / 009 | §6.3〜6.4、§7.2、§9.3、`SPC-AC-008/022` | PASS。route、route-selected、mode、order、transitions を操作前 state から変更しない。 |
| manual → auto success / failure | REQ-F-008 / 014 | §7.2、§9.3、§11.1〜11.2、`SPC-AC-008/022` | PASS。calculation failure と write failure を区別し、どちらも failure semantics が一意。write failure では manual state を保持。 |
| guide output と generation metadata | REQ-F-011 / 012 / 014、REQ-D-005 | §8.1、§8.3、§9.3、§11.2、`SPC-AC-010/018/021/022` | PASS。成功出力禁止、世代未消費、次回 `revision` 基準、受け手の独立判定が一意。 |
| retry / 後続操作 | REQ-F-008 / 012 / 014 | §9.3、`SPC-AC-022` | PASS。implicit retry / pending state は要求せず、再試行・後続操作を未変更 state から評価。 |
| reload / corruption / master mismatch | REQ-F-014、REQ-D-007 | §9.2〜9.3、§10.2、§11.2、`SPC-AC-012/019/022` | PASS。write failure は最後の正常保存 state、corruption は全体拒否、master mismatch は情報保持・未確認化。 |
| Treasure / Mob boundary | REQ-F-003 / 004 / 009 | §4、§5、§9.3、`SPC-AC-002/003/004/022` | PASS。Treasure 1:1 と Mob 1:多、候補 membership、classification、selection、confirmation、complete の意味を維持。 |
| 通常複数行と guide import | REQ-F-008 / 009 / 012、REQ-D-007 | §3.2、§8.2、§9.3、§11.2、`SPC-AC-011/020/022` | PASS。通常複数行の逐次 row semantics と guide の whole-snapshot validation / atomicity を混同していない。 |
| resolved finding の回帰 | cycle 003 review、Specification Review 004 | §3〜14、`SPC-AC-001`〜`SPC-AC-022` | PASS。SR-001〜SR-018 を再オープンする根拠なし。 |

### Board の独立確認

- Reviewer A 観点（契約・determinism・traceability）: persistence failure の操作結果、state、generation、reload、Acceptance、Requirement Traceability が本文へ追跡でき、合理的な二実装による外部結果差はないと判定した。
- Reviewer B 観点（利用者価値・lifecycle・運用）: failure を成功と誤表示せず、利用者が failure 理由を識別でき、再試行・後続操作・reload の基準が一意である。通常操作、manual → auto、guide generation の lifecycle に矛盾はないと判定した。
- Reviewer C 観点（Security / Interoperability）: untrusted input、malformed guide、stale / replay、保存 corruption、master mismatch、partial state、version / compatibility の境界は fail-closed であり、write failure の扱いも保存 corruption と区別されている。暗号、認証、同期は対象外であり finding にしていない。
- Reviewer D 観点（downstream feasibility）: 外部状態・エラー・generation・reload は Specification から実装・テスト可能で、storage API、clipboard sequence、transaction、内部 retry を決める必要はないと判定した。
- Chair: 上記の観点に重複する正式 finding はなく、全体として finding なしに統合した。

### Two-implementation test

同じ正常保存済み state と同じ利用者操作に対して、次の二つの合理的な実装を想定した。

| ケース | Implementation A | Implementation B | Specification から導ける共通結果 | 判定 |
| --- | --- | --- | --- | --- |
| 通常の状態変更の write failure | 書込み成功まで working state を current に採用しない | 一時的に計算した state を write failure 時に操作前 state へ戻す | 操作失敗、failure を識別可能、current state は操作前、persisted state は最後の正常保存、部分 state なし、reload 後も同じ state | PASS |
| route calculation success 後の write failure | route adoption と保存を成功時だけ反映 | route を算出後に write failure で adoption を破棄 | route、route-selected、mode、order、transitions は操作前のまま | PASS |
| manual → auto success 後の write failure | auto state を保存成功時だけ commit | auto state を仮採用して失敗時に manual snapshot を復元 | manual mode、手動順序、候補、selection、confirmation、completion、transitions、generation、reload 結果を保持 | PASS |
| guide output metadata の write failure | generation write を確定できた時だけ successful output として扱う | output attempt の仮世代を failure 時に破棄 | operation failure、成功 output なし、`revision` / `issued-at` 不変、失敗試行は世代を消費せず、次回は失敗前世代から出力 | PASS |
| 失敗後の同じ操作・後続操作 | pre-state から再実行 | rollback 後に同じ pre-state から再実行 | 成功した write のみ state を反映し、失敗した仮計算・仮世代を暗黙に引き継がない | PASS |
| 失敗後の reload | 保存済み payload を読み込む | 同じ保存済み payload を読み込む | 最後に正常保存された state を復元し、失敗操作の state / run / generation を復元しない | PASS |
| 出力文字列が外部へ渡った可能性がある場合 | source 側は failure として扱い、受け手は文字列を通常 import として検証 | 同じく source の保存成功を仮定せず、受け手が guide の内容だけで判定 | source の generation は進まず、受け手は構文・snapshot・`revision`・`issued-at` の通常規則で判定。clipboard API の処理順自体は下流事項 | PASS |

Mob の write failure ケースでは、上表の generation 項目に `run` / `revision` / `issued-at` を含め、失敗時に `run` を新規成立させず、`revision` / `issued-at` を変更・消費しないことを確認した。両実装の違いは内部の working state と rollback の方式だけであり、外部結果、ownership、consistency、recovery boundary を分岐させない。

## 10. 検証結果

- `git status --short`: レビュー開始時は clean。対象 Specification の未コミット差分は確認されなかった。
- `git rev-parse HEAD`: `0a3bdf9fdde17d3cefbb4235a48e2fc3aacaaf35`。依頼記載の Starting HEAD `fb53ebc...` とは一致しないが、実測した現行 HEAD を review target として固定した。
- `git diff --name-only`: レビュー成果物作成前はなし。
- `git diff --cached --name-only`: レビュー成果物作成前はなし。
- `git ls-files --others --exclude-standard`: レビュー成果物作成前は今回の artifact なし。成果物作成後は `docs/reviews/specification/specification-review-005.md` のみ。
- 対象 Specification SHA-256: `0ce9690e4544eca7bd0a4c810ebd13b53fca74f4882b42380096da1bdd488f26`。レビュー中に対象仕様を変更していない。
- 参照先存在: PASS。Concept、Requirements、Requirements Review 005、Specification Review 004、Design Review 001、および指定された skill / reference files を確認した。
- Markdown / structure: PASS。対象 Specification の章構成、`SPC-AC-001`〜`SPC-AC-022`、Requirement Traceability、`SPC-AC-022` と本文 §9.3 の対応を確認した。Acceptance ID の重複、Acceptance にしかない persistence failure 契約、未追跡の Requirement ID は確認されなかった。
- Acceptance / Traceability: PASS。`SPC-AC-008`、`SPC-AC-010`、`SPC-AC-012`、`SPC-AC-022` と §9.3 / §8.1 / §11.2 / Requirement rows の意味が一致している。
- Design Review 001 gap closure: PASS。write failure の操作結果、memory、persisted state、generation、retry、reload、利用者識別が一意に定義されている。
- `git diff --check`: PASS。成果物作成前の既存差分はなく、成果物作成後も whitespace error はない。
- review artifact 自体の whitespace 確認: PASS。`git diff --no-index --check /dev/null docs/reviews/specification/specification-review-005.md` で whitespace error は出なかった。
- `pnpm lint`: SKIPPED。docs-only review であり、コード変更がないため対象外。
- `pnpm test`: SKIPPED。docs-only review であり、コード変更がないため対象外。
- `pnpm run build`: SKIPPED。docs-only review であり、コード変更がないため対象外。
- Not validated: 実装、unit test、browser、static JSON / 画像の実値、実環境の localStorage / clipboard、性能、migration の実行結果。未実行の検証を PASS としていない。
- commit / push: 実施していない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Concept / Requirements の v1 purpose、scope、対象外、Treasure / Mob の責任境界を維持している。 |
| 2. 要件追跡と契約 | PASS | Requirements の意味が本文、Acceptance、Requirement Traceability に追跡でき、persistence failure の外部結果も下流へ未委譲である。 |
| 3. 処理と例外 | PASS | 通常変更、route adoption、manual → auto、guide generation、retry、reload、corruption、master mismatch、empty / complete の結果が一意である。 |
| 4. 内部整合性 | PASS | persistence failure と calculation failure / guide malformed / storage corruption / master mismatch を区別し、既存 resolved contract との矛盾を確認しなかった。 |
| 5. 検証可能性 | PASS | Acceptance と Two-implementation test から、operation result、state、route、generation、persisted state、reload を実装方式によらず確認できる。 |
| 6. 安全性・信頼境界・相互運用性 | PASS | untrusted input、fail-closed、partial update 防止、stale / replay、version、guide integrity、保存・復元境界を確認した。 |
| 7. 上流整合性と工程境界 | PASS | Requirements 判断を変更せず、storage API、clipboard sequence、parser、retry mechanism、schema 等は Design / Implementation / Test に残している。 |

Critical の New / Open / Reopened は 0 件。したがって、現行 review-gates.md に従い Gate は `READY` とする。Major / Minor の未解消 finding もないため、Major / Minor を理由に Gate を変更していない。

## 12. 残存リスクと未決定事項

- persistence write failure の外部契約に関する残存 Specification gap は確認されなかった。
- `Upstream ambiguity` はない。Requirements / Concept の変更は不要である。
- `Design decision pending` はない。保存 API、transaction、clipboard、retry、内部 state は下流の設計・実装事項として残るが、外部結果を分岐させない範囲で決定できる。
- 実装時には、write failure を成功表示しないこと、失敗前 state を current として保持すること、最後の正常保存 state から reload すること、Mob の generation を消費しないことを検証する必要がある。これは残存 Specification gap ではなく downstream handoff である。
- Design Review 001 の DR-001〜DR-004 は Design 工程の finding であり、本レビューの READY 判定により解消されたものではない。Specification は Design へ再引継ぎ可能だが、Design 自体の review lifecycle は別途管理する。

## 13. 自動変更

今回のレビューで新規作成したのは `docs/reviews/specification/specification-review-005.md` のみである。`docs/specification/specification.md`、Concept、Requirements、Design、既存 Review 001〜004、Design Review 001、Skill、AGENTS.md、source、test、static data、README は変更していない。commit、push、対象 Specification の自己修正は行っていない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。New / Reopened finding はなく、SR-001〜SR-018 は Resolved のまま維持されている。Design Review 001 の persistence write failure gap は閉じられており、更新後 Specification は Requirements から Design へ再引継ぎ可能である。
