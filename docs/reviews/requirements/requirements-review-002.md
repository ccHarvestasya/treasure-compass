# Requirements Review 002: Treasure Compass / Mob Compass

## 1. レビュー対象

- レビューサイクル: 002
- 対象成果物: `docs/requirements/requirements.md`
- 対象フェーズ: Requirements
- 確認日: 2026-09-10（Asia/Tokyo）
- 対象版: Author 修正後の作業ツリー上の未コミット・未追跡ドラフト
- 対象範囲: 全文。特に、ユーザー依頼に対応する `REQ-Q-003` / `AC-017`、`REQ-S-007` / `AC-018`、未決定事項、Acceptance、追跡性、工程境界を確認した。
- 前回資料: `docs/reviews/requirements/requirements-review-001.md`（履歴資料として不変、変更していない）
- 未確認範囲: GitHub の認証が必要な個別の「Security and quality」指摘、実装、テスト、静的データ、画像、外部資料、実際のブラウザ挙動、マスターデータの正確性・利用条件。個別指摘の内容・severity・ID・件数・解消状態は主張しない。

## 2. 使用した根拠

- ユーザー依頼: 「要件定義にテストできる箇所のカバレッジを90%以上に設定。githubのSecurity and qualityで指摘されている項目も解消することを盛り込む」
- 承認済み上流成果物: `docs/concept/concept.md`。目的、利用者、v1、対象外、責任境界、マップ間移動方針を確認した。
- 対象成果物: `docs/requirements/requirements.md`。前回レビュー後の全体と今回の追加差分を確認した。
- 前回レビュー: `docs/reviews/requirements/requirements-review-001.md`。`RR-001`～`RR-003` の履歴状態を確認した。
- 補助資料: `docs/concept/requirements-notes.md`（TEMPORARY / NON-NORMATIVE）。上流と矛盾しない未決定事項の照合に限定して使用した。
- プロジェクト指針: `AGENTS.md`。文書フェーズ、Scope Discipline、セキュリティ、文書検証、既存変更保持の規則を確認した。
- レビュー手順: `requirements-review` Skill、`review-common/review-playbook.md`、`requirements-review/review-gates.md`、`output-format.md`、`reviewers.md`、`security-checklist.md`。

## 3. レビュー結果

`READY`

Critical 0 / Major 3 / Minor 0。前回の `RR-001` / `RR-002` は Resolved、`RR-003` は Open のまま継続した。今回、`REQ-Q-003` と `REQ-S-007` はユーザー依頼へ追跡でき、受入条件と後工程への引継ぎも追加されている。新規の `RR-004` / `RR-005` は外部判定の厳密さを高める Major の任意改善であり、Critical ではないため Gate は `READY` とする。

## 4. 総評

今回の修正により、テスト可能な Requirement のカバレッジを90%以上とする要求が `REQ-Q-003` / `AC-017` に、GitHub の「Security and quality」に表示される指摘を台帳化し、解消証跡を残し、受入・公開時に未解消を残さない要求が `REQ-S-007` / `AC-018` に追加された。両方ともユーザー依頼から直接追跡でき、90%の閾値、外部から確認可能な証跡、未確認を解消済みとしない境界が明記されている。

一方、`REQ-Q-003` は分母へ入れる Requirement の分類を全 Requirement に対する完全な二分としていないため、テスト可能な Requirement を意図せず分母外にできる余地がある。また、`REQ-S-007` は依頼文の「指摘されている項目」より狭い `actionable` という語を使っているが、対象範囲・分類を Requirements で確定していない。いずれも下流で明確化できるが、受入判定の再現性を高めるには補足が望ましい。

## 5. 指摘事項

### RR-004 — Major — New（任意改善）

- 対象箇所: `docs/requirements/requirements.md:179-181, 235, 264`
- 事実: `REQ-Q-003` / `AC-017` は「テスト可能と分類した Requirement」を分母とし、テスト可能でないものを分母から除外した理由を残すとしている。しかし、全 Requirement ID がテスト可能 / テスト不可能のいずれかへ一度ずつ分類されること、分類されなかった Requirement を分母へ含めないこと、分母が0の場合を不合格とすることは明記されていない。
- 根拠: ユーザー依頼は「テストできる箇所のカバレッジを90%以上に設定」である。Requirements の Acceptance は、外部から同じ分母・分子を再現できる必要がある。
- 影響: 下流でテスト可能な Requirement の一部を分類対象から外したり、分母0を別扱いしたりしても、一覧と除外理由が存在する限り90%以上と判定できる余地がある。測定値が「テストできる箇所」のカバレッジを表さず、受入判定が実施主体により分岐する。
- 最小修正: すべての Requirement ID をテスト可能 / テスト不可能のどちらかへ分類し、完全な一覧を分母・除外一覧へ反映すること、および分母0または未分類を90%達成として扱わないことを `REQ-Q-003` / `AC-017` に明記する。分類規則、追跡形式、測定手順、具体的なテスト手段は後工程へ残せる。
- 再確認条件: 全 Requirement ID の分類が確認でき、分母・分子・除外理由が相互に追跡でき、未分類または分母0を成功扱いしない受入条件になっていること。

