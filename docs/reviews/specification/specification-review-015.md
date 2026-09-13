# Treasure Compass / Mob Compass Specification Review 015

## 1. レビュー対象

- レビューサイクル: 015
- 確認日: 2026-09-13（Asia/Tokyo）
- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `e214282a269cff4c1a3b449c4c156b488f7c0a3e`
- 対象成果物: [Specification](../../specification/specification.md) — Specification Author Revision 009
- 規範的上流: Requirements Author Revision 013、[Requirements Review 013](../requirements/requirements-review-013.md)（`READY`）
- 対象範囲: Specification Revision 009 全体。重点は responsive contract、member identity / parser、町名ラベル geometry、既存 Revision 008 の Treasure 状態・保存・route・unresolved 契約、Mob 分離、Acceptance / Traceability。
- 未確認範囲: Implementation / Test、実ブラウザ表示、静的 master、画像、localStorage 実データ、配備 origin、出典・ライセンスおよび Design Revision 009 の適合性。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。Reviewed HEAD、レビュー範囲、IR-014〜IR-016 の製品判断および禁止事項を確認した。
- `spec-review` Skill と、`review-common/review-playbook.md`、`review-common/output-format.md`、`spec-review/reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`。Specification の工程境界、追跡性、観測可能性、two-implementation test、重大度および Gate を適用した。
- [Requirements Revision 013](../../requirements/requirements.md) と [Requirements Review 013](../requirements/requirements-review-013.md)。手動登録、広幅一括入力、狭幅での入口省略、320 CSS px の主要操作、member identity 境界および Specification handoff の規範的根拠として確認した。Requirements Review 013 は `READY`。
- [Concept](../../concept/concept.md) と [Concept Review 005](../concept/concept-review-005.md)。連続した巡回体験、スマートフォン対応、ゲーム状態との責任境界、Treasure / Mob 分離を補助確認した。Concept Review 005 は `READY`。
- Specification Review 001〜014。前回の外部契約、SR-025〜SR-028 の解消状態、Revision 008 の Treasure 契約およびレビュー番号を確認した。
- Implementation Review 014 と現行実装。IR-014〜IR-016 の背景、明白な回帰および実現可能性を補助確認した。実装から新しい Specification contract は逆生成していない。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 1。SR-029 は Revision 009 の上流承認参照に関する非ブロッキング metadata finding であり、外部契約の意味および Gate を妨げない。

## 4. 総評

Specification Revision 009 は、Requirements Revision 013 の製品判断を観測可能かつ検証可能な外部契約へ具体化している。§3.2、§4.1、§4.2、§11 および SPC-AC-003 / 018 / 027 は、手動登録を全対象レイアウトで提供し、広い画面では一括入力を提供し、狭い画面では一括入力 control を省略しても手動登録から基本的な登録・巡回・進行を完了できることを定めている。responsive 差異を domain または保存状態にしていないことも一貫している。

member identity は、前置装飾を除外した後に trim と Unicode NFC を適用し、対応 marker を `★☆●▲◆♥♠♣◇♦♡○□△▽` に限定している。先頭の FFXIV private-use-area glyph を一つ扱い、その後の marker を連続除去し、任意の Unicode symbol や名前本体の通常文字を推測削除しない契約が入力、拒否結果、適合条件および検証引継ぎへ反映されている。

町名ラベルは width `8n + 24` CSS px、height 24 CSS px、22 CSS px の offset / gap、8方向、viewport 内、正の面積による衝突、edge touch 非衝突、最大8件、stable ID / candidate order、全アイコン表示・ラベルのみ省略、normal / point-selection 同一規則として閉じている。旧 `8n + 16`、`4 CSS px` の規範記述および狭幅でも一括入力を必須とする契約は残っていない。

既存の currentTarget / listSelection、next / back、保存・migration、route、unresolved reference、Treasure / Mob 分離の契約に不要な変更はない。parser の内部実装、state ownership、保存技術、コンポーネント構成および具体的なテストコードは Design / Implementation へ適切に委譲されている。

## 5. 指摘事項

### SR-029: Revision 013 の上流承認状態が Specification metadata に反映されていない

- Category: Traceability defect / metadata follow-up
- Severity: Minor
- Status: New
- Location: Specification 冒頭の Status、上流基準、および §15「参照資料と未確認範囲」

**確認した事実**

