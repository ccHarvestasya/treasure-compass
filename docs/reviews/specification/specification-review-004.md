# Treasure Compass / Mob Compass Specification Review 004

## 1. レビュー対象

- Review cycle: 004（独立レビュー）
- 対象フェーズ: Specification
- 確認日: 2026-09-10（Asia/Tokyo）
- Reviewed branch: `maintenance/add-mob-compass`
- Repo HEAD: `bc5d7c2d05f7520edfa98521abe69bb785bfd930`
- 対象成果物: `docs/specification/specification.md`
- レビュー開始時の対象仕様 SHA-256: `926928fc8936099a240c4cd162465ea74286dcd79004a14bef293f0a0268ebca`
- 対象版: 現行作業ツリー版。レビュー開始時点で対象仕様には既存の未コミット変更があったが、今回のレビューでは変更していない。
- 上流基準: Requirements baseline `09a41c6b008a14a1cb03d6c3539e335dad1adb89`
- レビュー範囲: 修正後の Specification 全文。目的・範囲、Requirements handoff、入力・出力、状態・lifecycle、ルート決定性、Acceptance / Traceability、チャット案内、保存、マスターデータ、異常・失敗原子性、security / interoperability の適用範囲、Design / Implementation 境界、cycle 003 の SR-013〜018、SR-001〜012、および指定20 Two-implementation ケースを確認した。
- 未確認範囲: 実装、テスト実行、ブラウザ挙動、実データの正確性、静的 JSON・画像、実環境の保存・チャット互換性。Author の自己評価・自己判定は根拠として使用していない。

## 2. 使用した根拠

- `AGENTS.md`: Source of Truth、Scope Discipline、文書工程境界、既存変更の保全、docs-only 検証、commit / push 禁止を確認した。
- `.agents/skills/spec-review/SKILL.md`: Specification の工程責務、Requirements handoff closure、外部契約と Design の分離、Two-implementation test、Finding 採用基準、重大度・判定規則を適用した。
- `.agents/skills/spec-review/review-gates.md`: 現行7 Gate と、Critical の New / Open / Reopened があれば `REVISE SPECIFICATION`、なければ `READY` とする判定規則を適用した。
- `.agents/skills/spec-review/reviewers.md`: 契約完全性、利用価値・lifecycle、Security / Interoperability の適用範囲と Chair の統合基準を適用した。
- `.agents/skills/spec-review/output-format.md`: `SR` ID、重大度、判定値、共通成果物形式との対応を確認した。
- `.agents/skills/spec-review/security-checklist.md`: 対象に該当する untrusted input、malformed / tampered / stale / replay、fail-closed、atomicity、persistence / recovery、deterministic representation、compatibility / versioning を確認した。認証・署名等は根拠がないため要求していない。
- `.agents/skills/review-common/review-playbook.md`: 根拠の優先順位、工程分類、重複統合、下流からの逆生成禁止、独立レビューの境界を適用した。
- `.agents/skills/review-common/output-format.md`: 14章の章名・順序、Finding 必須項目、追跡・未確認・自動変更の扱いを適用した。
- `docs/concept/concept.md`: 目的、対象ユーザー、v1 scope、責任境界、Treasure 1:1 / Mob 1:多、共有周回、対象外、地点意味とマスターデータの分離を確認した。
- `docs/requirements/requirements.md`: Requirements 全文、REQ-F-001〜014、REQ-D-001 / 005 / 007、REQ-S-001〜006、Acceptance、§9.1 の確定判断、§9.2 の Specification handoff を確認した。現行 SHA-256 は `b1629f2834c2884bc7bbdc4cd875997e2ba0cc69f0a8c6b608836668286582a0`。
- `docs/reviews/requirements/requirements-review-005.md`: Requirements の READY 判定、上流の確定判断、下流へ引き継がれた未決定事項、過去 RR の状態を確認した。
- `docs/specification/specification.md`: レビュー対象。全条文、Acceptance 21件、Requirement Traceability、Design / Implementation handoff を確認した。
- `docs/reviews/specification/specification-review-001.md`、`docs/reviews/specification/specification-review-002.md`、`docs/reviews/specification/specification-review-003.md`: SR-001〜018 の履歴、前回の未解消条件、cycle 003 の修正対象を確認した。これらは履歴資料であり、対象仕様の根拠や Author の自己評価としては扱っていない。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。現行版に New / Open / Reopened の正式 finding はない。SR-001〜012 は継続して Resolved、cycle 003 の SR-013〜018 も本文、Acceptance、Traceability、外部結果の再確認により Resolved と判定した。Critical がないため、review-gates.md の規則に従い `READY` とする。

