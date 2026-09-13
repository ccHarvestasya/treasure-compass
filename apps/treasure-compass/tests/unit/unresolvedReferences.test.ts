import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MapData, Point, TreasureCatalog, TreasurePointRef } from "../../src/types";

class LocalStorageMock {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

type StoreModule = typeof import("../../src/store/useAppStore");
let useAppStore: StoreModule["useAppStore"];
let storage: LocalStorageMock;

const knownRef: TreasurePointRef = { gradeSetId: "grade-set", mapId: "map-test", pointId: "point-known" };
const missingRef: TreasurePointRef = { gradeSetId: "grade-set", mapId: "map-test", pointId: "point-missing" };

function makePoint(stableId: string, pointName: string, division: Point["division"] = "P"): Point {
  return { stableId, pointNo: division === "T" ? 100 : 1, division, block: "", posX: 120, posY: 230, posZ: 0, posT: 0, time: 0, pointName };
}

function makeCatalog(refs: TreasurePointRef[]): TreasureCatalog {
  const map: MapData["mapData"][number] = {
    mapId: "map-test",
    region: "test",
    mapNo: 1,
    mapName: "Current map name",
    mapNameShort: "Current",
    point: [makePoint("aetheryte", "Aetheryte", "T"), ...refs.map((ref) => makePoint(ref.pointId, `Current ${ref.pointId}`))],
  };
  return {
    mapData: { mapSize: 431, mapData: [map] },
    candidates: refs.map((ref) => ({
      pointRef: { ...ref },
      grade: 17,
      version: "7.x",
      point: map.point.find((point) => point.stableId === ref.pointId)!,
      map,
    })),
    masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "current-map", appSchemaVersion: 1, appDataRevision: "current-treasure" },
  };
}

function seedSession(ref: TreasurePointRef, options: { currentTarget: string | null; locations: Array<{ mapId: string; pointRef: TreasurePointRef }> }) {
  storage.setItem("treasure-compass:treasure-session:v3", JSON.stringify({
    schemaVersion: 3,
    sessionRevision: 4,
    masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "old-map", appSchemaVersion: 1, appDataRevision: "old-treasure" },
    state: {
      registrations: [{ registrationId: "restored-1", memberName: "Alice", version: "7.x", pointRef: ref, completed: false, playlistPosition: 0 }],
      playlistOrder: ["restored-1"],
      orderMode: "auto",
      listSelection: null,
      currentTarget: options.currentTarget,
      mapCurrentLocations: options.locations,
      incompleteRoute: [{ registrationId: "restored-1", pointRef: ref }],
    },
  }));
}

async function loadStore(ref: TreasurePointRef, options: { currentTarget: string | null; locations: Array<{ mapId: string; pointRef: TreasurePointRef }> }) {
  storage = new LocalStorageMock();
  vi.stubGlobal("localStorage", storage);
  seedSession(ref, options);
  vi.resetModules();
  const module = await import("../../src/store/useAppStore");
  useAppStore = module.useAppStore;
  useAppStore.getState().setCatalog(makeCatalog(ref === missingRef ? [knownRef] : [knownRef]));
}

describe("unresolved Treasure references", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("re-matches every stable ref when only master identity changes", async () => {
    await loadStore(knownRef, { currentTarget: "restored-1", locations: [{ mapId: "map-test", pointRef: knownRef }] });

    const state = useAppStore.getState();

    expect(state.unresolvedReferences).toEqual([]);
    expect(state.currentTarget).toBe("restored-1");
    expect(state.route[0]?.point.pointName).toBe("Current point-known");
  });

  it("annotates only a missing registration ref after an identity change", async () => {
    await loadStore(missingRef, { currentTarget: null, locations: [] });

    expect(useAppStore.getState().unresolvedReferences).toEqual([
      expect.objectContaining({ source: "registration", reason: "master-identity-mismatch", pointRef: missingRef }),
    ]);
    expect(useAppStore.getState().route).toEqual([]);
  });

  it("retains and identifies an unresolved current target without route fallback", async () => {
    await loadStore(missingRef, { currentTarget: "restored-1", locations: [] });

    const state = useAppStore.getState();

    expect(state.currentTarget).toBe("restored-1");
    expect(state.route).toEqual([]);
    expect(state.unresolvedReferences).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: "currentTarget", reason: "master-identity-mismatch" }),
    ]));
  });

  it("annotates an unresolved map current location independently", async () => {
    await loadStore(knownRef, { currentTarget: null, locations: [{ mapId: "map-test", pointRef: missingRef }] });

    const state = useAppStore.getState();

    expect(state.unresolvedReferences).toEqual([
      expect.objectContaining({ source: "mapCurrentLocation", reason: "master-identity-mismatch", pointRef: missingRef }),
    ]);
  });
});
