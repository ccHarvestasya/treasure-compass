# Treasure Compass / Mob Compass Design Review 003

## 1. レビュー対象

- レビューサイクル: 003（全面改訂後の全体レビュー）
- 対象フェーズ: Design
- 確認日: 2026-09-11（Asia/Tokyo）
- ブランチ: `maintenance/add-mob-compass`
- レビュー開始時 HEAD: `bba038de847ceeb8cf373181b1c1b4dc1acbdc7a`
- 対象成果物: `docs/design/design.md` の未コミット Revision 003
- 対象 Design SHA-256: `f7853823f1401075e88e1c629c217052c4ef47e64babc22ffafb4259cd0212cd`
- 対象範囲: Design 全文。モノレポ構成、責務・依存、マスター形式・移行、状態所有、経路、永続化、主要フロー、失敗・復旧、安全性、スマートフォン構造、下流引継ぎを確認した。
- 未確認範囲: 実装適合性、テスト実行、ブラウザ動作、static data と画像の正確性・利用条件、Mob master・料金・ロード時間の実値、配備環境。既存コードと JSON は移行可能性を確認する補助資料に限った。

## 2. 使用した根拠

- ユーザーの最新判断。二つの別アプリをモノレポで管理し、地図基盤を共有すること、具体的 URL は決めないこと、既存 JSON の未使用要素をそのまま採用しないことを確認した。
- `AGENTS.md`。Source of Truth、工程境界、既存変更の保全、静的データ・localStorage の検証、docs-only validation、Git 規約を適用した。
- `design-review` Skill と review-common。Design の責務、4 Reviewer 観点、Finding 採用条件、重大度、8 Gate、Two-implementation test、14章の出力形式を適用した。
- [Specification](../../specification/specification.md) と [Specification Review 007](../specification/specification-review-007.md)。直接の上流と `READY` 判定として、別アプリ、登録、経路、進捗、保存、移行、マスター、スマートフォンの外部契約を確認した。
- [Requirements](../../requirements/requirements.md)、[Requirements Review 007](../requirements/requirements-review-007.md)、[Concept](../../concept/concept.md)、[Concept Review 005](../concept/concept-review-005.md)。目的、v1 scope、責任境界の補助確認に用いた。
- [Design Review 001](design-review-001.md) と [Design Review 002](design-review-002.md)。過去の DR-001〜DR-004 の履歴と解消状態を確認した。
- 現行 `GRADE_CONFIG`、`src/persistence/storage.ts`、`src/constants/index.ts`、`public/json/`。新しい契約の根拠にはせず、現行 storage key、configured dataset、移行元の存在を確認した。

## 3. レビュー結果

**READY**

Critical 0 / Major 3 / Minor 1。`DR-005`〜`DR-008` は New / Open である。Critical がないため Gate は `READY` だが、`DR-005`〜`DR-007` は Implementation 着手前に Design Author が修正することを推奨する。

## 4. 総評

Revision 003 は、新しい Specification に合わせて旧 Mob 案内、地点分類、単一 product switch を設計から除外し、Treasure、Mob ソロ、Mob パーティを別 root として再構成できている。二つの application entry、共有 map core/UI、固有 domain、master data の依存方向は明確で、汎用 `point[]` を map/Treasure/Mob の master に分離した判断も、未使用データを誤って正本化しないというユーザー判断に整合する。

`visitOrder` と `progressOrder` の分離、B candidate 単位の visit、write-before-publish、master/session identity による stale result 排除、旧 Treasure key の優先移行、厳格な master validation は、状態・整合性・失敗境界を実装可能な粒度で定めている。スマートフォンで drag 以外の並べ替え手段を要求し、共有 Map UI と固有 workflow を分けた点も適切である。

一方、origin 固有 localStorage と未決定の配備先の間に旧 Treasure 移行を保証する境界がなく、補助移動情報不足時の成功経路が planner result に表現されていない。また、master schema は catalog を持つものの map と mob の意味情報を出典へ直接対応付けられず、下流が関係を推測する余地がある。物理 package 名については、確定箇所と未決定箇所が文書内で矛盾する。

## 5. 指摘事項

### DR-005 — Major — New / Open

