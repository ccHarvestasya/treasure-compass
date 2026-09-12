# Treasure Compass / Mob Compass Specification Review 012

## 1. レビュー対象

- レビューサイクル: 012（Specification Revision 006、SR-025〜SR-027 再確認・全文回帰）
- 対象フェーズ: Specification
- 確認日: 2026-09-12（Asia/Tokyo）
- 対象成果物: `docs/specification/specification.md` Revision 006
- 対象版 / SHA-256（レビュー開始時）: `1b56c8063827bd7cb79463429e3073fa881f97699e04dbc8bb32b9cee57d75ad`
- 前回レビュー: `docs/reviews/specification/specification-review-011.md`、SHA-256 `32633d1bb78ac270dce4fa44d46230d18432e91b93e9f9ac1ab3cd3de2aedf7c`
- 前段承認: `docs/reviews/requirements/requirements-review-011.md`（`READY`、Critical 0 / Major 0 / Minor 0）
- 対象範囲: SR-025〜SR-027 の再確認、Specification 全文の Requirements 追跡性、外部契約の完全性、two-implementation test、および既存 Mob、地図、経路、エーテライト、安全性・互換性契約の回帰確認。
- 未確認範囲: 実装、テスト、静的マスターデータ、画像、ブラウザ表示、実 localStorage、実配備 origin、マスターの正確性・完全性、出典・画像利用条件、外部サービス。

## 2. 使用した根拠

- 最新判断: `MEMORY.md`。Treasure の連続プレイリスト、リスト選択／現在対象、再生・次へ・戻る、同格登録、必須名、混在バージョン、一括統合、保存・移行および同一 browser origin の判断を確認した。
- 承認済み Requirements: `docs/requirements/requirements.md` と Requirements Review 011。Requirement、Acceptance、Specification への明示的 handoff を判定基準とした。
- 承認済み Concept: `docs/concept/concept.md` と Concept Review 005。v1 の目的、利用者、対象外、責任境界および成功状態を確認した。
- レビュー対象: `docs/specification/specification.md` Revision 006 全511行。
- 前回レビュー: Specification Review 011。SR-025〜SR-027 の Evidence、Required Change および再確認条件を使用した。
- 過去レビュー: Specification Review 001〜010。SR-001〜SR-024 の履歴と解消済み契約の回帰確認に使用した。
- 許可された互換性資料: `README.md`。既存 Treasure の登録、チャット一括入力、地図、経路、進捗および browser 保存の継続範囲の補足確認に限定した。
- 作業規則: `AGENTS.md`、`spec-review` Skill、review-common の playbook / output format、spec-review の output format / gates / reviewers / security checklist。

## 3. レビュー結果

**REVISE SPECIFICATION**

Critical 2 / Major 0 / Minor 0。SR-025 と SR-027 は Open（継続）、SR-026 は Resolved。新規 finding はない。

## 4. 総評

Revision 006 は前回指摘へ実質的な修正を加えた。リスト選択、現在対象、マップ別現在地点を別の外部状態として定義し、選択、再生、次へ、削除、地点更新、保存・復元の大部分を整合させた。最後の未完了対象に対する最初の「次へ」と、その後の現在対象なし／全件完了状態での無操作「次へ」も明確に分離され、直後の「戻る」まで一意になったため SR-026 は解消した。

保存互換性も、現行 v3 key、schema 世代、認識優先順位、v2・統合 v1・separate key、移行成功／失敗、master 参照不能、同一 origin を明記し、SR-027 の不足を大きく縮小した。既存の同格登録、行単位解決、部分反映・原子性、混在バージョン、Mob、地図、経路、エーテライトおよび安全側の拒否結果にも回帰は確認されなかった。

ただし、プレイヤー状態では、リスト選択と現在対象が異なる許容状態から現在対象を個別完了した場合に、§4.3.1 内で選択を完了対象へ変える結果と変更しない結果が競合する。保存では、v3 が unknown field を拒否する一方で、許可する JSON field の集合・型・値域を閉じず、legacy envelope / state / member / route 等も承認済み旧表現を一意に識別できる形式まで定義していない。このため同じ外部入力を異なる実装が受理／拒否でき、SR-025 と SR-027 は再確認条件を満たさない。

## 5. 指摘事項

### SR-025 — 選択中の対象と現在対象の状態契約が一意でない

