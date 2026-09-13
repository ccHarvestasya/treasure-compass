# Treasure Compass Release Readiness Review 001

## 1. レビュー対象

- Repository: `ccHarvestasya/treasure-compass`
- Branch: `maintenance/add-mob-compass`
- Reviewed HEAD: `24554cfbbe2da388c450d3be58dd7885277952b5`
- 確認日: 2026-09-13
- 公開対象: Treasure Compass の production browser build を主対象とする。Mob Compass は未完成機能そのものを判定せず、root build、workspace dependency、shared `map-core` / `master-data`、lockfile、lint / test / build への影響だけを確認した。
- Release surface: `apps/treasure-compass/**`、Treasure の production Vite build、`packages/master-data/assets/**`、`packages/master-data/data/**`、`packages/master-data/migration/**`、workspace package / lockfile、README、LICENSE、NOTICE、favicon / support asset。
- Distribution boundary: repository 内に browser build 手順はあるが、公開先、deploy workflow、package publish、container、release archive、checksum manifest、durable release record は定義されていない。生成された `dist/` は `.gitignore` 対象である。
- 正式状態: Requirements Revision 013 / Review 013 `READY`、Specification Revision 009 / Review 015 `READY`、Design Revision 009 / Review 010 `READY`、Implementation Review 016 `READY`、IR-017 `RESOLVED` を確認した。
- 重点: Security / Trust Boundary、入力・保存・master data の integrity、外部通信、asset provenance、license / attribution、production build contents。
- 除外範囲: Mob Compass の未完成 feature 自体、実配備先の未指定設定、publish / deploy / tag / remote 操作、法的結論の判断。
- 未確認範囲: 実ブラウザ smoke、実スマートフォン、実配備 origin、HTTP header / CSP、Google endpoint の実送信 payload と consent 設定、外部 asset の契約原文、CI がないため CI 上の権限・artifact・provenance。

## 2. 使用した根拠

- ユーザーの Release Readiness Review 依頼、提示された footer 表示方針、`AGENTS.md`、`MEMORY.md`。公開対象、Security 重点、既存 `READY` の扱い、変更禁止範囲を確定した。
- `release-readiness-review` Skill、同 Skill の `review-gates.md`、`reviewers.md`、`output-format.md`、`review-common` の playbook / output format。release surface、Gate、Critical / Major / Minor、未実行 validation の扱いを適用した。
- `implement-review/security-checklist.md`。今回の Release Readiness における untrusted input、storage、static master、unsafe execution、外部通信、logging、resource、dependency / build boundary の探索補助として利用した。Implementation Review の再実施には使用していない。
- Requirements Revision 013 / Review 013、Specification Revision 009 / Review 015、Design Revision 009 / Review 010、Implementation Review 016。公開時に維持すべき parser、persistence、write-before-publish、migration、unresolved reference、route failure、Treasure / Mob 分離の既承認契約を確認した。
- `package.json`、workspace package manifests、`pnpm-lock.yaml`、Vite / TypeScript 設定、`.gitignore`、README、LICENSE、NOTICE、workflow discovery。
- Treasure の `index.html`、App / footer、bulk parser / input、persistence / validation、master validation、MapCanvas、runtime external links、production `dist/`。
- `pnpm audit`。sandbox 内の初回試行は registry DNS unavailable だったため、許可付き再試行を行い `No known vulnerabilities found` を確認した。

## 3. レビュー結果

**NOT READY**

Critical 0 / Major 2 / Minor 3。Treasure の production build、lint、unit test、static dependency audit は成功したが、公開時に実行される未承認の第三者 script / telemetry と、利用条件未レビューの第三者 map asset が残る。二つの Major finding は公開前に解消が必要である。

## 4. 総評

