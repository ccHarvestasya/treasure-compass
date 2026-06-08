import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { MapData, Point, UserItem, Grade } from "../../src/types";
import { DEFAULT_GRADE, FULL_PARTY } from "../../src/constants";

vi.mock("@/utils/distance", () => ({
  calcShortestRoute: (
    members: Array<{
      memberName: string;
      mapNo: number;
      mapName: string;
      mapNameShort: string;
      mapPoint: Point;
    }>,
  ) => ({
    orderedSteps: members.map((m) => ({
      mapNo: m.mapNo,
      mapName: m.mapName,
      mapNameShort: m.mapNameShort,
      memberName: m.memberName,
      point: m.mapPoint,
    })),
    totalDistance: 0,
  }),
  toRouteSteps: (
    orderedSteps: Array<{
      mapNo: number;
      mapName: string;
      mapNameShort: string;
      memberName: string;
      point: Point;
      teleportPoint?: Point;
    }>,
  ) =>
    orderedSteps.map((s, i) => ({
      orderNo: i + 1,
      mapNo: s.mapNo,
      mapName: s.mapName,
      mapNameShort: s.mapNameShort,
      memberName: s.memberName,
      point: s.point,
      teleportPoint: s.teleportPoint,
      isCompleted: false,
    })),
}));

