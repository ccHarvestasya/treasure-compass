import { describe, expect, it } from "vitest";
import type { MapDataItem, Point, TreasureCatalog } from "../../src/types";
import {
  analyzeBulkInput,
  findMapByName,
  findPointByCoord,
  parseBulkInput,
} from "../../src/utils/bulkParser";

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

describe("parseBulkInput", () => {
  it("parses valid chat lines including trailing text after coordinates", () => {
    const text = [
      "[21:57] (★Nicola Verde) Living Memory ( 20.5  , 23.0 )",
      "[22:00] (★Diving Gloth) Living Memory ( 34.9  , 35.1 )です",
    ].join("\n");

    const parsed = parseBulkInput(text);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({
      lineNumber: 1,
      memberName: "Nicola Verde",
      mapName: "Living Memory",
      coordX: 20.5,
      coordY: 23.0,
    });
    expect(parsed[1]).toEqual({
      lineNumber: 2,
      memberName: "Diving Gloth",
      mapName: "Living Memory",
      coordX: 34.9,
      coordY: 35.1,
    });
  });

  it("removes the leading FFXIV private-use icon from member names", () => {
    const text = "[21:57] (\uE091Nicola Verde) \uE0BBリビング・メモリー ( 20.5  , 23.0 )";

    const parsed = parseBulkInput(text);

    expect(parsed[0]).toEqual({
      lineNumber: 1,
      memberName: "Nicola Verde",
      mapName: "\uE0BBリビング・メモリー",
      coordX: 20.5,
      coordY: 23.0,
    });
  });

  it("removes all supported leading chat markers from member names", () => {
    const text = "(\uE091★☆●▲◆♥♠♣◇♦♡○□△▽Nicola Verde) Living Memory (20.5, 23.0)";

    const parsed = parseBulkInput(text);

    expect(parsed[0]?.memberName).toBe("Nicola Verde");
  });

  it("ignores lines that do not match chat coordinate format", () => {
    const text = [
      "[22:11] (★Alphinaud Leveilleur) This is just a chat message",
      "random text",
      "[21:57] (★Nicola Verde) Living Memory ( 20.5  , 23.0 )",
    ].join("\n");

    const parsed = parseBulkInput(text);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].memberName).toBe("Nicola Verde");
    expect(parsed[0].lineNumber).toBe(3);
  });

  it("supports full-width parentheses and comma", () => {
    const text = "[10:00] (★Magnai Oronir) Ruby Sea （ 7.5 ， 29.6 ）";

    const parsed = parseBulkInput(text);

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual({
      lineNumber: 1,
      memberName: "Magnai Oronir",
      mapName: "Ruby Sea",
      coordX: 7.5,
      coordY: 29.6,
    });
  });

  it("normalizes names and ignores empty or malformed rows without inventing a name", () => {
    const text = [
      "(★ Café) Living Memory (10.0, 20.0)",
      "(?Question) Living Memory (10.0, 20.0)",
      "(★ ) Living Memory (10.0, 20.0)",
      "(★ Alice) Living Memory (not-a-coordinate)",
    ].join("\n");

    const parsed = parseBulkInput(text);

    expect(parsed).toEqual([
      { lineNumber: 1, memberName: "Café", mapName: "Living Memory", coordX: 10, coordY: 20 },
      { lineNumber: 2, memberName: "?Question", mapName: "Living Memory", coordX: 10, coordY: 20 },
    ]);
  });

});

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
    expect(parseBulkInput("(Alice) Crystal Land (10.0, 20.0) and (30.0, 40.0)")).toEqual([]);
  });
});

describe("findMapByName", () => {
  const maps: MapDataItem[] = [
    {
      region: "R1",
      mapNo: 1,
      mapName: "Living Memory",
      mapNameShort: "Memory",
      point: [],
    },
    {
      region: "R2",
      mapNo: 2,
      mapName: "Ruby Sea",
      mapNameShort: "Ruby",
      point: [],
    },
  ];

  it("finds exact match by mapName and mapNameShort", () => {
    expect(findMapByName("Living Memory", maps)).toBe(maps[0]);
    expect(findMapByName("Ruby", maps)).toBe(maps[1]);
  });

  it("finds partial match", () => {
    expect(findMapByName("Mem", maps)).toBe(maps[0]);
  });

  it("returns null when no map matches", () => {
    expect(findMapByName("Not Found", maps)).toBeNull();
  });

  it("returns null when a partial name is ambiguous", () => {
    const overlappingMaps = [
      ...maps,
      {
        region: "R3",
        mapNo: 3,
        mapName: "Ruby Sea (North)",
        mapNameShort: "Ruby North",
        point: [],
      },
    ];

    expect(findMapByName("Sea", overlappingMaps)).toBeNull();
  });
});

describe("findPointByCoord", () => {
  const map: MapDataItem = {
    region: "Test",
    mapNo: 99,
    mapName: "Test Map",
    mapNameShort: "Test",
    point: [
      makePoint(1, "P", 100, 100, "NearP"),
      makePoint(2, "P", 300, 300, "FarP"),
      makePoint(3, "T", 117, 100, "Teleport"),
    ],
  };

  it("finds nearest treasure point within radius 1.0", () => {
    const found = findPointByCoord(10.6, 10.3, map);
    expect(found?.pointName).toBe("NearP");
  });

  it("falls back to radius 2.0 when 1.0 search fails", () => {
    const found = findPointByCoord(11.7, 10.0, map);
    expect(found?.pointName).toBe("NearP");
  });

  it("ignores non-treasure points", () => {
    const onlyTeleportMap: MapDataItem = {
      region: "Test",
      mapNo: 100,
      mapName: "Only TP",
      mapNameShort: "TP",
      point: [makePoint(1, "T", 100, 100, "TP")],
    };

    expect(findPointByCoord(10.0, 10.0, onlyTeleportMap)).toBeNull();
  });
});
