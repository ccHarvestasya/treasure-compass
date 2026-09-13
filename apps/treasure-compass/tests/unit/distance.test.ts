import { describe, expect, it } from "vitest";
import { calcShortestRoute, toRouteSteps } from "../../src/utils/distance";
import type { MapDataItem, Point } from "../../src/types";

function point(pointNo: number, division: Point["division"], x: number, y: number, stableId?: string): Point {
  return { stableId, pointNo, division, block: "", posX: x, posY: y, posZ: 999, posT: 0, time: 0, pointName: `P${pointNo}` };
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

  it("同距離の経路は安定キーで決定する", () => {
    const result = calcShortestRoute(
      [
        { registrationId: "registration-z", memberNo: 0, memberName: "B", mapId: "map-001", mapNo: 1, mapName: "Map", mapNameShort: "M", mapPoint: point(2, "P", 150, 100, "target-z") },
        { registrationId: "registration-a", memberNo: 1, memberName: "A", mapId: "map-001", mapNo: 1, mapName: "Map", mapNameShort: "M", mapPoint: point(1, "P", 50, 100, "target-a") },
      ],
      [{ ...map, mapId: "map-001" }],
    );
    expect(result.orderedSteps.map((step) => step.point.stableId)).toEqual(["target-a", "target-z"]);
    expect(result.tieCandidates?.length).toBeGreaterThan(1);
  });

  it("同率 tuple の stable identifier は Unicode code point 順で比較する", () => {
    const privateUse = point(30, "P", 150, 100, "\uE000");
    const supplementary = point(31, "P", 150, 100, "\u{1F600}");
    const result = calcShortestRoute(
      [
        { registrationId: "z", memberNo: 0, memberName: "Z", mapId: "map-001", mapNo: 1, mapName: "Map", mapNameShort: "M", mapPoint: supplementary },
        { registrationId: "a", memberNo: 1, memberName: "A", mapId: "map-001", mapNo: 1, mapName: "Map", mapNameShort: "M", mapPoint: privateUse },
      ],
      [{ ...map, mapId: "map-001", point: [point(10, "T", 100, 100, "aetheryte"), privateUse, supplementary] }],
    );

    expect(result.orderedSteps.map((step) => step.point.stableId)).toEqual(["\uE000", "\u{1F600}"]);
    expect(result.tieCandidates?.map((candidate) => candidate.orderedSteps.map((step) => step.point.stableId))).toContainEqual(["\u{1F600}", "\uE000"]);
  });

  it("複数エーテライトの開始地点を安定して結果とpresentationへ渡す", () => {
    const firstAetheryte = point(10, "T", 100, 100, "aetheryte-first");
    const secondAetheryte = point(11, "T", 300, 100, "aetheryte-second");
    const target = point(20, "P", 200, 100, "target");
    const result = calcShortestRoute(
      [{ registrationId: "registration-1", memberNo: 7, memberName: "Alice", mapId: "map-001", mapNo: 1, mapName: "Map", mapNameShort: "M", mapPoint: target }],
      [{ ...map, mapId: "map-001", point: [secondAetheryte, firstAetheryte, target] }],
    );

    expect(result.orderedSteps[0]?.startPoint?.stableId).toBe("aetheryte-first");
    expect(toRouteSteps(result.orderedSteps)[0]?.startPoint?.stableId).toBe("aetheryte-first");
  });

  it("エーテライトがないマップは計算不能理由を返す", () => {
    const result = calcShortestRoute(
      [{ memberNo: 0, memberName: "Alice", mapNo: 2, mapName: "Map 2", mapNameShort: "M2", mapPoint: point(1, "P", 200, 100) }],
      [{ ...map, mapNo: 2, point: [point(1, "P", 200, 100)] }],
    );
    expect(result.failure).toEqual({ reason: "missing-aetheryte", mapNos: [2] });
    expect(result.orderedSteps).toEqual([]);
  });
});
