# Treasure Compass / Mob Compass Specification Review 002

## 1. レビュー対象

- Review cycle: 002
- 対象フェーズ: Specification
- 確認日: 2026-09-10（Asia/Tokyo）
- Reviewed branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `5914e7d832fd73adebd41f2e73d85faf8aa9d199`
- Starting HEAD: `5914e7d832fd73adebd41f2e73d85faf8aa9d199`
- 対象成果物: `docs/specification/specification.md`
- 対象版 SHA-256: `e29eaafa00f3ea21feab48c63bd83b224ca22c00d19a26c01f5ab3ede77d9799`
- 範囲: Treasure Compass / Mob Compass v1 の Specification 全体。Concept / Requirements との整合、Requirements → Specification handoff closure、入力経路、座標・正規化、Treasure / Mob の状態意味、ルート比較・同順位・計算不能、手動 / 自動 lifecycle、`MOB-COMPASS/1` の形式・世代・取り込み、保存・マスター更新、Acceptance / Traceability、工程境界を確認した。
- 未確認範囲: 実装、テスト、ブラウザ挙動、静的データの実値、画像の利用条件、外部サービスおよび実環境での保存・チャット互換性。これらは Specification の根拠や合否の成功扱いにはしていない。

Specification 本体、Concept、Requirements、過去レビュー資料は変更していない。今回変更対象としたのは本レビュー成果物だけである。

## 2. 使用した根拠

- ユーザー依頼。Reviewed HEAD、必須再確認論点 SR-001〜SR-007、全体レビュー範囲、Review Board の役割、変更禁止範囲、commit / push および検証条件を根拠とした。
- `AGENTS.md`。Source of Truth、Scope Discipline、文書工程境界、既存資料不変、docs-only の検証規則、Git / 報告規則を確認した。
- `.agents/skills/spec-review/SKILL.md`。Requirements → Specification handoff closure、外部契約と Design の分離、Two-implementation test、過剰仕様防止、重大度と手順を適用した。
- `.agents/skills/spec-review/review-gates.md`。7 Gate と、Critical の New / Open / Reopened が1件以上の場合 `REVISE SPECIFICATION` とする規則を適用した。
- `.agents/skills/spec-review/reviewers.md`。Reviewer A / B / C の担当範囲と Chair の候補統合基準を適用した。
- `.agents/skills/spec-review/output-format.md`、`.agents/skills/spec-review/security-checklist.md`。成果物の識別子・重大度・状態・形式、および該当する malformed / tampered / stale / replay / persistence / deterministic representation / compatibility 観点を適用した。
- `.agents/skills/review-common/review-playbook.md`、`.agents/skills/review-common/output-format.md`。根拠の優先順位、工程分類、重複統合、出力章順、未確認の扱いを適用した。
- `docs/concept/concept.md`。目的、対象ユーザー、v1 対象外、責任境界、Treasure の1対1、Mob の1対多、地点意味の分離、リーダー責任を確認した。
- `docs/requirements/requirements.md`。承認済み Requirements と Acceptance、特に REQ-F-004 / 006 / 008 / 012 / 014、REQ-D-001 / 005 / 007、REQ-S-001〜006、および §9.1 / §9.2 の引継ぎを確認した。Requirements baseline は `09a41c6b008a14a1cb03d6c3539e335dad1adb89`、現行ファイル SHA-256 は `b1629f2834c2884bc7bbdc4cd875997e2ba0cc69f0a8c6b608836668286582a0` である。
- `docs/reviews/requirements/requirements-review-005.md`。Requirements が Specification へ引渡し可能であり、ルート第一軸、同順位時の料金・ロード時間の扱い、地点意味、異常情報の外部結果が Requirements で確定済みであることを確認した。
- `docs/reviews/specification/specification-review-001.md`。履歴として確認した。対象版 SHA-256 は `88efe6df3ea25fae440a0e017f1a57ca23e2c852ce5e9e96004101dcdead9649` であり、変更していない。
- Reviewed Specification 全文。現在の外部契約、Acceptance、Traceability、Design / Implementation handoff、cycle 001 後の修正を検査対象として扱った。補助資料を正式根拠へ昇格していない。