- Severity: Critical
- Status: Open（継続）
- Location: §4.3.1「完了」段落（Revision 006 の161行）、§2「リスト選択」「現在対象」、`SPC-AC-028`
- Evidence / Fact: §2 と §4.3 はリスト選択と現在対象を別状態とし、両者が異なる状態を明示的に許容する。§4.3.1 は「完了」を現在対象以外からも実行可能としたうえで、「現在対象を直接完了した場合は、リスト選択と現在対象をその完了対象のまま保つ」と定める。直後には「非選択対象の完了はリスト選択および現在対象を変更しない」とある。
- Problem: リスト選択 B、現在対象 A の許容状態で A を直接完了すると、A は「現在対象」であると同時に「非選択対象」である。前者の規則を、リスト選択も A にする規則として実装する結果と、後者に従ってリスト選択 B・現在対象 A を維持する結果が得られる。「保つ」と「その完了対象のまま」の目的語も、別状態として定義したリスト選択へ一意に適用できない。
- 根拠: REQ-T-007、REQ-P-001〜REQ-P-002、REQ-D-003、AC-011、AC-028、および Requirements §9.2 の選択／現在位置と個別完了・取消の併存を定める handoff。
- Why it matters: 同じ許容状態と完了操作からリスト強調、次の再生対象、保存・復元状態が実装ごとに分岐し、プレイヤーと個別完了の併存を一意に検証できない。
- Required Change: リスト選択と現在対象が異なる状態で、現在対象を個別完了した場合およびリスト選択中だが現在対象でない項目を完了した場合について、それぞれのリスト選択・現在対象・地図案内・保存結果を一意にする。既に定義した二状態の分離を維持し、内部保持方式は指定しない。
- 再確認条件: リスト選択と現在対象が同じ場合、異なる場合、一方が `null` の場合の各個別完了・取消について、§2、§4.3〜4.3.1、§9.1〜9.3、`SPC-AC-028` から同じ前後状態が得られることを確認する。

### SR-027 — 現行保存と旧 Treasure 保存の互換・移行入力境界が確定していない

- Severity: Critical
- Status: Open（継続）
- Location: §9.1.1、§9.2、§13.1、§13.3、`SPC-AC-014`、`SPC-AC-017`
- Evidence / Fact: §9.1.1 は v3 の JSON key と意味フィールドを列挙し、「フィールド名と値の型はこの表の表記を保存表現の契約」とし、unknown field を含むレコードを拒否する。しかし `registrations` 内の map / point 参照、完了状態、プレイリスト位置、`mapCurrentLocations`、`incompleteRoute`、`masterIdentity` の data revision 等について、JSON field 名、JSON 型、許容値、必須／任意の集合が閉じていない。トップレベルと各 object で許可する field の完全な集合も示されないため、unknown field 判定を一意に適用できない。旧 v2 / 統合 v1 / separate 保存も、`members` slot collection、location、`route`、`activeStep`、`currentMapPoints` 等を「承認済みの旧 envelope」「必須 location 情報」と参照するが、その正式な外部表現または一意な参照先を示していない。
- Problem: key、世代、優先順位、origin および高水準の移行結果は確定したが、同じ JSON value に対する構造的に正しい／破損／unknown field／認識対象 legacy の判定がまだ実装間で分岐する。例えば参照を文字列とする実装と object とする実装、未列挙 field を必須既知 field とする実装と unknown として全拒否する実装が、いずれも本文の意味記述へ適合し得る。
- 根拠: REQ-L-001〜REQ-L-002、REQ-L-006、REQ-D-002、REQ-Q-002、AC-014、AC-017、AC-021、および Requirements §9.2 が Specification へ引き継いだ保存対象の正確な形式、破損・旧形式・master 参照不能時の結果、既存保存互換性。
- Why it matters: 同じ現行または旧 browser 保存について、復元、全体拒否、未解決診断、移行成功／失敗が実装ごとに異なり得る。既存利用者の非破壊移行と fail-closed の適合を外部データから再現可能に判定できない。
- Required Change: 実装内部の decoder や状態所有は指定せず、v3 および認識対象 legacy 各世代について、外部保存 JSON の許可 field、必須／任意、JSON 型、値域、参照形状、余分な field の扱いを一意に定めるか、同じ情報を一意に定義する版付きの正式外部スキーマを規範参照する。既に定めた key 優先順位、同一 origin、全体拒否、master 未解決、移行原子性は維持する。
- 再確認条件: 現行 v3、v2、統合 v1、separate key の代表的な正常、欠落、余分、型不正、dangling / duplicate、master 未解決入力に対し、適合する二実装が同じ認識・拒否・診断・移行・旧保存保持結果を返し、§9 と §13 の工程境界が一致することを確認する。

