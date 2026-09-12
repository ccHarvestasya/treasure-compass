# Treasure Compass / Mob Compass Specification Review 011

## 1. レビュー対象

- レビューサイクル: 011（Specification Revision 005 全体レビュー）
- 対象フェーズ: Specification
- 確認日: 2026-09-12（Asia/Tokyo）
- 対象成果物: `docs/specification/specification.md`
- 対象版 / SHA-256（レビュー開始時）: `158459dc4081aa0c573761acfbace7dc67be22bfeec636c59426831d57b470eb`
- 前段承認: `docs/reviews/requirements/requirements-review-011.md`（`READY`、Critical 0 / Major 0 / Minor 0）
- 対象範囲: Specification 全文。Treasure の連続プレイリスト、同格な手動／一括登録、必須メンバー名と同一性、3.x〜7.x 混在、利用者向け `Gxx` 不使用、行単位の一括解決・統合・部分反映・原子性、選択／現在対象、再生・次へ・戻る、個別完了・取消、順序変更、保存・復元・旧保存移行・失敗、Acceptance と Traceability を重点確認した。既存の Mob、経路、エーテライト、安全性および互換性契約も全体回帰確認した。
- 未確認範囲: 実装、テスト、静的マスターデータ、画像、ブラウザ表示、実際の localStorage 内容、配備 origin、マスターデータの正確性・完全性、出典・画像利用条件、外部サービス。

## 2. 使用した根拠