## 3. レビュー結果

**REVISE SPECIFICATION**

Critical 4件（SR-002 Reopened、SR-008〜SR-010 New）、Major 2件（SR-011〜SR-012 New）、Minor 0件。SR-002 は通常経路の `run` / `revision` / `issued-at` 分離自体は解消しているが、全対象削除後も `run` を保持する仕様と、空状態への異なる `run` の初回取り込み規則の境界が閉じていないため、同じ根本問題の別形として Reopened とした。

`MOB-COMPASS/1` の通常入力経路、`revision` 世代、`issued-at` 時刻情報、保存破損の全体拒否、SR-003 の手動順序中未採用 Mob、同順位参照は修正を確認した。一方、複数行操作内の外部順序、案内の行間参照整合性、Requirements が委譲した高さの意味、計算不能な自動状態の案内表現、初回 mode が未確定である。これらは合理的な二実装で利用者可視結果または互換性結果が分岐するため、Specification を次工程へ確定済みとして渡せない。

## 4. 総評

Specification は、Concept と Requirements のスコープを逸脱せず、Treasure / Mob の対象対応、候補・採用・確認・完了の意味、マップ間遷移回数を第一軸とする Pareto 的な補助評価、同順位の決定的表示、手動順序中の遷移回数未確定、通常の Mob 複数行入力と正式な案内取り込みの分離を大部分で具体化している。

Review Board の独立確認は、次のとおりである。

- Reviewer A: 契約・handoff closure・決定性を確認し、同一複数行操作で受理した対象の相互順序が未定義である候補を提示した。
- Reviewer B: lifecycle・失敗回復・利用価値を確認し、計算不能な自動状態の案内出力可否と初回 mode の未定義を候補として提示した。通常入力後の route-selected については、5.2 / 7.1 が候補選択を自動ルート算出の結果として定めているため正式 finding にはしなかった。
- Reviewer C: Security / Interoperability を確認し、`item.order` の一意性・連続性、`item` と `candidate` の参照整合性が案内契約で明示されていない候補を提示した。`revision`、`issued-at`、encoding、block boundary、保存破損と master mismatch は追加 finding なしとした。
- Chair: 重複を統合し、上記の正式根拠、外部結果への影響、工程境界を再確認した。複数行順序、案内行間整合性、空周回の `run` 境界、高さの外部意味を採用し、実装方式の好みや一般的 hardening は採用していない。

## 5. 指摘事項

### SR-002 — Critical / Reopened / Open

- **Location**: `docs/specification/specification.md:302, 320, 351, 357, 365`
- **Evidence / Fact**: §8.1 は、全対象削除・全対象完了・再読み込みだけでは `run` を変更しないと定める。§9.1 は `run` と案内世代情報を保存する。一方、§8.2 は「異なる `run` の非空周回」を黙って上書きせず、空の現在状態への初回取り込みは案内の `run` を受理すると定める。保存された `run` だけが残る、全対象削除後または再読み込み後の状態が、この「空の現在状態」に該当するかは定義されていない。
- **Problem**: 同じ現在状態（対象は空だが、保存された `run` は `R1`）へ `run=R2` の案内を入力したとき、実装 A は空状態として案内を受理して `run` を `R2` へ置換し、実装 B は既存 `R1` の周回識別を保持して異なる `run` として拒否できる。周回の置換、stale / replay 境界、保存後の leader handoff 結果が一意でない。
- **Basis / upstream trace**: Requirements §9.2「古い、欠落した、または不正なチャット案内の扱い」、REQ-F-012、REQ-F-014、REQ-D-005。Specification §8.2 / §9.1 が外部 lifecycle を定める責務を持つ。これは run 生成アルゴリズムを要求する指摘ではない。
- **Why it matters**: 異なる周回の案内を、利用者の明示操作なしに受け入れるか拒否するかが分岐し、同一保存状態に対する import result、互換性、周回継続の責任境界が検証できない。
- **Required Change**: `run` が保持された対象空の状態を「初回取り込み可能な空状態」とみなす条件、または既存 `run` を持つ状態として異なる `run` を拒否する条件を外部契約として一意に定める。対象削除・reset・replace 後の `run` / 保存状態遷移もその条件と整合させる。run の生成方式は指定しない。
- **Retest / closure condition**: 同一 `run` の再読み込み、全対象削除、全対象完了、別 `run` 案内、明示的置換を組み合わせた同一ケースを二実装へ与え、受理 / 拒否、`run`、対象、revision、保存結果が一致し、明示操作なしの異周回上書きが発生しないこと。

