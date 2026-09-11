# Treasure Compass / Mob Compass Specification Review 008

## 1. レビュー対象

- レビューサイクル: 008（動的エーテライト表示・将来ローカライズ境界反映後の全体再レビュー）
- 対象フェーズ: Specification
- 確認日: 2026-09-12（Asia/Tokyo）
- ブランチ: `maintenance/add-mob-compass`
- 対象成果物: `docs/specification/specification.md`
- 対象 Specification SHA-256: `984e3e4f9083f4128a5219ee8d234cad65394704bdfd4d0ea751b62e01996e9b`
- 承認済み Requirements HEAD: `1211d936d48f8070b0e0c4566004b5f3dd6a0301f`
- 承認済み Requirements SHA-256: `30f91a210b44bc2e69422d6d807ac678e7b6ca52fa669301308bc7618554cba0`
- 前回レビュー資料（不変）: `docs/reviews/specification/specification-review-007.md`
- 前回レビュー対象 SHA-256: `41532625c37c181007b836fdb68a8ee1f8b1c38f11ff7ca601f3540d9b209a24`
- レビュー範囲: Specification 全文、Requirements handoff、動的エーテライト表示、共通地図情報、`division=T` / legacy `division=R` 境界、画像との重複除去、非操作性、初期日本語・将来ローカライズ境界、既存契約の回帰、two-implementation test、工程境界、安全性・相互運用性。
- 未確認範囲: 実装、テスト、静的マスターデータの実値、地図画像の編集結果、ブラウザ表示、マスターデータの正確性・完全性、出典・ライセンスの実査、仕様を実現する Design の実装可能性。

## 2. 使用した根拠

- 最新のユーザー判断: 通常地図・地点選択表示での全有効エーテライトの継続表示、実座標へのアイコン配置、町名ラベルの近接・重なり回避、コネクタ線なし、狭い・過密な表示でのアイコン優先、案内表示の非操作性、共通地図情報、検証済み `division=T` のみの採用、legacy `division=R` の不使用、背景画像との重複除去、既存アイコン資産の出典・利用条件確認、新しいラベルデザイン、初期日本語・将来ローカライズ境界。
- 承認済み上流: `docs/requirements/requirements.md` と `docs/reviews/requirements/requirements-review-009.md`。Requirements の外部要求、Acceptance、Specification への明示的 handoff、責任境界を確認した。
- 上流コンセプト: `docs/concept/concept.md` と `docs/reviews/concept/concept-review-005.md`。目的、利用者、v1 範囲、対象外、責任境界との整合を確認した。
- レビュー対象: `docs/specification/specification.md` 全文。外部契約、適合条件、traceability、下流引継ぎおよび未決定事項を検査した。
- 前回レビュー: `docs/reviews/specification/specification-review-007.md`。SR-019〜SR-023 の解消条件と過去の状態を確認した。前回資料は編集していない。
- 下流文脈: `docs/design/design.md`。Specification の外部契約との明白な矛盾および適切な Design handoff の確認に限って参照した。Design の内部方式を Specification の根拠へ逆輸入していない。
- 既存利用者向け契約・作業指針: `README.md`、`AGENTS.md`。既存 Treasure の継続範囲と文書レビューの検証境界を確認した。
- レビュー手順: `.agents/skills/spec-review/SKILL.md`、`reviewers.md`、`review-gates.md`、`output-format.md`、`security-checklist.md`、`.agents/skills/review-common/review-playbook.md` および `output-format.md`。

## 3. レビュー結果

**REVISE SPECIFICATION**

Critical 1 / Major 0 / Minor 0。`SPC-OPEN-001` は Requirements が Specification での定義を明示的に求めている事項を上流へ再委譲しているため、Critical の New finding とする。ラベルの製品上の具体値をレビュアーが補完するものではなく、仕様著者による外部契約の確定と再レビューが必要である。

## 4. 総評

