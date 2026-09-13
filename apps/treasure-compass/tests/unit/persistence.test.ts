import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readPersistedTreasure,
  STORAGE_KEY_LEGACY_SESSIONS,
  STORAGE_KEY_LEGACY_TREASURE_SESSION,
  STORAGE_KEY_TREASURE_SESSION,
  validatePersistedTreasureRoot,
  writePersistedTreasure,
  type PersistedTreasureRoot,
} from "../../src/persistence/storage";
import { STORAGE_KEY_GRADE, STORAGE_KEY_MEMBERS } from "../../src/constants";
import type { Point, TreasureSessionState } from "../../src/types";

class LocalStorageMock {
  private readonly values = new Map<string, string>();
  readonly operations: string[] = [];
  failWrites = false;
  failRemoves = false;

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.operations.push(`set:${key}`);
    if (this.failWrites) throw new Error("storage write failed");
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.operations.push(`remove:${key}`);
    if (this.failRemoves) throw new Error("storage cleanup failed");
    this.values.delete(key);
  }

  clear(): void {
    this.values.clear();
  }
}

function point(pointNo: number, x = 100, y = 200): Point {
  return {
    pointNo,
    division: "P",
    block: "",
    posX: x,
    posY: y,
    posZ: 0,
    posT: 0,
    time: 0,
    pointName: `P${pointNo}`,
  };
}

function legacyMember(memberNo: number, memberName: string, mapNo: number, pointNo: number): Record<string, unknown> {
  return {
    memberNo,
    memberName,
    mapNo,
    mapName: `Map ${mapNo}`,
    mapNameShort: `M${mapNo}`,
    mapPoint: point(pointNo),
  };
}

function legacyMembers(): Array<Record<string, unknown> | null> {
  return [legacyMember(0, "Alice", 1, 3), legacyMember(1, "Bob", 2, 5), ...Array(6).fill(null)];
}

function legacyV2State() {
  return {
    grade: 17,
    members: legacyMembers(),
    route: [
      { orderNo: 1, memberNo: 1, mapNo: 2, mapName: "Map 2", mapNameShort: "M2", memberName: "Bob", point: point(5), isCompleted: true },
      { orderNo: 2, memberNo: 0, mapNo: 1, mapName: "Map 1", mapNameShort: "M1", memberName: "Alice", point: point(3), isCompleted: false },
    ],
    isManualSort: true,
    activeStep: 0,
    bulkText: "legacy draft",
    currentMapPoints: { "1": point(3) },
  };
}

function currentState(): TreasureSessionState {
  const firstRef = { gradeSetId: "treasure-grade-17", mapId: "map-001", pointId: "map-001-point-001" };
  const secondRef = { gradeSetId: "treasure-grade-17", mapId: "map-002", pointId: "map-002-point-001" };
  return {
    registrations: [
      { registrationId: "r1", memberName: "Alice", version: "7.x", pointRef: firstRef, completed: false, playlistPosition: 1 },
      { registrationId: "r2", memberName: "Bob", version: "7.x", pointRef: secondRef, completed: true, playlistPosition: 0 },
    ],
    playlistOrder: ["r2", "r1"],
    orderMode: "manual",
    listSelection: "r1",
    currentTarget: "r2",
    mapCurrentLocations: [{ mapId: "map-001", pointRef: firstRef }],
    incompleteRoute: [{ registrationId: "r1", pointRef: firstRef }],
  };
}

function validV3Root(): Record<string, unknown> {
  return {
    schemaVersion: 3,
    sessionRevision: 9,
    masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "map", appSchemaVersion: 1, appDataRevision: "app" },
    state: currentState(),
  };
}