- **対象箇所**: Design §3.3、§8.2、§8.4
- **上流根拠**: Specification §1.1、§9.2、REQ-F-001、REQ-Q-002
- **事実**: Design は二つの app を別アドレスへ割り当て、保存媒体を origin ごとの localStorage とし、新 Treasure app が現行統合 key と旧 grade/member key を読む方式を定めている。しかし、Treasure app の配備 origin が現行 Treasure と異なる場合に旧 key へアクセスできないことを、配備 constraint または移行 boundary として扱っていない。
- **問題**: 同じ origin を維持する実装は旧保存を移行できるが、別 origin に配備する実装は browser security boundary により旧保存を読めない。具体的 URL を決めなくても、互換性を成立させる architecture constraint が必要である。
- **影響**: 有効な既存 Treasure の grade と8人分の member が初回移行されず、Specification の互換性契約を配備方式によって満たせなくなる。
- **分類**: Design defect。具体的 URL の未決定ではなく、origin 固有 storage を選んだ Design が旧保存への到達責任を閉じていない問題である。
- **最小修正**: Treasure の公開 entry が旧 key を読める origin を維持するか、異なる origin でも旧保存を安全に受け渡せる移行 boundary を配備 Design の制約として定める。具体的な URL 文字列は決めなくてよい。
- **再確認条件**: 同一 origin と異なる origin の配備候補について、どの component が旧 key を読み、新 key へ一度だけ移行するかが一意で、Mob app の保存境界を混在させないこと。

### DR-006 — Major — New / Open

- **対象箇所**: Design §5.2、§9.1〜§9.2、§12
- **上流根拠**: Specification §6.2、§6.4、REQ-R-001
- **事実**: Specification は、料金またはロード時間が欠落しても第一評価だけで一候補へ決まる場合、その候補を補助値欠落の表示付きで採用可能としている。Design は travel edge 不足を複数 map の route failure とし、planner result を success / empty / failure に分けるが、第一評価だけで決まる成功と欠落 warning を表現・採用する責務を定めていない。
- **問題**: 欠落 edge があれば常に failure とする実装と、遷移回数だけで一意なら success とする実装が Design から成立し、前者は上流契約を弱化する。
- **影響**: 本来継続可能な巡回が計算不能として拒否されるか、欠落情報の表示なしで採用される可能性がある。planner、coordinator、presentation 間の責務を実装者が推測する。
- **分類**: Design defect。外部結果は Specification で既に定まっており、その内部表現と adoption boundary が不足している。
- **最小修正**: 第一評価で一意になる条件、補助値が必要になる条件、成功 result に補助情報不足 warning を含める構造、coordinator の採用と presentation への warning 投影を定める。第一評価で一意にならず補助値が不足する場合だけ failure とする。
- **再確認条件**: 同じ欠落 edge を含む入力で、第一評価が一意な場合は warning 付き success、複数候補が残る場合は補助情報不足 failure となり、既存状態の採否が Specification と一致すること。

### DR-007 — Major — New / Open

- **対象箇所**: Design §4.2〜§4.4、§5.1、§6.2
- **上流根拠**: Specification §10.1〜§10.2、REQ-A-001、REQ-S-005
- **事実**: map master は共通 `sources` catalog を持ち、aetheryte と candidate 等は `sourceIds` を持つ。一方、map record と mob record 自体には出典 reference がなく、map の名称・範囲・画像対応や、mob の正式名・別名・rank・出現 map をどの source が裏付けるかを schema 上で対応付けられない。Design は Mob 全件の出典を preparation gate で求めるが、保存先と必須 cardinality を定めていない。
- **問題**: candidate の `sourceIds` を mob 全体へ暗黙適用する実装、report だけに出典を置く実装、未対応のまま schema validation を通す実装が成立する。strict schema と runtime master のどちらが出典対応の source of truth か不明になる。
- **影響**: map・mob の必須意味情報を確認・訂正する際に、対象 record と出典を一意に追跡できず、出典なしの情報を有効 master として採用し得る。
- **分類**: Design defect。Specification が master と出典の対応を要求しており、具体的な出典値ではなく data ownership と validation rule が不足している。
- **最小修正**: map と mob を含む必須意味情報を、共通 catalog の一件以上の source へ対応付ける schema または同等の明示的 mapping を定める。必須／空許可と参照検証の責任を Master adapter と採用 gate に割り当てる。画像 license との役割は分離する。
- **再確認条件**: map の名称・範囲・画像対応、mob の名称・別名・rank・出現 map、各地点について、対応 source が schema から一意に解決でき、空・未知・衝突 reference が正常 record として採用されないこと。

