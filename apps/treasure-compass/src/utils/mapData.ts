import type { MapData, MapDataItem, Point, PointDivision } from "@/types";
import type { MapMasterV1, TreasureMasterV1 } from "@treasure-compass/master-data";

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
    && (point.stableId === undefined || typeof point.stableId === "string")
  );
}

export function buildTreasureMapData(
  mapMaster: MapMasterV1,
  treasureMaster: TreasureMasterV1,
  grade: number,
  mapIds: readonly string[],
): MapData | null {
  const gradeSet = treasureMaster.gradeSets.find((set) => set.grades.includes(grade));
  if (!gradeSet) return null;
  const maps = mapIds.flatMap((mapId, index) => {
    const map = mapMaster.maps.find((candidate) => candidate.id === mapId);
    if (!map) return [];
    const points: Point[] = [
      ...map.aetherytes.map((aetheryte, aetheryteIndex) => ({
        pointNo: 1000 + aetheryteIndex,
        division: "T" as const,
        block: "",
        posX: aetheryte.x * 10,
        posY: aetheryte.y * 10,
        posZ: 0,
        posT: 0,
        time: 0,
        pointName: aetheryte.name,
      })),
      ...gradeSet.points.filter((point) => point.mapId === mapId).map((point, pointIndex) => ({
        stableId: point.id,
        pointNo: pointIndex + 1,
        division: "P" as const,
        block: "",
        posX: point.x * 10,
        posY: point.y * 10,
        posZ: 0,
        posT: 0,
        time: 0,
        pointName: point.label,
      })),
    ];
    return [{
      region: map.expansionId,
      mapNo: index + 1,
      mapName: map.name,
      mapNameShort: map.shortName,
      point: points,
    }];
  });
  return { mapSize: 431, mapData: maps };
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
