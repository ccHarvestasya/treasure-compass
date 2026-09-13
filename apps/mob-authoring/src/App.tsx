import { useMemo, useState } from "react";
import mapMasterJson from "@treasure-compass/master-data/data/map-master.v1.json";
import { validateMapMaster, type MapRecord } from "@treasure-compass/master-data";
import {
  MOB_RANKS,
  addOrUpdateAuthoringEntry,
  addSpawnArea,
  changeAuthoringMap,
  createAuthoringEntry,
  generateRuntimeMaster,
  loadAuthoringData,
  makeAuthoringData,
  removeAuthoringEntry,
  removeSpawnArea,
  saveAuthoringData,
  updateSpawnArea,
  validateAuthoringData,
  formatArea,
  type AuthoringDiagnostic,
  type MobAuthoringData,
  type MobAuthoringDraft,
  type MobAuthoringEntry,
  type SpawnArea,
} from "./authoring.ts";
import { MapAuthoringCanvas } from "./MapAuthoringCanvas.tsx";

const mapMasterValidation = validateMapMaster(mapMasterJson);
if (!mapMasterValidation.usable || !mapMasterValidation.data) {
  throw new Error("Map master validation failed.");
}
const mapMaster = mapMasterValidation.data;

const RANK_LABELS: Record<(typeof MOB_RANKS)[number], string> = {
  normal: "Normal",
  b: "B",
  a: "A",
  s: "S",
  ss: "SS",
};

type DrawMode = "add" | "edit" | null;

const EMPTY_DRAFT = (mapId: string): MobAuthoringDraft => ({
  name: "",
  rank: "normal",
  mapId,
  spawnAreas: [],
  source: "",
});

function diagnosticText(diagnostic: AuthoringDiagnostic): string {
  return `${diagnostic.scope}: ${diagnostic.message}`;
}

function diagnosticsText(diagnostics: readonly AuthoringDiagnostic[]): string {
  return diagnostics.map(diagnosticText).join(" ");
}