## 6. 解消済み指摘

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| SR-001〜SR-024 | Resolved（継続確認） | 既存の入力・座標、状態 lifecycle、Mob、経路、順序、削除、マスター、エーテライト表示、決定性、安全性および相互運用契約に回帰は確認されなかった。 |
| SR-026 | Resolved | §4.3.1 は、最後の未完了対象への最初の「次へ」で完了・マップ別現在地点・現在対象なし・全件完了を一操作として保存し、その操作を「戻る」対象にする。以後の現在対象なし／全件完了状態での「次へ」は無操作で、直前の戻る可能状態を失効させない。単一項目、他全件完了、空、現在対象なしの境界が `SPC-AC-028` と一致する。 |

## 7. 上流へのフィードバック

なし。残る SR-025 と SR-027 は、Requirements が Specification へ明示的に委譲した状態遷移と保存互換形式を、上流の意味を変えずに閉じる Specification-level clarification である。

## 8. 保留した指摘

- Design: SR-025 と SR-027 解消後の外部契約を保ち、リスト選択／現在対象、保存状態、decoder、legacy lookup、移行 marker、配備および内部モジュールの実現方式を決める。
- Implementation / Test: 修正版 Specification の状態組合せ、末尾進行、保存失敗、v3 / legacy の正常・不正・余分 field・参照不整合・master 未解決・origin 条件を検証する。
- Documentation / Release: 実際の URL / origin、利用者向けバージョン、プレイヤー操作および保存移行条件を実装済み契約と照合する。
- 静的マスターと画像: データ正確性、T / R 境界、埋め込み表示除去、出典および利用条件を後続で実査する。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Specification | 判定 |
| --- | --- | --- | --- |
| 同格登録、必須名、同一性、最大8件 | REQ-T-001、REQ-T-006、REQ-D-005、AC-026、AC-031 | §3.2、§4.1〜4.2、§12 | PASS |
| 連続プレイリスト、混在バージョン、`Gxx` 不使用 | REQ-T-002、REQ-T-004、REQ-D-003、REQ-Q-002、AC-027、AC-029 | §2〜§4、§9.2、§12 | PASS |
| 行単位解決、統合、部分反映、原子性 | REQ-T-005〜REQ-T-006、REQ-D-001、REQ-D-006、REQ-L-006、AC-030〜AC-031 | §4.2、§9.3、§12 | PASS |
| リスト選択、現在対象、個別完了・取消 | REQ-T-007、REQ-P-001〜REQ-P-002、REQ-D-003、AC-011、AC-028 | §2、§4.3〜4.3.1、§8、§9 | FAIL（SR-025） |
| 末尾の次へ・戻る | REQ-T-007、REQ-P-001〜REQ-P-002、AC-028 | §4.3.1、§12 | PASS（SR-026 Resolved） |
| 保存、復元、破損、旧形式、移行、失敗 | REQ-L-001〜REQ-L-006、REQ-D-002、REQ-Q-002、AC-014、AC-017、AC-021 | §9、§13 | FAIL（SR-027） |
| Mob 登録・探索・削除・モード分離 | REQ-F-003〜REQ-F-004、REQ-M-001〜REQ-M-008、REQ-P-003〜REQ-P-005 | §3、§5、§8 | PASS |
| 地図、経路、手動順序、決定性、計算不能 | REQ-R-001〜REQ-R-008、REQ-A-001〜REQ-A-002 | §2、§5〜§7、§10 | PASS |
| エーテライト表示、T / R 境界、非操作性 | REQ-F-006〜REQ-F-008、REQ-A-003〜REQ-A-004 | §4.4、§10、§12 | PASS |
| 無効入力、安全性、状態分離、全消去 | REQ-D-001〜REQ-D-002、REQ-L-003〜REQ-L-006、REQ-S-001〜REQ-S-005 | §1.2、§3.1、§9〜§10 | PASS（SR-027 の保存形式判定を除く） |
| Acceptance / Requirement Traceability | AC-001〜AC-031 | §12、§14 | FAIL（SR-025、SR-027） |

