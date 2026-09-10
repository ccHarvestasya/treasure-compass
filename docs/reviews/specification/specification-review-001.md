# Treasure Compass / Mob Compass Specification Review 001

## 1. レビュー対象

- 対象成果物: `docs/specification/specification.md`
- 対象版 SHA-256: `88efe6df3ea25fae440a0e017f1a57ca23e2c852ce5e9e96004101dcdead9649`
- レビューサイクル: 001
- 確認日: 2026-09-10
- 範囲: Treasure Compass / Mob Compass v1 の外部 Specification 全体。入力、出力、状態、進行、ルート、チャット案内、保存、マスターデータ、異常系、Traceability、Design / Implementation 境界を確認した。
- 未確認範囲: 独立 Reviewer エージェントからの完成済みレビュー本文、実装、テスト、ブラウザ挙動、マスターデータの実値、画像の利用条件の外部確認。コード、上流資料、対象 Specification は本レビュー資料の作成中に変更していない。

本資料は、独立 Reviewer の完了報告が得られなかったため、Manager が対象版に対して実施した bounded review の記録である。独立レビュー成立の有無は、仕様レベルの判定とは別に最終報告へ明記する。

## 2. 使用した根拠

- ユーザー依頼: 今回の Specification の対象、固定すべき Requirements 判断、必須確認範囲、対象外、Traceability、目標 Gate。
- `docs/concept/concept.md`: コンセプト、対象ユーザー、v1 スコープ、責任境界、Treasure 1:1 / Mob 1:多、対象外。
- `docs/requirements/requirements.md`: 承認済み Requirements、Requirement ID、Acceptance、Specification への引継ぎ事項。
- `docs/reviews/requirements/requirements-review-005.md`: Requirements が Specification へ引き渡し可能であること、既存 Finding の状態、下流への引継ぎ。
- `docs/concept/requirements-notes.md`: TEMPORARY / NON-NORMATIVE の補助資料。正式根拠と矛盾しない検討候補の確認に限定して扱った。
- `AGENTS.md` および `.agents/skills/spec-review/` の現行指針: 作業範囲、上流優先、文書レビューの工程境界、重大度、Gate、出力形式。

Requirements baseline は `09a41c6b008a14a1cb03d6c3539e335dad1adb89` とした。レビュー開始時の HEAD は `1b21ac5598ccad19b89e205634d14e903bce7d65` であり、指定された上流資料はこの基準から変更されていない。

## 3. レビュー結果

**READY（仕様レベル）**

Specification-level の Critical は確認されなかった。Major / Minor の New / Open / Reopened finding もない。Requirements の意味を変えずに、設計・実装が下流で具体化できる外部契約として整理されている。

ただし、独立 Reviewer エージェントがレビュー資料または判定本文を返さず停止したため、オーケストレーターのプロセス完了条件としての「独立レビュー済み」は **Not validated** である。したがって、Manager の最終報告における総合状態は独立レビュー未成立を含めて扱う。

## 4. 総評

Specification は、Treasure Compass と Mob Compass を別の公開単位として扱いながら、巡回支援、進行、共有周回の責任境界を共通の外部契約として整理している。Treasure は同じ時点で一人のメンバーに一つの現在座標、Mob は一つのモブに複数候補という差が、対象単位、候補集合、完了単位、ルート算出で維持されている。

Mob の確定地点、候補地点、ルート採用地点、利用者確認地点、完了を併記可能な別意味として定義し、候補・採用・確認から完了へ暗黙に昇格しない。候補集合から一つの採用地点を選ぶこと、同順位を表示すること、確認操作がルート変更や完了を自動成立させないことも追跡可能である。

ルートは未完了かつ有効な現在対象を対象とし、異なるマップへの遷移回数を第一軸とする。同数時にゲーム内通貨とロード時間を一方だけ常に優先せず、同順位を利用者へ示すため、Requirements の判断原則を保っている。料金・ロード時間の具体単位と比較式は Design へ送られ、内部アルゴリズムやデータ構造は Specification に混入していない。

