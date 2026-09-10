# Review Gates

Gate の目的は、Implementation を完璧にすることではなく、対象範囲が承認済み Specification / Design を安全かつ検証可能に満たすかを判断することである。対象に存在しない concern を、Gate や checklist のために要求しない。

## Gate の観点

1. **Scope / Traceability / Conformance**: requested scope、承認済み Specification、Design、必要な Requirements へ変更を追跡でき、無関係な変更が混入していない。
2. **Correctness / State / Data**: 計算、変換、分岐、状態、ownership、データ処理、外部結果が、適用される契約と Design を満たしている。
3. **Failure / Resource / Runtime Safety**: error、failure、resource lifecycle、cleanup、concurrency、atomicity、runtime safety が対象に応じて成立している。
4. **Compatibility / Integration**: public API、protocol、file、persistence、migration、platform、dependency、interoperability が必要な場合に整合している。
5. **Security / Trust Boundary**: 適用される trust boundary、権限、機密データ、入力、完全性、実行安全性が具体的に破られていない。
6. **Test / Validation / Regression**: 必要な契約、invariant、regression、security property を検出する独立した Test / validation 証拠がある。
7. **Implementation Discipline**: dependency、generated artifact、build、public / private boundary、migration、scope が承認済み方針と整合している。

各 Gate の結果は、対象箇所、発生条件、具体的事実、根拠、影響、完了条件へ追跡する。Security checklist は独立した大量の Gate や新しい要求へ変換せず、適用される Gate へ対応付ける。

## Upstream issue と Current Phase

Concept / Requirements の不足は `Upstream ambiguity`、Specification の外部契約不足は `Specification gap`、Design の内部判断不足は `Design gap` として `Upstream Feedback` に分ける。Implementation Review が具体的な要求・仕様・設計を発明して Gate failure にしてはならない。

上流不足により Implementation の正否を安全に判定できない場合は、root cause と「評価できない」という current phase への影響を分けて記録する。上流問題そのものを `Implementation defect` として二重計上しない。既存の Gate / Severity policy に従い、未解決の blocking impact がある状態を `READY` としない。

## Severity と判定

Severity は `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` を維持する。exploitability、reachability、precondition、affected scope、recoverability、security / integrity effect、compatibility / operational effect、downstream impact を総合し、単なる技術名、style、好み、checklist 項目だけで上げない。

- `CRITICAL`: 現実的に到達可能で、重大な security boundary compromise、任意の code / command execution、catastrophic integrity failure、不可逆または広範な data loss / corruption、認証・認可の根本破綻、core safety property の実質的崩壊等を招く。
- `HIGH`: realistic condition で、approved Specification の重大違反、重大な correctness / security / integrity / compatibility failure、major state corruption、serious migration failure、安全な release / operation を阻害する regression、重大な欠陥を検出できない Test gap 等を招く。
- `MEDIUM`: concrete だが影響が限定された correctness、robustness、compatibility、failure-path、test / validation の defect。
- `LOW`: 影響・到達可能性が限定された concrete defect / hygiene issue。一般論や任意改善だけでは採用しない。

`CRITICAL` / `HIGH` の New / Open / Reopened が1件以上ある場合は `REVISE IMPLEMENTATION`、`MEDIUM` / `LOW` のみ、または解決済み・Deferred のみの場合は `READY` とする。`READY` と `Required Changes: HIGH` の組み合わせは成立しない。Severity や Gate を security checklist の存在だけで決めない。