### SR-008 — Critical / New / Open

- **Location**: `docs/specification/specification.md:92-109, 126, 251-253`
- **Evidence / Fact**: 複数行入力は各行を独立して解析し、受理された行だけを追加すると定め、手動順序中の新規対象は未完了手動順序の末尾へ追加すると定める。しかし、同一操作で複数の異なる行が受理された場合の相互順序（入力行順、または別の規則）が定義されていない。受理・拒否・重複の行別結果は示されるが、同一操作内の適用順序と、相互に衝突する行をどの順で判定するかも一意でない。
- **Problem**: 同じ Mob 複数行入力を手動順序中に与えた場合、実装 A は入力順 `[A, B]` のまま末尾へ追加し、実装 B は正規化識別子順 `[B, A]` などで追加できる。Treasure の複数行貼り付けでも、同一メンバーや同一候補の衝突処理順が異なり得る。手動順序、後続の案内 `item.order`、利用者可視の件数・重複結果が分岐する。
- **Basis / upstream trace**: REQ-F-008、REQ-D-001、REQ-D-007、Requirements §9.2 の「入力経路の正確な解析規則」「対象追加・重複・状態遷移」。SPC-AC-020 / 14.1 は通常入力の受理結果を追跡しているが、同一操作内の順序契約を閉じていない。
- **Why it matters**: 利用者が同じ貼り付けを行っても手動順序と次の案内の順序が変わり、Two-implementation test と外部決定性を満たせない。自動ルートの内部アルゴリズムを指定する問題ではない。
- **Required Change**: 同一複数行操作で受理された行の適用順序、行内の重複・相互衝突の判定順、受理・拒否・重複件数の外部結果を定める。通常入力の候補登録と、その後の自動ルート算出による route-selected の扱いは別状態として維持し、実装方式は指定しない。
- **Retest / closure condition**: 既存の自動 / 手動状態に対し、有効行、同一行重複、正規化後重複、Treasure の同一メンバー衝突、拒否行を含む同一入力を二実装へ与え、受理対象、候補集合、手動順序、件数、既存確認・完了状態、再算出結果が一致すること。

### SR-009 — Critical / New / Open

