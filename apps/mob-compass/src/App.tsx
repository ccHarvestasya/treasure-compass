import { useEffect, useMemo, useState } from "react";
import {
  filterMobs,
  type MobCategory,
  type MobCompassMode,
  type MobRank,
  type MobTargetState,
} from "@treasure-compass/mob-domain";
import { MobCoordinator } from "./mobCoordinator.ts";
import { mobCatalog, mobMasterAvailable } from "./mobCatalog.ts";

type MobTab = "registration" | "route";

const MODE_LABELS: Record<MobCompassMode, string> = { solo: "ソロ", party: "パーティ" };
const RANK_LABELS: Record<MobRank, string> = { normal: "通常", b: "B", a: "A", s: "S", ss: "SS" };
const CATEGORY_LABELS: Record<MobCategory, string> = { regular: "一般", elite: "エリート" };

function targetStatus(target: MobTargetState): string {
  if (target.unfound) return "未発見";
  if (target.completed) return "完了";
  const explored = target.candidates.filter((candidate) => candidate.status === "explored").length;
  return explored > 0 ? `探索 ${explored}/${target.candidates.length}` : "未完了";
}

export function App() {
  const [controller] = useState(() => new MobCoordinator(mobCatalog));
  const [, redraw] = useState(0);
  const [tab, setTab] = useState<MobTab>("registration");
  const [query, setQuery] = useState("");
  const [expansionId, setExpansionId] = useState("");
  const [category, setCategory] = useState<MobCategory | "">("");
  const [rank, setRank] = useState<MobRank | "">("");
  const [selectedMapId, setSelectedMapId] = useState("");
  const [partySelectionMobId, setPartySelectionMobId] = useState<string | null>(null);
  const [clearRequested, setClearRequested] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => controller.subscribe(() => redraw((value) => value + 1)), [controller]);

  const mode = controller.mode;
  const session = controller.session;
  const route = controller.route;
  const filteredMobs = useMemo(() => filterMobs(controller.catalog, mode, query, {
    ...(expansionId ? { expansionId } : {}),
    ...(category ? { categories: [category] } : {}),
    ...(rank ? { ranks: [rank] } : {}),
  }), [category, controller.catalog, expansionId, mode, query, rank]);
  const selectedMap = controller.catalog.maps.find((map) => map.id === selectedMapId) ?? controller.catalog.maps[0];
  const partySelectionMob = partySelectionMobId ? controller.getMob(partySelectionMobId) : undefined;

  const run = (action: () => boolean, successMessage?: string) => {
    if (action()) {
      setFeedback(successMessage ?? null);
    } else {
      setFeedback(controller.persistenceError ?? "操作を保存できませんでした。状態は変更されていません。");
    }
  };

  const switchMode = (nextMode: MobCompassMode) => run(() => controller.switchMode(nextMode));

  return (
    <main className="shell">
      <section className="app-panel" aria-labelledby="app-title">
        <header className="app-header">
          <div>
            <p className="eyebrow">FFXIV モブハント</p>
            <h1 id="app-title">Mob Compass</h1>
          </div>
          <div className="mode-switch" aria-label="Mob モード">
            {(Object.keys(MODE_LABELS) as MobCompassMode[]).map((candidateMode) => (
              <button key={candidateMode} type="button" className={candidateMode === mode ? "selected" : ""} aria-pressed={candidateMode === mode} onClick={() => switchMode(candidateMode)}>
                {MODE_LABELS[candidateMode]}
              </button>
            ))}
          </div>
        </header>

        {(controller.persistenceError || feedback) && <p className="feedback" role="alert">{controller.persistenceError ?? feedback}</p>}
        {!mobMasterAvailable && <p className="data-gate" role="status">正式な Mob master が未提供のため、対象一覧は利用できません。承認済みデータを追加するまで具体的なMob値は表示しません。</p>}

        <nav className="tabs" aria-label="Mob操作">
          <button type="button" className={tab === "registration" ? "selected" : ""} onClick={() => setTab("registration")}>登録</button>
          <button type="button" className={tab === "route" ? "selected" : ""} onClick={() => setTab("route")}>巡回経路</button>
        </nav>

        {tab === "registration" ? (
          <div className="content-grid">
            <section className="registration-panel" aria-labelledby="registration-title">
              <h2 id="registration-title">対象を登録</h2>
              <div className="filters">
                <label>名前検索<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="正式名・別名" /></label>
                <label>拡張エリア<select value={expansionId} onChange={(event) => setExpansionId(event.target.value)}><option value="">すべて</option>{[...new Set(controller.catalog.maps.map((map) => map.expansionId))].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                <label>種別<select value={category} onChange={(event) => setCategory(event.target.value as MobCategory | "")}><option value="">すべて</option><option value="regular">一般</option><option value="elite">エリート</option></select></label>
                <label>ランク<select value={rank} onChange={(event) => setRank(event.target.value as MobRank | "")}><option value="">すべて</option>{(Object.keys(RANK_LABELS) as MobRank[]).map((value) => <option key={value} value={value}>{RANK_LABELS[value]}</option>)}</select></label>
              </div>
              <div className="candidate-list" aria-live="polite">
                {filteredMobs.length === 0 ? <p className="empty">検索条件に一致するMob masterがありません。</p> : filteredMobs.map((mob) => (
                  <article className="candidate-row" key={mob.id}>
                    <div><strong>{mob.name}</strong><span>{CATEGORY_LABELS[mob.category]} / {RANK_LABELS[mob.rank]}</span></div>
                    <button type="button" onClick={() => mode === "party" ? setPartySelectionMobId(mob.id) : run(() => controller.register(mob.id), "登録しました")}>{mode === "party" ? "地点を選ぶ" : "登録"}</button>
                  </article>
                ))}
              </div>
            </section>

            <section className="map-panel" aria-labelledby="map-title">
              <h2 id="map-title">地図</h2>
              <label>表示マップ<select value={selectedMap?.id ?? ""} onChange={(event) => setSelectedMapId(event.target.value)}><option value="">選択してください</option>{controller.catalog.maps.map((map) => <option key={map.id} value={map.id}>{map.name}</option>)}</select></label>
              {selectedMap ? <><p>{selectedMap.shortName}</p><ul className="aetherytes">{selectedMap.aetherytes.map((aetheryte) => <li key={aetheryte.id}>{aetheryte.name} ({aetheryte.x}, {aetheryte.y})</li>)}</ul></> : <p className="empty">地図データを利用できません。</p>}
            </section>
          </div>
        ) : (
          <section className="route-panel" aria-labelledby="route-title">
            <div className="section-heading"><h2 id="route-title">巡回経路</h2><div className="order-actions"><span>{session.orderMode === "auto" ? "自動順序" : "手動順序"}</span><button type="button" onClick={() => run(() => controller.setOrderMode(session.orderMode === "auto" ? "manual" : "auto"))}>{session.orderMode === "auto" ? "手動順序へ" : "自動計算"}</button></div></div>
            {route.kind === "failure" && <p className="feedback" role="alert">経路の対象地点をmasterで解決できません。</p>}
            {route.steps.length === 0 ? <p className="empty">未完了の巡回地点がありません。</p> : <ol className="route-list">{route.steps.map((step, index) => <li key={step.visitId} className={step.visitId === session.currentVisitId ? "current" : ""}><button type="button" onClick={() => run(() => controller.select(step.visitId))}><span>{index + 1}. {step.mobName} ({RANK_LABELS[step.rank]})</span><small>{step.mapId} / ({step.x}, {step.y})</small></button><div className="row-actions">{step.startPoint && <small>開始: {step.startPoint.name}</small>}{session.orderMode === "manual" && <><button type="button" onClick={() => run(() => controller.move(step.visitId, "up"))}>上へ</button><button type="button" onClick={() => run(() => controller.move(step.visitId, "down"))}>下へ</button></>}</div></li>)}</ol>}
          </section>
        )}

        <section className="progress-panel" aria-labelledby="progress-title">
          <div className="section-heading"><h2 id="progress-title">登録済み</h2><button type="button" onClick={() => setClearRequested(true)} disabled={session.targets.length === 0}>全消去</button></div>
          {session.targets.length === 0 ? <p className="empty">登録済みの対象はありません。</p> : <ul className="target-list">{session.targets.map((target) => <li key={target.targetId}><div><strong>{target.mobName}</strong><span>{RANK_LABELS[target.rank]} / {targetStatus(target)}</span></div><div className="row-actions">{target.category === "elite" && target.rank === "b" && <><button type="button" onClick={() => run(() => controller.bNext())}>B Next</button><button type="button" onClick={() => run(() => controller.bCancelNext())}>Next取消</button><button type="button" onClick={() => run(() => controller.research(target.targetId))}>再探索</button></>}{target.completed ? <button type="button" onClick={() => run(() => controller.cancel(target.targetId))}>取消</button> : <button type="button" onClick={() => run(() => controller.complete(target.targetId))}>完了</button>}<button type="button" onClick={() => run(() => controller.remove(target.targetId))}>削除</button></div></li>)}</ul>}
        </section>

        <footer className="legal-footer" aria-label="権利表記">
          <span>© SQUARE ENIX CO., LTD. All Rights Reserved.</span>
          <span>FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.</span>
          <span>Treasure Compass is an unofficial fan-made tool and is not affiliated with or endorsed by Square Enix.</span>
        </footer>
      </section>

      {partySelectionMob && <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="candidate-dialog-title"><h2 id="candidate-dialog-title">{partySelectionMob.name} の地点</h2><p>登録する候補地点を一つ選択してください。</p><ul>{partySelectionMob.candidates.map((candidate) => <li key={candidate.id}><button type="button" onClick={() => { if (controller.register(partySelectionMob.id, candidate.id)) { setFeedback("地点を登録しました"); setPartySelectionMobId(null); } else setFeedback(controller.persistenceError ?? "地点を保存できませんでした。ダイアログを開いたままにします。"); }}>{candidate.mapId} ({candidate.x}, {candidate.y})</button></li>)}</ul><button type="button" onClick={() => setPartySelectionMobId(null)}>閉じる</button></section></div>}
      {clearRequested && <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="clear-dialog-title"><h2 id="clear-dialog-title">Mob Compass {MODE_LABELS[mode]}を全消去</h2><p>現在のモードの登録、巡回順、進捗および現在地点を消去します。</p><div className="dialog-actions"><button type="button" onClick={() => setClearRequested(false)}>キャンセル</button><button type="button" onClick={() => { const success = controller.clear(); if (success) setClearRequested(false); else setFeedback(controller.persistenceError ?? "全消去を保存できませんでした。"); }}>消去する</button></div></section></div>}
    </main>
  );
}
