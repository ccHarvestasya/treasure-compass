# Treasure Compass / Mob Compass Specification Review 014

## 1. レビュー対象

- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `5ec189d19e443f5fd26e0be04f50790bb0065ca9`
- 対象成果物: `docs/specification/specification.md`
- 対象 revision: Specification Author Revision 008
- 上流成果物: Requirements Author Revision 012
- 上流レビュー: `docs/reviews/requirements/requirements-review-012.md`（Gate: `READY`）
- レビュー範囲: Specification Revision 008 全体。特に Treasure の登録後の現在対象確立、リスト選択と現在対象の独立、独立した再生 control の非必須化、登録更新、next / back、保存失敗、永続化、受け入れ条件、および Requirements からの追跡を確認した。

## 2. 使用した根拠

- `AGENTS.md`
- `MEMORY.md`
- `.agents/skills/spec-review/SKILL.md`
- `.agents/skills/review-common/review-playbook.md`
- `.agents/skills/review-common/output-format.md`
- `.agents/skills/review-common/review-gates.md`
- `.agents/skills/spec-review/reviewers.md`
- `.agents/skills/review-common/security-checklist.md`
- `docs/requirements/requirements.md`（Requirements Author Revision 012）
- `docs/reviews/requirements/requirements-review-012.md`（`READY`）
- `docs/reviews/specification/specification-review-013.md`
- 補助的な追跡資料として `docs/design/design.md` Revision 008 および `docs/reviews/implementation/implementation-review-013.md`

Requirements Revision 012 と Requirements Review 012 を直接の規範的根拠とした。Design、Implementation、および Implementation Review は、外部契約を逆方向に正当化する根拠には使用していない。

## 3. レビュー結果

**READY**

Specification Revision 008 は、Requirements Revision 012 の Treasure UX 判断を観測可能かつ検証可能な外部契約へ具体化している。Critical および Major の未解決指摘はない。

| Severity | Count |
| -------- | ----: |
| Critical |     0 |
| Major    |     0 |
| Minor    |     1 |

Minor の SR-028 は、作成時点の上流状態を表す Status と参照資料が Requirements Revision 012 / Requirements Review 012 に追随していない traceability metadata の問題である。Specification 本文の契約、または今回の Review Gate を妨げない。

## 4. 総評

§4.3 / §4.3.1 は、登録または更新の成功後に現在対象が未設定なら更新後 playlist の先頭未完了 registration を現在対象にすること、未完了がなければ未設定のままにすること、既存の現在対象は登録だけでは切り替えないことを明確にする。登録はリスト選択を設定・変更せず、選択のみでは現在対象、完了、順序、地図別現在地点を変更しないため、Requirements の二つの利用者状態の独立性に適合する。

独立した再生 control を必須としない通常フローは §4.3.1 および SPC-AC-028 に明記され、再生中／一時停止中の保存状態を持たない契約も維持されている。Specification 内に残る「再生」は、対象を現在対象へ反映する操作の意味または保存状態を持たないことの説明であり、巡回開始専用 control の必須化ではない。

next / back は、未完了の現在対象、playlist を一周する次の未完了探索、最後の対象での現在対象解除、連続 next のみを一件ずつ戻す undo、選択を変更しないこと、no-op next が undo chain を失わせないことを引き続き定義する。登録時の現在対象自動確立は back の操作履歴へ含めず、既存の back の意味を曖昧にしていない。

登録更新は identity と既存参照を保持し、同地点更新では完了を維持し、別地点更新では完了を解除する。これは利用者から観測できる更新結果として十分に具体的であり、ID 割当や Coordinator / Domain の所有などの Design 判断を要求していない。

登録・更新、現在対象自動確立、route、保存および公開の失敗境界は、保存失敗時に公開状態を部分適用しない契約として整合している。今回の UX 判断は schemaVersion 3、復元、検証、migration、legacy cleanup、または route start point / map current location の意味を変更していない。Mob の登録、ソロ／パーティ、candidate exploration、route state に Treasure の自動確立規則は波及していない。

## 5. 指摘事項

### SR-028: 上流承認状態と参照資料が Revision 012 に追随していない

- Category: Traceability defect / metadata follow-up
- Severity: Minor
- Status: Open
- Location: Specification Status、文書前段の「上流基準」、および §15「参照資料」

**確認した事実**

Specification Revision 008 の Status は `UPSTREAM REQUIREMENTS UPDATE REQUIRED` を含み、文書前段の「上流基準」および §15 は Requirements Review 011 を参照している。一方、Requirements Author Revision 012 は今回の Treasure UX 判断を正式化済みであり、Requirements Review 012 は `READY` を判定している。

**問題**

この metadata は、現在の上流承認状態および直接の追跡根拠を正確に表していない。Specification 本文と SPC-AC-028 は Requirements Revision 012 に適合しているため、外部契約の不整合ではない。

**必要なフォローアップ**

