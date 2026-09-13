import type { MapDataItem, Point, TreasureCatalog } from "@/types";
import { VERSION_BY_GRADE } from "@/constants";
import type { MapMasterV1, TreasureMasterV1 } from "@treasure-compass/master-data";

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
