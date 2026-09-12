import { describe, expect, it } from "vitest";
import { attachTreasurePointIds, isValidGradeMapData, isValidMapData } from "../../src/utils/mapData";
import type { MapData, Point } from "../../src/types";

const validPoint: Point = {
  pointNo: 1,
  division: "P",
  block: "",
  posX: 100,
  posY: 200,
  posZ: 0,
  posT: 0,
  time: 0,
  pointName: "宝箱",
};

const validMapData: MapData = {
  mapSize: 100,
  mapData: [{
    region: "地域",
    mapNo: 1,
    mapName: "地図",
    mapNameShort: "地図",
    point: [validPoint],
  }],
};

describe("isValidMapData", () => {
  it("accepts a valid map payload", () => {
    expect(isValidMapData(validMapData)).toBe(true);
  });

  it("rejects malformed points and non-finite coordinates", () => {
    expect(isValidMapData({
      ...validMapData,
      mapData: [{ ...validMapData.mapData[0], point: [{ ...validPoint, posX: Number.NaN }] }],
    })).toBe(false);
  });

  it("rejects empty or non-positive map sizes", () => {
    expect(isValidMapData({ ...validMapData, mapSize: 0 })).toBe(false);
    expect(isValidMapData({ ...validMapData, mapData: [] })).toBe(true);
    expect(isValidMapData(null)).toBe(false);
  });

  it("rejects map numbers outside the grade master mapping or duplicates", () => {
    const expectedMaps = [{ mapNo: 1, mapName: "地図", mapNameShort: "地図" }, { mapNo: 2, mapName: "別地図", mapNameShort: "別" }];
    expect(isValidGradeMapData(validMapData, expectedMaps)).toBe(true);
    expect(isValidGradeMapData({ ...validMapData, mapData: [{ ...validMapData.mapData[0], mapNo: 3 }] }, expectedMaps)).toBe(false);
    expect(isValidGradeMapData({ ...validMapData, mapData: [{ ...validMapData.mapData[0], mapName: "別地図" }] }, expectedMaps)).toBe(false);
    expect(isValidGradeMapData({ ...validMapData, mapData: [validMapData.mapData[0], validMapData.mapData[0]] }, expectedMaps)).toBe(false);
  });

  it("attaches stable IDs to treasure points without changing legacy fields", () => {
    const mapped = attachTreasurePointIds(validMapData, ["map-001"]);
    expect(mapped.mapData[0]?.point[0]).toMatchObject({
      pointNo: 1,
      stableId: "map-001-point-001",
    });
  });
});