- **Location**: `docs/specification/specification.md:294-310, 314-324, 328-339`
- **Evidence / Fact**: `item.order` は未完了対象の表示順を1から始める値、item 行の出現順は意味を持たないと定めるが、未完了 item の order が一意かつ連続すること、完了 item を含む集合との対応、Mob ごとの item と candidate 行の対応、item の採用候補識別が同じ Mob の candidate 集合に存在することを明示していない。§8.2 の「行間整合性」および§8.1 の「候補行を欠いた item」の記述だけでは、dangling reference、重複 order、欠落 / 余分な item / candidate の拒否境界が一意にならない。
- **Problem**: 同じ malformed または tampered block に対し、実装 A は不正案内として全体拒否し、実装 B は重複 order を別の tie-break で並べ、または同じ Mob に属さない採用候補識別を保持して取り込める。route order、採用地点、import result、同一 revision の snapshot equality の扱いが分岐する。
- **Basis / upstream trace**: REQ-F-012、REQ-D-005、REQ-D-007、Requirements §9.2 の案内形式・必須項目・欠落 / 不正案内の扱い。SPC-AC-011 / 018 / 021 は完全な案内の一括取り込みと世代判定を要求するため、行間 integrity は Specification で閉じる必要がある。
- **Why it matters**: `item` 行順を無意味とした決定性の契約が、`order` 値と candidate 参照の不正入力で崩れる。改変された案内が別の対象・地点・順序として受理される可能性があり、fail-closed と相互運用性を外部から検証できない。
- **Required Change**: 外部契約として、未完了 order の一意な1..N対応、完了 item の order、item と candidate の Mob / candidate identifier の参照整合性、candidate identifier と map / 正規化座標の一致、欠落・余分・重複・dangling reference の全体拒否条件を明記する。意味上のスナップショット比較が同じ結果を返すことを維持し、parser の方式は指定しない。
- **Retest / closure condition**: 同一の有効 / 不正 block を二実装へ与え、LF / CRLF、candidate / item 行の並べ替え、重複 order、order の欠落・飛び、未存在採用候補、他 Mob の候補参照、余分な行を含む場合の拒否・無変更・atomicity が一致すること。有効 block では order と採用候補の復元結果が一致すること。

### SR-010 — Critical / New / Open

- **Location**: `docs/specification/specification.md:79, 86, 167, 199-211, 294-308, 375-384`
- **Evidence / Fact**: Requirements §9.2 は、ルート評価における地図・移動拠点・高さ・移動負荷の解釈を Specification へ委譲している。Specification は、高さ等がマスターで必須なら入力に必要とするが、高さが地点識別に含まれるか、候補比較・ルート評価にどう作用するか、保存・案内でどう表現するかを定めていない。候補識別は正規マップ識別子と X/Y の組み合わせとされ、`MOB-COMPASS/1` の candidate 行も map と X/Y だけを運ぶ。
- **Problem**: 高さが必要な同一 map / X/Y の候補または高さが経路評価に影響する状態について、実装 A は高さを候補 identity / route comparison / interchange に含め、実装 B は入力検証だけに使って無視または欠落として扱える。candidate selection、route result、保存復元、案内出力 / 取り込み結果が分岐する。
- **Basis / upstream trace**: Concept §7、Requirements §9.2 のルート評価・地図・移動拠点・高さ・移動負荷の引継ぎ、REQ-F-006、REQ-F-013、REQ-D-001、REQ-D-005、REQ-D-007。これは高さの具体的な実装方式を要求するものではなく、委譲された外部意味の未閉包である。
- **Why it matters**: 同じ外部データに対する Mob 候補の同一性、最短ルート、案内相互運用性を実装者・検証者が一意に判定できない。高さを含む地点を正式に扱う場合、現行 message 形式では同じ意味を完全に伝えられない。
- **Required Change**: 高さの外部意味（地点 identity、受理 / 未確認境界、ルート評価・同順位への影響、表示・保存・案内での表現）を Specification で一意に定める。高さをルート評価対象外とする場合も、そのことと必要時の保持・相互運用境界を明記する。内部座標変換や schema / parser の方式は指定しない。
- **Retest / closure condition**: 高さが異なる候補、同一 X/Y で高さだけ異なる候補、必要高さの欠落、マスター更新、案内の出力 / 取り込みを二実装へ与え、候補 identity、受理 / 未確認、route result、保存・message compatibility が一致すること。

### SR-011 — Major / New / Open