対象更新、手動順序、自動ルートへの明示的な復帰、完了除外、途中追加、全完了、案内の出力時点・取り込み・古さ・重複・非同期、ブラウザ内保存の意味と製品間非互換、マスター更新による未確認化、異常時の部分更新禁止も外部から確認できる。

## 5. 指摘事項

なし。Critical 0 / Major 0 / Minor 0。

## 6. 解消済み指摘

なし。サイクル 001 の初回レビューであり、過去の Specification Review finding は存在しない。

## 7. 上流へのフィードバック

なし。Concept、Requirements、Requirements Review 005 の判断を変更する必要は確認されなかった。Requirements が未決定として下流へ送った座標単位、比較式、保存方式、入力文法の実装詳細は、上流不足として再定義していない。

## 8. 保留した指摘

以下は Specification の欠陥ではなく、Requirements が Specification / Design / Implementation / Test へ引き継いだ範囲である。

- 座標単位、表示丸め、画像座標への変換、具体的な手動入力・チャット解析文法: Design / Implementation。
- 料金・ロード時間の単位、観測条件、両者を同等に扱う具体的な比較式、探索アルゴリズム、グラフ、内部スコア、候補組み合わせの内部表現: Design。
- React コンポーネント、状態所有、内部イベント、保存キー、シリアライズ、マイグレーション、具体的なファイル形式・schema・読み込み: Design / Implementation。
- チャット案内の文字コード、区切り文字を含む名前のエスケープ実装、案内識別子の生成方法: Design。外部で必要なブロック境界、必須項目、候補集合、採用地点、進行の意味は Specification で固定されている。
- 空、部分、不正、全角/半角、座標境界、未知マップ、重複、最大容量、複数候補、ロード失敗、保存破損、グレード変更、リセット、再計算、古い案内の具体的 fixture・操作手順・テストコード: Test。

これらは単に対象外だからではなく、外部契約を維持した下流の実現・検証責任として分類した。

## 9. 対象範囲と追跡

| Requirement | Specification の確認箇所 | 確認結果 |
| --- | --- | --- |
| REQ-F-001〜005 | 1〜5、9、12、14.1 | 公開単位、Treasure 1:1、Mob 1:多、地点意味、モブ一律扱いを追跡できる |
| REQ-F-006〜010 | 6〜7、9、12、14.1 | ルート第一軸、候補比較、対象集合、手動順序、再計算、完了、個人/共有を追跡できる |
| REQ-F-011〜012 | 8、11、12、14.1 | 案内の出力時点・形式・取込条件・古さ・重複・非同期を追跡できる |
| REQ-F-013〜014 | 9〜10、12、14.1 | マスターデータ、更新、訂正、出典・利用条件、周回情報との分離を追跡できる |
| REQ-D-001 | 3〜6、12、14.1 | 対象・名前・座標・マップ・拠点・候補と入力受理境界を追跡できる |
| REQ-D-005 | 8、12、14.1 | 出力時点の対象、候補集合、採用地点、順序、進行を取り込める案内契約を追跡できる |
| REQ-D-007 | 3、5、6.4、8.2、9.2、10.2、11、12、14.1 | 不正・未知・欠落・破損を有効化せず、部分更新・誤ルート・誤進行を防ぐ境界を追跡できる |
| REQ-S-001〜006 | 1、5〜11、12、14.1 | 自動ゲーム状態取得なし、明示操作、リーダー責任、チャット投稿境界、マスター責任、出典・画像条件を追跡できる |

Requirement → Specification は 14.1 の全件表で確認でき、Specification の規範的項目には Requirement ID の参照がある。逆方向に、公開単位・地点意味・ルート・進行・案内・保存・マスター・異常・責任境界の追加契約を、Requirements またはユーザー依頼へ戻せる。

## 10. 検証結果

