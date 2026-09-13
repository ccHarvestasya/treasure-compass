import { CANVAS_SIZE, POINT_COLORS } from "@/constants";
import type { Point, RouteStep } from "@/types";

export function getScale(mapSize: number): number {
  return CANVAS_SIZE / mapSize;
}

export function toCanvas(pos: number, scale: number): number {
  return (pos - 10) * scale;
}

export function drawRoute(
  ctx: CanvasRenderingContext2D,
  steps: RouteStep[],
  scale: number,
  activeRegistrationId: string | null,
  playlistNumberByRegistrationId: ReadonlyMap<string, number>,
) {
  if (steps.length === 0) return;

  ctx.beginPath();
  ctx.strokeStyle = POINT_COLORS.route;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);

  steps.forEach((step, index) => {
    if (index === 0 && step.startPoint && step.teleportPoint) {
      ctx.moveTo(toCanvas(step.startPoint.posX, scale), toCanvas(step.startPoint.posY, scale));
      ctx.lineTo(toCanvas(step.point.posX, scale), toCanvas(step.point.posY, scale));
      return;
    }
    const x = toCanvas(step.point.posX, scale);
    const y = toCanvas(step.point.posY, scale);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

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

  [...steps].reverse().forEach((step) => {
    const index = steps.indexOf(step);
    const x = toCanvas(step.point.posX, scale);
    const y = toCanvas(step.point.posY, scale);
    const isActive = step.registrationId !== undefined && step.registrationId === activeRegistrationId;
    const isCompleted = step.isCompleted;

    if (isActive) {
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(250,204,21,0.25)";
      ctx.fill();
    }

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

    ctx.fillStyle = isCompleted || isActive ? "#0f172a" : "#ffffff";
    ctx.font = `bold ${isActive ? 13 : 11}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const number = step.registrationId
      ? playlistNumberByRegistrationId.get(step.registrationId) ?? index + 1
      : index + 1;
    ctx.fillText(String(number), x, y);
  });
}

export function drawAllPoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  scale: number,
) {
  for (const point of [...points].reverse()) {
    if (point.division !== "P") continue;
    const x = toCanvas(point.posX, scale);
    const y = toCanvas(point.posY, scale);

    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#0ea5e9";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const labelY = y - 12;
    const textW = ctx.measureText(point.pointName).width + 8;
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.beginPath();
    ctx.roundRect(x - textW / 2, labelY - 13, textW, 14, 3);
    ctx.fill();
    ctx.fillStyle = "#e0f2fe";
    ctx.fillText(point.pointName, x, labelY);
  }
}

export function findNearestTreasurePoint(
  points: Point[],
  canvasX: number,
  canvasY: number,
  scale: number,
): Point | null {
  let nearest: Point | null = null;
  let minDistance = Infinity;
  for (const point of points) {
    if (point.division !== "P") continue;
    const pointX = toCanvas(point.posX, scale);
    const pointY = toCanvas(point.posY, scale);
    const distance = Math.sqrt((canvasX - pointX) ** 2 + (canvasY - pointY) ** 2);
    if (distance < 20 && distance < minDistance) {
      minDistance = distance;
      nearest = point;
    }
  }
  return nearest;
}