Treasure の実装本体は Implementation Review 016 の `READY` を維持しており、localStorage の exact shape / revision / reference validation、legacy migration の write-before-cleanup、保存失敗時の publish 抑止、unresolved reference、parser normalization、currentTarget / listSelection の分離、route failure containment、runtime-only undo、Treasure / Mob の session 分離を release 観点でも確認できる。React の表示は通常の text node / JSX interpolation であり、`dangerouslySetInnerHTML`、`eval`、dynamic code execution は確認されない。

一方、公開面には次の二つの release blocker がある。

1. Treasure の `index.html` と production `dist/index.html` は、ページロード時に Google-hosted `gtag.js` を実行し、GA4 config を行う。これは静的 asset 取得を越える外部通信・第三者 executable の trust boundary であり、README、footer、NOTICE、Specification / Design の release-facing contract に開示・承認された根拠がない。
2. runtime が表示する 28 枚の map asset は、master data 上で `license-ffxiv-third-party-unreviewed` に紐付けられている。source record は削除済みの旧 path を参照し、`Copyright.txt` も現行 tree にない。Design が定めた「画像参照と利用条件が確認されるまで application asset として採用しない」gateを満たしていない。

これらを解消するまで、公開物が利用者へ渡す外部通信・資産 provenance・利用条件を安全に説明できないため `NOT READY` と判定する。

## 5. 指摘事項

### RL-001: production build が未承認の第三者 analytics script と外部 telemetry を実行する

- 分類: Release Security / Trust Boundary / Distribution
- 重大度: `Major`
- 状態: `New / Open`
- 対象箇所: `apps/treasure-compass/index.html:4-10`、生成後の `apps/treasure-compass/dist/index.html:4-10`
- 根拠: `AGENTS.md` の外部通信・計測を依頼なしに導入しない境界、Design Revision 009 §12 の「新しい外部通信は静的 asset の取得以外に導入しない」条件、今回のユーザー依頼の external communication / secrets 確認。

**Entry point → Reachable path → Trust boundary violation → Impact → Evidence**

- Entry point: Treasure の browser entry document を通常の URL load で開く。
- Reachable path: `<script async src="https://www.googletagmanager.com/gtag/js?id=...">` がページロード時に Google-hosted JavaScript を取得・実行し、inline `gtag('config', 'G-...')` が analytics queue を初期化する。production build にも同じ script と config が残る。
- Trust boundary violation: 静的 map asset 以外の第三者 executable と telemetry endpoint を、利用者の明示操作・同意・公開 docs の説明なしに Treasure runtime の page context へ導入している。リモート script は同一ページの DOM / runtime context で実行される。
- Impact: ページ閲覧情報の第三者送信、未説明の privacy / trust boundary、第三者 script の変更による runtime supply-chain exposure が公開利用者へ及ぶ。現行コードから chat text / localStorage 全文を直接 event payload にしている証拠はないが、そこへ到達できる第三者 executable 境界自体が release contract と整合しない。
- Evidence: `index.html` に Google tag の source と measurement ID、`dist/index.html` にも同じ二つの script / config、README / NOTICE に analytics・telemetry・privacy boundary の説明がない。source 上の他の外部 URL は利用者がクリックする X / Amazon / OFUSE の links で、`noopener noreferrer` を付けている。

**最小修正**

公開対象の release contract に適合するよう、当該第三者 executable / telemetry を除去するか、明示的な承認・公開説明・同意・送信データ境界・実配備側の integrity / policy を揃えた release decision を確定すること。修正後は source と production build の両方で意図しない外部 script / request がないことを確認する。

### RL-002: runtime 採用済み map asset の license / source provenance が未確認で、source reference も現行 tree と不一致である

- 分類: Release Distribution / SBOM-Licensing / Asset Provenance
- 重大度: `Major`
- 状態: `New / Open`
- 対象箇所: `packages/master-data/data/map-master.v1.json:1-34`、同ファイル各 map の `image.licenseId` / `sourceIds`、`packages/master-data/src/validate.ts:474-525`、`apps/treasure-compass/src/hooks/useMapData.ts:5-12`、`apps/treasure-compass/src/components/MapCanvas/MapCanvas.tsx:17-24,105-118`
- 根拠: Design Revision 009 §§6.1〜6.2、§12、§14。画像の map identity・実参照・内容・出典・license を確認してから application asset に関連付け、未確認画像は runtime の正常 asset として表示しないという採用 gate。