次の Specification Author 更新で、Status から解消済みの blocking 表現を除き、文書前段の「上流基準」と §15 の Requirements Review 参照を Revision 012 に追随させる。本文の外部契約はこの metadata 更新のために変更しない。

**再確認条件**

Status と参照資料が Requirements Author Revision 012 および Requirements Review 012（`READY`）を正しく示し、今回確認した外部契約に意味上の変更がないこと。

## 6. 解消済み指摘

Specification Review 001〜013 の指摘は、現行 Specification Revision 008 を対象とする今回の確認で再オープンしない。特に、登録から巡回への接続、選択と現在対象の独立、独立再生 control の非必須化に関する旧前提は、Requirements Revision 012 と整合する現行契約へ置き換えられている。

Implementation Review 013 の IR-011〜IR-013 は、当時の上流成果物との差異を記録する履歴である。IR-011 および IR-012 に関係する外部契約は Revision 008 で確認した。IR-013 の registration workflow ownership は Design Review の対象であり、Specification の指摘にはしない。

## 7. 上流へのフィードバック

なし。Requirements Revision 012 と Requirements Review 012（`READY`）は、Specification Revision 008 が具体化する Treasure UX 判断の十分な規範的根拠になっている。

## 8. 保留した指摘

なし。

SR-028 は Requirements または外部契約の不足ではなく、後続の Specification Author による非ブロッキングの metadata 追随であるため、上流フィードバックや保留指摘には分類しない。

## 9. 対象範囲と追跡

| Requirements / Acceptance | 確認した Specification 契約                                                                                                                                  | 判定 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| REQ-T-001 / REQ-T-002     | 登録、playlist、選択、現在対象、地図表示を別状態として扱う §2、§4.2、§4.3                                                                                    | Pass |
| REQ-T-003 / REQ-T-006     | 登録更新時の identity、同地点／別地点、completion、参照保持の §4.3.1                                                                                         | Pass |
| REQ-T-007                 | 登録・更新成功後の現在対象自動確立、既存現在対象の維持、選択との独立、next / back、独立再生操作の非必須化、play / pause 保存状態なしの §2、§4.3.1、§9.1、§12 | Pass |
| REQ-P-001 / REQ-P-002     | current target、list selection、map current location の独立保存、復元、検証の §9.1〜§9.3                                                                     | Pass |
| REQ-L-006                 | save-before-publish と登録・更新・route を含む write-failure の原子性 §4.3.1、§9.3                                                                           | Pass |
| AC-028                    | SPC-AC-028 の自動確立、selection 非変更、既存 target 維持、next / back、独立 control 非必須                                                                  | Pass |

Treasure の自動確立規則は Mob の状態遷移または受け入れ条件へ追加されていない。Mob の各契約は対象外のまま維持される。

## 10. 検証結果

| 検証                                         | 結果                     | 備考                                                                                       |
| -------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| `git status --short`（開始時）               | PASS                     | 作業ツリーは clean だった。                                                                |
| `git diff --check`（開始時）                 | PASS                     | 既存差分に whitespace error はなかった。                                                   |
| Specification 全文の静的レビュー             | PASS                     | Requirements Revision 012、Requirements Review 012、および重点確認項目に照らして確認した。 |
| Requirements → Specification traceability    | PASS                     | §14 と SPC-AC-028 を含め、今回対象の Requirement / Acceptance との対応を確認した。         |
| Markdown / document validation               | PENDING                  | review artifact 作成後に実行する。                                                         |
| `pnpm lint` / `pnpm test` / `pnpm run build` | SKIPPED / NOT APPLICABLE | コード、設定、テスト、静的データは変更していない。                                         |

## 11. レビューゲート

`READY`

Critical の未解決指摘はなく、Major の未解決指摘もない。SR-028 は現行本文の外部契約や上流適合を変更しない Minor の traceability metadata follow-up であるため、Specification Review Gate を妨げない。

## 12. 残存リスクと未決定事項

- SR-028 の metadata が残る間、Specification Revision 008 を読む利用者は、上流 Requirements 更新が未解消であると誤認しうる。外部仕様の意味、保存形式、または利用者動作への影響はない。
- Design Revision 008 の registration workflow responsibility boundary は本レビューの対象外である。Specification Review の `READY` 後、正式な Design Review で評価する。
- Implementation の現行適合性は本 Specification Review の根拠ではなく、上流文書の正式化後に必要となる後続の Implementation Review で再評価する。

## 13. 自動変更

自動変更は行っていない。作成した成果物はこの Specification Review artifact のみであり、Requirements、Specification、Design、Implementation、Test、Requirements Review 012、および Implementation Review 013 は変更していない。

## 14. 最終判定

**READY**

Specification Author Revision 008 は、Requirements Author Revision 012 および Requirements Review 012（`READY`）に基づく正式な Specification としてレビュー可能であり、次の正式工程は Design Revision 008 の Design Review である。
