# Treasure Compass / Mob Compass Requirements Review 013

## 1. レビュー対象

- レビューサイクル: 013
- 確認日: 2026-09-13（Asia/Tokyo）
- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `0992441c16a14827cd2237e65fe75b3f040db70a`
- 対象成果物: [Requirements](../../requirements/requirements.md) — Requirements Author Revision 013
- 対象範囲: Requirements 全体。重点は `REQ-T-001` / `REQ-T-002`、`REQ-Q-001`、`AC-003` / `AC-018` / `AC-027`、狭幅レイアウト、一括入力入口、チャット名の前置装飾、工程境界、Mob への影響および Traceability。
- 未確認範囲: Specification、Design、Implementation / Test、実ブラウザ挙動、配備、master data、画像および外部ライセンスの適合性。下流資料は引継ぎ可能性と明白な矛盾の確認に限って参照した。

## 2. 使用した根拠

- ユーザー依頼、`AGENTS.md`、`MEMORY.md`。Reviewed HEAD、変更背景、禁止事項および最新の製品判断を確認した。
- `requirements-review` Skill と、`review-common/review-playbook.md`、`review-common/output-format.md`、`requirements-review/reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`。Requirements の工程境界、Finding 分類、重大度、Gate および成果物形式を適用した。
- [Concept](../../concept/concept.md) と [Concept Review 005](../concept/concept-review-005.md)。目的、対象ユーザー、連続した Treasure 体験、スマートフォン対応、ゲーム状態との責任境界、Treasure / Mob の分離および v1 scope の規範的根拠として確認した。Concept Review 005 は `READY`。
- Requirements Review 001〜012。過去 Finding の状態、Revision 012 からの変更範囲、要求 ID / Acceptance ID および既存 Traceability を確認した。Requirements Review 012 は `READY`。
- `docs/requirements/requirements.md` Revision 013 の全体、変更差分および関連する Specification / Design の引継ぎ記述。後続文書は Requirements の根拠へ逆生成せず、境界確認にのみ使用した。
- Implementation Review 014。変更背景である IR-014〜IR-016 と今回のユーザー確定判断の対応を補助確認した。実装の存在は新しい Requirement の根拠にしていない。

## 3. レビュー結果

**READY**

Critical 0 / Major 0 / Minor 0。New / Open / Reopened の Requirements-level Finding はない。Requirements Revision 013 は Specification Revision 009 の正式レビューへ引き渡し可能である。

## 4. 総評

Revision 013 は、実操作で確定した三つの製品判断を Requirements の外部契約として適切に反映している。Treasure の手動登録を全対象レイアウトで利用可能とし、広い画面では一括入力を同じ巡回リストへ提供し、狭い画面では一括入力入口を省略しても登録から巡回・進行を完了できる。これは Concept の操作負荷を抑えた連続体験とスマートフォン対応に整合する。

チャット由来の名前については、前置装飾を member identity に含めず、名前本体の文字を推測削除しないという外部結果だけを定め、marker、glyph、trim、Unicode NFC などの具体規則を Specification へ委譲している。REQ-T-001、REQ-Q-001、AC-003、AC-018、AC-027 および §9 / §10 の引継ぎは、この工程の抽象度を維持している。Mob の登録対象、モード、経路、B モブ探索およびパーティ登録へ Treasure の判断を波及させる記述もない。

## 5. 指摘事項

なし。

## 6. 解消済み指摘

- RR-001〜RR-010: Resolved を維持。既存の登録、経路、保存失敗、共通操作感、スマートフォン、動的エーテライトおよび表示分類の要求に Revision 013 による回帰はない。
- Requirements Review 011〜012: `READY` を維持。Revision 012 の登録後 current target、自動進行、リスト選択との独立性および独立再生非必須の要求は維持され、今回のレスポンシブ／名前装飾更新で弱められていない。

## 7. 上流へのフィードバック