- **Location**: `docs/specification/specification.md:209, 231-235, 275-300, 308`
- **Evidence / Fact**: 補助値不足や対象不成立で自動ルートを計算不能とし、現在の自動ルートを無効化して最後の採用地点を過去の記録として扱う一方、案内の `item` は各 Mob に必須で `order` と採用候補識別を要求する。`transitions: unknown` は存在するが、計算不能な auto mode における item の order、採用候補 `none`、案内出力の可否および取り込み後の mode / 表示が定義されていない。
- **Problem**: 同じ計算不能状態に対し、実装 A は「現在の自動ルートがないため案内出力不可」とし、実装 B は `mode: auto`、`transitions: unknown`、何らかの対象順で出力できる。leader handoff と import result が分岐する。
- **Basis / upstream trace**: REQ-F-011、REQ-F-012、REQ-D-005、REQ-D-007、SPC-AC-010 / 011 / 013。これは案内を常に出力可能にする要求ではなく、計算不能時の外部結果を Specification で確定する要求である。
- **Why it matters**: stale な最後の採用地点を現在の route と誤って再配布する危険と、計算不能時の共有継続可否が実装ごとに変わる。形式上 valid な案内として出す場合の order / adopted-none の検証もできない。
- **Required Change**: 計算不能な auto state の案内を拒否する契約、または `order`、採用候補なし、`transitions: unknown`、未確認 / 計算対象外および取り込み後状態を表す契約のいずれかを外部結果として一意に定める。過去の採用地点を現在 route として再利用しない条件を保持する。
- **Retest / closure condition**: 補助値欠落、候補不成立、未知マスター、最後の採用地点が残る状態で、出力可否、出力内容、取り込み後の対象・order・adoption・mode・保存、既存状態の atomicity が二実装で一致すること。

### SR-012 — Major / New / Open

- **Location**: `docs/specification/specification.md:61-62, 142-148, 197-203, 239-261`
- **Evidence / Fact**: 自動ルートと手動順序の意味および、既存の自動 / 手動状態における追加・削除・完了・明示的な再計算は定義されている。しかし、空の状態へ最初の有効対象を登録したときの初期 mode、最初の自動再算出の契機、初回登録後に order / route を表示する条件が定義されていない。`run` の初回付与（Mob）も入力時の mode を定めない。
- **Problem**: 同じ空状態からの有効な Treasure / Mob 登録に対し、実装 A は自動ルートを直ちに算出し `mode: auto` とし、実装 B は手動 / 未算出状態で待機して明示的な再計算を要求できる。初回の利用者可視 route、遷移回数、案内 mode、次の追加順序が分岐する。
- **Basis / upstream trace**: REQ-F-006、REQ-F-007、REQ-F-008、Requirements §9.2 の状態遷移・再算出契機・結果の引継ぎ。SPC-AC-007 / 008 は追加後・手動中の結果を参照するが、空状態からの開始契機を閉じていない。
- **Why it matters**: 初回利用と reset / 空状態からの再開で、コア価値である route の確認可否と、後続の案内 `mode` が実装ごとに異なる。外部から route がまだ未算出なのか手動順序なのかを検証できない。
- **Required Change**: 空状態、初回有効登録、全完了後の追加、明示的 reset / reload 後について、初期 mode、再算出契機、route / order / transition の外部結果を定める。自動計算のアルゴリズムや UI 構成は指定しない。
- **Retest / closure condition**: 空状態から Treasure / Mob を各入力経路で登録し、全完了・全削除・再読み込み・追加を組み合わせたとき、mode、route、order、遷移回数、保存および案内出力結果が二実装で一致すること。

## 6. 解消済み指摘