## 4. 総評

Specification は、Concept と Requirements の目的・範囲・責任境界を維持し、Treasure の同時点 1:1 と Mob の 1:多を別の外部意味として扱っている。候補集合、マスター分類、ルート採用、利用者確認、完了を分離し、候補・採用・確認から完了へ暗黙に昇格しない契約も閉じている。

入力の正規化、座標の丸め、未知・不正・重複・衝突、複数行の逐次適用、Treasure の duplicate / conflict precedence、Mob の候補集合、同順位の決定的表示、料金・ロード時間の Pareto 的補助評価、高さを結果へ使わない境界が外部から判定できる。

manual / auto の切替、再計算失敗時の manual state 保持、auto 計算不能時の stale route 再利用禁止、空・全完了 snapshot、`run` / `revision` / `issued-at`、明示的な案内置換後の世代継続、singleton header と item / candidate の全体整合性が一意に定められている。保存破損は全体拒否、マスター参照だけの不整合は周回情報を保持して未確認化するため、失敗境界と復旧境界も Requirements へ追跡できる。

## 5. 指摘事項

正式な指摘事項はなし。

| ID | Severity | Status | 確認結果 |
| --- | --- | --- | --- |
| なし | — | — | 根拠追跡、外部結果差、合理的な二実装の分岐、現工程での解決可能性、非 speculative の全条件を満たす未解消候補は確認されなかった。 |

## 6. 解消済み指摘

### SR-001〜SR-012

| ID | Status | 今回の再確認結果 |
| --- | --- | --- |
| SR-001 | Resolved | §3.1〜3.3 の入力・座標契約、§6 の route / tie / calculation failure、§8 の guide format、§9 の persistence corruption が外部契約として閉じている。 |
| SR-002 | Resolved | §7.4、§8.2、§9.1〜9.2 が初期 `run` なし、valid 登録・初回 guide、対象0件、全削除、全完了、reload、異なる `run` の通常拒否と明示置換を区別している。 |
| SR-003 | Resolved | §7.2 が採用地点のない Mob を manual order に保持し、遷移を `unknown` とし、明示的な再計算まで候補を自動採用しない。 |
| SR-004 | Resolved | §9.2 が保存構造・整合性の破損を全体拒否し、マスター参照だけの不整合を周回情報保持・未確認化として区別している。 |
| SR-005 | Resolved | §3.1〜3.2 が手動、Mob 通常複数行、Treasure 貼り付け、マスター / マップ選択、正式 `MOB-COMPASS/1` 取り込みを別経路としている。 |
| SR-006 | Resolved | §8.1、§8.3、§9.1〜9.2 が `revision` を世代、`issued-at` を出力時刻として分離し、出力時の +1、世代飛び、時計ずれ非依存、保存後継続を定めている。 |
| SR-007 | Resolved | §5.2 と §6.3 が ASCII map identifier、数値 X/Y、Unicode code point による deterministic な同順位表示規則を共有している。 |
| SR-008 | Resolved | §3.2 が空行を除く入力順、前行適用後の状態を基準にした逐次評価、manual order の追加順と auto route ranking の分離を定めている。 |
| SR-009 | Resolved | §8.1 が item / candidate の所属、identifier と map/X/Y、採用参照、order、欠落・余分・重複・dangling の全体拒否を定めている。 |
| SR-010 | Resolved | §3.1、§5.1、§8.1、§9.1 が高さを informational metadata に限定し、identity、重複、route、tie-break、guide、保存・復元結果を変えない。 |
| SR-011 | Resolved | §6.4、§8.1、§11.1 が auto route 計算不能時の案内出力禁止、状態・世代情報不変、過去 route の現在結果としての再利用禁止を定めている。 |
| SR-012 | Resolved | §7.4 が初期空状態と新しい周回直後の最初の valid 登録を `mode: auto` とし、成功 / 失敗結果、既存 `run` の全削除・全完了・reload 後追加の継続を定めている。 |