### DR-008 — Minor — New / Open

- **対象箇所**: Design §3.1、§16
- **上流根拠**: Specification §13.1、Design 自身の工程境界
- **事実**: §3.1 は `apps/*` と `packages/*` の物理配置および package 名を確定しているが、§16 は「物理 package 名」を Implementation で決めるとしている。
- **問題**: 同じ Design 内で package 名・配置の確定状態が矛盾する。
- **影響**: 下流が §3.1 の構成を制約として扱うか、名称を変更可能な detail と扱うか判断できない。
- **分類**: Design defect。外部契約には影響しない局所的な文書整合性の問題である。
- **最小修正**: §3.1 を確定 Design とするか論理例とするかを一方に揃え、§16 の委譲範囲と一致させる。
- **再確認条件**: package の責務と依存を維持しつつ、名称・配置の確定／未決定が文書全体で一意であること。

## 6. 解消済み指摘

DR-001〜DR-004 は [Design Review 002](design-review-002.md) で `Resolved` である。Revision 003 は旧 guide lifecycle と selection history を上流 scope の変更に合わせて除外し、master/session identity による stale route 排除と write-before-publish を維持している。今回の全面改訂から、過去 finding の再発または Reopened に該当する問題は確認しなかった。

## 7. 上流へのフィードバック

なし。具体的 URL と配備先を確定しなくても DR-005 の storage access constraint は Design 内で解決できる。DR-006 の成功／失敗結果、DR-007 の出典要件も Specification に既に定義されており、新しい外部契約は不要である。

## 8. 保留した指摘

正式な Deferred finding はなし。Mob master の実値、料金、ロード時間、画像 license、legacy conversion report は、Design の data preparation gate に従って Implementation / Test 前後で検証する事項であり、現時点の値が未準備であること自体は Design finding にしない。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Design | 判定 |
| --- | --- | --- | --- |
| 別 app、モノレポ、共有地図 | Specification §1、§3、§13 | §1、§3、§11 | PASS。DR-005 は旧保存へ到達する配備境界だけが不足 |
| Treasure 登録・互換性 | Specification §4、§9 | §6、§7.2、§8.4、§10.1 | PASS WITH FINDING。DR-005 |
| Mob mode・登録・進行 | Specification §3、§5、§8 | §7.3〜§7.5、§10 | PASS |
| 自動・手動経路 | Specification §6〜§7 | §4.2、§7.1、§9 | PASS WITH FINDING。DR-006 |
| state ownership・保存原子性 | Specification §8〜§9 | §7〜§8、§10.4 | PASS |
| master schema・検証・移行 | Specification §10 | §2、§4〜§6 | PASS WITH FINDING。DR-007 |
| smartphone / UI boundary | Specification §3、§11 | §3、§10、§11 | PASS |
| failure・security | Specification §6、§9〜§10 | §5、§8、§12 | PASS WITH FINDING。DR-006、DR-007 |
| downstream handoff | Specification §12〜§13 | §13〜§16 | PASS WITH FINDING。DR-008 |

### Review Board の独立確認

- Reviewer A（構造と責務）: app/domain/shared package の一方向依存、session root、Map UI の境界を確認した。package 確定状態の矛盾を DR-008 とした。
- Reviewer B（Security）: JSON、localStorage、入力、HTML 表示、過大計算、部分復元、ログの境界を確認した。出典と意味情報の integrity ownership 不足を DR-007 とした。認証・権限は対象外である。
- Reviewer C（フローと運用）: 起動、登録、経路、保存、復元、master 更新、取消、全消去を確認した。origin をまたぐ旧保存到達を DR-005、補助情報不足の分岐を DR-006 とした。
- Reviewer D（追跡と下流実装可能性）: Specification 21適合条件と Design §15 を確認した。上記4件以外に、実装者が重大な ownership、atomicity、recovery を推測する問題は確認しなかった。
- Chair: 重複候補を統合し、Critical へ該当する system-wide blocker はないと判定した。

### Two-implementation test