Specification Author Revision 009 の Status は「正式 Specification Review 待ち」として妥当だが、上流基準は `Requirements Revision 013（Requirements Review 待ち）` と記載し、§15 は `Requirements Review 012` を「前回承認根拠」として参照している。一方、Requirements Revision 013 は Requirements Review 013 で `READY` である。

**問題**

文書 metadata が現在の直接上流の承認状態と追跡根拠を正確に示さず、Specification Revision 009 が未承認上流に依存しているように読める。本文、SPC-AC、外部契約および今回の Gate の意味を変更する問題ではない。

**必要なフォローアップ**

次の Specification Author 更新で、上流基準を Requirements Revision 013 / Requirements Review 013（`READY`）へ追随させ、§15 の承認根拠を Requirements Review 013 に更新する。Revision 009 の外部契約を変更する必要はない。

**再確認条件**

Status の上流記載と §15 の参照が Requirements Revision 013 および Requirements Review 013（`READY`）を示し、今回確認した responsive、parser、geometry、Treasure、Mob および persistence 契約に意味上の変更がないこと。

## 6. 解消済み指摘

- Specification Review 001〜013 の既存指摘は、Revision 009 の本文および SPC-AC で再オープンしない。特に SR-025 / SR-026 / SR-027 の current target、末尾 next / back、保存・migration 契約は維持されている。
- SR-028（Revision 008 の Requirements Review 012 metadata）は前回の follow-up で解消済みと扱う。今回の SR-029 は Revision 009 が新しい Requirements Revision 013 を参照する際の新規 metadata 不整合であり、過去 finding を機械的に再利用していない。
- Implementation Review 014 の IR-014〜IR-016 は、現行 Requirements 013 に反映された製品判断として確認した。旧実装差異をそのまま Specification finding へ継承していない。

## 7. 上流へのフィードバック

なし。Requirements Revision 013 と Requirements Review 013（`READY`）は、今回の responsive、member identity、geometry の外部契約を評価するのに十分である。製品判断を上流へ戻す必要はない。

## 8. 保留した指摘

- Design: parser、responsive presentation、route projection、状態所有、保存 adapter、migration decoder およびラベル配置の内部責務・アルゴリズムを、外部契約を変えずに定める。
- Implementation / Test: 320 CSS px 以上の各 layout、実際の marker / PUA 入力、ラベル配置、currentTarget / listSelection、next / back、persistence、migration、unresolved、normal / point-selection の実動作を検証する。
- Static master / image / deployment: T / R 境界、stable ID、画像の埋め込み表示除去、出典・利用条件、実 origin の適合を後続工程で確認する。

これらは Specification の外部契約として既に閉じているか、下流で確認する事項であり、追加の Specification finding にはしない。

## 9. 対象範囲と追跡

| Requirements / Acceptance | 確認した Specification 契約 | 判定 |
| --- | --- | --- |
| `REQ-T-001` / `REQ-T-002` / `REQ-Q-001`、`AC-003` / `AC-018` / `AC-027` | §3.2、§4.1〜4.2、§11、SPC-AC-003 / 018 / 027。手動登録は全対象レイアウト、一括入力は広い画面、狭幅は入口省略可能、基本体験完了、responsive 差異非永続化。 | PASS |
| `REQ-T-001`、`REQ-D-005` / `REQ-D-006`、`AC-003` | §4.1〜4.2。前置装飾を identity から除外し、marker 集合、先頭 PUA glyph、連続 marker、trim、NFC、推測削除禁止、空結果拒否を規定。 | PASS |
| `REQ-F-006` / `REQ-F-007`、`AC-022` / `AC-023` | §4.4、§10.1〜10.2、SPC-AC-022 / 023。width `8n + 24`、height 24、22 offset / gap、8方向、viewport、正の面積、edge touch 非衝突、最大8件、stable ID / candidate order、全アイコン表示、ラベルのみ省略、両表示同一規則。 | PASS |
| `REQ-T-007`、`REQ-P-001` / `REQ-P-002`、`AC-028` | §2、§4.3〜4.3.1、§8、§9、SPC-AC-028。currentTarget / listSelection 独立、登録後自動確立、既存 target 維持、next / back、独立再生 control 非必須、domain play / pause 非導入。 | PASS |
| `REQ-L-001`〜`REQ-L-006`、`REQ-D-002`、`AC-014` / `AC-017` / `AC-021` | §9、§12、§13。v3、legacy migration、破損拒否、unresolved 区別、保存失敗の外部原子性、clear 範囲を維持。 | PASS |
| Mob requirements、`AC-001` / `AC-002` / `AC-005`〜`AC-007` | §1〜§3、§5〜§8。Treasure の responsive、identity、geometry を Mob のモード、登録、B 探索、party、route、persistence へ波及させない。 | PASS |
| Requirements → Specification traceability | §14 の全 Requirement mapping、§12 の SPC-AC-001〜031、今回の SPC-AC-003 / 018 / 023 / 027 | PASS。Requirements 59件、Acceptance 31件、Specification Acceptance 31件の ID 重複なし。 |