### RR-005 — Major — New（任意改善）

- 対象箇所: `docs/requirements/requirements.md:209-211, 236, 265, 303`
- 事実: `REQ-S-007` / `AC-018` は GitHub の「Security and quality」に表示される `actionable` な指摘を対象とするが、依頼文は同欄で「指摘されている項目」の解消を求めている。Requirements では `actionable` の判定主体・対象範囲・該当しない表示項目の扱いを確定していない。個別指摘を取得していないこと自体は明記されているが、取得後にどの項目を台帳の母集団へ含めるかは異なる解釈が可能である。
- 根拠: ユーザー依頼、および `REQ-S-007` / `AC-018` の外部受入条件。GitHub の個別指摘は認証不備のため確認できず、具体的な指摘内容を根拠にはしていない。
- 影響: 同じ GitHub 表示でも、実施主体により `actionable` ではないとして項目を台帳・解消判定から除外できる。依頼が意図する対象をすべて確認したか、未解消ゼロかを Requirements だけで一意に判定できない。
- 最小修正: GitHub「Security and quality」の全表示項目を対象とするのか、`actionable` のみを対象とするのかを Requirements で明示し、後者なら除外条件と未分類・取得不能項目を未解消として扱う境界を定める。個別指摘の severity、ID、担当、期限、証跡の具体形式は取得後の下流へ残せる。
- 再確認条件: 対象リポジトリと確認時点の母集団、対象項目の分類、取得不能・未分類の扱い、各項目の解消証跡、受入・公開時の未解消判定が `REQ-S-007` / `AC-018` から一意に追跡できること。

## 6. 解消済み指摘

### RR-001 — Resolved（前回から継続確認）

`REQ-F-006` は登録された現在の対象集合から算出し、第一軸を異なるマップへの遷移回数の最小化、同数時の補助評価をテレポ料金・ロード時間とする要求へ展開されている。`REQ-Q-002`、`AC-005`、`AC-015` も同じ判断原則へ追跡でき、前回の Critical 条件は解消されている。

### RR-002 — Resolved（前回から継続確認）

`REQ-D-007` / `AC-016` により、空・不正・不完全・未知の入力、欠落・不正なマスターデータを有効な対象・位置情報として扱わず、処理不能または未確認であることを識別でき、誤ったルート算出・進行更新を防ぐ外部要求が維持されている。

### RR-003 — Open（前回から継続）

同じマップ遷移回数の候補を比較する際のテレポ料金とロード時間の方向・優先関係は `REQ-F-006` / `REQ-Q-002` / `AC-005` / `AC-015` でなお補助的評価に留まり、詳細な比較方法を下流へ委譲している。前回同様、Critical ではないため任意改善として残す。

## 7. 上流へのフィードバック

- `docs/concept/concept.md:9, 95` は、リネーム後の `./treasure-compass-mob-compass-requirements-notes.md` を参照しており、現行の `docs/concept/requirements-notes.md` と一致しない。Requirements の直接リンクは正しいため、Requirements の Finding ではなく、上流資料の文書整合性フィードバックである。
- 既存 Concept Review 資料の旧ファイル名は履歴情報として保持されている。現行参照として更新するかは管理者判断とする。

## 8. 保留した指摘

- `REQ-Q-003` の分類規則、Requirement と自動テスト / 自動検証の追跡形式、測定手順、証跡保存は Specification / Test へ引き継げる。ただし RR-004 の完全分類・分母0境界は Requirements で補足すると再現性が高まる。
- `REQ-S-007` の個別 GitHub 指摘、severity、ID、担当、期限、解消証跡の形式は、実際に取得できた情報を確認した後の下流工程へ引き継げる。取得不能を解消済みとしない境界は既に Requirements にある。
- ルートの評価式、入力形式、保存、チャット形式、状態遷移、アルゴリズム、テストコード等は前回同様、Specification / Design / Implementation / Test の責務であり、Requirements Finding にはしない。
- 応答時間、可用性、対応環境、同時利用者数等の数値品質目標は上流根拠がないため未要求とする。

## 9. 対象範囲と追跡

| 根拠 | 対応 Requirements | 対応 Acceptance | 判定 |
| --- | --- | --- | --- |
| Concept の目的、マップ間移動、テレポ負担 | `REQ-F-001`, `REQ-F-006`, `REQ-F-007`, `REQ-Q-001`, `REQ-Q-002` | `AC-001`, `AC-005`, `AC-006`, `AC-015` | 上流整合。RR-001 Resolved、RR-003 Open |
| Concept の対象ユーザー、利用場面、v1、対象外 | `REQ-F-002`–`REQ-F-014`, `REQ-S-003` | `AC-002`–`AC-016` | 追跡可能。対象外の拡張なし |
| Concept の責任境界・判断原則 | `REQ-D-003`, `REQ-D-007`, `REQ-S-001`–`REQ-S-006` | `AC-012`–`AC-016` | RR-002 Resolved |
| ユーザー依頼: テスト可能箇所の90%カバレッジ | `REQ-Q-003` | `AC-017` | 直接追跡可能。RR-004 Major 任意改善 |
| ユーザー依頼: GitHub Security and quality の指摘解消 | `REQ-S-007` | `AC-018` | 直接追跡可能。個別指摘は未確認。RR-005 Major 任意改善 |

