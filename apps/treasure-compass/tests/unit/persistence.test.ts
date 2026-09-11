import {
  readPersistedTreasure,
  STORAGE_KEY_LEGACY_SESSIONS,
  STORAGE_KEY_TREASURE_SESSION,
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
  failWrites = false;

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
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

describe("Treasure persistence boundary", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new LocalStorageMock());
  });

  it("新しい Treasure key を旧統合 key より優先する", () => {
    const snapshot = {
      grade: DEFAULT_GRADE,
      members: Array(FULL_PARTY).fill(null),
    };
    localStorage.setItem(
      STORAGE_KEY_TREASURE_SESSION,
      JSON.stringify({ schemaVersion: 1, sessionRevision: 1, state: snapshot }),
    );
    localStorage.setItem(
      STORAGE_KEY_LEGACY_SESSIONS,
      JSON.stringify({
        version: 1,
        product: "mob",
        treasure: null,
        mob: { broken: true },
      }),
    );

    expect(readPersistedTreasure()).toEqual({ snapshot, restoreFailure: false });
  });

  it("優先する統合 key が不正なら古い別 key へ fallback しない", () => {
    localStorage.setItem(
      STORAGE_KEY_LEGACY_SESSIONS,
      '{"version":1,"treasure":null}',
    );
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

  it("旧統合 key から Treasure 部分だけを新しい key へ移行する", () => {
    const snapshot = {
      grade: DEFAULT_GRADE,
      members: Array(FULL_PARTY).fill(null),
    };
    localStorage.setItem(
      STORAGE_KEY_LEGACY_SESSIONS,
      JSON.stringify({
        version: 1,
        product: "mob",
        treasure: snapshot,
        mob: { opaqueLegacyValue: "preserved" },
      }),
    );

    expect(readPersistedTreasure()).toEqual({ snapshot, restoreFailure: false });
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY_TREASURE_SESSION) ?? "null",
    ) as Record<string, unknown>;
    expect(stored).toEqual({
      schemaVersion: 1,
      sessionRevision: 1,
      state: snapshot,
    });
    expect(localStorage.getItem(STORAGE_KEY_LEGACY_SESSIONS)).toBeNull();
  });

  it("旧 separate key から移行後、旧 key を削除する", () => {
    const snapshot = {
      grade: DEFAULT_GRADE,
      members: Array(FULL_PARTY).fill(null),
    };
    localStorage.setItem(STORAGE_KEY_GRADE, JSON.stringify(snapshot.grade));
    localStorage.setItem(
      STORAGE_KEY_MEMBERS,
      JSON.stringify(snapshot.members),
    );

    expect(readPersistedTreasure()).toEqual({ snapshot, restoreFailure: false });
    expect(localStorage.getItem(STORAGE_KEY_GRADE)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY_MEMBERS)).toBeNull();
  });

  it("新しい key への移行保存に失敗した場合、旧保存を変更しない", () => {
    const legacyMob = { opaqueLegacyValue: "preserved" };
    localStorage.setItem(
      STORAGE_KEY_LEGACY_SESSIONS,
      JSON.stringify({
        version: 1,
        product: "mob",
        treasure: null,
        mob: legacyMob,
      }),
    );

    (localStorage as unknown as LocalStorageMock).failWrites = true;

    expect(readPersistedTreasure()).toEqual({
      snapshot: null,
      restoreFailure: true,
    });
    expect(localStorage.getItem(STORAGE_KEY_LEGACY_SESSIONS)).toContain(
      JSON.stringify(legacyMob),
    );
  });
});
