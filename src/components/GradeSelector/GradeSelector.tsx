import { GRADES, GRADE_LABELS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import type { Grade } from '@/types';
import { cn } from '@/lib/utils';

export function GradeSelector() {
  const grade = useAppStore(s => s.grade);
  const setGrade = useAppStore(s => s.setGrade);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {GRADES.map(g => (
        <button
          key={g}
          onClick={() => setGrade(g as Grade)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 border',
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
