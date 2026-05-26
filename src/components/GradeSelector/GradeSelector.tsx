import { GRADES, GRADE_LABELS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import type { Grade } from '@/types';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function GradeSelector() {
  const grade = useAppStore(s => s.grade);
  const setGrade = useAppStore(s => s.setGrade);
  const setGradeWithReset = useAppStore(s => s.setGradeWithReset);
  const members = useAppStore(s => s.members);
  const route = useAppStore(s => s.route);
  const bulkText = useAppStore(s => s.bulkText);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingGrade, setPendingGrade] = useState<Grade | null>(null);
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0, moved: false });

  const hasData = members.some(Boolean) || route.length > 0 || bulkText.trim().length > 0;
  const memberCount = members.filter(Boolean).length;

  // マウスホイールで横スクロール（PC対応）
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (containerRef.current) {
      containerRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ドラッグでスクロール
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    dragState.current = { isDragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
    el.style.cursor = 'grabbing';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const s = dragState.current;
    if (!s.isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const delta = x - s.startX;
    if (Math.abs(delta) > 3) s.moved = true;
    containerRef.current.scrollLeft = s.scrollLeft - delta;
  }, []);

  const onMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
    if (containerRef.current) containerRef.current.style.cursor = '';
  }, []);

  // ドラッグ中にボタンのクリックを抑制
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragState.current.moved) {
      e.stopPropagation();
      dragState.current.moved = false;
    }
  }, []);

  // 選択中ボタンをスクロール表示（初期表示・選択変更時）
  useEffect(() => {
    if (!containerRef.current) return;
    const active = containerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [grade]);

  const handleGradeClick = useCallback((nextGrade: Grade) => {
    if (nextGrade === grade) return;
    if (hasData) {
      setPendingGrade(nextGrade);
      setIsConfirmOpen(true);
      return;
    }
    setGrade(nextGrade);
  }, [grade, hasData, setGrade]);

  const handleConfirmGradeChange = useCallback(() => {
    if (!pendingGrade) return;
    setGradeWithReset(pendingGrade);
    setPendingGrade(null);
    setIsConfirmOpen(false);
  }, [pendingGrade, setGradeWithReset]);

  const handleConfirmOpenChange = useCallback((open: boolean) => {
    setIsConfirmOpen(open);
    if (!open) {
      setPendingGrade(null);
    }
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
      >
        {GRADES.map(g => (
          <button
            key={g}
            data-active={grade === g}
            onClick={() => handleGradeClick(g as Grade)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 border shrink-0',
              grade === g
                ? 'bg-sky-500 border-sky-400 text-white shadow-sky-500/30 shadow-md'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500',
            )}
          >
            {GRADE_LABELS[g as Grade]}
          </button>
        ))}
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={handleConfirmOpenChange}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-sky-300 text-sm">グレードを変更しますか？</DialogTitle>
            <DialogDescription className="text-slate-300 text-xs leading-relaxed">
              既存データを初期化してグレードを変更しますか？
              {memberCount > 0 && `（登録メンバー: ${memberCount}名）`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-slate-900/50 border-slate-700">
            <Button
              variant="outline"
              onClick={() => handleConfirmOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleConfirmGradeChange}
              className="bg-sky-600 hover:bg-sky-500 text-white"
            >
              初期化して変更
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