**Entry point → Reachable path → Trust boundary violation → Impact → Evidence**

- Entry point: Treasure 起動時の `useMapData` と MapCanvas の map display。
- Reachable path: Vite が `map-master.v1.json` と `packages/master-data/assets/maps/*.png` を production bundle に取り込み、`validateMapMaster` が license ID の存在と source ID の参照だけを検証し、MapCanvas が `image.asset` を resolve して実画像を表示する。
- Trust boundary violation: license record 自体が `FFXIV第三者資産（利用条件未レビュー）`、`runtime採用は未レビュー・未承認` と明記されているにもかかわらず、28 map image が production runtime の正常 asset として採用される。validator は license ID が既知かだけを確認し、未レビュー status や referenced file の存在・provenance を拒否しない。
- Impact: source・利用条件を再現可能に確認できない第三者 map asset を public build が配布する。公開時の attribution / usage condition の説明が asset と対応せず、誤った asset set を公開する release integrity risk になる。
- Evidence: `map-master.v1.json` の license は `license-ffxiv-third-party-unreviewed`。source-001〜005 は `apps/treasure-compass/public/json/g8.json` 等を参照するが、これらの path は現行 tree に存在しない。`apps/treasure-compass/public/img/Copyright.txt` も存在しない。一方、runtime asset は `packages/master-data/assets/maps/` に存在し、production build に 28 map PNG と aetheryte icon が含まれる。README / NOTICE は第三者資産が Apache License の対象外であることを一般記載するが、map asset ごとの確認済み source / usage condition にはなっていない。

**最小修正**

runtime に採用する全 map / icon asset について、現行ファイルへ追跡できる source、出典、利用条件、必要な attribution を確認・記録し、master / NOTICE / distribution asset の対応を整合させること。確認できない asset は公開 build から除外または公開承認済みの代替へ置換する。master validation と production build を再実行し、未確認 license を正常採用しないことを確認する。

### RL-003: README の公開説明と現行 release 実体が一致しない

- 分類: Public Documentation / Release Contract
- 重大度: `Minor`
- 状態: `New / Open`
- 対象箇所: `README.md:9`、`README.md:62-66`
- 根拠: Release Readiness の Public documentation consistency、Specification Revision 009 §6.2および Design Revision 009 §6。料金・ロード時間は route 評価に使用せず、現行 master / asset は `packages/master-data` が正本である。
- 事実: README は「テレポコストを考慮した最短巡回順」と説明するが、現行 route calculation は map 間回数と X/Y 距離を使い、fee / load time を評価しない。また、新グレード追加手順は `apps/treasure-compass/public/` の JSON / imagePrefix を前提とするが、現行 runtime は `packages/master-data/data` と `packages/master-data/assets` を参照し、README の例に示す `jsonFile` / `imagePrefix` 形式は現行 `GRADE_CONFIG` に存在しない。
- 影響: 利用者・保守担当者が route の評価軸と master asset の更新境界を誤認する。Treasure runtime の安全性を直接破るものではないが、公開説明と実装の semantic parity を損なう。
- 最小修正: 現行 route / master-data contract に合わせて README の説明と追加手順を更新し、再レビューで source path と route policy の一致を確認する。

### RL-004: bulk pasted input に処理上限がなく、巨大入力が同期 parser を長時間実行できる

