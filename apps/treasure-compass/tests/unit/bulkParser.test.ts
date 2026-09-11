import { describe, expect, it } from "vitest";
import type { MapDataItem, Point } from "../../src/types";
import {
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
      "[21:57] (?Nicola Verde) Living Memory ( 20.5  , 23.0 )",
      "[22:00] (?Diving Gloth) Living Memory ( 34.9  , 35.1 )です",
    ].join("\n");

    const parsed = parseBulkInput(text);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({
      memberName: "Nicola Verde",
      mapName: "Living Memory",
      coordX: 20.5,
      coordY: 23.0,
    });
    expect(parsed[1]).toEqual({
      memberName: "Diving Gloth",
      mapName: "Living Memory",
      coordX: 34.9,
      coordY: 35.1,
    });
  });

  it("ignores lines that do not match chat coordinate format", () => {
    const text = [
      "[22:11] (?Alphinaud Leveilleur) This is just a chat message",
      "random text",
      "[21:57] (?Nicola Verde) Living Memory ( 20.5  , 23.0 )",
    ].join("\n");

    const parsed = parseBulkInput(text);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].memberName).toBe("Nicola Verde");
  });

  it("supports full-width parentheses and comma", () => {
    const text = "[10:00] (?Magnai Oronir) Ruby Sea （ 7.5 ， 29.6 ）";

    const parsed = parseBulkInput(text);

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual({
      memberName: "Magnai Oronir",
      mapName: "Ruby Sea",
      coordX: 7.5,
      coordY: 29.6,
    });
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
