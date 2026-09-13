import type { MapData, MapDataItem, Point, PointDivision, TreasureCatalog } from "@/types";
import { VERSION_BY_GRADE } from "@/constants";
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
    typeof point.pointName === "string" &&
    (point.stableId === undefined || typeof point.stableId === "string")
  );
}

function pointFromTreasure(
  point: TreasureMasterV1["gradeSets"][number]["points"][number],
  grade: number,
  version: TreasureCatalog["candidates"][number]["version"],
  pointNo: number,
): Point {
  return {
    stableId: point.id,
    mapId: point.mapId,
    gradeSetId: `treasure-grade-${grade}`,
    grade,
    version,
    pointNo,
    division: "P",
    block: "",
    posX: point.x * 10,
    posY: point.y * 10,
    posZ: 0,
    posT: 0,
    time: 0,
    pointName: point.label,
  };
}

/** 検証済み master から、全対応バージョンを含む共有 Treasure catalog を作る。 */
export function buildTreasureCatalog(
  mapMaster: MapMasterV1,
  treasureMaster: TreasureMasterV1,
  mapIdsByGrade: Readonly<Record<number, readonly string[]>>,
): TreasureCatalog | null {
  const configuredMapIds = [...new Set(Object.values(mapIdsByGrade).flat())];
  const mapsById = new Map(mapMaster.maps.map((map) => [map.id, map]));
  const candidates: TreasureCatalog["candidates"] = [];
  const mapData: MapDataItem[] = [];

  configuredMapIds.forEach((mapId, mapIndex) => {
    const map = mapsById.get(mapId);
    if (!map) return;
    const points: Point[] = map.aetherytes.map((aetheryte, index) => ({
      stableId: aetheryte.id,
      mapId,
      pointNo: 1000 + index,
      division: "T",
      block: "",
      posX: aetheryte.x * 10,
      posY: aetheryte.y * 10,
      posZ: 0,
      posT: 0,
      time: 0,
      pointName: aetheryte.name,
    }));

    for (const gradeSet of treasureMaster.gradeSets) {
      const grade = gradeSet.grades.find((value) =>
        mapIdsByGrade[value]?.includes(mapId),
      );
      if (grade === undefined) continue;
      const version = VERSION_BY_GRADE[grade];
      if (!version) continue;
      gradeSet.points
        .filter((point) => point.mapId === mapId)
        .forEach((point, index) => {
          const normalized = pointFromTreasure(point, grade, version, index + 1);
          points.push(normalized);
          candidates.push({
            pointRef: {
              gradeSetId: gradeSet.id,
              mapId: point.mapId,
              pointId: point.id,
            },
            grade,
            version,
            point: normalized,
            map: {
              mapId,
              region: map.expansionId,
              mapNo: mapIndex + 1,
              mapName: map.name,
              mapNameShort: map.shortName,
              point: [],
            },
          });
        });
    }

    const mapRecord: MapDataItem = {
      mapId,
      region: map.expansionId,
      mapNo: mapIndex + 1,
      mapName: map.name,
      mapNameShort: map.shortName,
      point: points,
    };
    mapData.push(mapRecord);
    for (const candidate of candidates) {
      if (candidate.pointRef.mapId === mapId) candidate.map = mapRecord;
    }
  });

  if (mapData.length === 0 || candidates.length === 0) return null;
  return {
    mapData: { mapSize: 431, mapData },
    candidates,
    masterIdentity: {
      mapSchemaVersion: mapMaster.schemaVersion,
      mapDataRevision: mapMaster.dataRevision,
      appSchemaVersion: treasureMaster.schemaVersion,
      appDataRevision: treasureMaster.dataRevision,
    },
  };
}

/** 旧 API / fixture 向けに、指定 grade の map view を作る。 */
export function buildTreasureMapData(
  mapMaster: MapMasterV1,
  treasureMaster: TreasureMasterV1,
  grade: number,
  mapIds: readonly string[],
): MapData | null {
  const catalog = buildTreasureCatalog(mapMaster, treasureMaster, {
    [grade]: mapIds,
  });
  return catalog?.mapData ?? null;
}

function isMapDataItem(value: unknown): value is MapDataItem {
  if (!value || typeof value !== "object") return false;
  const map = value as Record<string, unknown>;
  return (
    (map.mapId === undefined || typeof map.mapId === "string") &&
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