| ID | Status | 確認結果 |
| --- | --- | --- |
| SR-001 | Resolved | 3 章で座標の意味・受理形式・正規化・拒否境界、6 章で route comparison / tie / calculation failure、8 章で message format / version / escape、9 章で persistence corruption result が外部契約化された。 |
| SR-002 | Reopened | `revision` / `issued-at` の分離と通常の `run` lifecycle は解消したが、保存された `run` だけが残る空状態と異なる `run` の初回取り込み境界が未閉包。詳細は §5。 |
| SR-003 | Resolved | 7.2:255-261 で、採用地点のない Mob を手動順序へ保持し、遷移回数を「未確定（採用地点未選択）」とし、明示的な最短ルート再計算まで候補を自動採用しない。 |
| SR-004 | Resolved | 9.2:359-367 で保存構造 / 整合性破損は全体拒否・空状態、master reference だけの不整合は周回情報を保持して未確認 / 計算対象外とする。 |
| SR-005 | Resolved | 3.1、3.2:71、92-107 で手動入力、Mob 通常複数行入力、Treasure パーティチャット貼り付け、master / map 選択、正式な `MOB-COMPASS/1` 取り込みを分離した。通常複数行入力を案内取り込みとして解釈しない。 |
| SR-006 | Resolved | 8.1:304-306、8.3:328-335、9.2:363 で `revision` を世代順、`issued-at` を出力時刻情報とし、出力時 +1、世代飛び、別リーダー再出力、保存 / 再読み込み継続、時計ずれ非依存を定めた。 |
| SR-007 | Resolved | 6.3:227 が 5.2 の決定的表示規則を参照し、5.2:179 の ASCII map id、数値 X/Y、Unicode code point の規則と一致した。 |

過去指摘を根拠なく新しい ID へ再発行していない。SR-002 のみ、同じ lifecycle root の未解消部分として Reopened とした。

## 7. 上流へのフィードバック

なし。Concept の目的・責任・対象外、および Requirements の意味・強さを変更する必要は確認されなかった。特に、第一軸をマップ間遷移回数とし、同順位時に料金とロード時間をいずれか一方へ常に寄せない判断、Mob の地点意味の分離、利用者の明示操作、共有周回のリーダー責任は上流のまま維持されている。SR-002、SR-008〜SR-012 は Requirements が Specification に委譲した外部契約または target Specification 内の境界欠落であり、Requirements へ新しい製品判断を差し戻していない。

## 8. 保留した指摘

正式な Deferred finding はなし。以下は、現在の Specification の外部契約を変更しない downstream handoff として妥当であり、今回の finding にはしていない。

- UI の画面構成、コンポーネント責務、入力欄・通知配置。
- parser の内部構造、検証関数の分割、探索アルゴリズム、グラフ表現、内部スコア、候補組み合わせのデータ構造。
- 保存キー、保存技術、シリアライズ内部表現、migration / deletion の実装。
- チャット生成・コピー・取り込みのモジュール構成。ただし、§8 の形式・encoding・世代・行間 integrity・失敗結果を満たす必要がある。
- マスターデータのファイル形式、内部 schema、配置、ロード、管理者向け公開手順。
- 具体的な fixture、操作手順、テストコード、ブラウザ検証。

これらを「Design に送った」ことだけで未閉包の外部契約を PASS としていない。SR-002、SR-008〜SR-012 の外部結果は Specification 修正対象である。

## 9. 対象範囲と追跡

