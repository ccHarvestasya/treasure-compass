import type { MapData, MapDataItem, Point, PointDivision } from "@/types";

const POINT_DIVISIONS = new Set<PointDivision>(["P", "T", "R", "Z"]);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPoint(value: unknown): value is Point {
  if (!value || typeof value !== "object") return false;
  const point = value as Record<string, unknown>;
  return (
    Number.isInteger(point.pointNo) &&
    typeof point.division === "string" &&
    POINT_DIVISIONS.has(point.division as PointDivision) &&
    typeof point.block === "string" &&
    isFiniteNumber(point.posX) &&
    isFiniteNumber(point.posY) &&
    isFiniteNumber(point.posZ) &&
    isFiniteNumber(point.posT) &&
    isFiniteNumber(point.time) &&
    typeof point.pointName === "string"
  );
}

function isMapDataItem(value: unknown): value is MapDataItem {
  if (!value || typeof value !== "object") return false;
  const map = value as Record<string, unknown>;
  return (
    typeof map.region === "string" &&
    Number.isInteger(map.mapNo) &&
    typeof map.mapName === "string" &&
    typeof map.mapNameShort === "string" &&
    Array.isArray(map.point) &&
    map.point.every(isPoint)
  );
}

export function isValidMapData(value: unknown): value is MapData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    isFiniteNumber(data.mapSize) &&
    data.mapSize > 0 &&
    Array.isArray(data.mapData) &&
    data.mapData.every(isMapDataItem)
  );
}

export function isValidGradeMapData(
  value: unknown,
  expectedMaps: readonly { mapNo: number; mapName: string; mapNameShort: string }[],
): value is MapData {
  if (!isValidMapData(value)) return false;
  const expected = new Map(expectedMaps.map((map) => [map.mapNo, map]));
  const mapNos = value.mapData.map((map) => map.mapNo);
  return (
    value.mapData.every((map) => {
      const expectedMap = expected.get(map.mapNo);
      return (
        expectedMap !== undefined &&
        map.mapName === expectedMap.mapName &&
        map.mapNameShort === expectedMap.mapNameShort
      );
    }) &&
    new Set(mapNos).size === mapNos.length
  );
}
