import { useCallback, useEffect, useRef } from 'react';
import { CANVAS_SIZE, GRADE_IMAGE_PREFIX } from '@/constants';
import { useAppStore } from '@/store/useAppStore';

export function MobMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const grade = useAppStore((state) => state.grade);
  const mapData = useAppStore((state) => state.mapData);
  const session = useAppStore((state) => state.mobSession);
  const mapNo = session.route.steps[0]?.mapNo ?? mapData?.mapData[0]?.mapNo ?? 1;
  const mapItem = mapData?.mapData.find((map) => map.mapNo === mapNo);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !mapData || !mapItem) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const scale = CANVAS_SIZE / mapData.mapSize;
    const toCanvas = (value: number) => (value - 10) * scale;
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (const target of Object.values(session.targets)) {
      for (const candidate of Object.values(target.candidates)) {
        if (candidate.mapNo !== mapNo) continue;
        const selected = session.currentSelections[target.mobId]?.candidateId === candidate.id;
        const confirmed = candidate.userConfirmed;
        const x = toCanvas(candidate.x * 10);
        const y = toCanvas(candidate.y * 10);
        context.beginPath();
        context.arc(x, y, selected ? 12 : 8, 0, Math.PI * 2);
        context.fillStyle = target.complete ? '#4ade80' : selected ? '#facc15' : confirmed ? '#38bdf8' : '#f97316';
        context.fill();
        context.fillStyle = '#0f172a';
        context.font = 'bold 10px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(target.mobName.slice(0, 3), x, y);
      }
    }
  }, [mapData, mapItem, mapNo, session]);

  useEffect(() => {
    if (!mapData || !mapItem) return;
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      redraw();
    };
    image.src = `${GRADE_IMAGE_PREFIX[grade]}${mapNo}.png`;
  }, [grade, mapData, mapItem, mapNo, redraw]);

  useEffect(() => redraw(), [redraw]);

  return <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full aspect-square rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/50" />;
}