function jsonPreview(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function downloadJson(filename: string, value: unknown): void {
  const blob = new Blob([jsonPreview(value)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function mapForEntry(entry: MobAuthoringEntry): MapRecord | undefined {
  return mapMaster.maps.find((map) => map.id === entry.mapId);
}

function firstMapForExpansion(expansionId: string): MapRecord | undefined {
  return mapMaster.maps.find((map) => map.expansionId === expansionId);
}

export function App() {
  const [loaded] = useState(() => loadAuthoringData(mapMaster));
  const maps = mapMaster.maps;
  const initialMap = maps[0];
  const [entries, setEntries] = useState<readonly MobAuthoringEntry[]>(loaded.valid ? loaded.data?.entries ?? [] : []);
  const [draft, setDraft] = useState<MobAuthoringDraft>(() => EMPTY_DRAFT(initialMap?.id ?? ""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [feedback, setFeedback] = useState<string | null>(() => {
    if (loaded.diagnostics.length === 0) return null;
    return diagnosticsText(loaded.diagnostics);
  });
  const [selectedExpansionId, setSelectedExpansionId] = useState(initialMap?.expansionId ?? "");

  const authoringData = useMemo(() => makeAuthoringData(entries), [entries]);
  const authoringValidation = useMemo(
    () => validateAuthoringData(authoringData, mapMaster),
    [authoringData],
  );
  const runtimeGeneration = useMemo(
    () => generateRuntimeMaster(authoringData, mapMaster),
    [authoringData],
  );
  const currentMap = maps.find((map) => map.id === draft.mapId) ?? initialMap;
  const mapsForSelectedExpansion = maps.filter((map) => map.expansionId === selectedExpansionId);

  const selectMap = (mapId: string) => {
    if (mapId === draft.mapId) return;
    if (draft.spawnAreas.length > 0 && !window.confirm("マップを切り替えると、編集中の出現範囲を削除します。続けますか？")) return;
    setDraft((current) => changeAuthoringMap(current, mapId));
    setSelectedAreaIndex(null);
    setDrawMode(null);
    setFeedback("マップを切り替えました。出現範囲を指定してください。");
  };

  const selectExpansion = (expansionId: string) => {
    setSelectedExpansionId(expansionId);
    const nextMap = firstMapForExpansion(expansionId);
    if (nextMap) selectMap(nextMap.id);
  };

  const selectSavedEntryForEdit = (entry: MobAuthoringEntry) => {
    const map = mapForEntry(entry);
    setDraft({
      name: entry.name,
      rank: entry.rank,
      mapId: entry.mapId,
      spawnAreas: [...entry.spawnAreas],
      source: entry.source,
    });
    setEditingId(entry.id);
    setSelectedAreaIndex(null);
    setDrawMode(null);
    if (map) setSelectedExpansionId(map.expansionId);
    setFeedback(`${entry.name} を編集中です。`);
  };

  const saveDraft = () => {
    const nextEntry = createAuthoringEntry(draft, editingId ?? undefined);
    const nextEntries = addOrUpdateAuthoringEntry(entries, draft, editingId ?? undefined);
    if (editingId && !entries.some((entry) => entry.id === editingId)) nextEntries.push(nextEntry);
    const nextData = makeAuthoringData(nextEntries);
    const validation = validateAuthoringData(nextData, mapMaster);
    if (!validation.valid) {
      setFeedback(diagnosticsText(validation.diagnostics));
      return;
    }
    if (!saveAuthoringData(nextData)) {
      setFeedback("authoring data を localStorage に保存できませんでした。状態は変更されていません。");
      return;
    }
    setEntries(nextEntries);
    setEditingId(null);
    setSelectedAreaIndex(null);
    setDrawMode(null);
    setDraft((current) => EMPTY_DRAFT(current.mapId));
    const generated = generateRuntimeMaster(nextData, mapMaster);
    setFeedback(generated.valid ? "保存しました。runtime master を export できます。" : "保存しました。ただし runtime export は validation が解消されるまで停止しています。");
  };

  const deleteEntry = (entry: MobAuthoringEntry) => {
    if (!window.confirm(`${entry.name} を削除しますか？`)) return;
    const nextData: MobAuthoringData = makeAuthoringData(removeAuthoringEntry(entries, entry.id));
    if (!saveAuthoringData(nextData)) {
      setFeedback("authoring data を localStorage に保存できませんでした。削除していません。");
      return;
    }
    setEntries(nextData.entries);
    if (editingId === entry.id) {
      setEditingId(null);
      setSelectedAreaIndex(null);
      setDrawMode(null);
      setDraft((current) => EMPTY_DRAFT(current.mapId));
    }
    setFeedback("削除しました。");
  };

  const commitArea = (area: SpawnArea) => {
    if (drawMode === "edit" && selectedAreaIndex !== null) {
      setDraft((current) => ({ ...current, spawnAreas: updateSpawnArea(current.spawnAreas, selectedAreaIndex, area) }));
    } else {
      setDraft((current) => ({ ...current, spawnAreas: addSpawnArea(current.spawnAreas, area) }));
      setSelectedAreaIndex(draft.spawnAreas.length);
    }
    setDrawMode(null);
    setFeedback("出現範囲を更新しました。必要な範囲を追加できます。");
  };

  const removeSelectedArea = () => {
    if (selectedAreaIndex === null) return;
    setDraft((current) => ({ ...current, spawnAreas: removeSpawnArea(current.spawnAreas, selectedAreaIndex) }));
    setSelectedAreaIndex(null);
    setDrawMode(null);
    setFeedback("出現範囲を削除しました。");
  };

  const resetDraft = () => {
    setDraft((current) => EMPTY_DRAFT(current.mapId));
    setEditingId(null);
    setSelectedAreaIndex(null);
    setDrawMode(null);
    setFeedback("入力をリセットしました。");
  };

  if (!currentMap) {
    return <main className="authoring-shell"><section className="tool-panel"><h1>Mob master Authoring Tool</h1><p className="error-box">有効な map master がありません。ツールを開始できません。</p></section></main>;
  }

  return (
    <main className="authoring-shell">
      <section className="tool-panel" aria-labelledby="tool-title">
        <header className="tool-header">
          <div>
            <p className="eyebrow">開発用データ作成ツール</p>
            <h1 id="tool-title">Mob master Authoring Tool</h1>
            <p className="lede">マップ上で出現範囲を指定し、Mob master の候補地点を生成します。Mob Compass 本体の状態は使用しません。</p>
          </div>
          <span className="dev-badge">authoring only</span>
        </header>

        {feedback && <p className="feedback" role="alert">{feedback}</p>}

        <section className="editor-layout" aria-labelledby="editor-title">
          <div className="editor-column">
            <h2 id="editor-title">Mob を作成・編集</h2>
            <div className="selector-grid">
              <label>Expansion<select value={selectedExpansionId} onChange={(event) => selectExpansion(event.target.value)}>{mapMaster.expansions.map((expansion) => <option key={expansion.id} value={expansion.id}>{expansion.name}</option>)}</select></label>
              <label>Map<select value={draft.mapId} onChange={(event) => selectMap(event.target.value)}>{mapsForSelectedExpansion.map((map) => <option key={map.id} value={map.id}>{map.name}</option>)}</select></label>
            </div>

            <label>モブ名<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="正式名" /></label>
            <fieldset className="rank-fieldset">
              <legend>ランク</legend>
              <div className="rank-options">{MOB_RANKS.map((rank) => <label key={rank} className="rank-option"><input type="radio" name="mob-rank" value={rank} checked={draft.rank === rank} onChange={() => setDraft((current) => ({ ...current, rank }))} />{RANK_LABELS[rank]}</label>)}</div>
              <p className="field-note">category は rank から自動導出: {draft.rank === "normal" ? "regular" : "elite"}</p>
            </fieldset>

            <label>出典<input list="source-catalog" value={draft.source} onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))} placeholder="source ID / label / reference" /></label>
            <datalist id="source-catalog">{mapMaster.sources.map((source) => <option key={source.id} value={source.id}>{source.label}</option>)}</datalist>
            <p className="field-note">共通 source catalog に未登録の出典も保存できますが、runtime export は登録されるまで停止します。</p>

            <div className="area-heading"><h3>出現範囲</h3><span>{draft.spawnAreas.length} 件</span></div>
            <div className="area-actions">
              <button type="button" onClick={() => { setDrawMode("add"); setFeedback("地図上をドラッグして新しい範囲を指定してください。"); }}>範囲を追加</button>
              <button type="button" disabled={selectedAreaIndex === null} onClick={() => { setDrawMode("edit"); setFeedback("地図上をドラッグして選択範囲を修正してください。"); }}>選択範囲を修正</button>
              <button type="button" disabled={selectedAreaIndex === null} onClick={removeSelectedArea}>選択範囲を削除</button>
              {drawMode && <button type="button" className="quiet-button" onClick={() => { setDrawMode(null); setFeedback("範囲指定をキャンセルしました。"); }}>指定をキャンセル</button>}
            </div>
            {draft.spawnAreas.length === 0 ? <p className="empty">まだ範囲がありません。地図上をドラッグしてください。</p> : <ol className="area-list">{draft.spawnAreas.map((area, index) => <li key={`${index}-${area.minX}-${area.minY}-${area.maxX}-${area.maxY}`} className={selectedAreaIndex === index ? "selected" : ""}><button type="button" onClick={() => { setSelectedAreaIndex(index); setDrawMode(null); }}>{`Area ${index + 1}`}</button><span>{formatArea(area)}</span></li>)}</ol>}

            <div className="editor-actions">
              <button type="button" className="primary-button" onClick={saveDraft}>保存</button>
              <button type="button" className="quiet-button" onClick={resetDraft}>新規入力に戻す</button>
            </div>
            <p className="generated-note">mob ID、candidate ID、map ID、座標、data revision は自動生成されます。</p>
          </div>

          <div className="map-column">
            <div className="section-heading"><h2>Map: {currentMap.name}</h2><span className={drawMode ? "drawing-state" : ""}>{drawMode ? "範囲指定中" : "選択モード"}</span></div>
            <MapAuthoringCanvas map={currentMap} areas={draft.spawnAreas} selectedAreaIndex={selectedAreaIndex} drawMode={drawMode} onSelectArea={(index) => setSelectedAreaIndex(index)} onCommitArea={commitArea} onCancelDraw={() => setDrawMode(null)} />
            <p className="bounds-note">座標範囲: X {currentMap.bounds.minX}–{currentMap.bounds.maxX} / Y {currentMap.bounds.minY}–{currentMap.bounds.maxY}</p>
          </div>
        </section>

        <section className="registered-section" aria-labelledby="registered-title">
          <div className="section-heading"><h2 id="registered-title">登録済み Mob</h2><span>{entries.length} 件</span></div>
          {entries.length === 0 ? <p className="empty">登録済みの Mob はありません。</p> : <div className="registered-list">{entries.map((entry) => <article className="registered-card" key={entry.id}><div><h3>{entry.name}</h3><p>{RANK_LABELS[entry.rank]} / {mapForEntry(entry)?.name ?? entry.mapId} / {entry.spawnAreas.length} area</p><p className="source-text">出典: {entry.source}</p></div><div className="card-actions"><button type="button" onClick={() => selectSavedEntryForEdit(entry)}>編集</button><button type="button" className="danger-button" onClick={() => deleteEntry(entry)}>削除</button></div></article>)}</div>}
        </section>

        <section className="validation-section" aria-labelledby="validation-title">
          <div className="section-heading"><h2 id="validation-title">Validation / Export</h2><span className={runtimeGeneration.valid ? "valid-state" : "invalid-state"}>{runtimeGeneration.valid ? "export ready" : "export blocked"}</span></div>
          <div className="validation-grid">
            <div className="validation-card"><h3>Authoring data</h3><p className={authoringValidation.valid ? "valid-state" : "invalid-state"}>{authoringValidation.valid ? "valid" : "invalid"}</p>{authoringValidation.diagnostics.length > 0 && <ul className="diagnostic-list">{authoringValidation.diagnostics.map((item, index) => <li key={`${item.scope}-${item.code}-${index}`}>{diagnosticText(item)}</li>)}</ul>}</div>
            <div className="validation-card"><h3>Runtime Mob master</h3><p className={runtimeGeneration.valid ? "valid-state" : "invalid-state"}>{runtimeGeneration.valid ? "validateMobMaster: valid" : "validateMobMaster: export不可"}</p>{runtimeGeneration.diagnostics.length > 0 && <ul className="diagnostic-list">{runtimeGeneration.diagnostics.map((item, index) => <li key={`${item.scope}-${item.code}-${index}`}>{diagnosticText(item)}</li>)}</ul>}</div>
          </div>
          <div className="export-actions"><button type="button" onClick={() => downloadJson("mob-authoring.v1.json", authoringData)}>Authoring JSON をダウンロード</button><button type="button" disabled={!runtimeGeneration.valid || !runtimeGeneration.data} onClick={() => { if (runtimeGeneration.data) downloadJson("mob-master.v1.json", runtimeGeneration.data); }}>Runtime master を export</button></div>
          <details className="preview"><summary>Authoring data JSON preview</summary><pre>{jsonPreview(authoringData)}</pre></details>
          <details className="preview"><summary>Runtime master JSON preview</summary>{runtimeGeneration.data ? <pre>{jsonPreview(runtimeGeneration.data)}</pre> : <p className="empty">validation を通過するまで runtime master は表示・export しません。</p>}</details>
        </section>
      </section>
    </main>
  );
}