### SR-013〜SR-018（cycle 003）

| ID | Status | 今回の再確認結果 |
| --- | --- | --- |
| SR-013 | Resolved | §5.1 が候補集合への所属とマスター上の現在分類を分離し、候補 identifier ごとの分類を `confirmed` または `candidate` の一つへ固定した。§8.1 の candidate 行も一行・単一分類で、route-selected、user-confirmed、complete と混同しない。 |
| SR-014 | Resolved | §8.1 が `MOB-COMPASS/1`、`run`、`revision`、`issued-at`、`mode`、`transitions`、開始・終了 marker を各一回だけ許可し、同値・異値の重複、欠落、余分な出現を全体 malformed / 拒否・状態無変更とした。 |
| SR-015 | Resolved | §3.3 が判定表を上から順に適用し、分類を相互排他的にした。完全一致の Treasure 現在対象は `duplicate`、異地点で next target の明示がない場合は `conflict`、明示された next target は順次対象規則となる。 |
| SR-016 | Resolved | §7.2 と §11.1 が manual mode の明示再計算失敗を manual state のままの失敗とし、手動順序、採用地点、遷移表示、世代、保存・reload 結果を保持し、案内可能性も既存状態に従うと定めている。 |
| SR-017 | Resolved | §6.3、§7.3〜7.4、§8.1 が対象0件・全完了を計算不能と区別し、現在 mode を保持し、`transitions: 0`、空 item / candidate、または完了 item の `order: -` として案内できると定めている。 |
| SR-018 | Resolved | §8.2〜8.3、§9.1〜9.2 が異なる `run` の明示置換で incoming `run` / `revision` / `issued-at` と snapshot を採用・保存し、次回出力を `revision + 1` とし、同 revision の duplicate / conflict、stale、newer を継続して判定すると定めている。 |

上記18件について、修正後の同じ入力・同じ外部状態で、合理的な二実装による正式根拠のない外部結果差は確認されなかった。過去 finding を新規 ID へ再発行していない。

## 7. 上流へのフィードバック

なし。Concept の目的・scope・責任境界、Requirements の意味・強さ、Requirements Review 005 の handoff 判定に対する未解消の不足・曖昧さ・矛盾は確認されなかった。今回確認した未決定事項は、Requirements が Specification または Design / Implementation へ正当に委譲した範囲であり、上流へ製品判断を差し戻す必要はない。

## 8. 保留した指摘

正式な Deferred finding はなし。以下は現在の外部契約を変更しない下流引継ぎであり、Specification finding にはしていない。

- UI の具体的な画面構成、コンポーネント責務、入力欄・通知の配置。
- parser の内部分割、経路探索アルゴリズム、グラフ表現、内部スコア、候補組み合わせの内部データ構造。
- 保存キー、保存技術、内部シリアライズ、migration / deletion 実装、`run` 生成方式。
- マスターデータのファイル形式、内部 schema、配置、ロード、管理者向け公開手順。
- 具体的な fixture、操作手順、テストコード、ブラウザ検証。ただし、3〜11章の外部契約と12章の適合条件を変更してはならない。

## 9. 対象範囲と追跡

