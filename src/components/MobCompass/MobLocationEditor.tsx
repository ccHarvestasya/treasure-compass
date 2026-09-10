import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatCoordinate } from '@/domain/normalization';
import { useAppStore } from '@/store/useAppStore';
import type { MobMasterLocation, MobMasterMob } from '@/types';
import { MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';

interface MobLocationEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function locationKey(mobId: string, index: number): string {
  return `${mobId}:${index}`;
}

interface LocationDraft {
  x: string;
  y: string;
  z: string;
}

interface ActiveLocation {
  mob: MobMasterMob;
  index: number;
  location: MobMasterLocation;
}

export function MobLocationEditor({ open, onOpenChange }: MobLocationEditorProps) {
  const master = useAppStore((state) => state.mobMaster);
  const editLocation = useAppStore((state) => state.editMobMasterLocation);
  const [selectedKey, setSelectedKey] = useState('');
  const [drafts, setDrafts] = useState<Record<string, LocationDraft>>({});

  const firstKey = master?.mobs[0]?.locations[0] ? locationKey(master.mobs[0].id, 0) : '';
  const activeKey = selectedKey || firstKey;
  let activeLocation: ActiveLocation | null = null;
  if (master) {
    for (const mob of master.mobs) {
      for (const [index, location] of mob.locations.entries()) {
        if (locationKey(mob.id, index) === activeKey) {
          activeLocation = { mob, index, location };
          break;
        }
      }
      if (activeLocation) break;
    }
    if (!activeLocation && master.mobs[0]?.locations[0]) activeLocation = { mob: master.mobs[0], index: 0, location: master.mobs[0].locations[0] };
  }

  const resolvedKey = activeLocation ? locationKey(activeLocation.mob.id, activeLocation.index) : '';
  const activeDraft = activeLocation
    ? drafts[resolvedKey] ?? {
      x: formatCoordinate(activeLocation.location.x),
      y: formatCoordinate(activeLocation.location.y),
      z: activeLocation.location.z === undefined ? '' : String(activeLocation.location.z),
    }
    : { x: '', y: '', z: '' };

  const updateDraft = (field: keyof LocationDraft, value: string) => {
    if (!activeLocation) return;
    setDrafts((current) => ({
      ...current,
      [resolvedKey]: { ...activeDraft, [field]: value },
    }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedKey('');
      setDrafts({});
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!master || !activeLocation) return;
    const result = editLocation(activeLocation.mob.id, activeLocation.index, activeDraft.x, activeDraft.y, activeDraft.z, master.generation);
    if (result.ok) toast.success('モブ位置を更新しました');
    else toast.error(result.reason ?? 'モブ位置を更新できません');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl w-full bg-slate-900 border-slate-700 text-slate-100 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-fuchsia-300 text-sm flex items-center gap-1.5"><MapPin className="size-4" />モブ位置を編集</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            X/Y は候補地点の識別に使い、Z は補足情報として表示します。編集は現在のブラウザ上の master read model に反映されます。
          </DialogDescription>
        </DialogHeader>

        {!master || master.mobs.length === 0 ? (
          <p className="text-xs text-slate-400">編集できる Mob マスターがありません。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 overflow-auto min-h-0">
            <div className="space-y-2 min-w-0">
              <p className="text-xs font-semibold text-slate-300">編集対象</p>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {master.mobs.flatMap((mob) => mob.locations.map((location, index) => {
                  const key = locationKey(mob.id, index);
                  const map = master.maps.find((entry) => entry.id === location.mapId);
                  const selected = activeLocation?.mob.id === mob.id && activeLocation.index === index;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedKey(key)}
                      className={`w-full rounded-md border p-2 text-left text-xs transition-colors ${selected ? 'border-fuchsia-500 bg-fuchsia-950/30' : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'}`}
                    >
                      <span className="block truncate text-slate-200">{mob.name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-400">
                        {map?.name ?? location.mapId} ({formatCoordinate(location.x)}, {formatCoordinate(location.y)}, {location.z === undefined ? '—' : location.z})
                      </span>
                    </button>
                  );
                }))}
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-slate-700 bg-slate-950/40 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-200">{activeLocation?.mob.name ?? '—'}</p>
                <p className="text-[10px] text-slate-500">{activeLocation ? (master.maps.find((map) => map.id === activeLocation.location.mapId)?.name ?? activeLocation.location.mapId) : '—'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="space-y-1 text-[10px] text-slate-400">X<Input value={activeDraft.x} onChange={(event) => updateDraft('x', event.target.value)} inputMode="decimal" className="text-xs bg-slate-900 border-slate-700" /></label>
                <label className="space-y-1 text-[10px] text-slate-400">Y<Input value={activeDraft.y} onChange={(event) => updateDraft('y', event.target.value)} inputMode="decimal" className="text-xs bg-slate-900 border-slate-700" /></label>
                <label className="space-y-1 text-[10px] text-slate-400">Z（任意）<Input value={activeDraft.z} onChange={(event) => updateDraft('z', event.target.value)} inputMode="decimal" className="text-xs bg-slate-900 border-slate-700" /></label>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">X/Y はマップの有効範囲と同一地点の重複を検証します。Z を空欄にすると補足値を削除します。</p>
              <Button onClick={handleSave} disabled={!activeLocation} className="w-full h-8 text-xs bg-fuchsia-700 hover:bg-fuchsia-600"><Save className="mr-1 size-3" />保存</Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="border-slate-600 text-slate-300">閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