新規追加された動的エーテライト表示の主要境界は、通常地図・地点選択表示の双方、全有効エーテライト、共通地図情報、実座標、画像背景化、`division=T` のみの採用、legacy `division=R` の除外、非操作性および初期日本語境界として概ね Requirements へ追跡できる。既存の Treasure 入力・互換性、Mob 登録、経路・順序、進行・取消、保存・復元・失敗、スマートフォンおよび工程境界にも、前回レビューからの回帰は確認されなかった。

ただし、§13.3 の `SPC-OPEN-001` は「ラベルの近接範囲・表示領域・省略対象・表示上限・同率時の優先順位」を未決定のまま上流確認へ戻している。承認済み `REQ-F-007` は、正確な配置・回避規則・表示上限を Specification で定義することを明記し、Requirements §9.2 も同じ事項を Specification handoff としている。したがって、これは上流の製品判断不足ではなく、現 Specification の handoff closure 不足である。

## 5. 指摘事項

### SR-024 — エーテライト町名ラベルの外部配置・省略契約が未確定

- Severity: Critical
- Status: New
- Location: §4.4、§10.2、§12 の `SPC-AC-023`、§13.3 の `SPC-OPEN-001`、§15
- Evidence / Fact: §4.4 はラベルをアイコンの近くへ置き、他ラベルと重ならないよう移動でき、過密時には一部を省略・非表示にできると定めるが、「近く」の範囲、重なり判定に含める表示領域、配置候補または同等の決定規則、省略対象・表示上限・同率時の優先順位を定めていない。§13.3 はこれらを Requirements の利用者判断だけでは一意に決まらないとして upstream clarification へ再委譲している。
- Problem: `REQ-F-007` は正確な配置・回避規則・表示上限を Specification で定義するよう明示し、Requirements §9.2 も同項目を Specification へ引き継いでいる。現状では同じマップ、同じ座標、同じ viewport に対し、合理的な二実装が異なるラベル位置・非表示対象・表示数を選んでも適合し得る。
- 根拠: `REQ-F-007`、`AC-023`、Requirements §9.2 のエーテライト案内表示 handoff、`REQ-D-003` の識別可能性、`docs/specification/specification.md` §4.4・§13.3。
- Why it matters: 町名ラベルが「近接」か、ラベル同士が「重ならない」か、過密時にどの町名を表示するかを利用者・実装者・検証者が同じ結果として判定できない。`SPC-AC-023` の受入可否と、実装間の表示決定性を検証できず、主要な新規表示機能を安全に Design / Implementation へ引き渡せない。
- Required Change: 製品判断をレビュアーが補完せず、Specification に、(1) アイコン座標を固定したままラベルが満たすべき近接範囲または許容単位、(2) ラベルの表示領域と重なりの判定、(3) 複数の配置候補がある場合の決定規則、(4) 全ラベルを置けない場合の表示上限・省略対象・同率時の優先順位、および (5) 通常地図・地点選択表示と狭い・過密な viewport で同じ入力から導ける外部結果を定義する。確定内容を §4.4、§10.2、`SPC-AC-023`、§13.3、§15 の未決定記録・追跡へ一致させ、既存のアイコン優先、コネクタ線なし、非操作性および画像非重複の境界を維持する。
- 再確認条件: 同じ有効エーテライト集合、マップ座標、表示領域および viewport を与えたとき、二つの合理的な実装が、ラベルの近接・重なり判定、配置または省略対象・表示数について同じ許容範囲内の結果を導けること。全アイコンが実座標に残り、コネクタ線がなく、ラベルの非表示時も周回状態が変化しないことを併せて確認できること。

## 6. 解消済み指摘

前回レビュー資料を変更せず、SR-019〜SR-023 の状態を今回の対象版で確認した。

