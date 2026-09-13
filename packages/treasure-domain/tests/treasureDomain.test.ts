import { describe, expect, it } from "vitest";
import {
  deriveTreasureSession,
  fillTreasureAutoOrder,
  replaceTreasureMapCurrentLocation,
  treasurePointRefKey,
  treasurePointRefsEqual,
  TREASURE_MEMBER_SLOTS,
  type TreasureSessionState,
} from "../src/index.ts";

describe("treasure-domain boundary", () => {
  it("Treasure の登録枠を8枠に固定する", () => {
    expect(TREASURE_MEMBER_SLOTS).toBe(8);
  });

  it("point reference の同一性と stable key を domain で扱う", () => {
    const first = { gradeSetId: "g17", mapId: "map-001", pointId: "point-001" };
    const same = { ...first };
    const other = { ...first, pointId: "point-002" };
    const delimiterCollision = { gradeSetId: "g17:map-001", mapId: "point-001", pointId: "other" };

    expect(treasurePointRefKey(first)).toBe("g17:map-001:point-001");
    expect(treasurePointRefsEqual(first, same)).toBe(true);
    expect(treasurePointRefsEqual(first, other)).toBe(false);
    expect(treasurePointRefsEqual(first, delimiterCollision)).toBe(false);
  });

  it("canonical session の playlist position と incomplete route を導出する", () => {
    const session: TreasureSessionState = {
      registrations: [
        { registrationId: "r1", memberName: "Alice", version: "7.x", pointRef: { gradeSetId: "g", mapId: "m1", pointId: "p1" }, completed: false, playlistPosition: 0 },
        { registrationId: "r2", memberName: "Bob", version: "7.x", pointRef: { gradeSetId: "g", mapId: "m2", pointId: "p2" }, completed: true, playlistPosition: 1 },
      ],
      playlistOrder: ["r2", "r1"],
      orderMode: "manual",
      listSelection: "r1",
      currentTarget: "r1",
      mapCurrentLocations: [],
      incompleteRoute: [],
    };

    const derived = deriveTreasureSession(session);

    expect(derived.registrations.map((registration) => registration.playlistPosition)).toEqual([1, 0]);
    expect(derived.incompleteRoute).toEqual([{ registrationId: "r1", pointRef: session.registrations[0]!.pointRef }]);
  });

  it("map current location を同じ map の既存値と置換する", () => {
    const session: TreasureSessionState = {
      registrations: [], playlistOrder: [], orderMode: "auto", listSelection: null,
      currentTarget: null,
      mapCurrentLocations: [{ mapId: "m1", pointRef: { gradeSetId: "g", mapId: "m1", pointId: "old" } }],
      incompleteRoute: [],
    };

    expect(replaceTreasureMapCurrentLocation(session, { gradeSetId: "g", mapId: "m1", pointId: "new" }).mapCurrentLocations).toEqual([
      { mapId: "m1", pointRef: { gradeSetId: "g", mapId: "m1", pointId: "new" } },
    ]);
  });

  it("auto order は completed item の位置を維持する", () => {
    const registrations = [
      { registrationId: "r1", memberName: "Alice", version: "7.x" as const, pointRef: { gradeSetId: "g", mapId: "m1", pointId: "p1" }, completed: true, playlistPosition: 0 },
      { registrationId: "r2", memberName: "Bob", version: "7.x" as const, pointRef: { gradeSetId: "g", mapId: "m2", pointId: "p2" }, completed: false, playlistPosition: 1 },
    ];
    expect(fillTreasureAutoOrder(["r1", "r2"], registrations, ["r2"])).toEqual(["r1", "r2"]);
  });
});
