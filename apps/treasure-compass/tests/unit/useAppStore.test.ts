import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { MapData, Point, TreasureCandidate, TreasureCatalog } from "../../src/types";

interface MockRouteMember {
  registrationId?: string;
  memberNo: number;
  memberName: string;
  mapId?: string;
  mapNo: number;
  mapName: string;
  mapNameShort: string;
  mapPoint: Point;
}

vi.mock("@/utils/distance", () => ({
  calcShortestRoute: (members: MockRouteMember[]) => {
    const toSteps = (orderedMembers: MockRouteMember[]) => orderedMembers.map((member) => ({
      registrationId: member.registrationId,
      memberNo: member.memberNo,
      mapId: member.mapId,
      mapNo: member.mapNo,
      mapName: member.mapName,
      mapNameShort: member.mapNameShort,
      memberName: member.memberName,
      point: member.mapPoint,
    }));
    const orderedSteps = toSteps(members);
    return {
      orderedSteps,
      totalDistance: 0,
      tieCandidates: members.length > 1
        ? [{ orderedSteps }, { orderedSteps: toSteps([...members].reverse()) }]
        : [],
    };
  },
}));

class LocalStorageMock {
  private readonly values = new Map<string, string>();
  failWrites = false;
  writeCount = 0;

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.writeCount += 1;
    if (this.failWrites) throw new Error("storage write failed");
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  clear(): void {
    this.values.clear();
  }
}

type StoreModule = typeof import("../../src/store/useAppStore");
let useAppStore: StoreModule["useAppStore"];
let storage: LocalStorageMock;

beforeAll(async () => {
  storage = new LocalStorageMock();
  vi.stubGlobal("localStorage", storage);
  const module = await import("../../src/store/useAppStore");
  useAppStore = module.useAppStore;
});

function makePoint(pointNo: number, posX: number, posY: number, division: Point["division"] = "P"): Point {
  return {
    stableId: `point-${pointNo}`,
    pointNo,
    division,
    block: "",
    posX,
    posY,
    posZ: 0,
    posT: 0,
    time: 0,
    pointName: `${division}${pointNo}`,
  };
}

const mapData: MapData = {
  mapSize: 100,
  mapData: [{
    mapId: "map-test",
    region: "test",
    mapNo: 1,
    mapName: "Test Map",
    mapNameShort: "Test",
    point: [makePoint(1, 100, 100), makePoint(2, 200, 200), makePoint(3, 300, 300), makePoint(4, 400, 400), makePoint(99, 0, 0, "T")],
  }],
};

const catalog: TreasureCatalog = {
  mapData,
  candidates: mapData.mapData.flatMap((map) => map.point
    .filter((point) => point.division === "P")
    .map((point) => ({
      pointRef: { gradeSetId: "grade-7", mapId: map.mapId ?? String(map.mapNo), pointId: `point-${point.pointNo}` },
      grade: 17,
      version: "7.x",
      point,
      map,
    }))),
  masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "map", appSchemaVersion: 1, appDataRevision: "treasure" },
};

beforeEach(() => {
  storage = new LocalStorageMock();
  vi.stubGlobal("localStorage", storage);
  const state = useAppStore.getState();
  state.clearAllData();
  state.setCatalog(null);
  state.setMapDataError(null);
  state.setBulkText("");
  state.closeModal();
  state.setCatalog(catalog);
});

function candidate(pointNo: number): TreasureCandidate {
  const value = useAppStore.getState().catalog?.candidates.find((entry) => entry.point.pointNo === pointNo);
  if (!value) throw new Error(`missing fixture candidate ${pointNo}`);
  return value;
}

function register(name: string, pointNo: number): string {
  const result = useAppStore.getState().registerManual(name, candidate(pointNo));
  expect(result).toBe(true);
  const registration = useAppStore.getState().registrations.at(-1);
  if (!registration) throw new Error("registration was not created");
  return registration.registrationId;
}

