import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateOneLineMacro, generateMultiLineMacro, generateLineOrder } from '@/utils/macro';
import { toast } from 'sonner';
import { Check, Copy, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RouteStep } from '@/types';

function SortableStep({ step, index, activeStep, onSelect, onComplete, onUncomplete }: {
  step: RouteStep;
  index: number;
  activeStep: number;
  onSelect: (i: number) => void;
  onComplete: (i: number) => void;
  onUncomplete: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.orderNo });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(index)}
      className={cn(
        'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-150 border text-sm',
        isDragging ? 'opacity-50' : '',
        step.isCompleted
          ? 'border-emerald-800/50 bg-emerald-950/30 text-emerald-400/70'
          : index === activeStep
            ? 'border-yellow-600/60 bg-yellow-950/30 text-yellow-200'
            : 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-800/60',
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="size-3.5" />
      </button>
      <span className={cn(
        'shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
        step.isCompleted ? 'bg-emerald-700 text-white' : index === activeStep ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-300',
      )}>
        {step.isCompleted ? <Check className="size-3" /> : index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium truncate">{step.memberName}</span>
          <span className="text-xs opacity-60">{step.mapNameShort}</span>
          <span className="text-xs opacity-50 font-mono">
            ({(step.point.posX / 10).toFixed(1)}, {(step.point.posY / 10).toFixed(1)})
          </span>
        </div>
        {step.teleportPoint && (
          <div className="text-xs text-orange-400/70 mt-0.5">
            TP: {step.teleportPoint.pointName}
          </div>
        )}
      </div>
      {!step.isCompleted && (
        <Button
          size="sm"
          variant="ghost"
          onClick={e => { e.stopPropagation(); onComplete(index); }}
          className="shrink-0 h-6 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50"
        >
          完了
        </Button>
      )}
      {step.isCompleted && (
        <Button
          size="sm"
          variant="ghost"
          onClick={e => { e.stopPropagation(); onUncomplete(index); }}
          className="shrink-0 h-6 px-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
        >
          取消
        </Button>
      )}
    </div>
  );
}

export function RouteProgressTab() {
  const route = useAppStore(s => s.route);
  const activeStep = useAppStore(s => s.activeStep);
  const setActiveStep = useAppStore(s => s.setActiveStep);
  const completeStep = useAppStore(s => s.completeStep);
  const uncompleteStep = useAppStore(s => s.uncompleteStep);
  const setRoute = useAppStore(s => s.setRoute);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = route.findIndex(s => s.orderNo === active.id);
    const newIdx = route.findIndex(s => s.orderNo === over.id);
    setRoute(arrayMove(route, oldIdx, newIdx));
  };

  const oneLineMacro = generateOneLineMacro(route);
  const multiLineMacro = generateMultiLineMacro(route);
  const lineOrder = generateLineOrder(route);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label}をコピーしました`);
    }).catch(() => {
      toast.error('コピーに失敗しました');
    });
  };

  if (route.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm mt-8">
        <ChevronRight className="inline size-4 mr-1" />
        メンバーを登録すると巡回経路が表示されます
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* パンくずナビ */}
      <div className="flex flex-wrap gap-1.5">
        {route.map((step, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={cn(
              'w-8 h-8 rounded-full text-xs font-bold transition-all duration-150 border',
              step.isCompleted
                ? 'bg-emerald-900/60 border-emerald-700 text-emerald-400'
                : i === activeStep
                  ? 'bg-yellow-500 border-yellow-400 text-slate-900 shadow-yellow-400/40 shadow-md scale-110'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700',
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* DnD進捗リスト */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={route.map(s => s.orderNo)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
            {route.map((step, i) => (
              <SortableStep
                key={step.orderNo}
                step={step}
                index={i}
                activeStep={activeStep}
                onSelect={setActiveStep}
                onComplete={completeStep}
                onUncomplete={uncompleteStep}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 行順 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-400">行順</label>
          <button onClick={() => copyToClipboard(lineOrder, '行順')} className="text-slate-500 hover:text-slate-300 transition-colors">
            <Copy className="size-3.5" />
          </button>
        </div>
        <div
          className="text-xs text-slate-300 bg-slate-900 rounded-md p-2 border border-slate-700 leading-relaxed cursor-pointer hover:bg-slate-800 transition-colors"
          onClick={() => copyToClipboard(lineOrder, '行順')}
        >
          {lineOrder}
        </div>
      </div>

      {/* 1行マクロ */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-400">1行マクロ</label>
          <button onClick={() => copyToClipboard(oneLineMacro, '1行マクロ')} className="text-slate-500 hover:text-slate-300 transition-colors">
            <Copy className="size-3.5" />
          </button>
        </div>
        <Textarea
          readOnly
          value={oneLineMacro}
          onClick={() => copyToClipboard(oneLineMacro, '1行マクロ')}
          className="h-12 text-xs bg-slate-900 border-slate-700 text-slate-300 leading-relaxed cursor-pointer hover:bg-slate-800 transition-colors resize-none"
        />
      </div>

      {/* 複数行マクロ */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-400">複数行マクロ</label>
          <button onClick={() => copyToClipboard(multiLineMacro, '複数行マクロ')} className="text-slate-500 hover:text-slate-300 transition-colors">
            <Copy className="size-3.5" />
          </button>
        </div>
        <Textarea
          readOnly
          value={multiLineMacro}
          onClick={() => copyToClipboard(multiLineMacro, '複数行マクロ')}
          className="min-h-[120px] text-xs bg-slate-900 border-slate-700 text-slate-300 leading-relaxed cursor-pointer hover:bg-slate-800 transition-colors resize-y"
        />
      </div>
    </div>
  );
}