| Finding ID | 状態 | 今回の確認 |
| --- | --- | --- |
| SR-019 | Resolved（継続確認） | §6.2 の料金・ロード時間が相反する同率候補に対し、同率表示と規定タプル列による採用経路の決定規則がある。 |
| SR-020 | Resolved（継続確認） | §3.1、§5.2、§7.1〜7.2 で初回の自動順序、手動順序への一般モブ追加時の候補選択および候補固定が定義されている。 |
| SR-021 | Resolved（継続確認） | §5.4 と §7.2 で、ソロ／パーティ、一般／B／A 以上の対象単位削除と候補・進捗・順序・現在地点への結果が定義されている。 |
| SR-022 | Resolved（継続確認） | §4.1 で、未完了地点の訂正と完了済み地点の置換後を区別し、後者を未完了の新地点として扱うことが定義されている。 |
| SR-023 | Resolved（継続確認） | §4.2 と §10.1〜10.2 で、指定記号の集合・省略可否、未知記号の扱い、非負かつ地図別範囲内の座標境界が定義されている。 |

過去 SR-001〜SR-018 のうち現 Requirements に継承された経路、保存破損、保存失敗および既存 Treasure 互換性の契約にも回帰は確認されなかった。`SPC-OPEN-001` は SR-019〜SR-023 の解消事項とは異なる新規の handoff closure 問題であり、重複計上していない。

## 7. 上流へのフィードバック

なし。`REQ-F-007` と Requirements §9.2 は、ラベルの正確な配置・回避規則・表示上限を Specification で定義することを明示しているため、`SPC-OPEN-001` は Requirements / Concept の不足ではなく、Specification の正式な指摘として扱う。レビュアーは近接距離や優先順位の具体値を決定していない。

## 8. 保留した指摘

正式な Deferred finding はなし。次の事項は Specification の外部契約を置き換えるものではなく、下流で確認・実現する事項として引き継ぐ。

- 実装、ブラウザ表示、レスポンシブ挙動、地図画像の編集結果および動的表示の実装適合性。
- T レコードの実値、参照整合性、共通地図情報への統合結果、legacy `division=R` の実データ除外、範囲外・町名なし等の実際の検証結果。
- G8、G10、G12、G14、G17 の全対応マップ画像が背景のみとなっていること、動的表示との重複がないこと。
- エーテライト視覚資産の採否、出典・利用条件および画像編集結果。仕様にある採用条件を満たすことを後続工程で確認する。
- 初期日本語名称のデータ整合および将来の言語別名称データの実体。v1 の英語等の翻訳、多言語 UI、Mob 名称・別名・検索語の多言語照合は対象外である。
- 具体的な JSON 配置、内部状態、保存媒体、UI 部品、ラベル配置の実現方式、ライブラリ、テストコードおよび画像編集手段。`SPC-OPEN-001` の外部契約が確定した後も、内部方式は Design / Implementation の責務とする。

## 9. 対象範囲と追跡

| 確認対象 | 上流根拠 | Specification | 判定 |
| --- | --- | --- | --- |
| 別アプリ・状態境界・Mob モード | REQ-F-001〜REQ-F-005、REQ-L-001〜REQ-L-005 | §1、§3、§9 | PASS |
| Treasure 登録・入力・既存互換性 | REQ-T-001〜REQ-T-003、REQ-Q-002 | §3.2、§4、§9.2 | PASS（SR-022、SR-023 解消継続） |
| Mob 登録・対象単位削除 | REQ-M-001〜REQ-M-008、REQ-D-001 | §5 | PASS（SR-021 解消継続） |
| 自動経路・手動順序 | REQ-R-001〜REQ-R-008 | §6、§7 | PASS（SR-019、SR-020 解消継続） |
| 完了・取消・B モブ探索 | REQ-P-001〜REQ-P-005 | §7.3、§8 | PASS |
| 保存・復元・消去・保存失敗 | REQ-L-001〜REQ-L-006 | §3.1、§9 | PASS |
| 共通地図情報・T / legacy R 境界 | REQ-A-003〜REQ-A-004、REQ-D-002、REQ-S-005 | §2、§6.3、§10.1〜10.2 | PASS |
| 動的エーテライト表示・画像非重複・非操作性 | REQ-F-006〜REQ-F-008、REQ-A-003〜REQ-A-004 | §2、§3.3、§4.4、§10、§12 | SR-024（ラベル詳細契約未完） |
| 初期日本語・将来ローカライズ境界 | REQ-D-004、REQ-T-001、REQ-Q-002 | §10.3、§12、§15 | PASS |
| スマートフォン表示 | REQ-Q-001 | §11 | PASS |
| 責任・対象外・安全性境界 | REQ-S-001〜REQ-S-005 | §1.2、§8、§10 | PASS |