| 根拠 / Requirement | Specification の確認箇所 | 判定 |
| --- | --- | --- |
| Concept §1〜§5、REQ-F-001〜005、REQ-S-001〜006 | 1〜5、10〜11 | 公開単位、Treasure 1:1、Mob 1:多、候補 / 確定 / 採用 / 確認 / 完了の意味、利用者・リーダー・マスター責任、対象外は整合。 |
| REQ-D-001 / REQ-D-007 | 3.1〜3.3、4〜5、10〜11、SPC-AC-015 / 020 | 座標、文字列 normalization、duplicate、unknown、malformed、master / map 選択、部分受理と全体拒否は大部分 closed。ただし複数行内の適用順序は SR-008、height semantics は SR-010。 |
| REQ-F-006 / REQ-F-007 | 6、7、SPC-AC-005 / 006 / 016 / 017 | 遷移回数第一、料金・ロード時間の Pareto 補助評価、tie、deterministic presentation、missing auxiliary values、candidate selection、manual unknown は closed。初回 mode は SR-012、height の評価意味は SR-010。 |
| REQ-F-008 / REQ-F-009 | 4、5.3、7、9 | add / delete / complete / sequential promotion / manual-vs-auto / explicit recalculation / retention は大部分 closed。batch application order は SR-008、空の retained run boundary は SR-002。 |
| REQ-F-011 / REQ-F-012 / REQ-D-005 | 8、11、SPC-AC-010 / 011 / 018 / 021 | block boundary、required fields、UTF-8 percent-encoding、run / revision / issued-at、stale / duplicate / conflict / newer、atomic import は closed。item / candidate cross-row integrity は SR-009、calculation-failure output は SR-011、retained run boundary は SR-002。 |
| REQ-F-014 | 9〜10、SPC-AC-012 / 019 / 021 | 保存対象、保持期間、reload、Treasure / Mob 非互換、破損全体拒否、master mismatch の全体保持・未確認化、revision 継続は closed。ただし保存された run だけが残る場合の異なる run 取り込みは SR-002。 |
| Requirements §9.2 の地図・移動拠点・高さ・移動負荷の引継ぎ | 3.1、6.1〜6.2、10.1 | 地図 / 拠点 / 通貨 / load の契約はあるが、高さの identity・評価・message / persistence 表現は未閉包（SR-010）。 |
| `docs/specification/specification.md` §12 / §14.1 | SPC-AC-001〜021、14.1 | Acceptance と Requirement ID の対応表は存在し、既存主要契約を追跡できる。ただし SPC-AC-020 / 021 が主張する一意な外部結果は SR-008〜SR-012 の不足部分を自動的には補完しない。 |

## 10. 検証結果

- `git rev-parse HEAD`: `5914e7d832fd73adebd41f2e73d85faf8aa9d199`。Reviewed HEAD と一致した。
- Reviewed Specification の SHA-256: `e29eaafa00f3ea21feab48c63bd83b224ca22c00d19a26c01f5ab3ede77d9799`。
- Requirements baseline と Concept / Requirements Review 005 の参照を確認した。Concept SHA-256 は `0fba67b9babbc6d0ca23f1198fa371c02a3d23981b5cfe3706f060715cc22864`、Requirements SHA-256 は `b1629f2834c2884bc7bbdc4cd875997e2ba0cc69f0a8c6b608836668286582a0` である。
- `docs/specification/specification.md`、`docs/reviews/specification/specification-review-001.md`、Concept、Requirements、Requirements Review 005、指定された Skill / review-common 資料を全文確認した。
- SR-001〜SR-007 を個別に再確認した。SR-001、SR-003〜SR-007 は Resolved、SR-002 は retained empty-run 境界のため Reopened とした。
- Reviewer A / B / C を独立に実行し、各 Reviewer は対象資料やソースを変更せず完了報告を返した。A は batch order、B は calculation-failure output / initial mode、C は案内 cross-row integrity の候補を提示した。Chair が根拠を再確認して統合・却下・追加判定した。
- Requirements → Specification handoff closure を、入力、状態遷移、ルート、案内、保存、マスター、Acceptance / Traceability の各項目で確認した。未閉包は SR-002、SR-008〜SR-012 として記録した。
- Two-implementation test は、座標 normalization、通常の route comparison / tie、SR-003、SR-004、通常の revision / issued-at、通常の master mismatch では外部結果の分岐を確認しなかった。SR-002、SR-008、SR-009、SR-010、SR-011、SR-012 の同一入力 / 状態では、受理・拒否、順序、candidate selection、route / message、mode、保存または import result が分岐する合理的な二実装を構成できたため Fail とした。
- Security / Interoperability checklist は、外部入力、malformed / tampered / stale / replay、fail-closed、atomic import、persistence / recovery、deterministic representation、compatibility / versioning に適用した。認証、権限、暗号学的真正性の要求は Concept / Requirements に根拠がなく、finding 化していない。
- `git diff --check`: 成果物作成後に実行し、PASS を確認した。
- `pnpm lint`: SKIPPED。docs-only であり、コード・設定・テストを変更していない。
- `pnpm test`: SKIPPED。docs-only であり、コード・設定・テストを変更していない。
- `pnpm run build`: SKIPPED。docs-only であり、コード・設定・テストを変更していない。
- 実装、ユニットテスト、ブラウザ、静的 JSON、画像、実データの正確性、実環境での保存 / チャット互換性: Not validated。これらを Specification の合否根拠や成功扱いにはしていない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Concept の目的、利用者、v1 対象外、リーダー / マスター / ゲーム状態の責任境界を維持している。未承認の参加者画面、同期、認証、外部サービスを追加していない。 |
| 2. 要件追跡と契約（handoff closure） | FAIL | Requirements が Specification に委譲した batch order、height semantics、初回 mode、計算不能案内、案内行間 integrity、retained empty-run import が一意に閉じていない（SR-002、SR-008〜SR-012）。 |
| 3. 処理と例外 | FAIL | malformed / tampered guide の order / reference 結果、計算不能 auto state の出力可否、空状態からの初回遷移、異なる run の取り込み結果が合理的な二実装で分岐する。 |
| 4. 内部整合性 | FAIL | 全対象削除後も `run` を保持する規則と「空状態への異なる run の初回取り込み」の境界が不明であり、案内 item / candidate 整合性と高さ表現にも未定義が残る。 |
| 5. 検証可能性 | FAIL | 同一外部入力・状態から手動順序、candidate selection、route result、message import、mode、保存結果を一意に期待できない。 |
| 6. 安全性・信頼境界・相互運用性 | FAIL | 未整合な案内の fail-closed 境界、異周回 replay / replacement、決定的 order / reference、必要高さの相互運用表現が一意でない。一般的 security hardening の不足ではなく、対象に適用される外部契約の不足による。 |
| 7. 上流整合性と工程境界 | FAIL | Concept / Requirements の目的・強さは維持しているが、外部結果を決める未閉包事項を Design / Implementation へ安全に委譲できる状態ではない。内部 parser、アルゴリズム、保存技術、UI 構成自体の handoff は妥当。 |