なし。Concept と Concept Review 005 は、既存 Treasure を継続しつつ利用者入力で登録・地図・巡回・進行を扱うこと、スマートフォンで主要操作を可能にすること、ゲーム状態を自動取得しないこと、Treasure と Mob を分離することを定めており、Revision 013 の判断を評価するのに十分である。

## 8. 保留した指摘

- Specification: 320 CSS px 以上の各 responsive layout における正確な主要操作、狭幅で省略される一括入力入口、手動入力の入口・構文・失敗結果、チャット名の具体的な marker / glyph / trim / NFC 判定を定める。
- Design: 上記外部契約を変えず、responsive presentation、parser、member identity 正規化および保存・状態遷移の内部責務を定める。
- Implementation / Test: 各 layout の実操作、一括入力省略時の手動登録経路、名前 identity、既存リストへの統合および Mob 非波及を検証する。

これらは後続工程で決める詳細であり、Requirements の不足としては扱わない。

## 9. 対象範囲と追跡

| 確認項目 | 根拠 | 結果 |
| --- | --- | --- |
| Concept との整合 | Concept §§1〜6、Concept Review 005 | PASS。連続した Treasure 体験、操作負荷の抑制、スマートフォン対応、利用者入力、ゲーム非連携、Treasure / Mob 分離と整合する。 |
| `REQ-T-001` / `REQ-T-002` | Revision 013、Concept の Treasure 利用場面 | PASS。手動登録を全対象レイアウトで可能とし、広い画面の一括入力を同じ集合へ反映し、狭幅で入口を省略しても基本体験を完了できる。登録単位、必須名、最大 8 人およびプレイリストの外部結果も維持する。 |
| `REQ-Q-001` | Concept のスマートフォン成功状態、AC-018 | PASS。幅 320 CSS px 以上で提供される主要操作を利用でき、Treasure の手動登録・地点選択・経路確認・完了・取消・全消去は全対象レイアウトで利用できる。一括入力は狭幅の必須操作として扱わない。 |
| `AC-003` / `AC-018` / `AC-027` | 対応 Requirement、§10.1 | PASS。手動／広幅一括の利用範囲、狭幅での完了可能性、responsive layout を保存状態にしないことを外部から判定できる。 |
| 名前の前置装飾 | `REQ-T-001`、`REQ-D-005` / `REQ-D-006`、AC-003 | PASS。装飾を identity に含めないことと、名前本体を推測削除しないことを外部結果として定義し、具体的な判定規則を Specification に委譲している。過剰な parser 実装指定ではない。 |
| 旧「一括入力必須」前提 | Requirements 全文検索、Revision 012 との差分 | PASS。狭幅でも一括入力を必須とする旧契約は除去され、広幅での提供と狭幅での省略許容に一貫して更新されている。 |
| 「再生」旧前提 | Requirements 全文検索 | PASS。独立再生操作必須、再生なしでは開始不能、選択項目を再生操作で現在対象にする旧契約は残っていない。既存の next / back と再生状態非導入は維持される。 |
| Requirements / Specification 境界 | §1、§9.2〜9.3 | PASS。具体的な CSS geometry、marker 集合、glyph 判定、trim / NFC 順序、parser、field、schema、store、domain、algorithm、test procedure は後工程へ委譲されている。 |
| Mob への影響 | `REQ-M-001`〜`REQ-M-008`、`REQ-P-003`〜`REQ-P-005`、`REQ-F-002`〜`REQ-F-004` | PASS。Treasure の responsive 入口と member identity 判断は Mob の登録対象、モード、経路、B モブ探索、パーティ登録および状態分離を変更しない。 |
| Traceability | §10.1、AC-003 / AC-018 / AC-027 | PASS。Concept / User Decision → `REQ-T-001` / `REQ-T-002` / `REQ-Q-001` → Acceptance → Specification handoff を追跡できる。全 Requirement 59 件、Acceptance 31 件で ID の重複はない。 |

## 10. 検証結果

