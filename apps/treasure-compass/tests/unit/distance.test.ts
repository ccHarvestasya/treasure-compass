import { describe, expect, it } from "vitest";
import { calcShortestRoute } from "../../src/utils/distance";
import type { MapDataItem, Point } from "../../src/types";

function point(pointNo: number, division: Point["division"], x: number, y: number): Point {
  return { pointNo, division, block: "", posX: x, posY: y, posZ: 999, posT: 0, time: 0, pointName: `P${pointNo}` };
}

describe("Treasure route distance", () => {
  const map: MapDataItem = {
    region: "R1",
    mapNo: 1,
    mapName: "Map",
    mapNameShort: "M",
    point: [point(10, "T", 100, 100), point(1, "P", 200, 100)],
  };

  it("Z を使わずエーテライト起点から X/Y 距離を評価する", () => {
    const result = calcShortestRoute(
      [{ memberNo: 0, memberName: "Alice", mapNo: 1, mapName: "Map", mapNameShort: "M", mapPoint: map.point[1] }],
      [map],
    );
    expect(result.totalDistance).toBe(100);
    expect(result.orderedSteps[0]?.teleportPoint?.pointNo).toBe(10);
  });

  it("保存済み現在地点があるマップはエーテライトを使わない", () => {
    const result = calcShortestRoute(
      [{ memberNo: 0, memberName: "Alice", mapNo: 1, mapName: "Map", mapNameShort: "M", mapPoint: map.point[1] }],
      [map],
      { "1": point(99, "P", 150, 100) },
    );
    expect(result.totalDistance).toBe(50);
    expect(result.orderedSteps[0]?.teleportPoint).toBeUndefined();
  });
});