### Review Board の観点別確認

- Reviewer A（契約の明確性・完全性）: 53 Requirements と 25 Acceptance の追跡、入力・出力・状態・validation・error、同率・順序・互換性を確認した。動的ラベルの具体的配置・省略だけは `REQ-F-007` の明示 handoff に対して閉じていないため SR-024 とした。
- Reviewer B（利用価値・運用適合性）: 通常地図・地点選択表示で全有効エーテライトを継続表示し、案内表示を周回操作から分離する利用結果を確認した。狭い・過密な場合の町名の扱いは利用者可視結果が一意でないため SR-024 に統合した。
- Reviewer C（Security / Interoperability）: 利用者入力・マスター・保存データを未信頼情報として扱う境界、T のみ・legacy R 不使用、HTML・命令として解釈しない名称、状態境界、破損・部分復元・保存失敗、既存 Treasure 互換性を確認した。ラベル詳細の欠落は表示決定性の問題として SR-024 とし、未承認の暗号方式・認証方式・実装 hardening は要求していない。
- Chair: SR-024 を現在工程の単一の根本原因として採用し、製品判断の補完、下流方式の指摘、過去 finding との重複を除外した。

### Two-implementation test

| ケース | 合理的な実装差 | 仕様から導ける共通結果 | 判定 |
| --- | --- | --- | --- |
| 料金・ロード時間が相反する同率経路 | 経路列挙・内部アルゴリズムが異なる | 同率表示後、規定タプル列で同じ採用経路を表示する | PASS |
| 手動順序へ複数候補の一般モブを追加 | 候補の列挙方法が異なる | 既存末尾またはエーテライトからの最小距離と安定順で同じ一地点を採用する | PASS |
| B モブ、完了対象、保存失敗の状態操作 | 内部状態分割・保存方式が異なる | 対象単位、直前操作、最後の正常保存状態に関する同じ外部結果となる | PASS |
| T と legacy R、範囲外・町名なしエーテライト | マスター表現・validator が異なる | 有効なのは検証済み `division=T` で参照解決済み、町名あり、有限かつ bounds 内のレコードだけで、無効情報は表示・参照・経路から除外する | PASS |
| 動的ラベルの近接・重なり回避・過密時省略 | 配置候補、ラベル領域、表示上限および優先順位が異なる | 仕様上の許容差、同じ省略対象・表示数・配置結果を導ける規則がない | FAIL（SR-024） |
| エーテライト案内へのクリック／タップ・再描画 | UI イベントの内部接続が異なる | 周回状態、地点、順序、保存状態を変更しない | PASS |

## 10. 検証結果

