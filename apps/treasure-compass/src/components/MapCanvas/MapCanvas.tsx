import { useEffect, useRef, useCallback, useMemo } from 'react';
import mapMasterJson from '@treasure-compass/master-data/data/map-master.v1.json';
import { validateMapMaster, type MapRecord } from '@treasure-compass/master-data';
import { useAppStore } from '@/store/useAppStore';
import { AetheryteOverlay } from '@/components/AetheryteOverlay/AetheryteOverlay';
import { CANVAS_SIZE, DEFAULT_GRADE, MAP_MASTER_IDS_BY_GRADE, POINT_COLORS } from '@/constants';
import type { RouteStep, Point, TreasurePointRef } from '@/types';

const mapMasterValidation = validateMapMaster(mapMasterJson);
if (!mapMasterValidation.usable || !mapMasterValidation.data) {
  throw new Error('Map master validation failed.');
}
const mapMaster = mapMasterValidation.data;

const mapImageAssets = import.meta.glob(
  '../../../../../packages/master-data/assets/maps/*.png',
  { eager: true, import: 'default', query: '?url' },
) as Record<string, string>;

function resolveMapImageUrl(asset: string): string | null {
  const key = `../../../../../packages/master-data/assets/${asset}`;
  return mapImageAssets[key] ?? null;
}

function resolveMapMasterRecord(mapId: string | undefined, mapNo: number): MapRecord | null {
  if (mapId) return mapMaster.maps.find((map) => map.id === mapId) ?? null;
  return mapMaster.maps.find((map) => map.id === `map-${String(mapNo).padStart(3, '0')}`) ?? null;
}

function pointRefKey(ref: TreasurePointRef): string {
  return `${ref.gradeSetId}:${ref.mapId}:${ref.pointId}`;
}

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
  activeRegistrationId: string | null,
  playlistNumberByRegistrationId: ReadonlyMap<string, number>,
) {
  if (steps.length === 0) return;

  // 経路ラインを描画
  ctx.beginPath();
  ctx.strokeStyle = POINT_COLORS.route;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);

  steps.forEach((step, i) => {
    if (i === 0 && step.startPoint && step.teleportPoint) {
      ctx.moveTo(toCanvas(step.startPoint.posX, scale), toCanvas(step.startPoint.posY, scale));
      ctx.lineTo(toCanvas(step.point.posX, scale), toCanvas(step.point.posY, scale));
      return;
    }
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
  [...steps].reverse().forEach((step) => {
    const i = steps.indexOf(step);
    const x = toCanvas(step.point.posX, scale);
    const y = toCanvas(step.point.posY, scale);
    const isActive = step.registrationId !== undefined && step.registrationId === activeRegistrationId;
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
    const number = step.registrationId
      ? playlistNumberByRegistrationId.get(step.registrationId) ?? i + 1
      : i + 1;
    ctx.fillText(String(number), x, y);
  });
}

function drawAllPoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  scale: number,
) {
  for (const p of [...points].reverse()) {
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

  const mapData = useAppStore(s => s.mapData);
  const catalog = useAppStore(s => s.catalog);
  const registrations = useAppStore(s => s.registrations);
  const playlistOrder = useAppStore(s => s.playlistOrder);
  const route = useAppStore(s => s.route);
  const currentTarget = useAppStore(s => s.currentTarget);
  const unresolvedReferences = useAppStore(s => s.unresolvedReferences);
  const playlistNumberByRegistrationId = useMemo(
    () => new Map(playlistOrder.map((registrationId, index) => [registrationId, index + 1] as const)),
    [playlistOrder],
  );

  const targetRegistration = registrations.find((registration) => registration.registrationId === currentTarget);
  const targetCandidate = targetRegistration && catalog?.candidates.find((candidate) => pointRefKey(candidate.pointRef) === pointRefKey(targetRegistration.pointRef));
  const unresolvedTarget = !interactive && currentTarget
    ? unresolvedReferences.find((reference) => reference.source === "currentTarget" && reference.registrationId === currentTarget)
    : undefined;
  const defaultMapId = MAP_MASTER_IDS_BY_GRADE[DEFAULT_GRADE]?.[0];
  const defaultMap = mapData?.mapData.find((item) => item.mapId === defaultMapId) ?? mapData?.mapData[0];

  // メインキャンバス用: アクティブステップのマップを表示
  const targetMapNo = unresolvedTarget
    ? undefined
    : interactive
      ? (mapNo ?? 1)
      : (targetCandidate?.map.mapNo ?? route[0]?.mapNo ?? defaultMap?.mapNo ?? 1);
  const targetMapId = interactive
    ? undefined
    : (targetCandidate?.map.mapId ?? route.find((step) => step.mapNo === targetMapNo)?.mapId);

  const currentMapItem = targetMapNo === undefined
    ? undefined
    : mapData?.mapData.find((item) => targetMapId ? item.mapId === targetMapId : item.mapNo === targetMapNo);
  const currentMapMaster = targetMapNo === undefined ? null : resolveMapMasterRecord(currentMapItem?.mapId, targetMapNo);

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
      const relevantSteps = route.filter((step) => targetMapId ? step.mapId === targetMapId : step.mapNo === targetMapNo);
      drawRoute(ctx, relevantSteps, scale, currentTarget, playlistNumberByRegistrationId);
    }
  }, [mapData, route, currentTarget, interactive, currentMapItem, targetMapId, targetMapNo, playlistNumberByRegistrationId]);

  // マップ画像を読み込んで描画
  useEffect(() => {
    if (!mapData || !currentMapMaster) {
      imageRef.current = null;
      return;
    }
    const src = resolveMapImageUrl(currentMapMaster.image.asset);
    if (!src) {
      imageRef.current = null;
      return;
    }
    let cancelled = false;

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imageRef.current = img;
      redraw();
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [targetMapNo, mapData, redraw, currentMapMaster]);

  // route/currentTarget変更時に再描画
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
    <div className="relative w-full aspect-square">
      {unresolvedTarget ? (
        <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-lg border border-amber-800/70 bg-slate-900 p-6 text-center text-sm text-amber-200">
          <p className="font-semibold">現在対象を表示できません</p>
          <p className="text-slate-300">{unresolvedTarget.memberName ?? "対象"}: マスターデータを解決できません。</p>
          <p className="break-all text-xs text-slate-500">{unresolvedTarget.reason} / {unresolvedTarget.pointRef.mapId} / {unresolvedTarget.pointRef.pointId}</p>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={handleCanvasClick}
            className={`block h-full w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/50 ${interactive ? 'cursor-crosshair' : ''}`}
          />
          {currentMapMaster && <AetheryteOverlay map={currentMapMaster} />}
        </>
      )}
    </div>
  );
}
