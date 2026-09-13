import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapCanvas } from "@/components/MapCanvas/MapCanvas";
import { useAppStore } from "@/store/useAppStore";
import { FULL_PARTY } from "@/constants";
import { cn } from "@/lib/utils";
import type { TreasureCandidate, TreasureCatalog, TreasureRegistration, TreasureVersion } from "@/types";

const VERSIONS: TreasureVersion[] = ["3.x", "4.x", "5.x", "6.x", "7.x"];

interface ManualEntryTabProps {
  readonly open: boolean;
  readonly registrationId: string | null | undefined;
  readonly onOpenChange: (open: boolean) => void;
}

interface ManualEntryDialogProps {
  readonly open: boolean;
  readonly existing: TreasureRegistration | undefined;
  readonly catalog: TreasureCatalog | null;
  readonly registrationLimitReached: boolean;
  readonly registerManual: (memberName: string, candidate: TreasureCandidate) => boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function initialMapNo(catalog: TreasureCatalog | null, existing: TreasureRegistration | undefined): number {
  const existingMap = existing && catalog?.candidates.find((candidate) =>
    candidate.pointRef.gradeSetId === existing.pointRef.gradeSetId && candidate.pointRef.pointId === existing.pointRef.pointId,
  )?.map;
  return existingMap?.mapNo ?? catalog?.mapData.mapData[0]?.mapNo ?? 1;
}

function ManualEntryDialog({ open, existing, catalog, registrationLimitReached, registerManual, onOpenChange }: ManualEntryDialogProps) {
  const [name, setName] = useState(() => existing?.memberName ?? "");
  const [version, setVersion] = useState<TreasureVersion>(() => existing?.version ?? "7.x");
  const [mapNo, setMapNo] = useState(() => initialMapNo(catalog, existing));

  const candidates = useMemo(() => catalog?.candidates.filter((candidate) => candidate.version === version) ?? [], [catalog, version]);
  const maps = useMemo(() => {
    const mapNos = new Set(candidates.map((candidate) => candidate.map.mapNo));
    return catalog?.mapData.mapData.filter((map) => mapNos.has(map.mapNo)) ?? [];
  }, [catalog, candidates]);
  const selectedMap = maps.find((map) => map.mapNo === mapNo) ?? maps[0];
  const selectedCandidates = candidates.filter((candidate) => candidate.map.mapNo === selectedMap?.mapNo);

  const selectCandidate = (candidate: TreasureCandidate) => {
    if (!registerManual(name, candidate)) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {registrationLimitReached && !existing ? (
        <DialogContent className="max-w-sm border-red-900/70 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-sm text-red-300">手動登録できません</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">巡回リストの登録上限に達しています。</DialogDescription>
          </DialogHeader>
          <p role="alert" className="rounded-md border border-amber-800/70 bg-amber-950/30 p-3 text-sm text-amber-200">
            宝箱は最大{FULL_PARTY}人まで登録できます。既存の登録を削除してから追加してください。
          </p>
        </DialogContent>
      ) : (
        <DialogContent className="max-h-[92vh] w-full max-w-6xl overflow-hidden border-slate-700 bg-slate-900 p-0 text-slate-100 md:max-w-none md:w-[min(calc(92vh_-_1.25rem),calc(100vw_-_2rem))]">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-sm text-sky-300">{existing ? "宝箱を変更" : "宝箱を登録"}</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">名前を入力してから、バージョン・マップ・地点を選択してください。</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="manual-entry-member-name" className="text-xs font-semibold text-slate-300">メンバー名</label>
            <Input id="manual-entry-member-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="メンバー名（必須）" className="border-slate-700 bg-slate-950 text-slate-100" autoFocus />
            <p className="text-xs text-slate-500">名前を入力後、地図上の地点（座標）を選択して登録します。</p>
          </div>
          <div className="flex flex-col gap-1.5" aria-label="バージョン">
            <span className="text-xs font-semibold text-slate-300">バージョン</span>
            <div className="flex flex-wrap gap-1.5">
              {VERSIONS.map((item) => (
                <Button key={item} size="sm" variant="outline" aria-pressed={version === item} onClick={() => setVersion(item)} className={cn("border-slate-600 text-xs", version === item && "border-sky-300 bg-sky-700 text-white ring-1 ring-sky-300")}>
                  {item}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5" aria-label="マップ">
            <span className="text-xs font-semibold text-slate-300">マップ</span>
            <div className="flex flex-wrap gap-1.5">
              {maps.map((map) => (
                <Button key={map.mapId ?? map.mapNo} size="sm" variant="outline" aria-pressed={selectedMap?.mapNo === map.mapNo} onClick={() => setMapNo(map.mapNo)} className={cn("border-slate-600 text-xs text-slate-200", selectedMap?.mapNo === map.mapNo && "border-sky-300 bg-sky-800 text-white ring-1 ring-sky-300")}>
                  {map.mapNameShort}
                </Button>
              ))}
            </div>
          </div>
          {selectedMap && (
            <div className="grid min-h-0 gap-3 md:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="min-w-0 md:flex md:justify-center">
                <div className="w-full md:max-w-[min(100%,calc(92vh_-_20rem))]">
                  <MapCanvas interactive mapNo={selectedMap.mapNo} onPointClick={(point) => {
                    const candidate = selectedCandidates.find((entry) => entry.pointRef.pointId === point.stableId);
                    if (candidate) selectCandidate(candidate);
                  }} />
                </div>
              </div>
              <div className="flex max-h-[calc(92vh_-_20rem)] flex-col gap-1 overflow-y-auto">
                <span className="mb-1 text-xs text-slate-400">地点一覧</span>
                {selectedCandidates.map((candidate) => (
                  <Button key={candidate.pointRef.pointId} variant="outline" size="sm" onClick={() => selectCandidate(candidate)} className="justify-start border-slate-600 text-xs text-slate-200 hover:border-sky-500 hover:bg-sky-950">
                    <span className="mr-2 font-bold text-sky-300">{candidate.point.pointName}</span>
                    <span className="font-mono text-[10px] text-slate-500">({(candidate.point.posX / 10).toFixed(1)}, {(candidate.point.posY / 10).toFixed(1)})</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

export function ManualEntryTab({ open, registrationId, onOpenChange }: ManualEntryTabProps) {
  const catalog = useAppStore((state) => state.catalog);
  const registrations = useAppStore((state) => state.registrations);
  const registerManual = useAppStore((state) => state.registerManual);
  const existing = registrationId ? registrations.find((registration) => registration.registrationId === registrationId) : undefined;

  return (
    <ManualEntryDialog
      key={`${open ? "open" : "closed"}:${registrationId ?? "new"}`}
      open={open}
      existing={existing}
      catalog={catalog}
      registrationLimitReached={registrationId === null && registrations.length >= FULL_PARTY}
      registerManual={registerManual}
      onOpenChange={onOpenChange}
    />
  );
}
