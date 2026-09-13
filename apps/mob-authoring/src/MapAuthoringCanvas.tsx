import { useRef, useState } from "react";
import type { MapRecord } from "@treasure-compass/master-data";
import type { SpawnArea } from "./authoring.ts";

const mapImageAssets = import.meta.glob(
  "../../../packages/master-data/assets/maps/*.png",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

function resolveMapImageUrl(asset: string): string | null {
  return mapImageAssets[`../../../packages/master-data/assets/${asset}`] ?? null;
}
type DrawMode = "add" | "edit" | null;

interface Point {
  readonly x: number;
  readonly y: number;
}

interface MapAuthoringCanvasProps {
  readonly map: MapRecord;
  readonly areas: readonly SpawnArea[];
  readonly selectedAreaIndex: number | null;
  readonly drawMode: DrawMode;
  readonly onSelectArea: (index: number) => void;
  readonly onCommitArea: (area: SpawnArea) => void;
  readonly onCancelDraw: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pointFromPointer(
  event: React.PointerEvent<HTMLDivElement>,
  bounds: MapRecord["bounds"],
  element: HTMLDivElement,
): Point {
  const rect = element.getBoundingClientRect();
  const horizontal = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const vertical = clamp((event.clientY - rect.top) / rect.height, 0, 1);
  return {
    x: bounds.minX + horizontal * (bounds.maxX - bounds.minX),
    y: bounds.minY + vertical * (bounds.maxY - bounds.minY),
  };
}

function areaFromPoints(first: Point, second: Point): SpawnArea {
  return {
    minX: Math.min(first.x, second.x),
    minY: Math.min(first.y, second.y),
    maxX: Math.max(first.x, second.x),
    maxY: Math.max(first.y, second.y),
  };
}

function percent(value: number, min: number, max: number): number {
  return max === min ? 0 : ((value - min) / (max - min)) * 100;
}

function areaStyle(area: SpawnArea, map: MapRecord): { x: number; y: number; width: number; height: number } {
  return {
    x: percent(area.minX, map.bounds.minX, map.bounds.maxX),
    y: percent(area.minY, map.bounds.minY, map.bounds.maxY),
    width: percent(area.maxX - area.minX, 0, map.bounds.maxX - map.bounds.minX),
    height: percent(area.maxY - area.minY, 0, map.bounds.maxY - map.bounds.minY),
  };
}

export function MapAuthoringCanvas({
  map,
  areas,
  selectedAreaIndex,
  drawMode,
  onSelectArea,
  onCommitArea,
  onCancelDraw,
}: MapAuthoringCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ readonly start: Point; readonly current: Point } | null>(null);
  const imageUrl = resolveMapImageUrl(map.image.asset);
  const previewArea = drag ? areaFromPoints(drag.start, drag.current) : null;
  const allAreas = previewArea ? [...areas, previewArea] : areas;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drawMode || event.button !== 0 || !stageRef.current) return;
    const point = pointFromPointer(event, map.bounds, stageRef.current);
    stageRef.current.setPointerCapture(event.pointerId);
    setDrag({ start: point, current: point });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || !stageRef.current) return;
    setDrag({ ...drag, current: pointFromPointer(event, map.bounds, stageRef.current) });
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || !stageRef.current) return;
    const area = areaFromPoints(drag.start, pointFromPointer(event, map.bounds, stageRef.current));
    setDrag(null);
    if (stageRef.current.hasPointerCapture(event.pointerId)) stageRef.current.releasePointerCapture(event.pointerId);
    onCommitArea(area);
  };

  return (
    <div
      ref={stageRef}
      className={`map-stage ${drawMode ? "is-drawing" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={() => { setDrag(null); onCancelDraw(); }}
      role="application"
      aria-label={`${map.name} の出現範囲選択地図`}
    >
      {imageUrl ? <img src={imageUrl} alt={`${map.name} の地図`} draggable={false} /> : <div className="map-missing">地図画像を読み込めません。</div>}
      <svg className={`map-overlay ${drawMode ? "drawing-overlay" : ""}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {allAreas.map((area, index) => {
          const style = areaStyle(area, map);
          const isPreview = index === areas.length && previewArea !== null;
          return (
            <rect
              key={isPreview ? "preview" : `${index}-${area.minX}-${area.minY}-${area.maxX}-${area.maxY}`}
              x={style.x}
              y={style.y}
              width={style.width}
              height={style.height}
              className={`spawn-rect ${isPreview ? "preview" : ""} ${selectedAreaIndex === index ? "selected" : ""}`}
              onClick={(event) => { event.stopPropagation(); if (!drawMode && !isPreview) onSelectArea(index); }}
            />
          );
        })}
      </svg>
      {drawMode && <div className="map-hint">地図上をドラッグして範囲を指定（キャンセルは下のボタン）</div>}
    </div>
  );
}