- 分類: Runtime Security / Resource Exhaustion / Validation
- 重大度: `Minor`
- 状態: `New / Open`
- 対象箇所: `apps/treasure-compass/src/components/SideBar/BulkInputTab.tsx:40-45,124`、`apps/treasure-compass/src/utils/bulkParser.ts:85-115`
- 根拠: Security checklist の untrusted / oversized input、Design Revision 009 §12 の「計算前に候補数・配列長を検証し、処理上限で failure を返す」条件、ユーザー依頼の malformed / oversized / resource exhaustion 確認。
- Entry point: Treasure の bulk input `Textarea` へ利用者が巨大な pasted chat を入力する。
- Reachable path: text change ごとに `useMemo` が `analyzeBulkInput` を同期実行し、入力全体を改行 split・map・filter した後、各行について regex、map candidate scan、distance sort を行う。`Textarea` に `maxLength` はなく、parser に文字数・行数・処理時間の上限または fail-closed cutoff はない。
- Trust boundary / Impact: chat paste は untrusted input であり、同一 browser tab の main thread と memory を消費する。十分に大きい入力または大量の重複行で、入力中の UI 応答低下・一時的な tab freeze に到達できる。攻撃者が別利用者へ影響を広げる remote path は確認されないため Major ではない。
- Evidence: `analyzeBulkInput` の入力全体処理と candidate scan、`BulkInputTab` の text 更新ごとの再解析に上限がない。通常サイズの parser test は PASS だが、oversized boundary test はない。
- 最小修正: 仕様に整合する明示的な入力・解析上限を設け、超過時は登録・保存へ進まず bounded failure とする。上限境界と巨大 / 重複 input の regression test を追加する。

### RL-005: mobile viewport の footer copyright 表示が提示された footer 方針と一致しない

- 分類: Public Attribution / Documentation Parity
- 重大度: `Minor`
- 状態: `New / Open`
- 対象箇所: `apps/treasure-compass/src/App.tsx:82-91`
- 根拠: 今回ユーザーが提示した footer 表示方針。
- 事実: desktop では `© 2026 Quarry Mill Applied Magitek Technologies` を表示するが、`sm` 未満では `© 2026 QMAMT` に短縮する。SQUARE ENIX attribution、FINAL FANTASY trademark、unofficial disclaimer は両方に残る。
- 影響: 同じ公開対象で viewport により copyright holder の表示が方針と異なる。第三者 attribution の主要文言は失われないため、公開阻害の Major ではない。
- 最小修正: 提示された footer 方針を全対象 viewport に適用するか、短縮表示を正式方針として明示・承認する。

## 6. 解消済み指摘

- Implementation Review 016 / IR-017: `RESOLVED`。今回の release review では再実装レビューを行わず、bulk parser の production surface と input boundary だけを release 観点で確認した。IR-017 の再発 evidence はない。
- Implementation Review 016 の READY 項目（IR-014〜IR-016、write-before-publish、persistence / migration、unresolved、currentTarget / listSelection、route failure、runtime-only undo、Treasure / Mob separation）: 今回の build / dependency / security 横断確認で concrete regression はなく、再オープンしない。

## 7. 上流へのフィードバック

なし。今回の blocking items は承認済み Specification / Design の不足ではなく、release surface に残る external communication、asset provenance、public documentation / runtime validation の current-phase issue である。

## 8. 保留した指摘

- 最終状態確認時の worktree には `README.md` の未コミット変更と、未追跡の `CHANGELOG.md` / `SECURITY.md` が存在する。これらは reviewed HEAD `24554cfbbe2da388c450d3be58dd7885277952b5` に含まれず、今回の release finding 件数には算入していない。復元・上書き・採用はせず、公開前に変更所有者が意図を確認し、release source を clean に確定する必要がある。

- CI / deploy / OIDC / provenance / durable release record: repository に workflow / deploy surface が存在しないため、現在の browser build review では対象外として保留する。実配備を決める場合は、exact asset set、checksum、permissions、headers、rollback を別途確認する。
- 実ブラウザ smoke、HTTP header / CSP、実 Google endpoint payload、外部 asset 契約原文: 現在の根拠では確認していない。RL-001 / RL-002 の解消条件に必要な範囲は、修正後の release follow-up で確認する。

