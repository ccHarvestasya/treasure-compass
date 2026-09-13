import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobCoordinator, MOB_MODE_KEY, MOB_SESSION_KEYS } from "../../src/mobCoordinator.ts";
import type { MobCatalog } from "@treasure-compass/mob-domain";

class StorageMock {
  private readonly values = new Map<string, string>();
  failWrites = false;

  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { if (this.failWrites) throw new Error("write failed"); this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
  clear(): void { this.values.clear(); }
}

function catalog(): MobCatalog {
  return {
    maps: [{ id: "map-a", name: "試験地図", shortName: "試験", expansionId: "expansion-a", aetherytes: [{ id: "aetheryte-a", name: "転移地点", x: 1, y: 1 }] }],
    mobs: [
      { id: "solo-id", name: "ソロ対象", aliases: [], category: "regular", rank: "normal", mapId: "map-a", candidates: [{ id: "solo-point", mapId: "map-a", x: 10, y: 10 }] },
      { id: "party-id", name: "パーティ対象", aliases: [], category: "elite", rank: "a", mapId: "map-a", candidates: [{ id: "party-point", mapId: "map-a", x: 20, y: 20 }] },
    ],
    masterIdentity: { mapSchemaVersion: 1, mapDataRevision: "map-fixture", mobSchemaVersion: 1, mobDataRevision: "mob-fixture" },
  };
}

describe("Mob coordinator", () => {
  let storage: StorageMock;

  beforeEach(() => {
    storage = new StorageMock();
    vi.stubGlobal("localStorage", storage);
  });

  it("solo/party root と mode preference を分離する", () => {
    const controller = new MobCoordinator(catalog(), storage as unknown as Storage);
    expect(controller.mode).toBe("solo");
    expect(controller.register("solo-id")).toBe(true);
    expect(controller.switchMode("party")).toBe(true);
    expect(controller.register("party-id", "party-point")).toBe(true);

    const soloRoot = JSON.parse(storage.getItem(MOB_SESSION_KEYS.solo) ?? "null") as { state: { targets: unknown[] } };
    const partyRoot = JSON.parse(storage.getItem(MOB_SESSION_KEYS.party) ?? "null") as { state: { targets: unknown[] } };
    expect(soloRoot.state.targets).toHaveLength(1);
    expect(partyRoot.state.targets).toHaveLength(1);
    expect(JSON.parse(storage.getItem(MOB_MODE_KEY) ?? "null").mode).toBe("party");
  });

  it("write failure は state と mode/dialog 相当の公開状態を進めない", () => {
    const controller = new MobCoordinator(catalog(), storage as unknown as Storage);
    storage.failWrites = true;
    expect(controller.register("solo-id")).toBe(false);
    expect(controller.session.targets).toHaveLength(0);
    expect(controller.switchMode("party")).toBe(false);
    expect(controller.mode).toBe("solo");
  });

  it("破損 root は該当 Mob root だけ初期化し、他 root の正しい保存を読める", () => {
    storage.setItem(MOB_SESSION_KEYS.solo, JSON.stringify({ schemaVersion: 1, sessionRevision: 1, state: {} }));
    const first = new MobCoordinator(catalog(), storage as unknown as Storage);
    expect(first.persistenceError).toContain("復元");
    expect(first.session.targets).toHaveLength(0);
    expect(first.register("solo-id")).toBe(true);

    first.switchMode("party");
    expect(first.register("party-id", "party-point")).toBe(true);
    const restored = new MobCoordinator(catalog(), storage as unknown as Storage);
    expect(restored.mode).toBe("party");
    expect(restored.session.targets[0]?.mobId).toBe("party-id");
  });
});