| 根拠 | Specification の追跡先 | 確認結果 |
| --- | --- | --- |
| Concept §1〜§5、REQ-F-001〜005、REQ-S-001〜006 | §1〜5、§10〜11、§12、§14.1 | 公開単位、Treasure 1:1、Mob 1:多、地点意味、利用者・リーダー・管理者の責任、対象外、自動判定・自動投稿なしを追跡できる。 |
| Concept §6〜§7、REQ-F-006〜010 | §6〜7、§9、§12、§14.1 | ルート第一軸、補助評価、対象集合、manual / auto、完了、個人 / 共有、lifecycle を追跡できる。 |
| REQ-F-011〜012、REQ-D-005 | §8、§11、§12 SPC-AC-010/011/018/021、§14.1 | 出力・取り込み、version、encoding、run、revision、issued-at、行間整合性、stale / duplicate / conflict / newer、atomic import を追跡できる。 |
| REQ-F-013〜014、REQ-S-005〜006 | §9〜10、§11、§12 SPC-AC-012/014/019、§14.1 | マスターデータの責任、出典・利用条件、更新・訂正、周回情報との分離、保存・復元・破損結果を追跡できる。 |
| REQ-D-001、REQ-D-007 | §3、§4〜6、§7.4、§8〜11、§12 SPC-AC-013/015/016/020/021、§14.1 | 入力形式、正規化、範囲、未知・不正・重複・衝突、計算不能、全体拒否、失敗原子性を追跡できる。 |

Requirements §9.1 の確定判断は、第一評価をマップ間遷移回数とし、同数時に通貨とロード時間を同等の補助負荷として扱うこと、地点の意味を分離すること、追加・削除・完了・手動順序の外部結果を定めることとして、§3〜7・§12へ閉じている。§9.2 の handoff は、入力・正規化 (§3)、Treasure / Mob 状態 (§4〜5)、route 評価 (§6)、lifecycle (§7)、guide protocol (§8)、保存・互換性 (§9)、master (§10)、error / security boundary (§11) へ対応しており、外部結果を Design へ再委譲していない。

Acceptance は `SPC-AC-001`〜`SPC-AC-021` が各 Requirement ID と対応し、本文の対象・入力・状態・失敗・案内・保存契約を参照している。特に `SPC-AC-020` は入力順と duplicate / conflict precedence、`SPC-AC-021` は singleton、空・全完了 snapshot、replacement 後の世代継続を追跡している。現行版に未追跡の Requirement ID、Acceptance ID、cycle 003 finding の外部契約は確認されなかった。

## 10. 検証結果

- レビュー開始時に `git status --short`、branch、HEAD、対象仕様 SHA-256 を確認した。branch は `maintenance/add-mob-compass`、HEAD は `bc5d7c2d05f7520edfa98521abe69bb785bfd930`、対象仕様 SHA-256 は `926928fc8936099a240c4cd162465ea74286dcd79004a14bef293f0a0268ebca` であった。
- 指定された AGENTS、spec-review の SKILL / gates / reviewers / output-format / security-checklist、review-common の playbook / output-format、Concept、Requirements、Requirements Review 005、Specification、Specification Review 001〜003を確認した。
- Requirements baseline commit の `docs/requirements/requirements.md` と現行 Requirements の SHA-256 は一致し、Requirements Review 005 の参照値とも一致した。Concept の SHA-256 は `0fba67b9babbc6d0ca23f1198fa371c02a3d23981b5cfe3706f060715cc22864`、Requirements Review 005 の SHA-256 は `544f93585168795d84c78bff109528d9836e1e3b45b20b1a5ef5eed3bfa1fbdb` である。
- SR-001〜SR-012を個別に再確認し、cycle 003 の SR-013〜SR-018を本文・Acceptance・Traceability・lifecycleの順に再確認した。未解消の正式 finding は確認されなかった。
- Security / Interoperability は、入力・保存・チャット案内・マスターデータが対象となる範囲で適用した。malformed / tampered input の全体拒否、stale / replay の世代判定、部分取込・部分復元の禁止、保存破損の全体拒否、master mismatch の保持・未確認化、決定的表現、version / compatibility を確認した。auth、authorization、暗号学的真正性、同期サービスは Requirements の対象外であり、finding 化していない。
- 次の指定20 Two-implementation ケースを、同じ外部入力・同じ外部状態に対して比較した。全ケースで仕様に適合する二実装の利用者可視結果、message / snapshot、state transition、ordering、compatibility result の差異は確認されなかった。