- `sha256sum docs/specification/specification.md` を実行し、指定された対象 SHA-256 `984e3e4f9083f4128a5219ee8d234cad65394704bdfd4d0ea751b62e01996e9b` と一致することを確認した。
- `sha256sum docs/requirements/requirements.md` を実行し、指定された承認済み Requirements SHA-256 `30f91a210b44bc2e69422d6d807ac678e7b6ca52fa669301308bc7618554cba0` と一致することを確認した。
- `sha256sum docs/reviews/specification/specification-review-007.md` を実行し、前回レビュー資料の SHA-256 `41532625c37c181007b836fdb68a8ee1f8b1c38f11ff7ca601f3540d9b209a24` と一致することを確認した。前回資料は変更していない。
- Requirements の Requirement ID 53 件、Acceptance ID 25 件を抽出し、Specification 内の Requirement 参照 53 件、`SPC-AC` 25 件を確認した。新規 `REQ-F-006〜008`、`REQ-A-003〜004`、`REQ-D-004`、`AC-022〜025` は本文・適合条件・traceability へ追跡されている。
- 対象 Specification、Requirements、Concept、前回レビューおよび README が参照する確認対象の存在を確認した。対象文書の相対リンクと章構成を確認した。
- 動的表示追加後の `SPC-OPEN-001`、§4.4、§10.2、`SPC-AC-023`、Requirement handoff の意味を照合し、SR-024 の根拠を確認した。
- `git diff --check`: PASS（レビュー資料作成後に再確認済み）。
- `pnpm lint` / `pnpm test` / `pnpm run build`: SKIPPED / NOT APPLICABLE。Specification とレビュー資料のみを対象とする文書レビューで、アプリコード変更を検証する作業ではない。
- 実装、テスト実行、静的マスターデータの実値、画像編集結果、ブラウザ表示、出典・ライセンスの実査、将来ローカライズ用データの実体: Not validated。本レビューの対象外または後続工程で確認する事項である。
- レビュー開始時から存在する `MEMORY.md` の変更と `apps/treasure-compass/public/img/aetheryte.png` の未追跡状態は無関係な変更として採用・修正・ステージしていない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 1. 目的と範囲 | PASS | Treasure / Mob、ソロ／パーティ、動的案内表示、対象外、利用者責任および初期ローカライズ境界を一意に理解できる。 |
| 2. 要件追跡と契約（handoff closure） | FAIL | `REQ-F-007` と Requirements §9.2 が Specification に委譲したラベル近接・回避・表示上限が `SPC-OPEN-001` のまま未確定であり、SR-024 がある。 |
| 3. 処理と例外 | FAIL | 通常・地点選択表示の全アイコン表示、無効エーテライト除外、画像非重複および非操作性は定義されているが、狭い・過密な viewport でのラベル配置・省略結果が一意でなく、SR-024 がある。 |
| 4. 内部整合性 | FAIL | §4.4 / `SPC-AC-023` が外部表示契約を掲げる一方、§13.3 / §15 が Requirements から明示的に委譲された同契約を未決定の上流事項として扱っている。 |
| 5. 検証可能性 | FAIL | 同じマップ・座標・viewport で、ラベルの近接、重なり、配置、省略対象および表示上限を同じ合否結果へ判定できない。 |
| 6. 安全性・信頼境界・相互運用性 | PASS | 未信頼入力・マスター・保存データの拒否境界、T / legacy R の採用境界、HTML・命令解釈の禁止、状態分離、破損・保存失敗・既存 Treasure 互換性は外部から確認できる。SR-024 は表示契約の未完であり、新たな認証・暗号・権限方式を要求する問題ではない。 |
| 7. 上流整合性と工程境界 | FAIL | Requirements は製品境界を確定しラベル詳細を Specification に委譲しているため、`SPC-OPEN-001` を upstream clarification として再委譲する現状は handoff の工程境界に適合しない。 |

Critical 1 / Major 0 / Minor 0。Gate 2、3、4、5、7 の不合格に対応する SR-024 があるため、最終判定は `REVISE SPECIFICATION` とする。

## 12. 残存リスクと未決定事項

- SR-024 が未解消であり、ラベルの近接範囲、重なり判定、配置決定、過密時の省略対象・表示上限・同率優先順位を下流で推測してはならない。
- T レコードの実データ、共通地図情報の統合、参照整合性、座標、町名、legacy `division=R` の除外、画像重複除去および出典・利用条件は未検証である。
- 初期日本語の名称データと既存 Treasure のチャット一括登録との実データ整合、将来の言語別名称データの実体は未検証である。v1 の多言語 UI、翻訳、Mob 名称の多言語照合を追加する未決定事項ではない。
- `MEMORY.md` と `apps/treasure-compass/public/img/aetheryte.png` は本レビューの根拠・対象に含めていない。

## 13. 自動変更

なし。レビュー対象の Specification、Requirements、Concept、Design、README、前回レビュー、`MEMORY.md`、コード、テストおよび画像は変更していない。本サイクルで指定出力先のレビュー資料だけを新規作成した。コミットは実施していない。

## 14. 最終判定

**REVISE SPECIFICATION**

Critical 1 / Major 0 / Minor 0。SR-024 を Specification で解消し、対象版の更新後に Specification Review 009 として再レビューする必要がある。