## 10. 検証結果

- `requirements-review` Skill および指定された review-common / requirements-review の参照資料を確認した。
- `AGENTS.md`、Concept、Requirements、検討メモ、前回 Requirements Review を確認した。
- `REQ-Q-003` / `AC-017`、`REQ-S-007` / `AC-018`、ユーザー依頼からの追跡、Acceptance 参照、工程境界を手動確認した。
- Markdown 構成、Requirement / Acceptance ID の参照、Requirements から Concept への内部リンクを確認した。
- `git diff --check`: PASS（レビュー資料作成前の対象差分）。
- 既存 `docs/reviews/requirements/requirements-review-001.md` の SHA-1 はレビュー前後で不変として確認した。前回資料は変更していない。
- 変更範囲: Author の対象差分は `docs/requirements/requirements.md` のみ。Reviewer はレビュー資料以外を変更していない。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED。docs の Requirements レビューであり、コード変更を伴わないため対象外。
- GitHub の個別「Security and quality」指摘: Not validated。認証不備により取得しておらず、個別内容・件数・severity・ID・解消状態を成功扱いにしていない。
- README、実装、テスト、静的データ、画像、ブラウザ挙動、マスターデータの正確性・利用条件: Not validated。Requirements の根拠または対象範囲外として成功扱いにしていない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 上流整合性 | PASS | Concept の目的、対象、v1、対象外、責任境界を維持し、ユーザー依頼の2項目も Requirements に直接追跡されている。 |
| 2. 要求完全性 | PASS | 既存の巡回・進行・責任境界に加え、90%カバレッジと GitHub 指摘解消の要求・Acceptance・引継ぎが追加されている。RR-004 / RR-005 は Major 任意改善。 |
| 3. 外部観測可能性 | PASS（条件付き） | `AC-017` はカバレッジの一覧・計算・証跡を、`AC-018` は台帳・解消証跡・未解消ゼロを要求する。分類の完全性と GitHub 対象範囲に RR-004 / RR-005 が残る。 |
| 4. 責任・境界 | PASS | テストカバレッジの証跡責任と、GitHub 指摘を未確認のまま解消済みとしない境界が定義されている。個別 GitHub 責任者等は下流へ委譲されている。 |
| 5. 品質・安全性 | PASS | `REQ-Q-003` は検証可能性と外部証跡、`REQ-S-007` は品質指摘の解消証跡を要求する。Security checklist の一般論を追加の Finding にはしていない。 |
| 6. Acceptance | PASS（条件付き） | `AC-017` / `AC-018` は依頼へ追跡でき、外部確認可能な成果物を指定する。完全分類・対象母集団の定義は RR-004 / RR-005 として残る。 |
| 7. 工程境界 | PASS | 具体的なテストコード、GitHub 個別指摘、台帳フォーマット、解析規則、アルゴリズムを Requirements で発明せず下流へ送っている。 |
| 8. 未決定事項 | PASS | 90%閾値、未確認を解消済みとしないこと、各 Acceptance は確定し、分類規則・追跡形式・個別指摘項目は後工程へ分離されている。 |

## 12. 残存リスクと未決定事項

- RR-004 が未対応の場合、テスト可能 Requirement の完全な母集団と分母0の扱いが下流の分類運用に委ねられ、90%という数値の比較可能性が下がる。
- RR-005 が未対応の場合、`actionable` の対象範囲が実施主体の解釈に依存し、GitHub に表示された指摘をすべて解消したかの受入判定が分岐する。
- GitHub 個別指摘は未取得であり、台帳の内容・severity・ID・件数・解消状態は未決定である。未確認を成功扱いにしていない。
- RR-003、Mob Compass の候補状態、チャット案内の契約、保存・保持・互換性、マスターデータの具体契約は前回から下流へ残っている。
- Concept の旧リンクは上流資料側の文書整合性問題として継続している。

## 13. 自動変更

なし。`docs/requirements/requirements.md`、Concept、検討メモ、README、コード、テスト、設定、既存レビュー資料は変更していない。作成したのは本レビュー資料のみである。

## 14. 最終判定

**READY**

Critical は0件。前回 `RR-001` / `RR-002` は Resolved、`RR-003` は Open の任意改善として追跡した。今回の `RR-004` / `RR-005` も Major の任意改善であり、90%カバレッジおよび GitHub Security and quality 指摘解消の要求自体はユーザー依頼、Requirement、Acceptance、下流引継ぎへ追跡可能である。`requirements-review` Skill の Gate 規則により、Critical 0 のため最終判定は `READY` とする。