## 9. 対象範囲と追跡

| Release surface | 確認した実体 | 結果 |
| --- | --- | --- |
| Treasure browser app | `apps/treasure-compass`、Vite config、App、UI、persistence、master loader | build は成功。runtime gtag は RL-001、footer は RL-005。 |
| Treasure static master / images | `packages/master-data/data`、`migration`、`assets`、MapCanvas glob、production `dist` | asset file は build に含まれるが、source / license gate 未解消で RL-002。 |
| Bulk / manual input | `BulkInputTab`、`bulkParser`、`ManualEntryTab`、domain / store | React text rendering、parser normalization、identity / conflict は PASS。oversized processing limit は RL-004。 |
| localStorage / migration | `storage.ts`、`storageValidation.ts`、persistence tests | exact shape、v3、legacy decode、write-before-cleanup、write failure containment は PASS。 |
| route / session integrity | `useAppStore`、`routeProjection`、`treasure-domain`、Implementation Review 016 | write-before-publish、currentTarget / listSelection、unresolved、route failure、undo は PASS。 |
| package / dependency | root and workspace manifests、`pnpm-lock.yaml`、scripts、`pnpm audit` | all packages private、lockfile integrity、audit PASS。npm package publish surface はなし。 |
| public documentation / attribution | README、LICENSE、NOTICE、App footer、support/contact links | LICENSE / NOTICE / disclaimer は存在。README は RL-003、mobile footer は RL-005。 |
| build / distribution | `pnpm run build`、Treasure/Mob `dist`、source map discovery | production build PASS、source mapなし、chunk warningあり。deploy surface はなし。 |
| CI / deploy | `.github/workflows`、release/deploy file discovery | workflow / deploy config なし。対象外として記録。 |

## 10. 検証結果