## 10. 検証結果

- `git status --short`（開始時）: PASS。作業ツリーは clean だった。
- `git diff --check`: PASS。
- `docs/specification/specification.md` の SHA-256: `949ddb2cfc01351f10558dbab3529e39b076614e9b77a3324e4bec6ec9800be0`。
- 要求 ID 59件、Acceptance ID 31件、Specification Acceptance ID 31件を確認し、集合内の重複はない。
- Requirements Revision 013、Requirements Review 013、Concept、Concept Review 005、既存 Specification Reviews および本文の相対参照先の存在を確認した。
- 旧 geometry `8n + 16`、`4 CSS px` の規範記述および狭幅一括入力必須の記述は、全文検索で確認されなかった。`8n + 24`、24 CSS px、22 CSS px、8方向、衝突・上限・決定性は §4.4、§10.2、SPC-AC-023、§13.2 に現れる。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。文書レビューであり、コード・設定・テスト・静的データを変更していないため。
- Implementation、実ブラウザ、実 localStorage、master data、画像、配備 origin、出典・ライセンスおよび Design Revision 009 の適合性: Not validated。後続工程で確認する。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Treasure / Mob の対象、連続体験、responsive、対象外および責任境界が Requirements / Concept と一致する。 |
| 2. 要件追跡と契約 | PASS | Requirements 013 が委譲した responsive、identity、parser、geometry、状態、保存および error 契約が本文・SPC-AC・§14で閉じている。 |
| 3. 処理と例外 | PASS | parser の不正・曖昧・空結果、ラベル配置不能・衝突・上限、保存失敗、migration、unresolved、next / back 境界を一意に判定できる。 |
| 4. 内部整合性 | PASS | 旧 geometry、狭幅一括入力必須、currentTarget / listSelection、通常地図 / point-selection の規則に矛盾はない。 |
| 5. 検証可能性 | PASS | SPC-AC-003 / 018 / 023 / 027 および §13.2 が第三者の外部検証条件を定める。 |
| 6. 安全性・信頼境界・相互運用性 | PASS | チャット・master・保存を未信頼入力として扱い、推測削除、未知・破損・未解決参照の正常採用、部分保存を禁止する外部結果を維持する。 |
| 7. 上流整合性と工程境界 | PASS | Requirements Revision 013 の意味を変えず、parser の実装方式、state ownership、保存媒体、UI 部品、アルゴリズムは下流へ委譲している。SR-029 は metadata のみ。 |

Critical 0 / Major 0 / Minor 1。Critical の未解決指摘はなく、spec-review Skill の規則に従い最終 Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- SR-029 の metadata が残る間、Specification Revision 009 の上流承認状態を誤認させる可能性がある。ただし外部契約、実装可能性および Gate の意味には影響しない。
- 実際の responsive layout、FFXIV private-use-area glyph の入力形態、marker の Unicode 入力、町名フォント描画、viewport 変換および画像上の重複は下流検証が必要である。
- Design Revision 009 の内部責務・依存・transaction boundary、現行 Implementation / Test の適合性、master data および配備 origin は本レビューでは判定していない。

## 13. 自動変更

なし。Specification、Requirements、Design、Implementation、Test、既存レビュー、README、設定、master data および画像は変更していない。本サイクルで作成した変更はこのレビュー成果物のみであり、commit / push は実施していない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 1（SR-029 metadata follow-up）。Specification Revision 009 は Requirements Revision 013 / Requirements Review 013（`READY`）の responsive、member identity / parser、町名ラベル geometry および既存 Treasure / Mob 外部契約を観測可能・検証可能に具体化しており、Design Revision 009 の正式レビューへ進める。
