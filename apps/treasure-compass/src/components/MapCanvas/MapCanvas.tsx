import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CANVAS_SIZE, GRADE_IMAGE_PREFIX, POINT_COLORS } from '@/constants';
import type { RouteStep, Point } from '@/types';

function getScale(mapSize: number): number {
  return CANVAS_SIZE / mapSize;
}

function toCanvas(pos: number, scale: number): number {
  return (pos - 10) * scale;
}

function drawRoute(
  ctx: CanvasRenderingContext2D,
  steps: RouteStep[],
  scale: number,
  activeStep: number,
) {
  if (steps.length === 0) return;

  // 経路ラインを描画
  ctx.beginPath();
  ctx.strokeStyle = POINT_COLORS.route;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);

  steps.forEach((step, i) => {
    const x = toCanvas(step.point.posX, scale);
    const y = toCanvas(step.point.posY, scale);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // テレポートラインを別色で
  steps.forEach((step) => {
    if (!step.teleportPoint) return;
    const tx = toCanvas(step.teleportPoint.posX, scale);
    const ty = toCanvas(step.teleportPoint.posY, scale);
    const px = toCanvas(step.point.posX, scale);
    const py = toCanvas(step.point.posY, scale);
    ctx.beginPath();
    ctx.strokeStyle = POINT_COLORS.teleport;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.moveTo(tx, ty);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // 各ポイントのマーカーを描画
  steps.forEach((step, i) => {
    const x = toCanvas(step.point.posX, scale);
    const y = toCanvas(step.point.posY, scale);
    const isActive = i === activeStep;
    const isCompleted = step.isCompleted;

    // 外側のグロー（アクティブ時）
    if (isActive) {
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250,204,21,0.25)';
      ctx.fill();
    }

    // マーカー
    ctx.beginPath();
    ctx.arc(x, y, isActive ? 12 : 10, 0, Math.PI * 2);
    ctx.fillStyle = isCompleted
      ? POINT_COLORS.completed
      : isActive
        ? POINT_COLORS.active
        : POINT_COLORS.treasure;
    ctx.shadowColor = isActive ? POINT_COLORS.active : POINT_COLORS.treasure;
    ctx.shadowBlur = isActive ? 12 : 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 番号テキスト
    ctx.fillStyle = (isCompleted || isActive) ? '#0f172a' : '#ffffff';
    ctx.font = `bold ${isActive ? 13 : 11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), x, y);
  });
}

function drawAllPoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  scale: number,
) {
  for (const p of points) {
    if (p.division !== 'P') continue;
    const x = toCanvas(p.posX, scale);
    const y = toCanvas(p.posY, scale);

    // 外枠（白）でくっきり見せる
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();

    // 内側（水色）
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#0ea5e9';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // ポイント名（背景付きラベル）
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const labelY = y - 12;
    const textW = ctx.measureText(p.pointName).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.beginPath();
    ctx.roundRect(x - textW / 2, labelY - 13, textW, 14, 3);
    ctx.fill();
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(p.pointName, x, labelY);
  }
}

interface MapCanvasProps {
  /** モーダル内での使用時はtrue: クリックイベントを有効化 */
  interactive?: boolean;
  /** モーダル内でのマップ番号（interactiveがtrueの場合に有効） */
  mapNo?: number;
  /** クリック時のコールバック（interactiveがtrueの場合に有効） */
  onPointClick?: (point: Point) => void;
}

export function MapCanvas({ interactive = false, mapNo, onPointClick }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const grade = useAppStore(s => s.grade);
  const mapData = useAppStore(s => s.mapData);
  const route = useAppStore(s => s.route);
  const activeStep = useAppStore(s => s.activeStep);

  // メインキャンバス用: アクティブステップのマップを表示
  const targetMapNo = interactive
    ? (mapNo ?? 1)
    : (route[activeStep]?.mapNo ?? mapData?.mapData[0]?.mapNo ?? 1);

  const currentMapItem = mapData?.mapData.find(m => m.mapNo === targetMapNo);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current || !mapData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = getScale(mapData.mapSize);
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(imageRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (interactive && currentMapItem) {
      drawAllPoints(ctx, currentMapItem.point, scale);
    } else {
      // メインキャンバス: このマップに関係するrouteのみ描画
      const relevantSteps = route.filter(s => s.mapNo === targetMapNo);
      drawRoute(ctx, relevantSteps, scale, activeStep);
    }
  }, [mapData, route, activeStep, interactive, currentMapItem, targetMapNo]);

  // マップ画像を読み込んで描画
  useEffect(() => {
    if (!mapData) return;
    const prefix = GRADE_IMAGE_PREFIX[grade];
    const src = `${prefix}${targetMapNo}.png`;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      redraw();
    };
    img.src = src;
  }, [grade, targetMapNo, mapData, redraw]);

  // route/activeStep変更時に再描画
  useEffect(() => {
    redraw();
  }, [redraw]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onPointClick || !mapData || !currentMapItem) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const scale = getScale(mapData.mapSize);

    // クリック位置に最も近いPポイントを探す
    let nearest: Point | null = null;
    let minDist = Infinity;
    for (const p of currentMapItem.point) {
      if (p.division !== 'P') continue;
      const px = toCanvas(p.posX, scale);
      const py = toCanvas(p.posY, scale);
      const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
      if (dist < 20 && dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }
    if (nearest) onPointClick(nearest);
  }, [interactive, onPointClick, mapData, currentMapItem]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      onClick={handleCanvasClick}
      className={`w-full aspect-square rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/50 ${interactive ? 'cursor-crosshair' : ''}`}
    />
  );
}
