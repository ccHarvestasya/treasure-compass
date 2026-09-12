export const AETHERYTE_LABEL_DIRECTIONS = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
] as const;

export type AetheryteLabelDirection =
  (typeof AETHERYTE_LABEL_DIRECTIONS)[number];

export interface AetheryteLayoutInput {
  readonly id: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
}

export interface LayoutViewport {
  readonly width: number;
  readonly height: number;
}

export interface LayoutPoint {
  readonly x: number;
  readonly y: number;
}

export interface CanonicalBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

export interface LabelRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface AetheryteIconLayout {
  readonly id: string;
  readonly name: string;
  readonly anchor: LayoutPoint;
}

export interface AetheryteLabelLayout extends AetheryteIconLayout {
  readonly direction: AetheryteLabelDirection;
  readonly directionRank: number;
  readonly rect: LabelRect;
}

export interface AetheryteLayout {
  readonly icons: readonly AetheryteIconLayout[];
  readonly labels: readonly AetheryteLabelLayout[];
}

const LABEL_HEIGHT = 24;
const LABEL_GAP = 22;
const MAX_LABELS = 8;

function compareCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(left).map((character) => character.codePointAt(0) ?? 0);
  const rightPoints = Array.from(right).map(
    (character) => character.codePointAt(0) ?? 0,
  );
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    const difference = leftPoints[index] - rightPoints[index];
    if (difference !== 0) return difference;
  }
  return leftPoints.length - rightPoints.length;
}

export function normalizeAetheryteName(name: string): string {
  return name.normalize("NFC");
}

export function getAetheryteLabelWidth(name: string): number {
  return 8 * Array.from(normalizeAetheryteName(name)).length + 24;
}

export function projectCanonicalCoordinate(
  x: number,
  y: number,
  bounds: CanonicalBounds,
  viewport: LayoutViewport,
): LayoutPoint | null {
  const rangeX = bounds.maxX - bounds.minX;
  const rangeY = bounds.maxY - bounds.minY;
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(viewport.height) ||
    viewport.width < 0 ||
    viewport.height < 0 ||
    !Number.isFinite(rangeX) ||
    !Number.isFinite(rangeY) ||
    rangeX <= 0 ||
    rangeY <= 0
  ) {
    return null;
  }
  return {
    x: ((x - bounds.minX) / rangeX) * viewport.width,
    y: ((y - bounds.minY) / rangeY) * viewport.height,
  };
}

export function createAetheryteLabelCandidates(
  anchor: LayoutPoint,
  width: number,
  height = LABEL_HEIGHT,
): readonly (LabelRect & {
  readonly direction: AetheryteLabelDirection;
  readonly directionRank: number;
})[] {
  const centeredLeft = anchor.x - width / 2;
  const centeredTop = anchor.y - height / 2;
  const right = anchor.x - LABEL_GAP - width;
  const bottom = anchor.y - LABEL_GAP - height;
  return [
    { direction: "N", directionRank: 0, left: centeredLeft, top: bottom, width, height },
    { direction: "NE", directionRank: 1, left: anchor.x + LABEL_GAP, top: bottom, width, height },
    { direction: "E", directionRank: 2, left: anchor.x + LABEL_GAP, top: centeredTop, width, height },
    { direction: "SE", directionRank: 3, left: anchor.x + LABEL_GAP, top: anchor.y + LABEL_GAP, width, height },
    { direction: "S", directionRank: 4, left: centeredLeft, top: anchor.y + LABEL_GAP, width, height },
    { direction: "SW", directionRank: 5, left: right, top: anchor.y + LABEL_GAP, width, height },
    { direction: "W", directionRank: 6, left: right, top: centeredTop, width, height },
    { direction: "NW", directionRank: 7, left: right, top: bottom, width, height },
  ];
}

export function rectanglesOverlap(left: LabelRect, right: LabelRect): boolean {
  return (
    Math.min(left.left + left.width, right.left + right.width) -
      Math.max(left.left, right.left) >
      0 &&
    Math.min(left.top + left.height, right.top + right.height) -
      Math.max(left.top, right.top) >
      0
  );
}

