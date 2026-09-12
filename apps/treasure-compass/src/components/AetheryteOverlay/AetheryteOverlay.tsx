import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MapRecord } from "@treasure-compass/master-data";
import aetheryteImageUrl from "../../../../../packages/master-data/assets/icons/aetheryte.png";
import {
  layoutAetherytes,
  type LayoutViewport,
} from "@/utils/aetheryteLayout";

interface AetheryteOverlayProps {
  readonly map: MapRecord;
}

export function AetheryteOverlay({ map }: AetheryteOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<LayoutViewport | null>(null);

  useLayoutEffect(() => {
    const element = overlayRef.current;
    if (!element) return;

    const measure = () => {
      setViewport({ width: element.clientWidth, height: element.clientHeight });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () =>
      viewport
        ? layoutAetherytes(map.aetherytes, map.bounds, viewport)
        : null,
    [map, viewport],
  );

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-px overflow-hidden rounded-lg"
    >
      {layout?.icons.map((icon) => (
        <img
          key={icon.id}
          src={aetheryteImageUrl}
          alt=""
          className="pointer-events-none absolute size-[35px] max-w-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: icon.anchor.x, top: icon.anchor.y }}
        />
      ))}
      {layout?.labels.map((label) => (
        <span
          key={label.id}
          className="pointer-events-none absolute flex items-center justify-center rounded border border-sky-300/70 bg-slate-950/85 px-2 text-[10px] leading-none text-sky-50 shadow-md shadow-slate-950/60"
          style={{
            left: label.rect.left,
            top: label.rect.top,
            width: label.rect.width,
            height: label.rect.height,
            boxSizing: "border-box",
            whiteSpace: "nowrap",
          }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}
