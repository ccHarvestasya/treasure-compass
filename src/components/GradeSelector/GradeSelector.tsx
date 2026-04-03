import { GRADES, GRADE_LABELS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import type { Grade } from '@/types';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useCallback } from 'react';

export function GradeSelector() {
  const grade = useAppStore(s => s.grade);
  const setGrade = useAppStore(s => s.setGrade);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0, moved: false });

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

  return (
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
          onClick={() => setGrade(g as Grade)}
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
  );
}
