import {
  readPersistedTreasure,
  STORAGE_KEY_SESSIONS,
  writePersistedTreasure,
} from "../../src/persistence/storage";
import {
  DEFAULT_GRADE,
  FULL_PARTY,
  STORAGE_KEY_GRADE,
  STORAGE_KEY_MEMBERS,
} from "../../src/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

  clear(): void {
    this.values.clear();
  }
}

describe("Treasure persistence boundary", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new LocalStorageMock());
  });

  it("旧統合 key の Mob 部分を採用せず Treasure 部分だけ復元する", () => {
    localStorage.setItem(
      STORAGE_KEY_SESSIONS,
      JSON.stringify({
        version: 1,
        product: "mob",
        treasure: {
          grade: DEFAULT_GRADE,
          members: Array(FULL_PARTY).fill(null),
        },
        mob: { broken: true },
      }),
    );

    expect(readPersistedTreasure()).toEqual({
      snapshot: {
        grade: DEFAULT_GRADE,
        members: Array(FULL_PARTY).fill(null),
      },
      restoreFailure: false,
    });
  });

  it("優先する統合 key が不正なら古い別 key へ fallback しない", () => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, '{"version":1,"treasure":null}');
    localStorage.setItem(STORAGE_KEY_GRADE, JSON.stringify(DEFAULT_GRADE));
    localStorage.setItem(
      STORAGE_KEY_MEMBERS,
      JSON.stringify(Array(FULL_PARTY).fill(null)),
    );

    expect(readPersistedTreasure()).toEqual({
      snapshot: null,
      restoreFailure: true,
    });
  });

  it("Treasure 更新を旧統合形式へ一回の write で保存する", () => {
    const snapshot = {
      grade: DEFAULT_GRADE,
      members: Array(FULL_PARTY).fill(null),
    };

    expect(writePersistedTreasure(snapshot)).toBe(true);
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY_SESSIONS) ?? "null",
    ) as Record<string, unknown>;
    expect(stored.treasure).toEqual(snapshot);
    expect(stored.product).toBe("treasure");
    expect(stored.mob).toEqual(
      expect.objectContaining({ targets: {}, sessionVersion: 0 }),
    );
  });

  it("旧統合 key にある Mob 試作データは解釈せず保持する", () => {
    const legacyMob = { opaqueLegacyValue: "preserved" };
    localStorage.setItem(
      STORAGE_KEY_SESSIONS,
      JSON.stringify({
        version: 1,
        product: "mob",
        treasure: null,
        mob: legacyMob,
      }),
    );

    const snapshot = {
      grade: DEFAULT_GRADE,
      members: Array(FULL_PARTY).fill(null),
    };
    expect(writePersistedTreasure(snapshot)).toBe(true);

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY_SESSIONS) ?? "null",
    ) as Record<string, unknown>;
    expect(stored.mob).toEqual(legacyMob);
    expect(stored.product).toBe("treasure");
  });
});
