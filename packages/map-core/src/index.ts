export interface Coordinate2d {
  readonly x: number;
  readonly y: number;
}

export interface MapBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

export function isFiniteCoordinate(value: Coordinate2d): boolean {
  return Number.isFinite(value.x) && Number.isFinite(value.y);
}

export function isValidBounds(bounds: MapBounds): boolean {
  return (
    Number.isFinite(bounds.minX) &&
    Number.isFinite(bounds.maxX) &&
    Number.isFinite(bounds.minY) &&
    Number.isFinite(bounds.maxY) &&
    bounds.minX <= bounds.maxX &&
    bounds.minY <= bounds.maxY
  );
}

export function containsCoordinate(
  bounds: MapBounds,
  value: Coordinate2d,
): boolean {
  return (
    isValidBounds(bounds) &&
    isFiniteCoordinate(value) &&
    value.x >= bounds.minX &&
    value.x <= bounds.maxX &&
    value.y >= bounds.minY &&
    value.y <= bounds.maxY
  );
}

export function distance2d(from: Coordinate2d, to: Coordinate2d): number {
  if (!isFiniteCoordinate(from) || !isFiniteCoordinate(to)) {
    return Number.NaN;
  }

  return Math.hypot(to.x - from.x, to.y - from.y);
}