## 10. 検証結果

- 対象 SHA-256 `1b56c8063827bd7cb79463429e3073fa881f97699e04dbc8bb32b9cee57d75ad` と前回レビュー SHA-256 `32633d1bb78ac270dce4fa44d46230d18432e91b93e9f9ac1ab3cd3de2aedf7c` は、レビュー開始時に指定値と一致した。
- Specification Revision 006 全511行、Requirements 全440行、Requirements Review 011、Concept、Concept Review 005、`MEMORY.md`、README、Specification Review 001〜011 を確認した。
- Reviewer A: handoff closure、状態、入力形式、境界、適合条件、Traceability と two-implementation test を確認し、SR-025 / SR-027 の残存と SR-026 の解消を確認した。
- Reviewer B: 選択・再生・個別完了、末尾進行、既存保存の復元・移行失敗、および Mob / route / map の利用者可視回帰を確認した。
- Reviewer C: 未信頼入力、保存 JSON、unknown / malformed / duplicate / dangling、partial failure、原子性、master 未解決、version / migration、origin および fail-closed result を確認した。
- two-implementation test: SR-026 の末尾操作は同じ結果となる。対して、リスト選択 B・現在対象 A で A を個別完了する実装、および同じ v3 / legacy JSON の未定義 field / shape を認識する実装では外部結果が分岐する。
- Requirement ID 59件、Acceptance ID 31件、Specification Acceptance ID 31件を確認し、集合内の重複はない。
- 対象文書が参照する Requirements、Requirements Review 011、Concept、Concept Review 005、README、`MEMORY.md` の存在を確認した。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。docs-only review のためアプリ検証は対象外。
- 実装、テスト、静的マスター、画像、ブラウザ挙動、実 localStorage、配備 origin、出典・ライセンス: Not validated。
- レビュー終端で対象、前回レビューおよび過去 Specification Review の SHA-256、`git diff --check`、変更・staged・untracked file を再確認する。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | 対象、利用者、連続 Treasure 体験、Mob および対象外は上流と一致する。 |
| 2. 要件追跡と契約（handoff closure） | FAIL | SR-025 と SR-027 により、個別完了の状態遷移と保存形式 handoff が閉じていない。 |
| 3. 処理と例外 | FAIL | SR-025 の完了結果と SR-027 の保存認識・移行結果が分岐する。SR-026 の末尾境界は解消した。 |
| 4. 内部整合性 | FAIL | SR-025 は同じ許容状態への二つの完了規則が競合し、SR-027 は unknown field 拒否と許可 field 集合の未完結が両立しない。 |
| 5. 検証可能性 | FAIL | 同じ個別完了操作と保存 JSON に一意な期待結果を作れない。 |
| 6. 安全性・信頼境界・相互運用性 | FAIL | SR-027 により malformed / unknown、version、legacy recognition、migration の fail-closed 境界が一意でない。 |
| 7. 上流整合性と工程境界 | FAIL | SR-027 の外部保存表現は Requirements の明示 handoff であり、内部 decoder とは分けて Specification で閉じる必要がある。 |

Critical の Open が2件あるため、最終ゲートは `REVISE SPECIFICATION` とする。

## 12. 残存リスクと未決定事項

- SR-025 と SR-027 が解消されるまで、個別完了を含む Treasure プレイヤー状態と保存・移行適合性を一意に設計・実装・検証できない。
- Mob、地図、経路、エーテライト、静的マスター、画像およびブラウザ UI は文書契約上の回帰のみ確認し、実装・データ・資産の適合は未検証である。
- G18 の実データ範囲、具体的 URL、内部アルゴリズム、保存実装およびコンポーネント構成は、確定済み外部契約を変えない下流判断として残る。

## 13. 自動変更

なし。Specification、Review 011、Requirements、`MEMORY.md`、Concept、Design、実装、テスト、README、設定、画像および既存レビューは変更していない。本サイクルで新規作成した成果物は `docs/reviews/specification/specification-review-012.md` のみである。commit / push は実施していない。

## 14. 最終判定

**REVISE SPECIFICATION**

Critical 2 / Major 0 / Minor 0。SR-026 は Resolved。SR-025 と SR-027 は Open（継続）であり、個別完了時の選択／現在対象と、現行・旧保存 JSON の認識境界を一意にした後で再レビューする必要がある。