- 対象 Specification 全文、Concept、Requirements、Requirements Review 005、補助資料の位置づけを確認した。
- 対象 Specification の SHA-256 をレビュー対象版の値と照合した: `88efe6df3ea25fae440a0e017f1a57ca23e2c852ce5e9e96004101dcdead9649`。
- `git diff --check`: PASS。
- Requirement ID `REQ-F-001`〜`REQ-F-014`、`REQ-D-001`、`REQ-D-005`、`REQ-D-007`、`REQ-S-001`〜`REQ-S-006` の本文参照と 14.1 の逆方向 Traceability を確認した。未追跡 ID はない。
- 相対参照先の Concept、Requirements、Requirements Review 005、補助資料の存在を確認した。
- 実装、ユニットテスト、ブラウザ、静的 JSON、画像、実データの正確性、保存互換性の実環境挙動: Not validated。docs-only の Specification Review のため、`pnpm lint`、`pnpm test`、`pnpm run build` は SKIPPED。
- 独立 Reviewer エージェントへの委譲: 複数回実施したが、対象版に対する完成済み判定またはレビュー資料を返さず停止した。独立性のある外部判定としては Not validated。対象 Specification への自動変更はなかった。

## 11. レビューゲート

| Gate | 判定 | 根拠 |
| --- | --- | --- |
| 上流整合性 | PASS | Concept / Requirements の公開単位、1:1 / 1:多、共有責任、対象外、ルート第一軸を変更していない |
| 要求完全性 | PASS | 全 Requirement ID を 14.1 で追跡し、入力、対象、ルート、進行、案内、保存、マスター、異常を具体化している |
| 外部観測可能性 | PASS | 対象集合、地点の意味、採用候補、確認、完了、順序モード、遷移回数、失敗を利用者が区別できる |
| Mob 候補契約 | PASS | 候補集合からの選択、採用識別、同順位、確認、完了後の候補保持を 5 章で定義している |
| ルート決定性 | PASS | 第一軸、補助負荷、同順位、計算不能、対象集合変化の外部結果を定義し、アルゴリズムは Design へ送っている |
| 進行・再計算 | PASS | 追加、削除、重複、完了、手動順序、明示的な自動復帰、途中追加、全完了を 7 章で定義している |
| チャット・保存・マスター | PASS | 8〜10 章で出力時点、取込成立、古さ、重複、非同期、保存分離、欠落・更新・訂正を定義している |
| 安全性・工程境界 | PASS | 明示操作なしの自動成立を禁止し、破損・不正情報を有効化せず、内部方式を Design 以降へ送っている |
| Specification Gate | READY | Critical の New / Open / Reopened は 0 件 |
| 独立 Reviewer 完了 | BLOCKED / Not validated | 委譲した Reviewer が完成済み判定を返さず停止したため、独立レビュー済みとは証明できない |

## 12. 残存リスクと未決定事項

- 本資料は Manager による fallback review の記録であり、独立 Reviewer の判断を代替しない。
- 料金とロード時間の具体比較式が未確定であるため、Design は Requirements の「いずれか一方を常に優先しない」条件を保持する必要がある。
- チャット案内のブロック要素は外部契約として定義したが、エスケープ・文字コード・案内識別子生成は下流で一意な相互運用を壊さないよう具体化する必要がある。
- 実装・テストで、未確認情報が正常なルートや進行へ昇格しないこと、手動順序と自動ルートが混同されないことを検証する必要がある。

## 13. 自動変更

レビュー中に対象 Specification、Concept、Requirements、Requirements Review 005、コード、テスト、設定を自動変更していない。新規作成したレビュー資料は本ファイルのみである。独立 Reviewer が返答しなかったため、Reviewer による対象変更もない。

## 14. 最終判定

**READY（仕様レベル。Critical 0）**

ただし、オーケストレーター上の独立レビュー完了条件は **BLOCKED / Not validated** である。独立 Reviewer の正式な判定を受け取っていないため、「独立レビュー済みで READY FOR DESIGN」とは報告しない。
