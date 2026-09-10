import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { formatCoordinate } from '@/domain/normalization';
import { serializeMobGuide } from '@/domain/mobGuide';
import type { MobOperationResult } from '@/types';
import { toast } from 'sonner';
import { Check, Copy, RotateCcw, Trash2, Upload, X } from 'lucide-react';

function resultMessage(result: MobOperationResult) {
  if (result.failure === 'persistence-write') return '保存書込みに失敗しました。状態は変更されていません。';
  if (result.failure === 'route-calculation') return result.reason ?? 'ルートを計算できません。';
  if (result.failure?.startsWith('guide-')) return result.reason ?? '案内を処理できません。';
  return result.reason;
}

export function MobCompassPanel() {
  const master = useAppStore((state) => state.mobMaster);
  const masterError = useAppStore((state) => state.mobMasterError);
  const session = useAppStore((state) => state.mobSession);
  const lastResult = useAppStore((state) => state.mobLastResult);
  const inputText = useAppStore((state) => state.mobInputText);
  const setInputText = useAppStore((state) => state.setMobInputText);
  const guideText = useAppStore((state) => state.mobGuideText);
  const setGuideText = useAppStore((state) => state.setMobGuideText);
  const addInput = useAppStore((state) => state.addMobInput);
  const addMob = useAppStore((state) => state.addMob);
  const addMasterCandidate = useAppStore((state) => state.addMobMasterCandidate);
  const removeMob = useAppStore((state) => state.removeMob);
  const confirmCandidate = useAppStore((state) => state.confirmMobCandidate);
  const completeMob = useAppStore((state) => state.completeMob);
  const reorderMob = useAppStore((state) => state.reorderMob);
  const recalc = useAppStore((state) => state.recalcMobRoute);
  const startNewRun = useAppStore((state) => state.startNewMobRun);
  const outputGuide = useAppStore((state) => state.outputMobGuide);
  const importGuide = useAppStore((state) => state.importMobGuide);
  const [mobName, setMobName] = useState('');
  const [mapName, setMapName] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [generatedGuide, setGeneratedGuide] = useState('');
  const [selectedMobId, setSelectedMobId] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  const selectedMob = master?.mobs.find((mob) => mob.id === selectedMobId);

  const orderedTargets = useMemo(() => {
    const order = session.mode === 'auto' ? session.route.order : session.manualOrder;
    const rest = Object.keys(session.targets).filter((id) => !order.includes(id));
    return [...order, ...rest].filter((id, index, ids) => ids.indexOf(id) === index && session.targets[id]);
  }, [session.manualOrder, session.mode, session.route.order, session.targets]);

  const showResult = (result: MobOperationResult) => {
    const message = resultMessage(result);
    if (result.ok && result.kind === 'accepted') toast.success('Mob Compass の状態を更新しました');
    else if (result.kind === 'duplicate') toast.info('既に登録されている候補です');
    else if (message) toast.error(message);
  };

  const handleAdd = () => {
    const result = addMob(mobName, mapName, x, y);
    showResult(result);
    if (result.ok) {
      setMobName('');
      setMapName('');
      setX('');
      setY('');
    }
  };

  const handleOutput = async () => {
    let copied = false;
    const result = await outputGuide(async (guide) => {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(guide);
      copied = true;
    });
    if (result.ok && result.guide) {
      const serialized = serializeMobGuide(result.guide);
      setGeneratedGuide(serialized);
      toast.success(copied ? '案内をコピーしました' : '案内を生成しました');
    } else toast.error(resultMessage(result) ?? '案内を出力できません');
  };

  const moveTarget = (mobId: string, delta: number) => {
    const order = [...(session.mode === 'manual' ? session.manualOrder : session.route.order)];
    const index = order.indexOf(mobId);
    if (index < 0) return;
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= order.length) return;
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    showResult(reorderMob(order));
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {masterError && <p className="rounded-md border border-red-900/60 bg-red-950/30 p-2 text-xs text-red-300">{masterError}</p>}
      {!master && !masterError && <p className="text-xs text-slate-400">Mob マスターデータを読み込んでいます。</p>}
      {master && master.mobs.length === 0 && <p className="rounded-md border border-amber-900/60 bg-amber-950/30 p-2 text-xs text-amber-300">利用可能な Mob マスターがありません。</p>}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-sky-300">Mob を登録</h2>
          <span className="text-[10px] text-slate-500">候補は同じモブへ追加</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input value={mobName} onChange={(event) => setMobName(event.target.value)} placeholder="モブ名" disabled={!master} className="h-8 text-xs bg-slate-900 border-slate-700" />
          <Input value={mapName} onChange={(event) => setMapName(event.target.value)} placeholder="マップ" disabled={!master} className="h-8 text-xs bg-slate-900 border-slate-700" />
          <Input value={x} onChange={(event) => setX(event.target.value)} placeholder="X" disabled={!master} className="h-8 text-xs bg-slate-900 border-slate-700" />
          <Input value={y} onChange={(event) => setY(event.target.value)} placeholder="Y" disabled={!master} className="h-8 text-xs bg-slate-900 border-slate-700" />
        </div>
        <Button onClick={handleAdd} disabled={!master} className="w-full h-8 text-xs bg-sky-600 hover:bg-sky-500">候補を登録</Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-sky-300">マスターから選択</h2>
        <div className="grid grid-cols-2 gap-2">
          <select value={selectedMobId} onChange={(event) => { setSelectedMobId(event.target.value); setSelectedCandidateId(''); }} disabled={!master} className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200">
            <option value="">モブを選択</option>
            {master?.mobs.map((mob) => <option key={mob.id} value={mob.id}>{mob.name}</option>)}
          </select>
          <select value={selectedCandidateId} onChange={(event) => setSelectedCandidateId(event.target.value)} disabled={!selectedMob} className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200">
            <option value="">候補地点を選択</option>
            {selectedMob?.locations.map((location) => <option key={`${location.mapId}-${location.x}-${location.y}`} value={`${location.mapId}@${formatCoordinate(location.x)},${formatCoordinate(location.y)}`}>{location.mapId} ({formatCoordinate(location.x)}, {formatCoordinate(location.y)})</option>)}
          </select>
        </div>
        <Button onClick={() => { const result = addMasterCandidate(selectedMobId, selectedCandidateId); showResult(result); if (result.ok) setSelectedCandidateId(''); }} disabled={!master || !selectedMobId || !selectedCandidateId} className="w-full h-8 text-xs bg-sky-600 hover:bg-sky-500">選択した候補を登録</Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-sky-300">通常の複数行入力</h2>
        <Textarea value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder={'mob: モブ名 | マップ | 12.3,45.6\n...'} disabled={!master} className="h-28 text-xs font-mono bg-slate-900 border-slate-700 resize-none" />
        <Button onClick={() => showResult(addInput())} disabled={!master || !inputText.trim()} variant="outline" className="h-8 text-xs border-slate-600 text-slate-300">入力行を登録</Button>
        {lastResult?.rowResults && <div className="text-[10px] text-slate-400">valid {lastResult.rowResults.filter((row) => row.status === 'valid').length} / duplicate {lastResult.rowResults.filter((row) => row.status === 'duplicate').length} / reject {lastResult.rowResults.filter((row) => row.status === 'invalid' || row.status === 'conflict').length}</div>}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-sky-300">巡回</h2>
          <span className="text-xs text-slate-400">{session.mode ? `${session.mode === 'auto' ? '自動ルート' : '手動順序'} / ${session.route.transitions === 'unknown' ? '未確定' : `${session.route.transitions} 遷移`}` : '未開始'}</span>
        </div>
        {session.route.status === 'failure' && <p className="text-xs text-red-300">ルート計算不能: {session.route.failure}</p>}
        {session.route.status === 'ready' && (session.route.fee !== undefined || session.route.loadTime !== undefined) && <p className="text-[10px] text-slate-400">移動負荷: {session.route.fee === undefined ? '料金未提供' : `${session.route.fee} gil`} / {session.route.loadTime === undefined ? 'ロード時間未提供' : `${session.route.loadTime}`}</p>}
        {session.route.ties.map((tie) => <div key={tie.mobId} className="rounded border border-amber-800/60 bg-amber-950/20 p-2 text-[10px] text-amber-200">同順位: {session.targets[tie.mobId]?.mobName ?? tie.mobId} — {tie.alternatives.map((alternative) => `${alternative.selection.candidateId} (${alternative.fee === undefined ? '料金?' : `${alternative.fee} gil`}/${alternative.loadTime === undefined ? '時間?' : alternative.loadTime})`).join(' / ')}</div>)}
        {orderedTargets.length === 0 && <p className="text-xs text-slate-500">Mob を登録すると候補と進行が表示されます。</p>}
        <div className="space-y-2">
          {orderedTargets.map((mobId, index) => {
            const target = session.targets[mobId];
            const selected = session.currentSelections[mobId] ?? session.selectionHistory[mobId];
            return <div key={mobId} className={`rounded-md border p-2 ${target.complete ? 'border-emerald-900/50 bg-emerald-950/20' : 'border-slate-700 bg-slate-800/30'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{target.complete ? '✓' : index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{target.mobName}</span>
                {!target.complete && <Button variant="ghost" size="sm" onClick={() => showResult(completeMob(mobId))} className="h-6 px-2 text-[10px] text-emerald-400">完了</Button>}
                <Button variant="ghost" size="sm" onClick={() => showResult(removeMob(mobId))} className="h-6 px-1.5 text-slate-500 hover:text-red-400"><Trash2 className="size-3" /></Button>
              </div>
              <div className="mt-1 space-y-1 pl-5">
                {Object.values(target.candidates).map((candidate) => <div key={candidate.id} className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className={candidate.classification === 'confirmed' ? 'text-sky-300' : 'text-amber-300'}>{candidate.classification}</span>
                  <span className="font-mono">{candidate.mapNameShort} ({formatCoordinate(candidate.x)}, {formatCoordinate(candidate.y)})</span>
                  {selected?.candidateId === candidate.id && <span className="text-fuchsia-300">route-selected</span>}
                  {candidate.userConfirmed && <span className="text-emerald-300">user-confirmed</span>}
                  <button onClick={() => showResult(confirmCandidate(mobId, candidate.id, !candidate.userConfirmed))} className="ml-auto text-slate-500 hover:text-sky-300">{candidate.userConfirmed ? <X className="size-3" /> : <Check className="size-3" />}</button>
                </div>)}
              </div>
              {session.mode === 'manual' && !target.complete && <div className="mt-1 flex gap-1 pl-5"><Button variant="ghost" size="sm" onClick={() => moveTarget(mobId, -1)} disabled={index === 0} className="h-5 px-1 text-[10px]">↑</Button><Button variant="ghost" size="sm" onClick={() => moveTarget(mobId, 1)} disabled={index === orderedTargets.length - 1} className="h-5 px-1 text-[10px]">↓</Button></div>}
            </div>;
          })}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => showResult(recalc())} disabled={!master || !session.run} className="h-8 flex-1 text-xs bg-indigo-600 hover:bg-indigo-500"><RotateCcw className="mr-1 size-3" />最短ルートを再計算</Button>
          <Button onClick={() => showResult(startNewRun())} className="h-8 text-xs border-slate-600 text-slate-300" variant="outline">新しい周回</Button>
        </div>
      </section>

      <section className="space-y-2 border-t border-slate-800 pt-3">
        <h2 className="text-sm font-semibold text-sky-300">案内</h2>
        <div className="flex gap-2">
          <Button onClick={() => void handleOutput()} disabled={!session.run} className="h-8 text-xs bg-emerald-700 hover:bg-emerald-600"><Copy className="mr-1 size-3" />案内をコピー</Button>
          <Button onClick={() => showResult(importGuide(guideText, false))} disabled={!guideText.trim()} variant="outline" className="h-8 text-xs border-slate-600 text-slate-300"><Upload className="mr-1 size-3" />取り込む</Button>
          <Button onClick={() => showResult(importGuide(guideText, true))} disabled={!guideText.trim()} variant="outline" className="h-8 text-xs border-amber-800 text-amber-300">置換</Button>
        </div>
        <Textarea value={guideText} onChange={(event) => setGuideText(event.target.value)} placeholder="MOB-COMPASS/1 の案内を貼り付け" className="h-28 text-[10px] font-mono bg-slate-900 border-slate-700 resize-y" />
        {generatedGuide && <Textarea readOnly value={generatedGuide} className="h-28 text-[10px] font-mono bg-slate-950 border-emerald-900/60 text-emerald-200 resize-y" />}
      </section>
    </div>
  );
}