class LocalStorageMock {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

type StoreModule = typeof import("../../src/store/useAppStore");

let useAppStore: StoreModule["useAppStore"];

beforeAll(async () => {
  vi.stubGlobal("localStorage", new LocalStorageMock());
  const mod = await import("../../src/store/useAppStore");
  useAppStore = mod.useAppStore;
});

beforeEach(() => {
  localStorage.clear();
  const state = useAppStore.getState();
  state.setGradeWithReset(DEFAULT_GRADE);
  state.setMapData(null);
  state.setBulkText("");
  state.setManualSort(false);
  state.setActiveStep(0);
  state.closeModal();
});

function makePoint(pointNo: number, posX: number, posY: number): Point {
  return {
    pointNo,
    division: "P",
    block: "",
    posX,
    posY,
    posZ: 0,
    posT: 0,
    time: 0,
    pointName: `P${pointNo}`,
  };
}

function makeMember(
  memberNo: number,
  memberName: string,
  mapNo: number,
  mapName: string,
  mapNameShort: string,
  pointNo: number,
  posX: number,
  posY: number,
): UserItem {
  return {
    memberNo,
    memberName,
    mapNo,
    mapName,
    mapNameShort,
    mapPoint: makePoint(pointNo, posX, posY),
  };
}

const mapData: MapData = {
  mapSize: 100,
  mapData: [
    {
      region: "R1",
      mapNo: 1,
      mapName: "Living Memory",
      mapNameShort: "Memory",
      point: [makePoint(1, 100, 100)],
    },
  ],
};

describe("useAppStore", () => {
  it("setMember updates route when mapData is loaded", () => {
    const s = useAppStore.getState();
    s.setMapData(mapData);

    s.setMember(
      0,
      makeMember(0, "Alice", 1, "Living Memory", "Memory", 1, 100, 100),
    );
    s.setMember(
      1,
      makeMember(1, "Bob", 1, "Living Memory", "Memory", 2, 120, 130),
    );

    const next = useAppStore.getState();
    expect(next.route).toHaveLength(2);
    expect(next.route.map((r) => r.memberName)).toEqual(["Alice", "Bob"]);
    expect(next.isManualSort).toBe(false);
    expect(next.activeStep).toBe(0);
  });

  it("manual route order is cleared and recalculated after member data change", () => {
    const s = useAppStore.getState();
    s.setMapData(mapData);
    s.setMember(
      0,
      makeMember(0, "Alice", 1, "Living Memory", "Memory", 1, 100, 100),
    );
    s.setMember(
      1,
      makeMember(1, "Bob", 1, "Living Memory", "Memory", 2, 120, 130),
    );

    const reversed = [...useAppStore.getState().route].reverse();
    s.setRoute(reversed);
    expect(useAppStore.getState().isManualSort).toBe(true);
    expect(useAppStore.getState().route.map((r) => r.memberName)).toEqual([
      "Bob",
      "Alice",
    ]);

    s.setMember(
      0,
      makeMember(0, "Alice", 1, "Living Memory", "Memory", 3, 210, 220),
    );

    const next = useAppStore.getState();
    expect(next.isManualSort).toBe(false);
    expect(next.route.map((r) => r.memberName)).toEqual(["Alice", "Bob"]);
    expect(next.route[0].point.posX).toBe(210);
    expect(next.route[0].point.posY).toBe(220);
  });

  it("completion flags are reset on recalculation after data change", () => {
    const s = useAppStore.getState();
    s.setMapData(mapData);
    s.setMember(
      0,
      makeMember(0, "Alice", 1, "Living Memory", "Memory", 1, 100, 100),
    );
    s.setMember(
      1,
      makeMember(1, "Bob", 1, "Living Memory", "Memory", 2, 120, 130),
    );

    s.completeStep(0);
    expect(useAppStore.getState().route[0].isCompleted).toBe(true);

    s.setMember(
      1,
      makeMember(1, "Bob", 1, "Living Memory", "Memory", 4, 350, 360),
    );

    const next = useAppStore.getState();
    expect(next.route.every((step) => step.isCompleted === false)).toBe(true);
  });

  it("clearMembers resets members, route, manual sort and active step", () => {
    const s = useAppStore.getState();
    s.setMapData(mapData);
    s.setMember(
      0,
      makeMember(0, "Alice", 1, "Living Memory", "Memory", 1, 100, 100),
    );
    s.setRoute([...useAppStore.getState().route].reverse());
    s.setActiveStep(1);

    s.clearMembers();

    const next = useAppStore.getState();
    expect(next.members).toHaveLength(FULL_PARTY);
    expect(next.members.every((m) => m === null)).toBe(true);
    expect(next.route).toEqual([]);
    expect(next.isManualSort).toBe(false);
    expect(next.activeStep).toBe(0);
  });

  it("setGradeWithReset resets route-related state and marks loading", () => {
    const s = useAppStore.getState();
    s.setMapData(mapData);
    s.setMember(
      0,
      makeMember(0, "Alice", 1, "Living Memory", "Memory", 1, 100, 100),
    );
    s.setBulkText("sample");
    s.setRoute([...useAppStore.getState().route].reverse());
    s.setActiveStep(2);

    s.setGradeWithReset(8 as Grade);

    const next = useAppStore.getState();
    expect(next.grade).toBe(8);
    expect(next.mapData).toBeNull();
    expect(next.isLoading).toBe(true);
    expect(next.bulkText).toBe("");
    expect(next.route).toEqual([]);
    expect(next.isManualSort).toBe(false);
    expect(next.activeStep).toBe(0);
    expect(next.members.every((m) => m === null)).toBe(true);
  });

  it("setDraftMemberName stores temporary names without mutating members", () => {
    const s = useAppStore.getState();

    s.setDraftMemberName(0, "Alice");

    const next = useAppStore.getState();
    expect(next.members[0]).toBeNull();
    expect(next.draftMemberNames[0]).toBe("Alice");
  });

  it("setMember commits name and clears draft for the same slot", () => {
    const s = useAppStore.getState();
    s.setMapData(mapData);
    s.setDraftMemberName(0, "DraftName");

    s.setMember(
      0,
      makeMember(0, "Alice", 1, "Living Memory", "Memory", 1, 100, 100),
    );

    const next = useAppStore.getState();
    expect(next.members[0]?.memberName).toBe("Alice");
    expect(next.draftMemberNames[0]).toBe("");
  });

  it("removeMember clears draft for the same slot", () => {
    const s = useAppStore.getState();
    s.setMapData(mapData);
    s.setDraftMemberName(1, "Temp");
    s.setMember(
      1,
      makeMember(1, "Bob", 1, "Living Memory", "Memory", 1, 100, 100),
    );
    s.setDraftMemberName(1, "AnotherTemp");

    s.removeMember(1);

    const next = useAppStore.getState();
    expect(next.members[1]).toBeNull();
    expect(next.draftMemberNames[1]).toBe("");
  });
});