describe("useAppStore", () => {
  it("keeps the Treasure session unchanged when map loading reports an error", () => {
    const id = register("Alice", 1);
    const before = useAppStore.getState().session;

    useAppStore.getState().setMapDataError("読み込みに失敗しました");

    const next = useAppStore.getState();
    expect(next.mapDataError).toBe("読み込みに失敗しました");
    expect(next.session).toEqual(before);
    expect(next.registrations.map((registration) => registration.registrationId)).toEqual([id]);
  });

  it("rejects an empty member name and normalizes a valid name", () => {
    expect(useAppStore.getState().registerManual("   ", candidate(1))).toBe(false);
    expect(useAppStore.getState().registrations).toEqual([]);

    register("  A\u0301lice  ", 1);
    expect(useAppStore.getState().registrations[0]?.memberName).toBe("Álice");
  });

  it("creates one registration and keeps its playlist identity", () => {
    const id = register("Alice", 1);
    const state = useAppStore.getState();

    expect(state.registrations).toHaveLength(1);
    expect(state.playlistOrder).toEqual([id]);
    expect(state.registrations[0]?.playlistPosition).toBe(0);
    expect(state.orderMode).toBe("auto");
    expect(state.session.incompleteRoute.map((entry) => entry.registrationId)).toEqual([id]);
    expect(state.currentTarget).toBe(id);
  });

  it("switches to manual order when registrations are dragged", () => {
    const first = register("Alice", 1);
    const second = register("Bob", 2);
    const third = register("Carol", 3);

    expect(useAppStore.getState().reorderRegistrations(first, third)).toBe(true);

    const state = useAppStore.getState();
    expect(state.playlistOrder).toEqual([second, third, first]);
    expect(state.orderMode).toBe("manual");
  });

  it("keeps route tie candidates in the runtime projection", () => {
    register("Alice", 1);
    register("Bob", 2);

    const state = useAppStore.getState();
    expect(state.routeTieCandidates).toHaveLength(2);
    expect(state.routeTieCandidates[0]?.route.map((step) => step.memberName)).toEqual(["Alice", "Bob"]);
  });

  it("updates an existing normalized name without creating a duplicate", () => {
    const id = register("Alice", 1);
    expect(useAppStore.getState().registerManual(" Alice ", candidate(2))).toBe(true);

    const state = useAppStore.getState();
    expect(state.registrations).toHaveLength(1);
    expect(state.registrations[0]).toMatchObject({ registrationId: id, memberName: "Alice", completed: false });
    expect(state.registrations[0]?.pointRef.pointId).toBe("point-2");
    expect(state.playlistOrder).toEqual([id]);
  });

  it("keeps listSelection and currentTarget independent", () => {
    const first = register("Alice", 1);
    const second = register("Bob", 2);

    expect(useAppStore.getState().selectListItem(first)).toBe(true);
    expect(useAppStore.getState().play()).toBe(true);
    expect(useAppStore.getState().listSelection).toBe(first);
    expect(useAppStore.getState().currentTarget).toBe(first);

    expect(useAppStore.getState().selectListItem(second)).toBe(true);
    expect(useAppStore.getState().listSelection).toBe(second);
    expect(useAppStore.getState().currentTarget).toBe(first);
  });

  it("player next completes only currentTarget, updates map location, and advances", () => {
    const first = register("Alice", 1);
    const second = register("Bob", 2);
    const third = register("Carol", 3);
    useAppStore.getState().selectListItem(first);
    useAppStore.getState().play();

    expect(useAppStore.getState().next()).toBe(true);
    let state = useAppStore.getState();
    expect(state.registrations.find((registration) => registration.registrationId === first)?.completed).toBe(true);
    expect(state.currentTarget).toBe(second);
    expect(state.listSelection).toBe(first);
    expect(state.mapCurrentLocations[0]?.mapId).toBe("map-test");
    expect(state.session.incompleteRoute.map((entry) => entry.registrationId)).toEqual([second, third]);

    expect(state.next()).toBe(true);
    state = useAppStore.getState();
    expect(state.currentTarget).toBe(third);
    expect(state.next()).toBe(true);
    expect(useAppStore.getState().currentTarget).toBeNull();
    expect(useAppStore.getState().next()).toBe(false);
  });

  it("backs through consecutive player steps and starts a new undo chain after back", () => {
    const first = register("Alice", 1);
    const second = register("Bob", 2);
    const third = register("Carol", 3);
    useAppStore.getState().selectListItem(first);
    useAppStore.getState().play();
    useAppStore.getState().next();
    useAppStore.getState().next();

    expect(useAppStore.getState().back()).toBe(true);
    expect(useAppStore.getState().currentTarget).toBe(second);
    expect(useAppStore.getState().registrations.find((registration) => registration.registrationId === second)?.completed).toBe(false);
    expect(useAppStore.getState().back()).toBe(true);
    expect(useAppStore.getState().currentTarget).toBe(first);
    expect(useAppStore.getState().registrations.every((registration) => !registration.completed)).toBe(true);

    expect(useAppStore.getState().next()).toBe(true);
    expect(useAppStore.getState().currentTarget).toBe(second);
    expect(useAppStore.getState().back()).toBe(true);
    expect(useAppStore.getState().currentTarget).toBe(first);
    expect(third).not.toBe(first);
  });

  it("completes and cancels an individual registration without changing its identity", () => {
    const id = register("Alice", 1);
    const state = useAppStore.getState();
    expect(state.completeRegistration(id)).toBe(true);
    expect(useAppStore.getState().registrations[0]?.completed).toBe(true);
    expect(useAppStore.getState().session.incompleteRoute).toEqual([]);

    expect(useAppStore.getState().cancelRegistration(id)).toBe(true);
    expect(useAppStore.getState().registrations[0]?.completed).toBe(false);
    expect(useAppStore.getState().playlistOrder).toEqual([id]);
  });

  it("preserves manual order when a point is updated", () => {
    const first = register("Alice", 1);
    const second = register("Bob", 2);
    const third = register("Carol", 3);
    expect(useAppStore.getState().moveRegistration(third, "up")).toBe(true);
    expect(useAppStore.getState().moveRegistration(third, "up")).toBe(true);
    expect(useAppStore.getState().playlistOrder).toEqual([third, first, second]);
    expect(useAppStore.getState().orderMode).toBe("manual");

    expect(useAppStore.getState().registerManual("Alice", candidate(4))).toBe(true);
    expect(useAppStore.getState().playlistOrder).toEqual([third, first, second]);
    expect(useAppStore.getState().registrations.find((registration) => registration.registrationId === first)?.pointRef.pointId).toBe("point-4");
  });

  it("applies only non-conflicting bulk proposals and keeps existing registrations", () => {
    const existing = register("Existing", 1);
    const result = useAppStore.getState().applyBulkProposal([
      { memberName: "Alice", candidate: candidate(2), lineNumbers: [1] },
      { memberName: "Alice", candidate: candidate(3), lineNumbers: [2] },
      { memberName: "Bob", candidate: candidate(4), lineNumbers: [3] },
    ]);

    expect(result.applied).toBe(1);
    expect(result.rejected).toEqual([{ memberName: "Alice", lineNumbers: [1, 2], reason: "conflict" }]);
    expect(useAppStore.getState().registrations.map((registration) => registration.memberName)).toEqual(["Existing", "Bob"]);
    expect(useAppStore.getState().playlistOrder[0]).toBe(existing);
    const persisted = JSON.parse(storage.getItem("treasure-compass:treasure-session:v3") ?? "null") as { state?: { registrations?: Array<{ memberName: string }> } };
    expect(persisted.state?.registrations?.map((registration) => registration.memberName)).toEqual(["Existing", "Bob"]);
    expect(JSON.stringify(persisted)).not.toContain("conflict");
  });

  it("continues existing-name updates after a bulk capacity rejection", () => {
    for (let index = 1; index <= 8; index += 1) register(`Member${index}`, 1);

    const result = useAppStore.getState().applyBulkProposal([
      { memberName: "Overflow", candidate: candidate(2), lineNumbers: [9] },
      { memberName: "Member8", candidate: candidate(4), lineNumbers: [10] },
    ]);

    expect(result.applied).toBe(1);
    expect(result.rejected).toEqual([{ memberName: "Overflow", lineNumbers: [9], reason: "capacity" }]);
    expect(useAppStore.getState().registrations).toHaveLength(8);
    expect(useAppStore.getState().registrations.find((registration) => registration.memberName === "Member8")?.pointRef.pointId).toBe("point-4");
    const persisted = JSON.parse(storage.getItem("treasure-compass:treasure-session:v3") ?? "null") as { state?: { registrations?: Array<{ memberName: string }> } };
    expect(persisted.state?.registrations?.some((registration) => registration.memberName === "Overflow")).toBe(false);
    expect(JSON.stringify(persisted)).not.toContain("capacity");
  });

  it("preserves an unresolved current target without creating a map fallback route", () => {
    const id = register("Unresolved", 1);
    expect(useAppStore.getState().playRegistration(id)).toBe(true);
    const knownCatalog = useAppStore.getState().catalog;
    if (!knownCatalog) throw new Error("catalog was not created");
    const unresolvedCatalog: TreasureCatalog = { ...knownCatalog, candidates: [] };

    useAppStore.getState().setCatalog(unresolvedCatalog);
    const state = useAppStore.getState();

    expect(state.currentTarget).toBe(id);
    expect(state.route).toEqual([]);
    expect(state.unresolvedReferences).toEqual(expect.arrayContaining([
      expect.objectContaining({ registrationId: id, source: "registration", reason: "point-ref-not-found" }),
      expect.objectContaining({ registrationId: id, source: "currentTarget", reason: "point-ref-not-found" }),
    ]));
    expect(state.playRegistration(id)).toBe(false);
  });

  it("keeps state and persisted data when a session save fails", () => {
    const id = register("Alice", 1);
    const before = useAppStore.getState().session;
    const raw = storage.getItem("treasure-compass:treasure-session:v3");
    storage.failWrites = true;

    expect(useAppStore.getState().selectListItem(id)).toBe(false);
    expect(useAppStore.getState().session).toEqual(before);
    expect(storage.getItem("treasure-compass:treasure-session:v3")).toBe(raw);
  });

  it("returns false and keeps draft/dialog state when clear or auto-sort save fails", () => {
    const id = register("Alice", 1);
    useAppStore.getState().setDraftMemberName(0, "draft");
    useAppStore.getState().openModal(id);
    const before = useAppStore.getState().session;
    const beforeDrafts = useAppStore.getState().draftMemberNames;
    const beforeModal = useAppStore.getState().modalRegistrationId;
    const raw = storage.getItem("treasure-compass:treasure-session:v3");
    storage.failWrites = true;

    expect(useAppStore.getState().setManualSort(true)).toBe(false);
    expect(useAppStore.getState().clearAllData()).toBe(false);
    expect(useAppStore.getState().session).toEqual(before);
    expect(useAppStore.getState().draftMemberNames).toEqual(beforeDrafts);
    expect(useAppStore.getState().modalRegistrationId).toBe(beforeModal);
    expect(storage.getItem("treasure-compass:treasure-session:v3")).toBe(raw);
  });

  it("performs row playback as one logical write and rejects partial playback on failure", () => {
    const first = register("Alice", 1);
    const second = register("Bob", 2);
    storage.writeCount = 0;

    expect(useAppStore.getState().playRegistration(second)).toBe(true);
    expect(storage.writeCount).toBe(1);
    expect(useAppStore.getState().listSelection).toBe(second);
    expect(useAppStore.getState().currentTarget).toBe(second);

    const before = useAppStore.getState().session;
    const raw = storage.getItem("treasure-compass:treasure-session:v3");
    storage.writeCount = 0;
    storage.failWrites = true;
    expect(useAppStore.getState().playRegistration(first)).toBe(false);
    expect(storage.writeCount).toBe(1);
    expect(useAppStore.getState().session).toEqual(before);
    expect(storage.getItem("treasure-compass:treasure-session:v3")).toBe(raw);
  });

  it("clears selection references with a removed registration and resets the canonical session", () => {
    const first = register("Alice", 1);
    const second = register("Bob", 2);
    useAppStore.getState().selectListItem(first);
    useAppStore.getState().play();
    expect(useAppStore.getState().removeRegistration(first)).toBe(true);
    expect(useAppStore.getState().listSelection).toBeNull();
    expect(useAppStore.getState().currentTarget).toBeNull();
    expect(useAppStore.getState().playlistOrder).toEqual([second]);

    useAppStore.getState().clearAllData();
    const state = useAppStore.getState();
    expect(state.registrations).toEqual([]);
    expect(state.playlistOrder).toEqual([]);
    expect(state.orderMode).toBe("auto");
    expect(state.listSelection).toBeNull();
    expect(state.currentTarget).toBeNull();
    expect(state.session.incompleteRoute).toEqual([]);
  });
});
