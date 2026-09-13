# Treasure Compass Implementation Review 016

## 1. レビュー対象

- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `99a2ffefa531477cdf274fc69ab4322c2437ac0c`
- Follow-up base: 前回 Implementation Review 015 の Reviewed HEAD `94a60bb043f6aab260a6ea76e3573528e7b6260a`
- 確認日: 2026-09-13
- レビュー方式: IR-017 の修正に限定した Implementation / Test follow-up review。前回 `READY` の項目は、今回の変更による concrete regression がないかを確認し、根拠なく再オープンしない。
- 主対象: `apps/treasure-compass/src/utils/bulkParser.ts`、`apps/treasure-compass/tests/unit/bulkParser.test.ts`
- 関連確認: bulk proposal、既存 member identity / conflict 判定、承認済み Specification Revision 009 / Design Revision 009、前回 [Implementation Review 015](implementation-review-015.md)
- 変更範囲: HEAD の実装差分は `bulkParser.ts` の再 `trim()` 追加と、marker / PUA / 空白境界および空名の unit test 追加に限定される。
- 除外範囲: Mob の未実装部分、上流文書の再レビュー、README、release / deployment、実ブラウザ・実端末・実配備 origin、外部画像ライセンス。
- 未確認範囲: 実ゲームチャット貼り付けイベント、実ブラウザでの表示・操作、既存利用者の実 localStorage、実配備 origin。これらは今回の parser source / unit test の適合判定を阻害する必須 evidence ではない。

## 2. 使用した根拠

- ユーザーの follow-up review 依頼、`AGENTS.md`、`MEMORY.md`。対象 HEAD、変更禁止範囲、既存 finding の扱い、検証および報告条件を確定した。
- `implement-review` Skill、`review-common/review-playbook.md`、`review-common/output-format.md`、`implement-review/output-format.md`、`review-gates.md`、`reviewers.md`、`security-checklist.md`。Implementation / Test の適合性、finding、severity、Gate、成果物形式を適用した。
- [Specification Revision 009](../../specification/specification.md) §4.1〜§4.2、特に member identity、前置装飾の除去、対応 marker の allow-list、PUA glyph、再度の前後空白除去、Unicode NFC、空名拒否、同一性・競合判定。
- [Design Revision 009](../../design/design.md) §§3.2、7.2、8.1、14。parser / proposal lifecycle の責務、正規化済み identity の coordinator への受け渡し、bulk apply と保存境界を確認した。
- [Implementation Review 015](implementation-review-015.md)。IR-017 の事実・影響・再確認条件、および IR-014〜IR-016 を再オープンしない前回の判定を確認した。
- Reviewed HEAD の `bulkParser.ts`、`bulkParser.test.ts`、`useAppStore.ts`、`BulkInputTab.tsx`、`treasure-domain` の member normalization と bulk apply 経路。
- 実行した `git status --short`、`git diff --check`、`pnpm lint`、`pnpm test`、`pnpm run build`、bulk parser 対象 test。

## 3. レビュー結果

**READY**

CRITICAL 0 / HIGH 0 / MEDIUM 0 / LOW 0。IR-017 は `RESOLVED`。新規、Open、Reopened の blocking finding および blocking review condition はない。

## 4. 総評

IR-017 の修正は Specification §4.2 および Design Revision 009 に適合する。`normalizeMemberName` は次の順序を実装している。

```text
trim
→ 先頭 FFXIV PUA prefix を一つ除去
→ allow-list marker を先頭から連続除去
→ trim
→ Unicode NFC
```

`★Alice`、`★ Alice`、`●▲ Alice`、PUA + `★ Alice` はすべて `Alice` になり、装飾除去後に空になる入力は `名前がありません` として unresolved になる。marker なしの `Alice` は維持され、指定外の通常先頭文字 `x` は `xAlice` として維持される。任意 Unicode symbol を推測削除する処理はなく、marker 除去は Specification の allow-list に限定される。

parser の出力は bulk proposal の同一性キーへ渡され、bulk apply と manual registration はいずれも `trim().normalize("NFC")` の同じ identity 比較を行う。したがって、今回の修正は既存 member の更新、入力内 conflict、capacity 判定に不要な差異を持ち込まない。

## 5. 指摘事項

なし。

## 6. 解消済み指摘

### IR-017: marker 除去後の前後空白を再度正規化していない

- 前回状態: `New / Open`、MEDIUM。marker 除去後に名前先頭の空白が残り、Specification §4.2 の member identity と異なる可能性があった。
- 修正箇所: `apps/treasure-compass/src/utils/bulkParser.ts:39-46`。marker 除去後、NFC 前に `.trim()` を追加した。
- 回帰検証: `apps/treasure-compass/tests/unit/bulkParser.test.ts:72-93` に `★Alice`、`★ Alice`、`●▲ Alice`、PUA + marker + 空白、marker なし、指定外通常文字、および装飾後空名の検証を追加した。
- 再確認結果: `RESOLVED`。§4.2 の normalization 順序、空名拒否、既存 identity / conflict 経路への適合を確認した。

前回 `READY` だった IR-014〜IR-016 は、今回の変更差分による concrete regression がないため再オープンしない。responsive / bulk input、member identity の基本契約、aetheryte label geometry は継続して PASS とする。

## 7. 上流へのフィードバック

