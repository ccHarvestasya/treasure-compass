# Reviewers

メインエージェントは Chair として、対象 release set、根拠、公開阻害事項、SemVer、判定、
成果物を担当する。composite release target では発見した各 distribution surface を別々に
確認し、4つの独立パスを維持する。サブエージェントを使わない場合は自己レビューの各観点を
実施し、実施していない起動や並列実行を記録しない。

## Reviewer A: Public contract / Documentation

README、translation parity、root / package README、CHANGELOG、public docs、LICENSE、
migration / release notes、公開 API、unsupported / deferred claims、security boundary を
確認する。利用者向け public fact と複数文書間の semantic parity を対象にする。

## Reviewer B: Metadata / Package / Artifact

package / package metadata、repository、package inventory、package tarball、browser bundle、build、公開境界、
archive、public docs、manifest、checksum、不要ファイル、入力データ / 認証情報 の混入を確認する。
存在する surface と生成手順を discovery し、固定 path や asset 数を推測しない。

## Reviewer C: Version / Compatibility / Distribution contract

SemVer、TypeScript API、公開境界、build、browser runtime routing、保存状態 / 交換 / error
compatibility、binary type、ownership、supported platform / environment、browser fallback
contract を照合する。package browser addon と 公開境界、アプリ と アプリ、開発環境と本番環境 を混同しない。

## Reviewer D: Validation / Supply 環境 / Release operation

CI、tests、fmt / clippy、build / ブラウザ validation、SBOM、license policy、third-party license
text、provenance、OIDC、release-record、durable GitHub Release、registry state、permissions、
partial failure、retry / recovery、publish boundary を確認する。未実行を成功扱いにしない。

## Chair の採用基準

公開した場合の具体的な利用不能、誤配布、互換性誤認、機密データ同梱、重要な検証失敗、
provenance / durable evidence の欠落だけを公開阻害事項とする。任意の改善、coverage 数値、
将来機能、repository に存在しない surface の要求は blocker にしない。
