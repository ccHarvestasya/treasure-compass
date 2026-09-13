# Treasure Compass / Mob Compass Requirements Review 012

## 1. レビュー対象

- レビューサイクル: 012
- 確認日: 2026-09-13（Asia/Tokyo）
- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `e6aecc94c6773c9f06e1b94cd337f70cbb458c1a`
- 対象成果物: [Requirements](../../requirements/requirements.md) Revision 012
- 対象範囲: Requirements 全体。重点は `REQ-T-007`、`AC-028`、§9 の決定事項と Specification への引継ぎ、Traceability、および Treasure UX 更新が Mob 要求へ与える影響。
- 未確認範囲: Specification Revision 008、Design Revision 008、Implementation / Test、実ブラウザ挙動、配備、master data、画像および外部ライセンス。下流資料は今回のユーザー判断との追跡確認だけに用い、Requirements の根拠にはしていない。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。対象 revision、レビュー範囲、禁止事項および最新の Treasure UX 判断を確認した。
- `requirements-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`requirements-review/reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`。工程境界、Finding、Gate、14章形式を適用した。
- [Concept](../../concept/concept.md) と [Concept Review 005](../concept/concept-review-005.md)。Requirements の規範的上流として、連続した巡回、利用者による入力・進行、ゲーム状態との境界、Treasure / Mob の分離および v1 scope を確認した。Concept Review 005 の Gate は `READY`。
- [Requirements Review 011](requirements-review-011.md) と Requirements Review 001〜010。過去 RR-001〜RR-010 の状態、Revision 012 の変更前基準、ID と review 番号を確認した。
- Specification Revision 008、Design Revision 008、[Implementation Review 013](../implementation/implementation-review-013.md)。ユーザー判断が反映される前の下流差異と、今回の Requirements が下流実装から逆生成されていないことを補助確認した。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。New / Open / Reopened の Requirements-level Finding はない。Requirements Revision 012 は Specification Revision 008 の正式 Specification Review へ引き渡し可能である。

## 4. 総評

Revision 012 は、ユーザーが確定した Treasure UX 判断を Requirements の外部結果として適切に反映している。登録または地点更新により現在対象が未設定のときだけ巡回を開始可能にし、既存の現在対象を登録だけで切り替えず、リスト選択を現在対象・進捗・順序・現在地点から分離している。これは、登録から進行までを一つの連続体験として扱う Concept の価値と責任境界に整合する。

`REQ-T-007` と `AC-028` は、独立再生操作を必須にしないという製品判断を、利用者が観測できる登録後の結果、進行、戻る、および不要な再生状態を作らない制約として定義している。具体的な field、state transition の細部、保存方式、route 計算、package / domain / coordinator ownership を定めておらず、Specification / Design への境界を維持している。Mob の登録、モード、経路、B モブ探索、パーティ登録へ Treasure の現在対象規則を波及させる変更もない。

## 5. 指摘事項

なし。

## 6. 解消済み指摘

- RR-001〜RR-008: Resolved を維持。登録、経路、保存失敗、共通操作感、スマートフォンおよび工程境界に今回の UX 更新による回帰はない。
- RR-009: Resolved を維持。T / legacy R の採用境界は `REQ-A-003` / `REQ-A-004` と Acceptance で維持されている。
- RR-010: Resolved を維持。`REQ-T-004`、`REQ-Q-002`、AC-029 の利用者向け `Gxx` 不使用と確定対応表に回帰はない。

## 7. 上流へのフィードバック

なし。Concept は、登録・地図・順序・進行を利用者が扱う Treasure の連続体験、ゲーム状態を自動取得しない境界、および Treasure / Mob を無理に統合しない方針を定めており、Revision 012 の製品判断を評価するのに十分である。

## 8. 保留した指摘

- Specification: 登録後の現在対象確立、既存現在対象の維持、リスト選択と現在対象の正確な状態遷移、空・全件完了・取消・削除・保存失敗との併存、ならびに地図・案内の前面表示を定める。
- Design: 上記外部契約を変えず、state ownership、transaction、persistence、route projection および registration workflow の内部責務を定める。
- Implementation / Test: Specification / Design に適合する UX、保存失敗時の状態、回帰検証を実装・検証する。

## 9. 対象範囲と追跡

| 確認項目 | 根拠 | 結果 |
| --- | --- | --- |
| Concept との整合 | Concept §§1〜6、Concept Review 005 | PASS。連続体験、操作負荷、利用者入力、ゲーム非連携、Treasure / Mob 分離と整合する。 |
| `REQ-T-007` | 最新ユーザー判断、Concept、Requirements §4.3 | PASS。現在対象の自動確立条件、既存対象の維持、選択の独立、next / back、独立再生非必須を外部要求として定める。 |
| `AC-028` | `REQ-T-007`、`REQ-P-001`、`REQ-P-002` | PASS。初回／現在対象なし、既存対象あり、selection 非作成、next / back、再生状態非導入を観測可能に確認できる。 |
| 旧「再生」前提 | Requirements 全文の `再生` / `play` 検索 | PASS。再生 control 必須、再生なしでは開始不能、選択項目を再生で current target にする旧契約は残っていない。 |
| リスト選択と現在対象 | `REQ-T-007`、`REQ-D-003`、§9.1 | PASS。選択だけが current target、完了、順序、現在地点を変えず、登録による current target 確立と selection 作成を区別する。 |
| 既存現在対象の維持 | `REQ-T-007`、Concept の進行管理 | PASS。登録・更新が巡回中の利用者コンテキストを不用意に切り替えない。正確な例外・遷移は Specification へ委譲する。 |
| next / back | `REQ-T-007`、`REQ-P-001`、`REQ-P-002`、§9.1 | PASS。next の完了・進行、back の逐次取消、再生中／一時停止中の state を作らない要求を維持する。 |
| Requirements / Specification 境界 | Requirements §1、§9.2〜9.3 | PASS。内部 field、ID、helper、store、domain / coordinator、save-before-publish、route planner、schema、algorithm、package ownershipを要求化していない。 |
| Mob Requirements への影響 | `REQ-M-001`〜`REQ-M-008`、`REQ-P-003`〜`REQ-P-005`、`REQ-F-002`〜`REQ-F-004` | PASS。Treasure 固有の現在対象自動確立は Mob の登録、mode、route、B 探索、party 登録へ波及しない。 |
| Traceability | Requirements §10.1、AC-028 | PASS。Concept / 最新ユーザー判断 → `REQ-T-007` → `AC-028` → Specification handoff を追跡できる。Requirement ID と Acceptance ID の重複はない。 |

## 10. 検証結果

- `git status --short`（開始時）: PASS。作業ツリーは変更なし。
- `git diff --check`: PASS。
- Reviewed HEAD の Requirements 差分: `docs/requirements/requirements.md` のみ。Revision 012 の変更は Status、`REQ-T-007`、AC-028、§9.1〜9.2、§10.1 の UX 判断と追跡に限定される。
- ID 検査: Requirement ID の重複なし、Acceptance ID の重複なし、Acceptance 31 件。
- Markdown / link / 文書整合: PASS。Concept、Concept Review 005、過去 Requirements Review、下流参照の存在と §10.1 の追跡を確認した。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。Requirements Review の docs-only 作業であり、コード、設定、test、static data を変更していないため。
- 未確認: 下流実装の適合性、実ブラウザ、実配備、master data、画像および外部ライセンス。Requirements Review の対象外。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 上流整合性 | PASS | Concept の連続巡回、利用者責任、ゲーム非連携、Treasure / Mob 分離と整合する。 |
| 要求完全性 | PASS | Revision 012 の UX 判断に必要な登録後の現在対象、既存対象維持、selection 独立、next / back、独立再生非必須を定める。 |
| 外部観測可能性 | PASS | `REQ-T-007` と AC-028 が登録後、巡回中、selection、進行、取消の観測結果を定める。 |
| 責任・境界 | PASS | 利用者の登録・進行の責任を維持し、ゲーム自動連携、Mob の統合、内部 ownership を追加しない。 |
| 品質・安全性 | PASS | 保存失敗・無効入力・状態分離の既存要求を弱めず、今回の UX 判断から追加の security requirement は導かれない。 |
| Acceptance | PASS | AC-028 は REQ-T-007 と REQ-P-001 / REQ-P-002 を、実装手順に依存せず判定可能にする。 |
| 工程境界 | PASS | exact transition、field、schema、store、domain、package ownership を Specification / Design へ分離している。 |
| 未決定事項 | PASS | Requirements の製品判断と Specification 以降で定める詳細を §9.1〜9.3 で分離している。 |

Critical 0 のため、requirements-review Skill の規則に従い最終 Gate は **READY**。

## 12. 残存リスクと未決定事項

- Requirements Revision 012 は外部要求を定める。正確な状態遷移、境界操作、保存・復元、地図表示および error 結果は Specification Revision 008 の正式レビューで確認する必要がある。
- Implementation Review 013 の内部 ownership 論点は Requirements に持ち込まず、Design / Implementation の責務として扱う。
- 実装済みかどうか、実ブラウザでの操作可能性、実データ・画像・配備 origin は本レビューの根拠および対象外である。

## 13. 自動変更

`docs/reviews/requirements/requirements-review-012.md` を新規作成した。Requirements、Concept、Specification、Design、Implementation、Test、Implementation Review 013、設定および既存レビューは変更していない。commit / push は実施していない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。Requirements Revision 012 は、確定した Treasure UX 判断を Concept の範囲内で外部要求・Acceptance・下流引継ぎへ一貫して反映しており、次の正式工程である Specification Revision 008 の Specification Review へ進める。