describe("Treasure persistence boundary", () => {
  let storage: LocalStorageMock;

  beforeEach(() => {
    storage = new LocalStorageMock();
    vi.stubGlobal("localStorage", storage);
  });

  it("writes and restores the exact v3 envelope", () => {
    const state = currentState();
    expect(writePersistedTreasure(state, undefined, 9)).toBe(true);
    const raw = JSON.parse(storage.getItem(STORAGE_KEY_TREASURE_SESSION) ?? "null") as PersistedTreasureRoot;

    expect(raw.schemaVersion).toBe(3);
    expect(raw.sessionRevision).toBe(9);
    expect(Object.keys(raw).sort()).toEqual(["masterIdentity", "schemaVersion", "sessionRevision", "state"]);
    expect(validatePersistedTreasureRoot(raw)).toBe(true);
    expect(readPersistedTreasure()).toEqual({ snapshot: raw, restoreFailure: false, migrated: false });
  });

  it("rejects partial, extra, or malformed v3 state without fallback", () => {
    const invalid = {
      schemaVersion: 3,
      sessionRevision: 1,
      masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "map", appSchemaVersion: 1, appDataRevision: "app" },
      state: { ...currentState(), unexpected: true },
    };
    storage.setItem(STORAGE_KEY_TREASURE_SESSION, JSON.stringify(invalid));
    storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, treasure: { grade: 17, members: legacyMembers() } }));

    expect(readPersistedTreasure()).toEqual({ snapshot: null, restoreFailure: true, migrated: false });
    expect(storage.getItem(STORAGE_KEY_LEGACY_SESSIONS)).not.toBeNull();
  });

  it.each([
    ["schemaVersion", (root: Record<string, unknown>) => { delete root.schemaVersion; }],
    ["sessionRevision", (root: Record<string, unknown>) => { delete root.sessionRevision; }],
    ["masterIdentity", (root: Record<string, unknown>) => { delete root.masterIdentity; }],
    ["masterIdentity.mapSchemaVersion", (root: Record<string, unknown>) => { delete (root.masterIdentity as Record<string, unknown>).mapSchemaVersion; }],
    ["masterIdentity.mapDataRevision", (root: Record<string, unknown>) => { delete (root.masterIdentity as Record<string, unknown>).mapDataRevision; }],
    ["masterIdentity.appSchemaVersion", (root: Record<string, unknown>) => { delete (root.masterIdentity as Record<string, unknown>).appSchemaVersion; }],
    ["masterIdentity.appDataRevision", (root: Record<string, unknown>) => { delete (root.masterIdentity as Record<string, unknown>).appDataRevision; }],
    ["state", (root: Record<string, unknown>) => { delete root.state; }],
    ["state.registrations", (root: Record<string, unknown>) => { delete (root.state as Record<string, unknown>).registrations; }],
    ["state.playlistOrder", (root: Record<string, unknown>) => { delete (root.state as Record<string, unknown>).playlistOrder; }],
    ["state.orderMode", (root: Record<string, unknown>) => { delete (root.state as Record<string, unknown>).orderMode; }],
    ["state.listSelection", (root: Record<string, unknown>) => { delete (root.state as Record<string, unknown>).listSelection; }],
    ["state.currentTarget", (root: Record<string, unknown>) => { delete (root.state as Record<string, unknown>).currentTarget; }],
    ["state.mapCurrentLocations", (root: Record<string, unknown>) => { delete (root.state as Record<string, unknown>).mapCurrentLocations; }],
    ["state.incompleteRoute", (root: Record<string, unknown>) => { delete (root.state as Record<string, unknown>).incompleteRoute; }],
    ["registration.registrationId", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.registrationId; }],
    ["registration.memberName", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.memberName; }],
    ["registration.version", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.version; }],
    ["registration.pointRef", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.pointRef; }],
    ["registration.completed", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.completed; }],
    ["registration.playlistPosition", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.playlistPosition; }],
    ["registration.pointRef.gradeSetId", (root: Record<string, unknown>) => { delete (((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.pointRef as Record<string, unknown>).gradeSetId; }],
    ["registration.pointRef.mapId", (root: Record<string, unknown>) => { delete (((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.pointRef as Record<string, unknown>).mapId; }],
    ["registration.pointRef.pointId", (root: Record<string, unknown>) => { delete (((root.state as Record<string, unknown>).registrations as Array<Record<string, unknown>>)[0]!.pointRef as Record<string, unknown>).pointId; }],
    ["mapCurrentLocations.mapId", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).mapCurrentLocations as Array<Record<string, unknown>>)[0]!.mapId; }],
    ["mapCurrentLocations.pointRef", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).mapCurrentLocations as Array<Record<string, unknown>>)[0]!.pointRef; }],
    ["incompleteRoute.registrationId", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).incompleteRoute as Array<Record<string, unknown>>)[0]!.registrationId; }],
    ["incompleteRoute.pointRef", (root: Record<string, unknown>) => { delete ((root.state as Record<string, unknown>).incompleteRoute as Array<Record<string, unknown>>)[0]!.pointRef; }],
  ])("rejects v3 nested required field %s without trying a legacy fallback", (_name, mutate) => {
    const root = JSON.parse(JSON.stringify(validV3Root())) as Record<string, unknown>;
    mutate(root);
    const raw = JSON.stringify(root);
    storage.setItem(STORAGE_KEY_TREASURE_SESSION, raw);
    storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, treasure: { grade: 17, members: legacyMembers() } }));

    expect(validatePersistedTreasureRoot(root)).toBe(false);
    expect(readPersistedTreasure()).toEqual({ snapshot: null, restoreFailure: true, migrated: false });
    expect(storage.getItem(STORAGE_KEY_TREASURE_SESSION)).toBe(raw);
    expect(storage.getItem(STORAGE_KEY_LEGACY_SESSIONS)).not.toBeNull();
  });

  it.each([
    [1, { grade: 17, members: legacyMembers() }],
    [2, legacyV2State()],
  ])("accepts the exact v2 schema %s root shape", (schemaVersion, state) => {
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify({ schemaVersion, sessionRevision: 3, state }));

    const result = readPersistedTreasure();

    expect(result.migrated).toBe(true);
    expect(result.snapshot?.schemaVersion).toBe(3);
    expect(result.snapshot?.state.registrations).toHaveLength(2);
  });

  it("accepts the second exact v2 root shape only when identity is valid", () => {
    const state = { schemaVersion: 2, sessionRevision: 3, masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "map", appSchemaVersion: 1, appDataRevision: "app" }, state: legacyV2State() };
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify(state));
    expect(readPersistedTreasure().migrated).toBe(true);

    storage.clear();
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify({ ...state, masterIdentity: { ...state.masterIdentity, extra: true } }));
    expect(readPersistedTreasure()).toEqual({ snapshot: null, restoreFailure: true, migrated: false });
  });

  it.each([
    ["extra state field", { ...legacyV2State(), extra: true }],
    ["missing state field", (() => Object.fromEntries(Object.entries(legacyV2State()).filter(([key]) => key !== "bulkText")))()],
    ["extra root field", { schemaVersion: 2, sessionRevision: 3, state: legacyV2State(), extra: true }],
  ])("rejects v2 %s", (_name, value) => {
    const root = "schemaVersion" in value
      ? value
      : { schemaVersion: 2, sessionRevision: 3, state: value };
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify(root));

    expect(readPersistedTreasure()).toEqual({ snapshot: null, restoreFailure: true, migrated: false });
  });

  it("migrates v2 while preserving completion, manual order, and current map locations", () => {
    const legacy = legacyV2State();
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify({ schemaVersion: 2, sessionRevision: 4, state: legacy }));

    const result = readPersistedTreasure();
    expect(result.migrated).toBe(true);
    expect(result.snapshot?.state.orderMode).toBe("manual");
    expect(result.snapshot?.state.playlistOrder).toEqual(["legacy-registration-1", "legacy-registration-0"]);
    expect(result.snapshot?.state.registrations.map((registration) => [registration.memberName, registration.completed])).toEqual([["Bob", true], ["Alice", false]]);
    expect(result.snapshot?.state.mapCurrentLocations).toEqual([{ mapId: "map-023", pointRef: { gradeSetId: "treasure-grade-17", mapId: "map-023", pointId: "map-023-point-003" } }]);
    expect(storage.getItem(STORAGE_KEY_LEGACY_TREASURE_SESSION)).not.toBeNull();
    result.cleanupLegacy?.();
    expect(storage.getItem(STORAGE_KEY_LEGACY_TREASURE_SESSION)).toBeNull();
    expect(validatePersistedTreasureRoot(JSON.parse(storage.getItem(STORAGE_KEY_TREASURE_SESSION) ?? "null"))).toBe(true);
  });

  it("migrates v1 with only the missing semantics defaulted", () => {
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify({ schemaVersion: 1, sessionRevision: 2, state: { grade: 17, members: legacyMembers() } }));

    const result = readPersistedTreasure();
    expect(result.migrated).toBe(true);
    expect(result.snapshot?.state.orderMode).toBe("auto");
    expect(result.snapshot?.state.listSelection).toBeNull();
    expect(result.snapshot?.state.currentTarget).toBeNull();
    expect(result.snapshot?.state.mapCurrentLocations).toEqual([]);
    expect(result.snapshot?.state.registrations.every((registration) => !registration.completed)).toBe(true);
  });

  it("migrates integrated v1 and separate keys as independent generations", () => {
    storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, product: "treasure-compass", treasure: { grade: 17, members: legacyMembers() }, mob: { opaque: true } }));
    const integrated = readPersistedTreasure();
    expect(integrated.snapshot?.state.registrations).toHaveLength(2);
    integrated.cleanupLegacy?.();
    expect(storage.getItem(STORAGE_KEY_LEGACY_SESSIONS)).toBeNull();

    storage.clear();
    storage.setItem(STORAGE_KEY_GRADE, JSON.stringify(17));
    storage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(legacyMembers()));
    const separate = readPersistedTreasure();
    expect(separate.snapshot?.state.registrations).toHaveLength(2);
    separate.cleanupLegacy?.();
    expect(storage.getItem(STORAGE_KEY_GRADE)).toBeNull();
    expect(storage.getItem(STORAGE_KEY_MEMBERS)).toBeNull();
  });

  it.each([undefined, { opaque: true }])("accepts integrated v1 object or omitted mob payload %j", (mob) => {
    storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, product: "treasure-compass", treasure: { grade: 17, members: legacyMembers() }, mob }));

    expect(readPersistedTreasure().snapshot?.state.registrations).toHaveLength(2);
  });

  it.each([null, "opaque", 42, []])("rejects integrated v1 non-object mob payload %j", (mob) => {
    storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, product: "treasure-compass", treasure: { grade: 17, members: legacyMembers() }, mob }));

    expect(readPersistedTreasure()).toEqual({ snapshot: null, restoreFailure: true, migrated: false });
    expect(storage.getItem(STORAGE_KEY_LEGACY_SESSIONS)).not.toBeNull();
  });

  it("rejects an integrated root extra field without falling back to separate keys", () => {
    storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, product: "treasure-compass", treasure: { grade: 17, members: legacyMembers() }, extra: true }));
    storage.setItem(STORAGE_KEY_GRADE, "17");
    storage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(legacyMembers()));

    expect(readPersistedTreasure()).toEqual({ snapshot: null, restoreFailure: true, migrated: false });
    expect(storage.getItem(STORAGE_KEY_LEGACY_SESSIONS)).not.toBeNull();
  });

  it.each([
    ["grade only", [[STORAGE_KEY_GRADE, "17"]]],
    ["members only", [[STORAGE_KEY_MEMBERS, JSON.stringify(legacyMembers())]]],
    ["invalid grade", [[STORAGE_KEY_GRADE, JSON.stringify("17")], [STORAGE_KEY_MEMBERS, JSON.stringify(legacyMembers())]]],
    ["invalid members", [[STORAGE_KEY_GRADE, "17"], [STORAGE_KEY_MEMBERS, JSON.stringify({})]]],
  ])("rejects incomplete or invalid separate generation: %s", (_name, entries) => {
    for (const [key, value] of entries) storage.setItem(key, value);

    expect(readPersistedTreasure()).toEqual({ snapshot: null, restoreFailure: true, migrated: false });
  });

  it("uses generation priority and keeps a valid upper generation authoritative", () => {
    const root = validV3Root();
    storage.setItem(STORAGE_KEY_TREASURE_SESSION, JSON.stringify(root));
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify({ schemaVersion: 2, sessionRevision: 3, state: legacyV2State() }));
    storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, treasure: { grade: 17, members: legacyMembers() } }));

    const result = readPersistedTreasure();

    expect(result).toEqual({ snapshot: root, restoreFailure: false, migrated: false });
    expect(storage.getItem(STORAGE_KEY_LEGACY_TREASURE_SESSION)).not.toBeNull();
  });

  it.each([
    ["v2 over integrated and separate", () => {
      storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify({ schemaVersion: 1, sessionRevision: 3, state: { grade: 17, members: legacyMembers() } }));
      storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, treasure: { grade: 17, members: legacyMembers() } }));
      storage.setItem(STORAGE_KEY_GRADE, "17");
      storage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(legacyMembers()));
    }, "auto"],
    ["integrated over separate", () => {
      storage.setItem(STORAGE_KEY_LEGACY_SESSIONS, JSON.stringify({ version: 1, treasure: { grade: 17, members: legacyMembers() } }));
      storage.setItem(STORAGE_KEY_GRADE, "17");
      storage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(legacyMembers()));
    }, "auto"],
  ])("applies candidate priority: %s", (_name, seed, expectedOrder) => {
    seed();

    const result = readPersistedTreasure();

    expect(result.migrated).toBe(true);
    expect(result.snapshot?.state.orderMode).toBe(expectedOrder);
    expect(storage.getItem(STORAGE_KEY_TREASURE_SESSION)).not.toBeNull();
  });

  it("keeps legacy records when migration write fails", () => {
    const legacyRaw = JSON.stringify({ schemaVersion: 1, sessionRevision: 2, state: { grade: 17, members: legacyMembers() } });
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, legacyRaw);
    storage.failWrites = true;

    expect(readPersistedTreasure()).toEqual({ snapshot: null, restoreFailure: true, migrated: false });
    expect(storage.getItem(STORAGE_KEY_LEGACY_TREASURE_SESSION)).toBe(legacyRaw);
    expect(storage.getItem(STORAGE_KEY_TREASURE_SESSION)).toBeNull();
    expect(storage.operations.some((operation) => operation.startsWith("remove:"))).toBe(false);
  });

  it("retains the v3 marker when cleanup fails and prevents legacy resurrection", () => {
    storage.setItem(STORAGE_KEY_LEGACY_TREASURE_SESSION, JSON.stringify({ schemaVersion: 1, sessionRevision: 2, state: { grade: 17, members: legacyMembers() } }));
    storage.failRemoves = true;
    const migrated = readPersistedTreasure();
    expect(migrated.migrated).toBe(true);
    expect(storage.getItem(STORAGE_KEY_TREASURE_SESSION)).not.toBeNull();
    expect(storage.getItem(STORAGE_KEY_LEGACY_TREASURE_SESSION)).not.toBeNull();
    expect(storage.operations.indexOf(`set:${STORAGE_KEY_TREASURE_SESSION}`)).toBeGreaterThanOrEqual(0);
    expect(storage.operations.indexOf(`remove:${STORAGE_KEY_LEGACY_TREASURE_SESSION}`)).toBe(-1);

    storage.failRemoves = false;
    migrated.cleanupLegacy?.();
    expect(storage.operations.indexOf(`remove:${STORAGE_KEY_LEGACY_TREASURE_SESSION}`)).toBeGreaterThan(storage.operations.indexOf(`set:${STORAGE_KEY_TREASURE_SESSION}`));
    const restored = readPersistedTreasure();
    expect(restored.migrated).toBe(false);
    expect(restored.snapshot).toEqual(migrated.snapshot);
  });
});
