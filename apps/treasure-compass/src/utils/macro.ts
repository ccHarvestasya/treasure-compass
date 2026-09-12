import type { RouteStep } from '@/types';

function pendingSteps(steps: RouteStep[]): RouteStep[] {
  return steps.filter((step) => !step.isCompleted);
}

/**
 * 1行マクロ: /p 1.名前→2.名前→...
 */
export function generateOneLineMacro(steps: RouteStep[]): string {
  const pending = pendingSteps(steps);
  if (pending.length === 0) return '';
  const order = pending.map((s, i) => `${i + 1}.${s.memberName}`).join('→');
  return `/p ${order}`;
}

/**
 * 複数行マクロ: 各行に /p 順番.名前 マップ(X, Y)
 */
export function generateMultiLineMacro(steps: RouteStep[]): string {
  const pending = pendingSteps(steps);
  if (pending.length === 0) return '';
  return pending
    .map((s, i) => {
      const x = (s.point.posX / 10).toFixed(1);
      const y = (s.point.posY / 10).toFixed(1);
      return `/p ${i + 1}.${s.memberName} ${s.mapNameShort} (${x}, ${y})`;
    })
    .join('\n');
}