| # | Two-implementation ケース | 結果 | 一意に定まる外部結果 |
| ---: | --- | --- | --- |
| 1 | `run` あり対象0件へ異なる `run` の案内 | PASS | 通常取り込みは拒否し、明示的な案内置換だけを許可する。 |
| 2 | `run` なし初期空状態への初回 valid guide | PASS | incoming `run` を採用し、guide の mode・snapshot を現在周回へ取り込む。 |
| 3 | 同一 Mob / Treasure の複数行入力順 | PASS | 空行を除く上から下へ逐次適用し、前行の結果を次行へ反映する。 |
| 4 | duplicate / conflict を含む複数行 | PASS | Treasure 完全一致現在対象は `duplicate`、明示 next target でない異地点は `conflict` とする。 |
| 5 | guide の duplicate order / missing order | PASS | 案内全体を拒否し、既存状態を変更しない。 |
| 6 | dangling candidate reference | PASS | 案内全体を拒否し、部分取り込みしない。 |
| 7 | 他 Mob の candidate reference | PASS | 所属不一致として案内全体を拒否し、状態を変更しない。 |
| 8 | 同一 map/X/Y で高さだけ異なる candidate | PASS | 同一 candidate identity とし、高さで候補・route・guide・保存結果を分けない。 |
| 9 | 高さ欠落 | PASS | X/Y が有効なら高さ欠落だけでは拒否・未確認化・計算対象外にしない。 |
| 10 | auto route calculation failure | PASS | 自動 route を未算出 / 失敗として表示し、過去 route を現在 route に再利用しない。 |
| 11 | calculation failure 後の guide 出力 | PASS | auto failure では出力を失敗させ、`revision`、`issued-at`、現在状態を変更しない。 |
| 12 | 初回 valid 登録 | PASS | `mode: auto` で算出を開始し、成功時は route、採用地点、遷移、order、失敗時は auto failure を示す。 |
| 13 | 全対象完了後の追加 | PASS | `run` と現在 mode を維持し、追加対象だけを未完了として扱う。 |
| 14 | 全対象削除後の追加 | PASS | 同じ logical `run` と現在 mode を維持し、新しい `run` を暗黙生成しない。 |
| 15 | reload 後の対象0件への追加 | PASS | 保存・復元した `run` / mode に従い、同じ周回へ追加する。 |
| 16 | 同一地点が master 上で confirmed かつ candidate の意味を持ち得る状態 | PASS | 候補集合への所属と current master classification を分離し、candidate 行は一つの classification、route-selected・確認・完了は別状態で表す。 |
| 17 | singleton header / marker の重複 | PASS | 同値・異値を問わず案内全体を malformed として拒否し、first-wins / last-wins を行わない。 |
| 18 | manual → auto 再算出失敗 | PASS | manual mode、手動順序、採用地点、遷移表示、世代、保存・reload 結果を保持する。 |
| 19 | auto / manual の対象0件・全完了 guide | PASS | valid snapshot とし、`transitions: 0`、空 item / candidate、または完了 item の `order: -` を用いる。 |
| 20 | explicit guide replacement 後の revision | PASS | incoming `revision` / `issued-at` を保持し、次回出力を `revision + 1` とする。 |

