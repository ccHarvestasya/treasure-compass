import { describe, expect, it } from "vitest";
import {
  MOB_COMPASS_MODES,
  calculateMobRoute,
  cancelBNext,
  completeBNext,
  createEmptyMobSession,
  encodePersistedMobSession,
  filterMobs,
  moveMobVisit,
  registerMob,
  setMobOrderMode,
  validatePersistedMobRoot,
  type MobCatalog,
} from "../src/index.ts";

function catalog(): MobCatalog {
  return {
    maps: [{ id: "map-a", name: "試験地図", shortName: "試験", expansionId: "expansion-a", aetherytes: [{ id: "aetheryte-a", name: "転移地点", x: 1, y: 1 }] }],
    mobs: [
      { id: "regular-id", name: "通常対象", aliases: ["別名"], category: "regular", rank: "normal", mapId: "map-a", candidates: [{ id: "regular-point", mapId: "map-a", x: 10, y: 10 }] },
      { id: "b-id", name: "B対象", aliases: [], category: "elite", rank: "b", mapId: "map-a", candidates: [{ id: "b-point-1", mapId: "map-a", x: 20, y: 20 }, { id: "b-point-2", mapId: "map-a", x: 30, y: 30 }] },
      { id: "a-id", name: "A対象", aliases: [], category: "elite", rank: "a", mapId: "map-a", candidates: [{ id: "a-point", mapId: "map-a", x: 40, y: 40 }] },
    ],
    masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "map-fixture", mobSchemaVersion: 1, mobDataRevision: "mob-fixture" },
  };
}

describe("mob-domain boundary", () => {
  it("ソロとパーティを独立した mode 値として公開する", () => {
    expect(MOB_COMPASS_MODES).toEqual(["solo", "party"]);
  });

  it("検索・mode eligibility と一般/B の登録単位を分ける", () => {
    const data = catalog();
    expect(filterMobs(data, "solo", "別名").map((mob) => mob.id)).toEqual(["regular-id"]);
    expect(filterMobs(data, "party", "").map((mob) => mob.id)).toEqual(["a-id"]);

    const session = registerMob(createEmptyMobSession("solo", data), data, "b-id");
    expect(session?.targets[0]?.candidates).toHaveLength(2);
    expect(session?.visitOrder).toEqual(["b-id:b-point-1", "b-id:b-point-2"]);
    const regular = registerMob(session!, data, "regular-id");
    expect(regular?.visitOrder).toContain("regular-id:regular-point");
  });

  it("B Next と一段取消は candidate 状態・current location を一単位で扱う", () => {
    const data = catalog();
    const registered = registerMob(createEmptyMobSession("solo", data), data, "b-id")!;
    const progressed = completeBNext({ ...registered, currentVisitId: registered.visitOrder[0]! }, data)!;
    expect(progressed.targets[0]?.candidates[0]?.status).toBe("explored");
    expect(progressed.mapCurrentLocations).toEqual([{ mapId: "map-a", candidateId: "b-point-1" }]);
    expect(progressed.currentVisitId).toBe("b-id:b-point-2");
    expect(cancelBNext(progressed)?.targets[0]?.candidates.every((candidate) => candidate.status === "unexplored")).toBe(true);
  });

  it("manual order を保ち、auto では安定した map/座標順に戻す", () => {
    const data = catalog();
    const registered = registerMob(registerMob(createEmptyMobSession("solo", data), data, "regular-id")!, data, "b-id")!;
    const manual = setMobOrderMode(registered, data, "manual");
    const moved = moveMobVisit(manual, "regular-id:regular-point", "down")!;
    expect(moved.visitOrder[0]).toBe("b-id:b-point-1");
    expect(setMobOrderMode(moved, data, "auto").visitOrder[0]).toBe("regular-id:regular-point");
    expect(calculateMobRoute(moved, data).steps[0]?.visitId).toBe("b-id:b-point-1");
  });

  it("Mob v1 root は exact envelope で復元し、余分 field を拒否する", () => {
    const data = catalog();
    const root = encodePersistedMobSession(registerMob(createEmptyMobSession("party", data), data, "a-id", "a-point")!);
    expect(validatePersistedMobRoot(root)).toBe(true);
    expect(validatePersistedMobRoot({ ...root, state: { ...root.state, extra: true } })).toBe(false);
    expect(validatePersistedMobRoot({ ...root, masterIdentity: { ...root.masterIdentity, mobDataRevision: "" } })).toBe(false);
  });
});