- Reviewed HEAD は `0992441c16a14827cd2237e65fe75b3f040db70a` と確認した。
- `git status --short`（レビュー開始時）: PASS。作業ツリーは変更なし。
- `git diff --check`: PASS。
- Revision 013 の変更差分を確認し、対象成果物の変更は `docs/requirements/requirements.md` に限定されること、狭幅一括入力、全対象レイアウト手動登録、320 CSS px、前置装飾および対応 Acceptance / Traceability / 引継ぎが整合していることを確認した。
- Requirements ID 59 件、Acceptance ID 31 件を確認し、重複はない。Requirements の相対リンク（Concept、Concept Review、MEMORY、README）の参照先は存在する。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。Requirements とレビュー成果物のみの文書レビューで、コード・設定・テスト・静的データを変更していないため。
- Implementation、実ブラウザ、実配備、master data、画像、外部ライセンス、Specification Revision 009 の適合性: Not validated。本レビューの対象外または後続工程で確認する。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 上流整合性 | PASS | Concept の連続体験、スマートフォン対応、利用者責任、ゲーム非連携、Treasure / Mob 分離と整合する。 |
| 要求完全性 | PASS | Revision 013 の responsive 登録判断と名前 identity の外部結果が、既存 Treasure 要求を弱めずに定義されている。 |
| 外部観測可能性 | PASS | REQ-T-001 / REQ-T-002 / REQ-Q-001 と AC-003 / AC-018 / AC-027 が、各 layout で提供される登録経路と結果を判定可能にする。 |
| 責任・境界 | PASS | 利用者、チャット由来入力、マスター、Treasure / Mob アプリの責任境界を維持し、チャット自動連携や Mob への波及を追加していない。 |
| 品質・安全性 | PASS | 名前の誤同一視を避け、入力・保存の既存の不正／未知情報境界を弱めていない。今回の判断から追加の認証・外部通信等の要求は導かれない。 |
| Acceptance | PASS | 更新された Acceptance は手動登録、広幅一括入力、狭幅での基本体験完了、名前 identity を外部から確認でき、実装手順に依存しない。 |
| 工程境界 | PASS | parser の具体判定、CSS geometry、UI 部品、store、schema、algorithm およびテスト手順を Specification / Design / Implementation / Test へ分離している。 |
| 未決定事項 | PASS | Requirements で確定した製品判断と、後工程で定める responsive、parser、保存・状態遷移の詳細が §9.1〜9.3 で分離されている。 |

Critical 0 / Major 0 / Minor 0。Gate failure に該当する Finding はなく、requirements-review Skill の規則に従い最終 Gate は `READY` とする。

## 12. 残存リスクと未決定事項

- 320 CSS px 以上の各 layout で「提供される主要操作」をどの UI 配置・表示条件で満たすかは Specification / Design / Implementation / Test で具体化する必要がある。一括入力の省略は必須操作不足と扱わない境界を維持する。
- 前置装飾の対応 marker、先頭 glyph、trim、Unicode NFC および正規化順序は Specification で定める必要がある。Requirements が名前本体を推測削除しないという外部結果を変更してはならない。
- 一括入力の正確な構文、曖昧行、競合、保存失敗および既存リスト統合は後続 Specification で確認する。
- 実装・テスト・実ブラウザでの responsive 操作、parser identity、既存保存互換性および Mob 非波及は未検証である。

## 13. 自動変更

なし。`docs/requirements/requirements.md`、Concept、Specification、Design、Implementation、Test、既存レビュー、設定および README は変更していない。本サイクルで作成した変更は本レビュー成果物のみであり、commit / push は実施していない。

## 14. 最終判定

**READY**

Critical 0 / Major 0 / Minor 0。Requirements Revision 013 は、確定した狭幅一括入力省略、全対象レイアウト手動登録、320 CSS px の主要操作、チャット名の前置装飾 identity 境界を Concept の範囲内で外部要求・Acceptance・Specification 引継ぎへ一貫して反映している。Mob 要求への不要な影響および Requirements / Specification 境界の違反はなく、次の正式工程である Specification Revision 009 のレビューへ進める。