- `git diff --check`: PASS。対象仕様に既存差分があるが whitespace error はなく、artifact 作成後の最終確認でも PASS とした。
- docs-only のレビューであり、`pnpm lint`、`pnpm test`、`pnpm run build` は AGENTS.md の change-aware validation に従い SKIPPED。コード・設定・テスト変更がないため対象外である。
- 実装、ユニットテストの実行結果、ブラウザ挙動、静的 JSON / 画像の実値、マスターデータの正確性・利用条件、実環境の保存・チャット互換性は Not validated。これらを Specification の合否や PASS の根拠にしていない。
- 今回の作業で新規作成したファイルは本 artifact のみであり、対象仕様、上流資料、過去レビュー、Skill、コード、テスト、設定、静的データ、画像は変更していない。commit / push は行っていない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Concept の目的、利用者、v1 scope、対象外、リーダー・管理者・ゲーム状態の責任境界を維持している。 |
| 2. 要件追跡と契約（handoff closure） | PASS | REQ-F / REQ-D / REQ-S の外部判断が本文、SPC-AC-001〜021、§14.1へ追跡でき、入力、出力、validation、error、状態、禁止事項を Design へ再委譲していない。 |
| 3. 処理と例外 | PASS | 正常、空、境界、未知、不正、重複、衝突、計算不能、manual 再計算失敗、guide stale / duplicate / conflict / newer、保存破損、空・全完了 snapshot の結果が一意である。 |
| 4. 内部整合性 | PASS | cycle 003 の同時地点意味、singleton、duplicate / conflict、manual failure、empty / complete guide、replacement revision の境界を修正後全文で再確認し、相互に矛盾する外部結果を確認しなかった。 |
| 5. 検証可能性 | PASS | Acceptance と本文から、20 Two-implementation ケースを含む受理・拒否、状態遷移、順序、案内内容、保存・復元結果を実装内部なしに判定できる。 |
| 6. 安全性・信頼境界・相互運用性 | PASS | untrusted input、malformed / tampered guide、stale / replay、fail-closed、partial failure / atomicity、persistence / recovery、deterministic representation、version / compatibility の適用範囲が一意である。認証・権限・暗号方式を根拠なく追加していない。 |
| 7. 上流整合性と工程境界 | PASS | Concept、Requirements、Requirements Review 005、過去レビューの未解消 Critical と矛盾せず、内部 parser、探索、保存技術、UI、schema、テスト実装だけを downstream へ残している。 |

Critical の New / Open / Reopened は0件であり、Gate 1〜7 はすべて PASS。Major / Minor を理由に `REVISE SPECIFICATION` へ変更していない。

## 12. 残存リスクと未決定事項

- 実装・テスト・ブラウザ・実環境の保存・チャット互換性は未検証である。下流では、仕様に定めた外部契約を内部方式の選択で変更しないことが必要である。
- マスターデータの実値、画像・出典・利用条件の実在確認、JSON の実際の整合性は本レビューの対象外である。仕様上は管理者責任、公開前確認、欠落・不正時の未確認 / 計算対象外境界まで閉じている。
- UI、parser、route 探索、保存技術、内部 schema、`run` 生成方式、具体的なテスト方法は下流で未決定だが、§8 の handoff 条件の範囲内で決定すべき Design / Implementation / Test 事項である。
- アカウント認証、権限管理、暗号学的真正性、サーバー同期、ゲーム状態連携は Concept / Requirements の v1 対象外であり、残存する Specification 要求ではない。
- 現行 Specification の外部契約に関する未決定事項、上流への差戻し事項、正式 Deferred finding は確認されなかった。

## 13. 自動変更

今回のレビューで新規作成したのは `docs/reviews/specification/specification-review-004.md` のみ。対象仕様、Concept、Requirements、Requirements Review 005、Specification Review 001〜003、Skill、コード、テスト、設定、README、静的データ、画像は変更していない。commit、push、対象仕様の修正は行っていない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。SR-001〜SR-012 と SR-013〜SR-018 は Resolved、New / Open / Reopened の正式 finding はない。7 Gate、Requirements → Specification handoff、determinism、Acceptance / Traceability、適用される security / interoperability 契約、指定20 Two-implementation ケースを確認し、Specification は次工程へ引き渡し可能と判定する。