| 検証 | 結果 | 備考 |
| --- | --- | --- |
| `git status --short` | PASS AT START / WORKTREE DIRTY AT FINAL | 開始時は clean。最終状態では review artifact に加えて、`README.md` の未コミット変更と `CHANGELOG.md` / `SECURITY.md` の未追跡ファイルを検出した。reviewed HEAD の内容ではなく、復元・上書き・採用はしていない。 |
| `git diff --check` | PASS | whitespace error なし。 |
| `pnpm lint` | PASS | `oxlint --type-aware --type-check .`。 |
| `pnpm test` | PASS | 13 files / 135 tests。Treasure / shared / Mob の unit test を含む。 |
| `pnpm run build` | PASS | TypeScript、Treasure build、Mob build が成功。Treasure JS chunk 538.91 kB の Vite warning は failure ではない。 |
| `pnpm audit` | PASS | sandbox 初回は registry DNS unavailable。ネットワーク許可付き再試行は `No known vulnerabilities found`。 |
| unsafe execution / DOM injection static search | PASS | `dangerouslySetInnerHTML`、`innerHTML`、`eval`、`new Function`、`document.write`、動的 code execution は source で確認されない。React は user / master / storage 文字列を text として描画する。 |
| external URL / communication search | FAIL / RL-001 | gtag はページロード時の第三者 script / telemetry。X / Amazon / OFUSE は利用者クリックの `noopener noreferrer` link。 |
| localStorage / malformed data | PASS | JSON parse exception、exact root / field / enum / finite number / duplicate / reference / capacity validation、legacy migration failure を確認。 |
| static master validation | PASS WITH RL-002 | schema、field、source/license ID、ID collision、reference、座標を検証するが、`unreviewed` license status と現行 source file の存在を gate していない。 |
| production artifact contents | PASS WITH RL-002 | 28 map PNG、aetheryte icon、fonts、JS/CSS、favicon、OFUSE iconを確認。source mapなし、local path / credential の混入なし。map provenance は別途 blocker。 |
| browser / mobile smoke | NOT RUN | 実ブラウザ、実スマートフォン、orientation、実配備 origin は未確認。 |
| CI / deploy / publication | NOT APPLICABLE IN REPOSITORY | workflow、deploy、package publish、release record は存在しない。 |

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| Target / release-set identification | PASS | Treasure browser build を主対象、Mob は shared build impact のみと一意に確定。 |
| Public documentation consistency | MINOR | README の route / asset update contract と mobile footer に RL-003 / RL-005。 |
| Package / crate metadata | PASS | package は private、Treasure version は `0.1.0`、root version は `1.0.0`。npm publish surface はない。各 package に license field はないが、今回は package distribution を対象にしていない。 |
| Public API / contract / compatibility | PASS | Implementation Review 016 の READY、Treasure v3 / legacy compatibility、parser / route contract を維持。 |
| Distribution contents | MAJOR BLOCKED | runtime map assets は build に含まれるが、license / source provenance gate 未解消（RL-002）。 |
| Platform / runtime support | PASS WITH UNCONFIRMED SMOKE | static build と responsive source は確認。実 browser / device / deploy origin は未実行。 |
| Security / input data handling | MAJOR BLOCKED | page-load third-party executable / telemetry（RL-001）。oversized paste の上限欠落は Minor（RL-004）。XSS / unsafe execution は evidenceなし。 |
| SBOM / license evidence | MAJOR BLOCKED | `pnpm audit` は pass、lockfile integrity も確認。ただし runtime third-party map asset の license record は未レビューで、source pathも stale（RL-002）。 |
| Provenance / release identity | NOT IN REPOSITORY | CI / OIDC / tag / checksum manifest / durable release record は存在しない。現段階で release operation を成功扱いしない。 |
| Durable publication | NOT IN REPOSITORY | exact public asset set を永続化する publish surface は未定義。 |
| Retry / recovery | PASS FOR RUNTIME | persistence write-before-publish、migration cleanup、route failure containment、partial state publish 抑止を確認。deploy rerun は対象外。 |
| Validation evidence | PASS WITH LIMITATION | lint / test / build / audit は pass。browser smoke、実配備、external endpoint、asset terms は未確認。 |
| Public hygiene | MINOR | README stale contract と mobile footer attribution 差異。gtag / asset provenance はそれぞれ Major gate にも反映。 |

Critical / Major の New / Open が 2 件あるため、正式 Release Gate は `NOT READY` とする。Minor だけであれば `READY WITH MINOR FIXES` とできるが、今回は該当しない。

## 12. 残存リスクと未決定事項

- RL-001 解消まで、Treasure 起動時の Google-hosted script / telemetry が公開 runtime に残る。measurement ID は secret ではないが、第三者 executable / data flow の承認根拠が不足している。
- RL-002 解消まで、map / icon asset の source・利用条件・現行 file provenance を公開物として再現できない。README / NOTICE の一般的な第三者資産記載だけでは asset-level gate を満たさない。
- RL-004 の oversized input は同一利用者の browser tab availability に限定される。remote cross-user attack path は確認されないため Minor とした。
- Vite chunk-size warning は現時点で build failure、security boundary、公開不能を示さない既知 warning であり、任意改善として扱う。
- CI / deploy / CSP / durable release evidence は repository に存在しないため、実配備を開始する場合の別工程で確定する。

## 13. 自動変更

なし。レビュー中にコード、設定、依存、README、LICENSE、NOTICE、asset、既存 review、build 設定は変更していない。本レビューで新規作成するのは `docs/reviews/release-readiness/release-readiness-review-001.md` のみである。publish / deploy / tag / remote / commit / push は実施していない。

## 14. 最終判定

**NOT READY**

Critical 0 / Major 2 / Minor 3。公開前に RL-001（未承認の第三者 analytics script / telemetry）と RL-002（未確認 asset license / provenance）を解消する必要がある。RL-003〜RL-005 は公開を直接阻害しないが、公開面の正確性・資源境界・footer 方針のため修正を推奨する。
