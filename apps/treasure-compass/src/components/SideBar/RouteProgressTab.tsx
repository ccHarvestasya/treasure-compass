import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronRight, Copy, GripVertical, MoreHorizontal, Pencil, RotateCcw, SkipForward, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { generateMultiLineMacro, generateOneLineMacro } from "@/utils/macro";
import { toast } from "sonner";
import { treasurePointRefKey } from "@treasure-compass/treasure-domain";

interface RouteProgressTabProps {
  readonly onEdit?: (registrationId: string) => void;
}

type SortableResult = ReturnType<typeof useSortable>;
type SortableHandle = Pick<SortableResult, "attributes" | "listeners" | "setActivatorNodeRef">;

function SortableRouteItem({ id, children }: { readonly id: string; readonly children: (handle: SortableHandle) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-70" : undefined}
    >
      {children({ attributes, listeners, setActivatorNodeRef })}
    </div>
  );
}

export function RouteProgressTab({ onEdit }: RouteProgressTabProps) {
  const registrations = useAppStore((state) => state.registrations);
  const playlistOrder = useAppStore((state) => state.playlistOrder);
  const catalog = useAppStore((state) => state.catalog);
  const listSelection = useAppStore((state) => state.listSelection);
  const currentTarget = useAppStore((state) => state.currentTarget);
  const orderMode = useAppStore((state) => state.orderMode);
  const unresolvedReferences = useAppStore((state) => state.unresolvedReferences);
  const route = useAppStore((state) => state.route);
  const routeTieCandidates = useAppStore((state) => state.routeTieCandidates);
  const routeError = useAppStore((state) => state.routeError);
  const selectListItem = useAppStore((state) => state.selectListItem);
  const next = useAppStore((state) => state.next);
  const back = useAppStore((state) => state.back);
  const completeRegistration = useAppStore((state) => state.completeRegistration);
  const cancelRegistration = useAppStore((state) => state.cancelRegistration);
  const removeRegistration = useAppStore((state) => state.removeRegistration);
  const reorderRegistrations = useAppStore((state) => state.reorderRegistrations);
  const setManualSort = useAppStore((state) => state.setManualSort);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const registrationById = useMemo(
    () => new Map(registrations.map((registration) => [registration.registrationId, registration])),
    [registrations],
  );
  const candidateByRef = useMemo(
        () => new Map((catalog?.candidates ?? []).map((candidate) => [treasurePointRefKey(candidate.pointRef), candidate])),
    [catalog],
  );
  const orderedRegistrations = playlistOrder.flatMap((id) => {
    const registration = registrationById.get(id);
    return registration ? [registration] : [];
  });
  const playlistKey = playlistOrder.join("\u0000");
  const orderedIds = useMemo(() => playlistKey ? playlistKey.split("\u0000") : [], [playlistKey]);
  useEffect(() => {
    const container = listRef.current;
    if (!container || !currentTarget) return;
    const targetIndex = orderedIds.indexOf(currentTarget);
    const targetElement = itemRefs.current.get(currentTarget);
    if (targetIndex < 0 || !targetElement) return;
    if (targetIndex === 0) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const previousElement = itemRefs.current.get(orderedIds[targetIndex - 1] ?? "");
    const gap = 6;
    const previousHeight = previousElement?.offsetHeight ?? targetElement.offsetHeight;
    const containerRect = container.getBoundingClientRect();
    const targetTop = targetElement.getBoundingClientRect().top - containerRect.top + container.scrollTop;
    container.scrollTo({
      top: Math.max(0, targetTop - previousHeight - gap),
      behavior: "smooth",
    });
  }, [currentTarget, orderedIds]);

  const copyToClipboard = async (value: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("copy failed");
      }
      toast.success(`${label}をコピーしました`);
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  const run = (action: () => boolean, failureMessage: string) => {
    if (!action()) toast.warning(failureMessage);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    run(() => reorderRegistrations(String(active.id), String(over.id)), "並べ替えを保存できませんでした");
  };

  if (orderedRegistrations.length === 0) {
    return (
      <div className="p-4 text-center text-sm">
        {routeError ? <p className="text-red-300" role="alert">{routeError}</p> : (
          <p className="mt-8 text-slate-500"><ChevronRight className="mr-1 inline size-4" />宝箱を登録すると巡回リストが表示されます</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {routeError && <p className="text-sm text-red-300" role="alert">{routeError}</p>}
      {routeTieCandidates.length > 1 && (
        <details className="rounded-md border border-amber-800/60 bg-amber-950/20 p-2 text-xs text-amber-200">
          <summary className="cursor-pointer">同率候補 {routeTieCandidates.length} 件（先頭を表示）</summary>
          <ol className="mt-2 space-y-1 pl-4">
            {routeTieCandidates.map((candidate, candidateIndex) => (
              <li key={`route-tie-${candidateIndex}`}>
                候補 {candidateIndex + 1}{candidate.route[0]?.startPoint ? `（開始: ${candidate.route[0].startPoint.pointName}）` : ""}: {candidate.route.map((step) => `${step.mapId ?? step.mapNameShort} (${(step.point.posX / 10).toFixed(1)},${(step.point.posY / 10).toFixed(1)}) ${step.point.stableId ?? step.registrationId ?? step.memberName}`).join(" → ")}
              </li>
            ))}
          </ol>
        </details>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">{orderMode === "manual" ? "手動順序" : "自動順序"}</span>
        <Button size="sm" variant="outline" onClick={() => run(() => setManualSort(orderMode !== "manual"), "順序を保存できませんでした")} className="h-7 border-slate-600 px-2 text-xs text-slate-200">
          {orderMode === "manual" ? "自動順序へ" : "手動順序へ"}
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => run(back, "戻れる操作がありません")} className="h-7 border-slate-600 px-2 text-xs text-slate-200" aria-label="戻る"><RotateCcw className="mr-1 size-3" />戻る</Button>
          <Button size="lg" onClick={() => run(next, "次へ進める対象がありません")} className="h-10 min-w-20 bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-600"><SkipForward className="mr-1 size-4" />次へ</Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedRegistrations.map((registration) => registration.registrationId)} strategy={verticalListSortingStrategy}>
          <div ref={listRef} className="flex max-h-[28rem] flex-col gap-1.5 overflow-y-auto pr-1">
            {orderedRegistrations.map((registration, index) => {
          const candidate = candidateByRef.get(treasurePointRefKey(registration.pointRef));
          const unresolved = unresolvedReferences.find((reference) => reference.registrationId === registration.registrationId && reference.source === "registration");
          const isSelected = listSelection === registration.registrationId;
          const isTarget = currentTarget === registration.registrationId;
          const actionButtons = (
            <>
              {!unresolved && (registration.completed ? (
                <Button size="xs" variant="outline" onClick={() => run(() => cancelRegistration(registration.registrationId), "取消できません")} className="border-slate-600 bg-slate-900/70 text-xs text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white">取消</Button>
              ) : (
                <Button size="xs" variant="outline" onClick={() => run(() => completeRegistration(registration.registrationId), "完了にできません")} className="border-emerald-800/80 bg-emerald-950/30 text-xs text-emerald-300 hover:border-emerald-600 hover:bg-emerald-900/50 hover:text-emerald-100">完了</Button>
              ))}
              <details className="relative">
                <summary className="flex size-6 cursor-pointer list-none items-center justify-center rounded-md border border-slate-600 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white [&::-webkit-details-marker]:hidden" aria-label={`${registration.memberName}のその他の操作`}>
                  <MoreHorizontal className="size-3.5" />
                </summary>
                <div className="absolute right-0 top-full z-30 mt-1 min-w-24 rounded-md border border-slate-600 bg-slate-900 p-1 text-xs shadow-lg shadow-black/30">
                  <button type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); onEdit?.(registration.registrationId); }} className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-slate-200 hover:bg-slate-700"><Pencil className="size-3" />編集</button>
                  <button type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); run(() => removeRegistration(registration.registrationId), "削除を保存できませんでした"); }} className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-red-300 hover:bg-red-950/50"><Trash2 className="size-3" />削除</button>
                </div>
              </details>
            </>
          );
          return (
            <SortableRouteItem key={registration.registrationId} id={registration.registrationId}>
              {(handle) => <div
                ref={(element) => {
                  if (element) itemRefs.current.set(registration.registrationId, element);
                  else itemRefs.current.delete(registration.registrationId);
                }}
                className={cn(
                "rounded-md border p-1.5 text-sm transition-colors",
                unresolved ? "border-amber-800/70 bg-amber-950/20" : registration.completed ? "border-emerald-800/50 bg-emerald-950/30" : isTarget ? "border-yellow-600/70 bg-yellow-950/30" : isSelected ? "border-sky-600/70 bg-sky-950/20" : "border-slate-700/50 bg-slate-800/30",
              )}
              >
              <div className="flex items-center gap-1.5">
                <button type="button" ref={handle.setActivatorNodeRef} {...handle.attributes} {...handle.listeners} className="touch-none cursor-grab rounded bg-slate-900/40 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 active:cursor-grabbing" aria-label={`${registration.memberName}を並べ替え`}>
                  <GripVertical className="size-4" />
                </button>
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold", unresolved ? "bg-amber-600 text-slate-950" : registration.completed ? "bg-emerald-700 text-white" : isTarget ? "bg-yellow-500 text-slate-900" : "bg-slate-700 text-slate-300")}>
                    {unresolved ? "?" : registration.completed ? <Check className="size-3" /> : index + 1}
                  </span>
                <button type="button" onClick={() => selectListItem(registration.registrationId)} className="flex min-w-0 flex-1 flex-col items-start text-left">
                  <span className="flex w-full items-center gap-2">
                    <span className={cn("truncate leading-5 font-medium", unresolved ? "text-amber-200" : registration.completed ? "text-emerald-300/70" : "text-slate-200")}>{registration.memberName}</span>
                    {isTarget && <span className="shrink-0 text-[10px] text-yellow-300">現在</span>}
                  </span>
                  <span className="flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap text-xs leading-4 text-slate-500">
                    <span>{registration.version}</span>
                    <span>{candidate?.map.mapNameShort ?? "地点未解決"}</span>
                    {candidate && <span className="font-mono">({(candidate.point.posX / 10).toFixed(1)}, {(candidate.point.posY / 10).toFixed(1)})</span>}
                  </span>
                </button>
                <div className="hidden shrink-0 items-center gap-1 sm:flex">{actionButtons}</div>
              </div>
              {unresolved && <div className="mt-0.5 pl-7 text-xs text-amber-300">未解決: {unresolved.reason}（完了状態保持）</div>}
              <div className="mt-1 flex items-center justify-end gap-1 pl-14 sm:hidden">{actionButtons}</div>
              </div>}
            </SortableRouteItem>
          );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="hidden space-y-1 sm:block">
        <div className="flex items-center justify-between"><label className="text-xs text-slate-400">1行マクロ</label><button type="button" onClick={() => copyToClipboard(generateOneLineMacro(route), "1行マクロ")} className="text-slate-500 hover:text-slate-300"><Copy className="size-3.5" /></button></div>
        <Textarea readOnly value={generateOneLineMacro(route)} onClick={() => copyToClipboard(generateOneLineMacro(route), "1行マクロ")} className="h-12 cursor-pointer resize-none border-slate-700 bg-slate-900 text-xs text-slate-300" />
      </div>
      <div className="hidden space-y-1 sm:block">
        <div className="flex items-center justify-between"><label className="text-xs text-slate-400">複数行マクロ</label><button type="button" onClick={() => copyToClipboard(generateMultiLineMacro(route), "複数行マクロ")} className="text-slate-500 hover:text-slate-300"><Copy className="size-3.5" /></button></div>
        <Textarea readOnly value={generateMultiLineMacro(route)} onClick={() => copyToClipboard(generateMultiLineMacro(route), "複数行マクロ")} className="min-h-28 cursor-pointer resize-y border-slate-700 bg-slate-900 text-xs text-slate-300" />
      </div>
    </div>
  );
}