- 最新のユーザー判断を記録した `MEMORY.md`: Treasure の同格登録、必須メンバー名、一人一 Treasure、最大 8 人、連続プレイリスト、再生・次へ・戻る、混在バージョン、利用者向け表記、一括入力統合、手動順序、周回状態保存および既存保存へ到達する同一 browser origin の互換境界を確認した。
- 承認済み Requirements: `docs/requirements/requirements.md` と `docs/reviews/requirements/requirements-review-011.md`。Requirement、Acceptance、Specification への明示的 handoff、および Requirements Review 011 の下流引継ぎを判定基準とした。
- 承認済み Concept: `docs/concept/concept.md` と `docs/reviews/concept/concept-review-005.md`。目的、利用者、v1、対象外、責任境界および成功状態を確認した。
- レビュー対象: `docs/specification/specification.md` 全482行。入力、表示、状態遷移、経路、保存、失敗、適合条件、下流引継ぎおよび Requirement Traceability を確認した。
- 過去レビュー: `docs/reviews/specification/specification-review-001.md`〜`specification-review-010.md`。SR-001〜SR-024 の履歴、解消状態および既存契約の回帰確認に使用した。過去レビューは変更していない。
- 許可された互換性資料: `README.md`。既存 Treasure の登録、チャット一括入力、地図、経路、進捗および browser 保存の継続範囲の確認に限定し、そこから新しい Requirement を作っていない。
- プロジェクト指針とレビュー手順: `AGENTS.md`、`spec-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`spec-review/output-format.md`、`review-gates.md`、`reviewers.md`、`security-checklist.md`。

## 3. レビュー結果

**REVISE SPECIFICATION**

Critical 3 / Major 0 / Minor 0。SR-025〜SR-027 は New / Open であり、Gate 2、3、4、5、6、7 を不合格にする。

## 4. 総評

Specification Revision 005 は、Treasure の手動登録と一括入力を同じ巡回リストへ反映する同格の入口とし、非空の正規化済みメンバー名による一人一件・最大8件の同一性を定めている。一括入力も、行単位の構文・マップ・座標・バージョン／地点解決、曖昧行の利用者解決、重複・競合・上限超過、既存更新と新規追加、解決済み行だけの部分反映、および一操作としての保存失敗時原子性まで具体化している。3.x〜7.x の混在、巡回全体のバージョン非選択、利用者向け `Gxx` 不使用と6対応も Requirements と一致する。

既存の Mob 登録・削除・探索、マップ間／マップ内経路、手動順序、動的エーテライト表示、無効入力の非採用、状態境界別の保存失敗および全消去について、SR-001〜SR-024 を再発させる回帰は確認されなかった。内部アルゴリズム、コンポーネント、保存実装および parser 実現方式を要求する指摘も採用していない。

一方、Treasure プレイヤーには外部状態の矛盾が残る。リスト上の「選択」と「現在対象」が同じ情報か別情報か確定せず、末尾の未完了対象での「次へ」は完了する契約と何も変更しない契約が同時に存在する。また、Requirements が Specification へ明示的に引き継いだ保存形式・旧形式互換性について、対応する版・表現・到達条件を確定しないまま保存形式、キー、decoder および配備を Design へ再委譲している。これらは two-implementation test で利用者可視結果、状態遷移、再読み込みおよび移行結果が分岐するため、次工程へ進む前に Specification で閉じる必要がある。

## 5. 指摘事項

### SR-025 — 選択中の対象と現在対象の状態契約が一意でない

- Severity: Critical
- Status: New / Open
- Location: §2「現在対象」、§4.3 第2段落、§4.3.1「再生」、§9.1 Treasure 保存対象、§9.2 復元、`SPC-AC-028`
- Evidence / Fact: §2 は「現在対象」を地図・案内を前面表示している選択対象と定義する。§4.3 は利用者が対象を選択すると「選択状態だけ」を変更し、選択対象の削除時に「現在対象の選択」を解除するとする。一方、§4.3.1 は選択中の対象がある状態から「再生」によってその対象を現在対象にするとし、選択中対象と現在対象が別状態であることを前提にする。§9.1 は保存対象を「選択中の現在対象」と一項目にまとめ、§9.2 も保存された現在対象を「選択」として復元する。
- Problem: リスト上の選択とプレイヤーの現在対象が同一状態なのか、再生前後で分かれる二状態なのかが確定していない。対象行を選択した時点で地図・案内と「次へ」の対象が変わる実装と、「再生」成功時だけ変わる実装の双方が本文へ適合し得る。選択変更、再生、次へによる自動進行、削除、地点更新、保存失敗および再読み込み後の結果も一意にならない。
- 根拠: REQ-T-002、REQ-T-007、REQ-D-003、REQ-L-001〜REQ-L-002、AC-027〜AC-028、および Requirements §9.2 の「選択中／現在位置」と保存・復元の正確な外部遷移を Specification で定める handoff。
- Why it matters: 同じリスト・完了・順序で同じ対象をクリックした利用者が、実装によって異なる地図、案内、次へ対象、保存状態および復元状態を見る。Treasure の主要な連続プレイヤー体験と適合試験を一意に実装・検証できない。
- Required Change: リスト上の選択と現在対象を一つの状態として扱うか、別々の状態として扱うかを外部契約として確定し、用語を分離する。対象選択、再生、次へによる自動進行、削除、地点更新、保存失敗、保存成功および再読み込みの各時点で、どの対象の地図・案内が前面に出て、どの対象へ次へを実行でき、何を保存・復元するかを同じ契約へ揃える。内部の状態保持方式は指定しない。
- 再確認条件: 上記各操作について選択と現在対象の前後状態が一意であり、§2、§4.3〜4.3.1、§9.1〜9.3、`SPC-AC-028` が同じ意味を用いていることを確認する。

### SR-026 — 末尾の未完了 Treasure に対する「次へ」の結果が矛盾する

- Severity: Critical
- Status: New / Open
- Location: §4.3.1 第3〜4段落、`SPC-AC-028`
- Evidence / Fact: §4.3.1 第3段落は、未完了の現在対象で「次へ」を実行すると現在対象を完了にし、次の未完了対象がない場合は現在対象を解除して全件完了を表示すると定める。直後の第4段落は「リスト末尾で次の未完了対象がない状態での『次へ』」について、完了・順序・現在地点・選択を変更しないと定める。
- Problem: 現在対象が巡回リスト最後の未完了 Treasure である同じ状態に、完了して全件完了へ遷移する規則と、何も変更しない規則の双方が適用される。第4段落が意図する境界が「末尾を既に次へで完了した後」なのか「末尾の未完了対象が現在対象である時」なのかも判別できない。
- 根拠: REQ-T-007 は「次へ」が現在の Treasure を完了にして次へ進む一操作であることを要求し、AC-028 と Requirements §9.2 は末尾を含む正確な境界を Specification へ引き継ぐ。
- Why it matters: 最終 Treasure の完了、全件完了表示、マップ別現在地点、保存結果および直後の「戻る」可否が実装間で分岐し、巡回を完了できるかを外部から一意に判定できない。
- Required Change: 未完了の末尾対象で最初に「次へ」を実行する場合と、その結果として現在対象がなくなった後にさらに「次へ」を実行する場合を区別し、それぞれの完了、現在対象、マップ別現在地点、保存および「戻る」対象の結果を一意にする。REQ-T-007 の現在対象完了契約を弱めない。
- 再確認条件: 1件だけの未完了リスト、複数件の末尾未完了、末尾以外が完了済み、全件完了、現在対象なしの各状態で、「次へ」と直後の「戻る」の結果が一つに決まり、本文と `SPC-AC-028` が一致することを確認する。

### SR-027 — 現行保存と旧 Treasure 保存の互換・移行入力境界が確定していない

- Severity: Critical
- Status: New / Open
- Location: §1.1、§9.1〜9.2、§13.1、§13.3、Requirement Traceability の REQ-L / REQ-Q 行
- Evidence / Fact: §9.1 は保存媒体、保存キー、内部形式および分割方法を Design に委譲する。§9.2 は「旧グレードとメンバー情報を構造的に解釈できる場合」の結果を定めるが、現行保存と旧保存の識別可能な版、対応する表現、必須項目、認識対象となる既存 Treasure 保存、および旧保存へ到達できる browser origin 条件を定めない。§13.1 / §13.3 は保存形式・キー、legacy lookup、decoder、移行 marker および配備を Design / Implementation の選択としている。最新ユーザー判断は、既存 Treasure 保存へ初回移行で到達できるよう v1 Treasure entry を運用中 Treasure と同じ browser origin に配備し、異なる origin なら事前に別の移行設計を必要とする。
- Problem: Requirements §9.2 が Specification へ明示的に引き継いだ「保存対象の正確な形式」「破損・旧形式・マスター参照不能時の外部動作」「既存 Treasure 保存データとの互換性」が閉じていない。合理的な二実装が異なる保存版・キー・旧形式を認識し、同じ既存ブラウザ保存を移行成功、移行失敗または未検出として扱える。異なる origin への配備でも旧保存へ到達不能なまま仕様適合と解釈できる。
- 根拠: REQ-L-001〜REQ-L-002、REQ-L-006、REQ-D-002、REQ-Q-002、AC-014、AC-017、AC-021、Requirements §9.2 の明示的 handoff、および最新ユーザー判断の同一 browser origin / 代替移行境界。
- Why it matters: 既存利用者の登録を継続利用できるか、どの保存を破損として拒否するか、再読み込みが同じ状態を復元するか、および移行失敗時に旧保存を保持できるかが実装・配備ごとに分岐する。互換性と非破壊移行を外部から検証できない。
- Required Change: 実装方式を固定せず、少なくとも現行保存と移行対象の旧 Treasure 保存を外部から識別できる版／表現、必須意味項目と参照整合性、認識対象、各入力に対する復元・全体拒否・未解決 master 参照保持・移行成功／失敗結果、および旧保存への到達条件を Specification で確定する。同一 origin を維持しない場合は、旧保存へ到達して非破壊移行を成立させる代替外部契約を先に定める。具体的な decoder、保存ライブラリ、内部モジュールおよび移行処理の実装は Design / Implementation に残す。
- 再確認条件: 同じ現行／旧保存入力、同じ master、同じ origin 条件に対して、適合する二実装が同じ復元・拒否・診断・移行・旧保存保持結果を返し、§9 と §13 の工程境界が矛盾しないことを確認する。

## 6. 解消済み指摘

過去 finding の解消履歴を維持する。今回の全文レビューで SR-001〜SR-024 の再発は確認されなかった。

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| SR-001〜SR-018 | Resolved（継続確認） | 外部入力・座標、route 比較、状態 lifecycle、保存破損、入力経路、revision / message、決定性、空状態および過去の相互運用契約について、今回の変更から再発する矛盾を確認しなかった。旧 Treasure 保存の現行 handoff 不足は新しい根本原因として SR-027 に統合した。 |
| SR-019 | Resolved（継続確認） | §6.2 でマップ間同率を表示し、規定タプル列で採用経路を決定する。 |
| SR-020 | Resolved（継続確認） | §3.1、§5.2、§7.1〜7.2 で初回自動順序、手動順序への一般モブ追加時の採用地点と固定規則を維持する。 |
| SR-021 | Resolved（継続確認） | §5.4、§7.2 で Mob の対象単位削除と候補・進捗・順序・現在地点への結果を維持する。 |
| SR-022 | Resolved（継続確認） | §4.3 で Treasure の異地点更新は完了を解除し、同地点再登録は重複を作らず完了・選択を維持する。 |
| SR-023 | Resolved（継続確認） | §4.2、§10.1〜10.2 で指定記号、未知記号、非負座標、地図別有効範囲および無効 master の拒否境界を維持する。 |
| SR-024 | Resolved（継続確認） | §4.4 と §10.2 でエーテライト町名ラベルの表示領域、矩形、8方向候補、重なり、最大8件、省略および同率規則を一意に維持する。 |

## 7. 上流へのフィードバック

なし。Requirements Review 011 は `READY` であり、今回の3件は Requirements が Specification へ明示的に委譲した外部契約、または最新ユーザー判断と既存互換性境界から Requirements の意味を変えずに確定できる Specification-level clarification である。Concept / Requirements へ新しい製品判断を要求しない。

## 8. 保留した指摘

- Design: SR-025〜SR-027 解消後の一意な外部契約を保ったまま、選択／現在対象／取消情報の内部所有、parser、logical commit、保存媒体、decoder、移行 marker、配備およびモジュール境界を決める。
- Implementation / Test: 修正版 Specification に対し、選択と再生、末尾の次へと戻る、個別完了・取消との併存、保存失敗、再読み込み、現行／旧保存の正常・破損・master 参照不能・origin 条件を検証する。
- Documentation / Release: 利用者向けバージョン表記、連続プレイリスト、保存移行条件および実際の公開 URL / origin を、実装済み外部契約と照合する。
- 静的マスターと画像: Mob master、Treasure / map master、エーテライト T / R 境界、地図画像の埋め込み表示除去、出典および画像利用条件は後続の実査対象である。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Specification | 判定 |
| --- | --- | --- | --- |
| 同格登録、必須名、同一性、最大8件 | REQ-T-001、REQ-T-006、REQ-D-005、AC-026、AC-031 | §3.2、§4.1〜4.2、§12 | PASS |
| 連続プレイリスト、登録集合との同一性 | REQ-T-002、REQ-D-003、AC-027 | §2、§3.2、§4.3、§12 | PASS |
| 3.x〜7.x 混在、全体選択なし、`Gxx` 不使用と6対応 | REQ-T-004、REQ-Q-002、AC-029 | §4.2〜4.3、§9.2、§12 | PASS |
| 行単位解決、曖昧性、統合、部分反映、原子性 | REQ-T-005〜REQ-T-006、REQ-D-001、REQ-D-006、REQ-L-006、AC-030〜AC-031 | §4.2、§9.3、§12 | PASS |
| 選択、現在対象、再生・保存・復元 | REQ-T-007、REQ-D-003、REQ-L-001〜REQ-L-002、AC-028 | §2、§4.3〜4.3.1、§9.1〜9.2 | FAIL（SR-025） |
| 次へ・戻るの末尾境界 | REQ-T-007、REQ-P-001〜REQ-P-002、AC-028 | §4.3.1、§12 | FAIL（SR-026） |
| 個別完了・取消との併存 | REQ-P-001〜REQ-P-002、AC-011、AC-028 | §4.3.1、§8 | PASS。個別操作は戻る連続可能状態を失効させ、他対象を巻き戻さない |
| 保存、復元、破損、旧形式、移行、失敗 | REQ-L-001〜REQ-L-006、REQ-D-002、REQ-Q-002、AC-014、AC-017、AC-021 | §9、§13 | FAIL（SR-027） |
| Mob 登録・探索・削除・モード分離 | REQ-F-003〜REQ-F-004、REQ-M-001〜REQ-M-008、REQ-P-003〜REQ-P-005 | §3、§5、§8 | PASS |
| 経路・手動順序・決定性・計算不能 | REQ-R-001〜REQ-R-008 | §6〜§7 | PASS |
| エーテライト表示・T/R 境界・非操作性 | REQ-F-006〜REQ-F-008、REQ-A-003〜REQ-A-004 | §4.4、§10 | PASS |
| 無効入力、安全性、状態分離、全消去 | REQ-D-001〜REQ-D-002、REQ-L-003〜REQ-L-006、REQ-S-001〜REQ-S-005 | §1.2、§3.1、§9〜§10 | PASS（SR-027 の保存互換入力境界を除く） |
| Acceptance と Traceability | AC-001〜AC-031 | §12、§14 | FAIL（SPC-AC-028 と保存互換性の合否が一意でない） |

## 10. 検証結果

- 対象 Specification のレビュー開始時 SHA-256 は `158459dc4081aa0c573761acfbace7dc67be22bfeec636c59426831d57b470eb` で、指定値と一致した。
- Specification 全482行、Requirements 全440行、Requirements Review 011、Concept、Concept Review 005、`MEMORY.md`、README、および Specification Review 001〜010 の finding 履歴を確認した。
- Reviewer A（契約の明確性と完全性）: Requirement handoff、入力、結果、状態、順序、境界、適合条件、Traceability および two-implementation test を確認し、SR-025〜SR-027 の候補を抽出した。
- Reviewer B（利用価値と運用適合性）: 連続画面、同格登録、メンバー更新、プレイヤー進行、完了・取消、再読み込み・移行失敗および既存 Treasure 継続性への利用者可視影響を確認し、3件を Critical とする影響を確認した。
- Reviewer C（Security / Interoperability primary）: 未信頼入力、曖昧行、部分失敗、外部原子性、状態境界、破損、master 参照不能、保存 lifecycle、version / migration、同一 origin 条件および fail-closed result を確認した。一括入力の原子性と既存 Mob / map の拒否契約は維持されるが、保存・移行入力の相互運用境界は SR-027 と判定した。
- two-implementation test: 選択時に現在対象も変える実装／再生時だけ変える実装、末尾の次へを完了として適用する実装／no-op とする実装、異なる旧保存版・キー・origin 到達条件を認識する実装が、それぞれ異なる外部結果を返せることを確認した。
- Requirement ID 59件、Acceptance ID 31件、Specification Acceptance ID 31件を確認し、各集合内に重複 ID がないことを確認した。
- 対象文書から参照する Requirements、Requirements Review 011、Concept、Concept Review 005、README および `MEMORY.md` の存在を確認した。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。docs-only の Specification Review であり、アプリコードを変更していない。
- 実装、テスト、静的マスター、画像、ブラウザ挙動、実保存、配備 origin、出典・ライセンス: Not validated。本レビューの対象外または後続確認事項である。
- レビュー終端で対象と Specification Review 001〜010 の SHA-256、`git diff --check`、変更ファイル、staged file および untracked file を再確認する。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Treasure / Mob、連続プレイリスト、対象外および責任境界は上流と一致する。 |
| 2. 要件追跡と契約（handoff closure） | FAIL | SR-025 と SR-027 により、選択／現在対象と保存・旧形式互換性の明示 handoff が閉じていない。 |
| 3. 処理と例外 | FAIL | SR-025〜SR-027 によりプレイヤー状態、末尾操作、復元・移行結果が分岐する。 |
| 4. 内部整合性 | FAIL | SR-025 の状態用語と SR-026 の隣接段落が相互に矛盾する。 |
| 5. 検証可能性 | FAIL | 同じ選択、末尾状態または既存保存入力に対する一意な期待結果を作れない。 |
| 6. 安全性・信頼境界・相互運用性 | FAIL | SR-027 により保存版、破損判定、旧形式認識、origin 到達および migration の相互運用結果が一意でない。 |
| 7. 上流整合性と工程境界 | FAIL | SR-027 は Requirements が Specification へ委譲した外部互換契約を Design / Implementation へ再委譲している。 |

Critical の New / Open が3件あるため、最終ゲートは `REVISE SPECIFICATION` とする。

## 12. 残存リスクと未決定事項

- SR-025〜SR-027 が解消されるまで、Treasure のプレイヤー UI、保存モデル、移行、適合テストおよび公開 origin を一意に設計・実装・検証できない。
- Mob、経路、エーテライト、静的マスター、画像、実保存およびブラウザ UI は文書契約上の回帰だけを確認し、実装適合性やデータ正確性は未検証である。
- G18 の実データ提供範囲・時期、具体的な URL 文字列、内部アルゴリズム、保存ライブラリおよびコンポーネント構成は、外部契約を変えない下流判断として残る。

## 13. 自動変更

なし。レビュー対象、Requirements、`MEMORY.md`、Concept、Design、実装、テスト、README、設定、画像および既存レビューは変更していない。本サイクルで新規作成した成果物は `docs/reviews/specification/specification-review-011.md` のみである。commit / push は実施していない。

## 14. 最終判定

**REVISE SPECIFICATION**

Critical 3 / Major 0 / Minor 0。SR-025〜SR-027 は New / Open。Treasure の登録・混在バージョン・一括統合と既存 Mob / route / aetheryte / safety 契約は概ね追跡可能だが、選択／現在対象、末尾の「次へ」、および保存・旧形式移行の外部契約を一意にしてから Design へ引き渡す必要がある。
