import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore, type BulkApplyResult, type BulkRegistrationProposal } from "@/store/useAppStore";
import { analyzeBulkInput, type BulkRow } from "@/utils/bulkParser";
import type { TreasureCandidate } from "@/types";
import { toast } from "sonner";

interface BulkInputTabProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function candidateKey(candidate: TreasureCandidate): string {
  return `${candidate.pointRef.gradeSetId}:${candidate.pointRef.mapId}:${candidate.pointRef.pointId}`;
}

function candidateLabel(candidate: TreasureCandidate): string {
  return `${candidate.version} / ${candidate.map.mapNameShort} / ${candidate.point.pointName} (${(candidate.point.posX / 10).toFixed(1)}, ${(candidate.point.posY / 10).toFixed(1)})`;
}

function rowStatus(row: BulkRow): string {
  if (row.status === "resolved") return "登録候補";
  if (row.status === "ambiguous") return "候補を選択してください";
  return row.reason ?? "登録できません";
}

function resultReason(reason: BulkApplyResult["rejected"][number]["reason"]): string {
  if (reason === "conflict") return "同名の候補が競合しています";
  if (reason === "capacity") return "登録上限のため未適用です";
  return "保存失敗のため未適用です";
}

export function BulkInputTab({ open, onOpenChange }: BulkInputTabProps) {
  const catalog = useAppStore((state) => state.catalog);
  const text = useAppStore((state) => state.bulkText);
  const setBulkText = useAppStore((state) => state.setBulkText);
  const applyBulkProposal = useAppStore((state) => state.applyBulkProposal);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, TreasureCandidate>>({});
  const [lineResults, setLineResults] = useState<Record<number, string>>({});

  const rows = useMemo(
    () => catalog && text.trim() ? analyzeBulkInput(text, catalog) : [],
    [catalog, text],
  );

  const proposals = useMemo(() => {
    const byName = new Map<string, Array<{ candidate: TreasureCandidate; lineNumber: number; explicit: boolean }>>();
    for (const row of rows) {
      const candidate = selectedCandidates[row.lineNumber] ?? row.selectedCandidate;
      const name = row.parsed?.memberName ?? "";
      if (!candidate || !name) continue;
      const entries = byName.get(name) ?? [];
      entries.push({ candidate, lineNumber: row.lineNumber, explicit: selectedCandidates[row.lineNumber] !== undefined });
      byName.set(name, entries);
    }
    const values: BulkRegistrationProposal[] = [];
    const conflicts = new Set<string>();
    const candidatesByName = new Map<string, TreasureCandidate[]>();
    for (const [name, entries] of byName) {
      const candidates = [...new Map(entries.map((entry) => [candidateKey(entry.candidate), entry.candidate])).values()];
      candidatesByName.set(name, candidates);
      const explicit = [...new Map(entries.filter((entry) => entry.explicit).map((entry) => [candidateKey(entry.candidate), entry.candidate])).values()];
      const selected = explicit.length === 1 ? explicit[0] : candidates.length === 1 ? candidates[0] : null;
      if (!selected) {
        conflicts.add(name);
        continue;
      }
      values.push({
        memberName: name,
        candidate: selected,
        lineNumbers: entries.filter((entry) => candidateKey(entry.candidate) === candidateKey(selected)).map((entry) => entry.lineNumber),
      });
    }
    return { values, conflicts, candidatesByName };
  }, [rows, selectedCandidates]);

  const selectCandidate = (lineNumber: number, candidate: TreasureCandidate) => {
    setSelectedCandidates((previous) => ({ ...previous, [lineNumber]: candidate }));
  };

  const handleApply = () => {
    if (!catalog) {
      toast.error("マスターデータが読み込まれていません");
      return;
    }
    if (proposals.values.length === 0) {
      toast.warning("登録できる解決済みデータがありません");
      return;
    }
    const result = applyBulkProposal(proposals.values);
    const nextLineResults: Record<number, string> = {};
    for (const lineNumber of result.appliedLineNumbers) nextLineResults[lineNumber] = "登録済み";
    for (const rejection of result.rejected) {
      for (const lineNumber of rejection.lineNumbers) nextLineResults[lineNumber] = resultReason(rejection.reason);
    }
    setLineResults((previous) => ({ ...previous, ...nextLineResults }));
    if (result.applied > 0) toast.success(`${result.applied}件を登録しました`);
    if (result.rejected.length > 0) toast.warning("一部の行は未適用です。内容を確認してください");
    if (result.applied === 0 && result.rejected.length === 0) toast.error("登録に失敗しました。保存内容は変更されていません");
    if (result.rejected.length === 0 && proposals.conflicts.size === 0) onOpenChange(false);
  };

  const handleClear = () => {
    setBulkText("");
    setSelectedCandidates({});
    setLineResults({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden border-slate-700 bg-slate-900 p-0 text-slate-100">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-sm text-sky-300">一括登録</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            パーティチャットを貼り付け、解決できた行だけ確認して登録します。名前のない行は登録しません。
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
          <Textarea
            value={text}
            onChange={(event) => setBulkText(event.target.value)}
            placeholder="(★プレイヤー名) マップ名 (12.3, 45.6)"
            className="h-40 shrink-0 resize-none border-slate-700 bg-slate-950 font-mono text-xs text-slate-200 placeholder:text-slate-600"
          />
          {rows.length > 0 && (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-2">
                {rows.map((row) => {
                  const selected = selectedCandidates[row.lineNumber] ?? row.selectedCandidate;
                  const hasConflict = row.parsed?.memberName ? proposals.conflicts.has(row.parsed.memberName) : false;
                  const nameCandidates = row.parsed?.memberName ? proposals.candidatesByName.get(row.parsed.memberName) ?? row.candidates : row.candidates;
                  const status = lineResults[row.lineNumber] ?? (hasConflict ? "同名の候補が競合" : rowStatus(row));
                  return (
                    <div key={row.lineNumber} className="rounded border border-slate-700 bg-slate-950/60 p-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 break-words text-slate-300">{row.lineNumber}: {row.parsed?.memberName || row.raw}</span>
                        <span className={row.status === "resolved" && !hasConflict ? "shrink-0 text-emerald-300" : "shrink-0 text-amber-300"}>
                          {status}
                        </span>
                      </div>
                      {nameCandidates.length > 1 && (
                        <select
                          value={selected ? candidateKey(selected) : ""}
                          onChange={(event) => {
                            const candidate = nameCandidates.find((entry) => candidateKey(entry) === event.target.value);
                            if (candidate) selectCandidate(row.lineNumber, candidate);
                          }}
                          className="mt-2 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                        >
                          <option value="">候補を選択</option>
                          {nameCandidates.map((candidate) => (
                            <option key={candidateKey(candidate)} value={candidateKey(candidate)}>{candidateLabel(candidate)}</option>
                          ))}
                        </select>
                      )}
                      {selected && !hasConflict && <p className="mt-1 text-slate-500">{candidateLabel(selected)}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex shrink-0 gap-2">
            <Button onClick={handleApply} className="flex-1 bg-sky-600 text-white hover:bg-sky-500">解決済みを登録</Button>
            <Button variant="outline" onClick={handleClear} className="border-slate-600 text-slate-300 hover:bg-slate-800">クリア</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