| ケース | 合理的な実装差 | Design から導ける結果 | 判定 |
| --- | --- | --- | --- |
| 同一 origin で Treasure を配備 | path や build 出力名が異なる | 旧 key を読み新 key へ移行できる | PASS |
| 異なる origin で Treasure を配備 | hosting 構成が異なる | 旧 key への到達方法がなく移行結果が分岐 | FAIL。DR-005 |
| 補助 edge 不足、第一評価は一意 | planner の result 型が異なる | warning 付き success と failure の両方が成立 | FAIL。DR-006 |
| map/mob の出典検証 | source を record、candidate、report のどこに置くかが異なる | 必須意味情報の出典対応と拒否条件が分岐 | FAIL。DR-007 |
| 保存 write failure | immutable candidate または rollback buffer | 成功 write まで current state を変更しない | PASS |
| B Next の一段取消 | snapshot または inverse operation | candidate、順序、current location を一操作前へ戻す | PASS |

## 10. 検証結果

- 対象 Design SHA-256: `f7853823f1401075e88e1c629c217052c4ef47e64babc22ffafb4259cd0212cd`。レビュー中に対象 Design を変更していない。
- 参照先: Specification、Specification Review 007、Requirements、Requirements Review 007、Concept、Concept Review 005、Design Review 001/002、Skill 資料の存在を確認した。
- 現行補助資料: `treasure-compass:sessions:v1`、`treasure-compass:grade`、`treasure-compass:members` と configured dataset 5件の存在を確認した。
- Markdown: 見出し、表、code fence、相対リンク、Finding の必須項目を確認した。
- `git diff --check`: レビュー作成前 PASS。レビュー作成後に再実行する。
- `pnpm lint`: SKIPPED。文書のみの変更で対象外。
- `pnpm test`: SKIPPED。文書のみの変更で対象外。
- `pnpm run build`: SKIPPED。文書のみの変更で対象外。
- Not validated: 実装、ブラウザ、実 master data、画像、実配備、性能、migration 実行結果。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | §1〜§2 が承認済み上流、対象、対象外、現行資産の位置付けを示す |
| 2. コンテキストと責任 | PASS | §3、§5、§7〜§8、§12 が component と trust boundary を分離。出典対応の局所不足は DR-007 |
| 3. 依存方向 | PASS | app、product domain、map core/UI、master-data の一方向依存を定義 |
| 4. 主要フローと失敗 | PASS | 起動から全消去までの flow と write failure を定義。補助情報不足分岐は DR-006 |
| 5. 状態・データ所有 | PASS | 三 root、preference、visit/progress、undo、snapshot の owner を定義 |
| 6. セキュリティ・整合性・運用境界 | PASS | strict validation、write-before-publish、stale 排除を定義。DR-005〜DR-007 は Major だが Critical blocker ではない |
| 7. 上流整合性と工程境界 | PASS | 外部機能の追加はない。DR-006 は局所的な上流契約の弱化、DR-008 は内部矛盾として記録 |
| 8. 下流実装可能性 | PASS | 主要責務は実装可能。DR-005〜DR-008 の修正で推測余地を除ける |

Critical の New / Open / Reopened は0件であるため、規定により最終 Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- DR-005〜DR-007 を未修正のまま実装すると、旧保存移行、経路継続、master provenance が実装・配備方式で分岐する。
- DR-008 は外部結果を変えないが、モノレポ移行前に package 名・配置の確定状態を揃える必要がある。
- Mob master、移動補助値、画像利用条件、変換 report は未検証であり、Design §6 と §14 の gate を通過するまで production data として扱えない。
- 具体的 URL 文字列は意図的な未決定事項であり、DR-005 の修正に URL 確定は不要である。

## 13. 自動変更

レビュー中は対象 Design、Specification、Requirements、Concept、コード、テスト、静的データ、画像、既存レビューを変更していない。本サイクルで新規作成したのは本レビュー成果物だけである。`MEMORY.md` の既存未コミット変更は Design Author / プロジェクト対話担当の成果であり、本レビューによる変更ではない。

## 14. 最終判定

**READY**

Critical 0 / Major 3 / Minor 1。DR-005〜DR-008 は New / Open。Design は Gate 上は Implementation へ進めるが、互換性、経路結果、master integrity の推測を残さないため、Major 3件を先に修正して再レビューすることを推奨する。
