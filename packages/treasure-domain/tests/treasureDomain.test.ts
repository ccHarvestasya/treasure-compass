import { describe, expect, it } from "vitest";
import {
  advanceTreasureTarget,
  cancelTreasureRegistration,
  completeTreasureRegistration,
  deriveTreasureSession,
  moveTreasureRegistration,
  fillTreasureAutoOrder,
  playTreasureRegistration,
  playTreasureSelection,
  removeTreasureRegistration,
  reorderTreasureRegistrations,
  replaceTreasureMapCurrentLocation,
  selectTreasureRegistration,
  setTreasureManualOrder,
  treasurePointRefKey,
  treasurePointRefsEqual,
  TREASURE_MEMBER_SLOTS,
  type TreasureRegistration,
  type TreasureSessionState,
} from "../src/index.ts";

function registration(
  registrationId: string,
  completed = false,
): TreasureRegistration {
  return {
    registrationId,
    memberName: registrationId,
    version: "7.x",
    pointRef: { gradeSetId: "g", mapId: registrationId, pointId: `${registrationId}-point` },
    completed,
    playlistPosition: 0,
  };
}

function session(
  overrides: Partial<TreasureSessionState> = {},
): TreasureSessionState {
  const registrations = [registration("r1"), registration("r2"), registration("r3")];
  return {
    registrations,
    playlistOrder: registrations.map((entry) => entry.registrationId),
    orderMode: "auto",
    listSelection: null,
    currentTarget: null,
    mapCurrentLocations: [],
    incompleteRoute: [],
    ...overrides,
  };
}

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

  it("selection と play は selection/currentTarget を独立して更新する", () => {
    const selected = selectTreasureRegistration(session(), "r2");
    expect(selected?.listSelection).toBe("r2");
    expect(selected?.currentTarget).toBeNull();
    expect(selectTreasureRegistration(session(), "unknown")).toBeNull();
    expect(selectTreasureRegistration(session(), null)?.listSelection).toBeNull();

    expect(playTreasureSelection(session({ listSelection: "r2" })).currentTarget).toBe("r2");
    expect(playTreasureSelection(session({ listSelection: "r2", registrations: [registration("r1", true), registration("r2", true), registration("r3", true)] })).currentTarget).toBe("r2");
    expect(playTreasureSelection(session()).currentTarget).toBe("r1");
    expect(playTreasureSelection(session({ registrations: [registration("r1", true), registration("r2", true), registration("r3", true)] })).currentTarget).toBeNull();
    expect(playTreasureSelection(session({ listSelection: "r2", currentTarget: "r1" })).currentTarget).toBe("r2");
    expect(playTreasureSelection(session({ listSelection: "r2", currentTarget: "r2" }))).toEqual(session({ listSelection: "r2", currentTarget: "r2" }));
    expect(playTreasureRegistration(session(), "r3")).toMatchObject({ listSelection: "r3", currentTarget: "r3" });
    expect(playTreasureRegistration(session(), "unknown")).toBeNull();
  });

  it("next は target を完了し、map location と次の未完了を更新する", () => {
    const before = session({ listSelection: "r3", currentTarget: "r1" });
    const next = advanceTreasureTarget(before);

    expect(next).toMatchObject({ listSelection: "r3", currentTarget: "r2" });
    expect(next?.registrations.find((entry) => entry.registrationId === "r1")?.completed).toBe(true);
    expect(next?.mapCurrentLocations).toEqual([{ mapId: "r1", pointRef: before.registrations[0]!.pointRef }]);
    expect(next?.incompleteRoute.map((entry) => entry.registrationId)).toEqual(["r2", "r3"]);
  });

  it("next は playlist を一周し、完了済み・対象なしでは no-op になる", () => {
    const wrapped = advanceTreasureTarget(session({ currentTarget: "r3" }));
    expect(wrapped?.currentTarget).toBe("r1");
    expect(advanceTreasureTarget(session({ currentTarget: "r2", registrations: [registration("r1", true), registration("r2", true), registration("r3", false)] }))).toBeNull();
    expect(advanceTreasureTarget(session())).toBeNull();
  });

  it("complete/cancel は対象だけを変更し、complete は map location を記録する", () => {
    const before = session();
    const completed = completeTreasureRegistration(before, "r2");
    expect(completed?.registrations.find((entry) => entry.registrationId === "r2")?.completed).toBe(true);
    expect(completed?.registrations.find((entry) => entry.registrationId === "r1")?.completed).toBe(false);
    expect(completed?.mapCurrentLocations).toEqual([{ mapId: "r2", pointRef: before.registrations[1]!.pointRef }]);
    expect(completeTreasureRegistration(before, "r2")).toBeTruthy();
    expect(cancelTreasureRegistration(completed!, "r2")?.registrations.find((entry) => entry.registrationId === "r2")?.completed).toBe(false);
    expect(cancelTreasureRegistration(before, "r2")).toBeNull();
  });

  it("remove は registration と参照だけを playlist から除去する", () => {
    const before = session({ listSelection: "r2", currentTarget: "r2" });
    const removed = removeTreasureRegistration(before, "r2");
    expect(removed?.registrations.map((entry) => entry.registrationId)).toEqual(["r1", "r3"]);
    expect(removed?.playlistOrder).toEqual(["r1", "r3"]);
    expect(removed?.listSelection).toBeNull();
    expect(removed?.currentTarget).toBeNull();
    expect(removeTreasureRegistration(before, "unknown")).toBeNull();
  });

  it("move と reorder は境界を拒否し、成功時だけ manual order にする", () => {
    const before = session();
    expect(moveTreasureRegistration(before, "r1", "up")).toBeNull();
    expect(moveTreasureRegistration(before, "r3", "down")).toBeNull();
    expect(moveTreasureRegistration(before, "r2", "up")?.playlistOrder).toEqual(["r2", "r1", "r3"]);
    expect(moveTreasureRegistration(before, "r2", "up")?.orderMode).toBe("manual");
    expect(setTreasureManualOrder(before).orderMode).toBe("manual");
    expect(reorderTreasureRegistrations(before, "r3", "r1")?.playlistOrder).toEqual(["r3", "r1", "r2"]);
    expect(reorderTreasureRegistrations(before, "r1", "r1")).toBe(before);
    expect(reorderTreasureRegistrations(before, "unknown", "r1")).toBeNull();
  });
});