なし。Specification §4.2 と Design §§7.2、8.1 は今回の修正を判定するために十分であり、上流の不足・曖昧さ・矛盾は確認されない。

## 8. 保留した指摘

なし。実ブラウザ、実端末、実配備 origin、実ゲーム貼り付け、既存 localStorage および外部画像ライセンスは未確認範囲として記録するが、今回の parser follow-up の Gate を阻害する保留 finding ではない。

## 9. 対象範囲と追跡

| 確認項目 | 根拠 | 結果 |
| --- | --- | --- |
| normalization 順序 | Specification §4.2、Design §§7.2、8.1 | PASS。初期 trim、PUA 1文字、対応 marker 連続除去、再 trim、NFC の順序を source で確認。 |
| 必須境界入力 | ユーザー依頼、Specification §4.2、bulkParser test | PASS。`★Alice`、`★ Alice`、`●▲ Alice`、PUA + `★ Alice` は `Alice`。 |
| marker なし | Specification §4.1〜§4.2 | PASS。`Alice` を変更しない。 |
| 指定外通常先頭文字 | Specification §4.2 | PASS。`xAlice` を保持し、通常文字を marker として削除しない。 |
| 任意 Unicode symbol | Specification §4.2 | PASS。除去 regex は指定 marker allow-list と PUA prefix だけを対象とし、任意 symbol の推測削除を行わない。 |
| 装飾後の空名 | Specification §4.2 | PASS。空文字として `名前がありません`、`unresolved` になる。 |
| member identity / conflict | Specification §§4.1〜§4.2、Design §§7.2、8.1、`useAppStore.ts` | PASS。parser の結果は bulk proposal へ渡り、bulk apply / manual registration の NFC + trim identity 判定と整合する。 |
| IR-014〜IR-016 | 前回 Review 015、今回の変更差分 | PASS。今回変更が responsive、既存 identity 基本契約、label geometry に影響する concrete evidence はない。 |

## 10. 検証結果

| 検証 | 結果 | 備考 |
| --- | --- | --- |
| `git status --short`（開始時） | PASS | 作業ツリーは clean だった。 |
| `git diff --check` | PASS | whitespace error なし。 |
| `pnpm lint` | PASS | `oxlint --type-aware --type-check .`。 |
| `pnpm test` | PASS | 13 files / 135 tests。 |
| `pnpm run build` | PASS | TypeScript、Treasure build、Mob build が成功。Treasure bundle の 500 kB 超過 warning は非阻害の既存 baseline warning として扱う。 |
| bulk parser 対象 test | PASS | 1 file / 10 tests。 |
| Implementation / Test 静的照合 | PASS | source、unit test、bulk apply、manual identity / conflict 経路を確認。 |

既知 warning は build の chunk size warning のみで、lint / test / build の failure や今回の変更による regression は確認されない。baseline failure はない。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Scope / Traceability / Conformance | PASS | IR-017 の変更は parser normalization とその regression test に限定され、Specification §4.2 / Design の責務へ追跡できる。 |
| Correctness / State / Data | PASS | normalization、空名拒否、member identity / conflict の入力キーが契約どおりで、session state の不要な変更を導入していない。 |
| Failure / Resource / Runtime Safety | PASS | 空名は unresolved として拒否され、異常入力を登録候補へ流さない。今回の変更に新しい外部 effect、retry、保存境界はない。 |
| Compatibility / Integration | PASS | bulk proposal、bulk apply、manual registration の identity 比較と整合し、既存メンバー更新・conflict・capacity 判定を変更しない。 |
| Security / Trust Boundary | PASS | chat-derived input の解釈は allow-list された decoration のみを除去し、HTML / eval / 外部通信 / raw input logging を導入していない。 |
| Test / Validation / Regression | PASS | 必須 boundary cases、空名、marker なし、指定外通常文字を対象 test で確認し、全体 test / lint / build も成功した。 |
| Implementation Discipline | PASS | parser / proposal の責務と Domain / Coordinator の境界を変更していない。 |

CRITICAL / HIGH の New / Open / Reopened は 0 件、必須 evidence / validation の blocking unavailable もないため、正式 Gate は **READY** とする。

## 12. 残存リスクと未決定事項

- 実ブラウザ・実端末・実配備 origin・実ゲーム貼り付けイベントは未確認である。ただし、今回の変更の外部契約は source と unit test で検証可能であり、Gate を阻害しない。
- Vite の 500 kB 超 chunk warning は残るが、前回レビューからの既知 warning であり、今回の IR-017 修正による failure / regression ではない。
- IR-014〜IR-016 は今回の変更で再発した concrete evidence がなく、継続 PASS とする。

## 13. 自動変更

Implementation、Test、Specification、Design、既存 Review、設定および静的データは変更していない。本レビューで追加した成果物は `docs/reviews/implementation/implementation-review-016.md` のみである。commit / push は実施していない。

## 14. 最終判定

**READY**

IR-017 は解消済みで、新しい blocking finding はない。IR-014〜IR-016 は再オープンしない。Reviewed HEAD `99a2ffefa531477cdf274fc69ab4322c2437ac0c` の対象 Implementation / Test は、Specification Revision 009 / Design Revision 009 に対して follow-up review を通過した。

**IR-017 RESOLVED**

**IMPLEMENTATION REVIEW READY**
