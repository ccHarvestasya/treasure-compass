import { describe, expect, it } from "vitest";
import type { MapDataItem, Point, TreasureCatalog } from "../../src/types";
import { analyzeBulkInput } from "../../src/utils/bulkParser";

function makePoint(
  pointNo: number,
  division: Point["division"],
  posX: number,
  posY: number,
  pointName = `P${pointNo}`,
): Point {
  return {
    pointNo,
    division,
    block: "",
    posX,
    posY,
    posZ: 0,
    posT: 0,
    time: 0,
    pointName,
  };
}

describe("analyzeBulkInput", () => {
  const makeCandidate = (mapId: string, mapName: string, pointNo: number): TreasureCatalog["candidates"][number] => {
    const map: MapDataItem = { mapId, region: "R1", mapNo: pointNo, mapName, mapNameShort: mapName, point: [] };
    const treasurePoint = makePoint(pointNo, "P", 100, 200);
    map.point = [treasurePoint];
    return {
      pointRef: { gradeSetId: "grade-7", mapId, pointId: `${mapId}-point-${pointNo}` },
      grade: 17,
      version: "7.x",
      point: treasurePoint,
      map,
    };
  };
  const first = makeCandidate("map-a", "Crystal Land", 1);
  const second = makeCandidate("map-b", "Land of Dawn", 2);
  const catalog: TreasureCatalog = {
    mapData: { mapSize: 431, mapData: [first.map, second.map] },
    candidates: [first, second],
    masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "map", appSchemaVersion: 1, appDataRevision: "treasure" },
  };

  it("marks unknown and ambiguous rows without applying them", () => {
    const rows = analyzeBulkInput([
      "(Alice) Unknown (10.0, 20.0)",
      "(Bob) Land (10.0, 20.0)",
      "(Carol) Crystal Land (10.0, 20.0)",
    ].join("\n"), catalog);

    expect(rows.map((row) => [row.status, row.reason])).toEqual([
      ["unresolved", "マップが見つかりません"],
      ["ambiguous", "複数の正規マップに一致します"],
      ["resolved", null],
    ]);
    expect(rows[2]?.selectedCandidate?.pointRef).toEqual(first.pointRef);
  });

  it("does not choose one coordinate when a line contains multiple coordinate expressions", () => {
    const rows = analyzeBulkInput("(Alice) Crystal Land (10.0, 20.0) and (30.0, 40.0)", catalog);

    expect(rows).toEqual([expect.objectContaining({
      status: "ambiguous",
      reason: "複数の座標候補があります",
      parsed: null,
      candidates: [],
    })]);
  });

  it("normalizes private-use icons and supported leading markers on the active parser path", () => {
    const rows = analyzeBulkInput("(\uE091★☆●▲◆♥♠♣◇♦♡○□△▽Nicola Verde) Crystal Land (10.0, 20.0)", catalog);

    expect(rows[0]?.parsed?.memberName).toBe("Nicola Verde");
    expect(rows[0]?.status).toBe("resolved");
  });
});