function isWithinViewport(rect: LabelRect, viewport: LayoutViewport): boolean {
  return (
    rect.left >= 0 &&
    rect.top >= 0 &&
    rect.left + rect.width <= viewport.width &&
    rect.top + rect.height <= viewport.height
  );
}

function compareSelections(
  left: readonly (AetheryteLabelLayout | null)[],
  right: readonly (AetheryteLabelLayout | null)[],
): number {
  const leftCount = left.filter((item) => item !== null).length;
  const rightCount = right.filter((item) => item !== null).length;
  if (leftCount !== rightCount) return leftCount - rightCount;

  for (let index = 0; index < left.length; index += 1) {
    const leftVisible = left[index] !== null ? 1 : 0;
    const rightVisible = right[index] !== null ? 1 : 0;
    if (leftVisible !== rightVisible) return leftVisible - rightVisible;
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftRank = left[index]?.directionRank;
    const rightRank = right[index]?.directionRank;
    if (leftRank !== undefined && rightRank !== undefined && leftRank !== rightRank) {
      return rightRank - leftRank;
    }
  }
  return 0;
}

export function layoutAetherytes(
  aetherytes: readonly AetheryteLayoutInput[],
  bounds: CanonicalBounds,
  viewport: LayoutViewport,
): AetheryteLayout {
  const records = aetherytes
    .map((aetheryte) => {
      const anchor = projectCanonicalCoordinate(
        aetheryte.x,
        aetheryte.y,
        bounds,
        viewport,
      );
      if (!anchor) return null;
      const width = getAetheryteLabelWidth(aetheryte.name);
      const candidates = createAetheryteLabelCandidates(anchor, width).filter(
        (candidate) => isWithinViewport(candidate, viewport),
      );
      return { ...aetheryte, anchor, candidates };
    })
    .filter((record): record is NonNullable<typeof record> => record !== null)
    .sort((left, right) => compareCodePoints(left.id, right.id));

  const icons = records.map(({ id, name, anchor }) => ({ id, name, anchor }));
  let best: (AetheryteLabelLayout | null)[] = records.map(() => null);

  function getOptimisticSelection(
    selected: (AetheryteLabelLayout | null)[],
  ): (AetheryteLabelLayout | null)[] {
    const optimistic = [...selected];
    let visibleCount = selected.filter((item) => item !== null).length;
    while (optimistic.length < records.length) {
      if (visibleCount >= MAX_LABELS) {
        optimistic.push(null);
        continue;
      }
      const record = records[optimistic.length];
      optimistic.push({
        id: record.id,
        name: normalizeAetheryteName(record.name),
        anchor: record.anchor,
        direction: "N",
        directionRank: 0,
        rect: record.candidates[0] ?? {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          direction: "N",
          directionRank: 0,
        },
      });
      visibleCount += 1;
    }
    return optimistic;
  }

  function search(
    index: number,
    selected: (AetheryteLabelLayout | null)[],
  ): void {
    if (compareSelections(getOptimisticSelection(selected), best) <= 0) {
      return;
    }
    const selectedCount = selected.filter((item) => item !== null).length;
    if (index === records.length || selectedCount === MAX_LABELS) {
      const completedSelection = [
        ...selected,
        ...Array.from({ length: records.length - selected.length }, () => null),
      ];
      if (compareSelections(completedSelection, best) > 0) best = completedSelection;
      return;
    }

    const record = records[index];
    for (const candidate of record.candidates) {
      if (selected.some((item) => item !== null && rectanglesOverlap(item.rect, candidate))) {
        continue;
      }
      selected.push({
        id: record.id,
        name: normalizeAetheryteName(record.name),
        anchor: record.anchor,
        direction: candidate.direction,
        directionRank: candidate.directionRank,
        rect: candidate,
      });
      search(index + 1, selected);
      selected.pop();
    }

    selected.push(null);
    search(index + 1, selected);
    selected.pop();
  }

  search(0, []);
  return { icons, labels: best.filter((item): item is AetheryteLabelLayout => item !== null) };
}
