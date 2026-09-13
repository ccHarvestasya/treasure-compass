import { describe, expect, it } from "vitest";
import mapMasterJson from "@treasure-compass/master-data/data/map-master.v1.json";
import { validateMapMaster, validateMobMaster } from "@treasure-compass/master-data";
import {
  addSpawnArea,
  changeAuthoringMap,
  createAuthoringEntry,
  createCandidateId,
  generateRuntimeMaster,
  loadAuthoringData,
  makeAuthoringData,
  removeSpawnArea,
  representativeCoordinate,
  saveAuthoringData,
  updateSpawnArea,
  validateAuthoringData,
  type MobAuthoringDraft,
  type SpawnArea,
} from "../src/authoring.ts";

const mapValidation = validateMapMaster(mapMasterJson);
if (!mapValidation.data) throw new Error("test map master is not valid");
const mapMaster = mapValidation.data;
const map = mapMaster.maps[0]!;
const otherMap = mapMaster.maps[1]!;
const source = mapMaster.sources[0]!;

function draft(overrides: Partial<MobAuthoringDraft> = {}): MobAuthoringDraft {
  return {
    name: "テストモブ",
    rank: "normal",
    mapId: map.id,
    spawnAreas: [{ minX: 10, minY: 12, maxX: 14, maxY: 18 }],
    source: source.id,
    ...overrides,
  };
}

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear() { values.clear(); },
    getItem(key: string) { return values.get(key) ?? null; },
    key(index: number) { return [...values.keys()][index] ?? null; },
    removeItem(key: string) { values.delete(key); },
    setItem(key: string, value: string) { values.set(key, value); },
  };
}

describe("Mob master authoring", () => {
  it("generates a valid regular runtime candidate from one area", () => {
    const entry = createAuthoringEntry(draft());
    const authoringData = makeAuthoringData([entry]);
    const result = generateRuntimeMaster(authoringData, mapMaster);

    expect(result.valid).toBe(true);
    expect(result.data?.mobs).toHaveLength(1);
    expect(result.data?.mobs[0]?.category).toBe("regular");
    expect(result.data?.mobs[0]?.candidates[0]).toMatchObject({ x: 12, y: 15 });
    expect(validateMobMaster(result.data, mapMaster).diagnostics).toEqual([]);
  });

  it("supports adding, editing, and deleting multiple areas", () => {
    const first: SpawnArea = { minX: 2, minY: 3, maxX: 4, maxY: 5 };
    const second: SpawnArea = { minX: 20, minY: 21, maxX: 22, maxY: 23 };
    const added = addSpawnArea([], first);
    const withSecond = addSpawnArea(added, second);
    const edited = updateSpawnArea(withSecond, 1, { ...second, maxY: 24 });

    expect(edited).toEqual([first, { ...second, maxY: 24 }]);
    expect(removeSpawnArea(edited, 0)).toEqual([{ ...second, maxY: 24 }]);
    expect(representativeCoordinate(edited[1]!)).toEqual({ x: 21, y: 22.5 });
    const generated = generateRuntimeMaster(makeAuthoringData([createAuthoringEntry(draft({ spawnAreas: edited }))]), mapMaster);
    expect(generated.data?.mobs[0]?.candidates).toHaveLength(2);
  });

  it("generates deterministic IDs and candidates for the same input", () => {
    const first = generateRuntimeMaster(makeAuthoringData([createAuthoringEntry(draft())]), mapMaster);
    const second = generateRuntimeMaster(makeAuthoringData([createAuthoringEntry(draft())]), mapMaster);

    expect(second).toEqual(first);
    expect(first.data?.mobs[0]?.candidates[0]?.id).toBe(
      createCandidateId(createAuthoringEntry(draft()).id, map.id, draft().spawnAreas[0]!),
    );
  });

  it("derives elite category for B/A/S/SS ranks", () => {
    for (const rank of ["b", "a", "s", "ss"] as const) {
      const result = generateRuntimeMaster(makeAuthoringData([createAuthoringEntry(draft({ rank }))]), mapMaster);
      expect(result.valid).toBe(true);
      expect(result.data?.mobs[0]?.category).toBe("elite");
    }
  });

  it("clears ranges when the selected map changes", () => {
    const changed = changeAuthoringMap(draft(), otherMap.id);
    expect(changed.mapId).toBe(otherMap.id);
    expect(changed.spawnAreas).toEqual([]);
  });

  it("reports bounds, source, and empty-area errors without correcting input", () => {
    const invalid = createAuthoringEntry(draft({
      source: "",
      spawnAreas: [
        { minX: map.bounds.maxX + 1, minY: 4, maxX: map.bounds.maxX, maxY: 5 },
        { minX: map.bounds.maxX + 1, minY: 4, maxX: map.bounds.maxX + 2, maxY: 5 },
      ],
    }));
    const result = validateAuthoringData(makeAuthoringData([invalid]), mapMaster);

    expect(result.valid).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(["empty-source", "invalid-order", "out-of-bounds"]));
    expect(result.data?.entries[0]?.spawnAreas[0]).toEqual(invalid.spawnAreas[0]);
  });

  it("reports duplicate mob and candidate IDs", () => {
    const entry = createAuthoringEntry(draft());
    const duplicateArea = createAuthoringEntry({ ...draft(), spawnAreas: [...draft().spawnAreas, draft().spawnAreas[0]!] }, entry.id);
    const result = validateAuthoringData(makeAuthoringData([entry, duplicateArea]), mapMaster);

    expect(result.valid).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(["duplicate-id", "duplicate-mob", "duplicate-candidate-id"]));
  });

  it("reports invalid rank, map, and missing ranges", () => {
    const entry = createAuthoringEntry(draft());
    const invalidRank = { ...entry, rank: "unknown" } as unknown as typeof entry;
    const invalidMap = { ...entry, id: `${entry.id}-2`, mapId: "missing-map", spawnAreas: [] };
    const result = validateAuthoringData(makeAuthoringData([invalidRank, invalidMap]), mapMaster);

    expect(result.valid).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(["invalid-rank", "unknown-map", "no-spawn-areas"]));
  });

  it("persists and restores authoring data", () => {
    const storage = memoryStorage();
    const data = makeAuthoringData([createAuthoringEntry(draft({ rank: "a" }))]);
    expect(saveAuthoringData(data, storage)).toBe(true);
    expect(loadAuthoringData(mapMaster, storage)).toEqual({ valid: true, data, diagnostics: [] });
  });

  it("does not export a runtime master for an unregistered source", () => {
    const data = makeAuthoringData([createAuthoringEntry(draft({ source: "new source reference" }))]);
    const result = generateRuntimeMaster(data, mapMaster);

    expect(result.valid).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.diagnostics[0]?.code).toBe("source-not-registered");
  });
});