Gate 規則上、Critical の New / Open / Reopened が4件あるため、最終判定は `REVISE SPECIFICATION` である。Major だけで不合格にしたものではない。

## 12. 残存リスクと未決定事項

- `run` の生成アルゴリズム自体、保存キー、parser、探索方式、内部候補表現は Design / Implementation の責務として残る。ただし、SR-002、SR-009、SR-010 が定める外部結果を変更してはならない。
- 高さを扱うマスターデータが実際に存在するか、現行実装がどのように保持するかは未確認である。これは SR-010 を無効にする根拠にはせず、Requirements の正式な引継ぎに対する Specification closure の問題として扱った。
- 計算不能時に案内出力を許可するか拒否するか、初回 mode を自動 / 手動のどちらにするか、異なる run の retained empty state を拒否 / 置換のどちらにするかは、Chair が製品判断を代行せず、Specification Author が外部契約として確定すべき事項である。
- チャット案内は暗号学的な真正性や認証を提供する契約ではない。Concept / Requirements に根拠がないため、その追加を残存要求や finding としていない。

## 13. 自動変更

レビュー中の Specification、Concept、Requirements、前段レビュー、Skill、Design、Implementation、source code、tests、README、静的データ、画像への変更はない。

自動変更: なし。新規に作成したレビュー成果物は `docs/reviews/specification/specification-review-002.md` のみである。

## 14. 最終判定

**REVISE SPECIFICATION**

Critical 4 / Major 2 / Minor 0。SR-001、SR-003〜SR-007 は Resolved、SR-002 は retained empty-run の境界で Reopened、SR-008〜SR-010 は Critical New、SR-011〜SR-012 は Major New / Open である。Requirements → Specification handoff closure と Two-implementation test は未完了であり、Design handoff は内部方式に限って妥当、次工程へは Specification の修正・再レビュー後に進むべきである。
