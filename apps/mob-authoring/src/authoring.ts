import { containsCoordinate, type MapBounds } from "@treasure-compass/map-core";
import {
  validateMobMaster,
  type MapMasterV1,
  type MasterDiagnostic,
  type MobMasterV1,
} from "@treasure-compass/master-data";
import type { MobCategory, MobRank } from "@treasure-compass/mob-domain";

export const AUTHORING_SCHEMA_VERSION = 1 as const;
export const AUTHORING_STORAGE_KEY = "mob-compass:authoring-data:v1";
export const MOB_RANKS = ["normal", "b", "a", "s", "ss"] as const satisfies readonly MobRank[];

export interface SpawnArea {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface MobAuthoringEntry {
  readonly id: string;
  readonly name: string;
  readonly rank: MobRank;
  readonly mapId: string;
  readonly spawnAreas: readonly SpawnArea[];
  readonly source: string;
}

export interface MobAuthoringData {
  readonly schemaVersion: typeof AUTHORING_SCHEMA_VERSION;
  readonly dataRevision: string;
  readonly entries: readonly MobAuthoringEntry[];
}

export interface MobAuthoringDraft {
  readonly name: string;
  readonly rank: MobRank;
  readonly mapId: string;
  readonly spawnAreas: readonly SpawnArea[];
  readonly source: string;
}

export interface AuthoringDiagnostic {
  readonly severity: "error" | "warning";
  readonly scope: string;
  readonly code: string;
  readonly message: string;
  readonly recordId?: string;
}

export interface AuthoringValidationResult<T> {
  readonly valid: boolean;
  readonly data?: T;
  readonly diagnostics: readonly AuthoringDiagnostic[];
}

export interface RuntimeGenerationResult {
  readonly valid: boolean;
  readonly data?: MobMasterV1;
  readonly diagnostics: readonly AuthoringDiagnostic[];
}

const AUTHORING_ROOT_KEYS = ["schemaVersion", "dataRevision", "entries"] as const;
const ENTRY_KEYS = ["id", "name", "rank", "mapId", "spawnAreas", "source"] as const;
const AREA_KEYS = ["minX", "minY", "maxX", "maxY"] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => key in value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isMobRank(value: unknown): value is MobRank {
  return typeof value === "string" && (MOB_RANKS as readonly string[]).includes(value);
}

function isSpawnArea(value: unknown): value is SpawnArea {
  return (
    isObject(value) &&
    hasExactKeys(value, AREA_KEYS) &&
    isFiniteNumber(value.minX) &&
    isFiniteNumber(value.minY) &&
    isFiniteNumber(value.maxX) &&
    isFiniteNumber(value.maxY)
  );
}

function normalizeText(value: string): string {
  return value.trim().normalize("NFC");
}

function compareCodePoints(left: string, right: string): number {
  const a = Array.from(left.normalize("NFC"));
  const b = Array.from(right.normalize("NFC"));
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    const leftCodePoint = a[index]!.codePointAt(0)!;
    const rightCodePoint = b[index]!.codePointAt(0)!;
    if (leftCodePoint !== rightCodePoint) return leftCodePoint - rightCodePoint;
  }
  return a.length - b.length;
}

function hashText(value: string): string {
  let hash = 2_166_136_261;
  for (const character of value) {
    hash ^= character.codePointAt(0)!;
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function canonicalArea(area: SpawnArea): string {
  return JSON.stringify({ minX: area.minX, minY: area.minY, maxX: area.maxX, maxY: area.maxY });
}

function canonicalEntries(entries: readonly MobAuthoringEntry[]): string {
  return JSON.stringify(
    [...entries]
      .sort((left, right) => compareCodePoints(left.id, right.id))
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        rank: entry.rank,
        mapId: entry.mapId,
        spawnAreas: entry.spawnAreas.map((area) => ({
          minX: area.minX,
          minY: area.minY,
          maxX: area.maxX,
          maxY: area.maxY,
        })),
        source: entry.source,
      })),
  );
}

function diagnostic(
  diagnostics: AuthoringDiagnostic[],
  scope: string,
  code: string,
  message: string,
  recordId?: string,
): void {
  diagnostics.push({ severity: "error", scope, code, message, ...(recordId ? { recordId } : {}) });
}

function areaInsideBounds(area: SpawnArea, bounds: MapBounds): boolean {
  return (
    containsCoordinate(bounds, { x: area.minX, y: area.minY }) &&
    containsCoordinate(bounds, { x: area.maxX, y: area.maxY })
  );
}

function duplicateDiagnostics(
  values: ReadonlyMap<string, number>,
  scope: string,
  code: string,
  message: string,
  diagnostics: AuthoringDiagnostic[],
): void {
  for (const [value, count] of values) {
    if (count > 1) diagnostic(diagnostics, scope, code, message, value);
  }
}

function incrementCount(counts: Map<string, number>, value: string): void {
  counts.set(value, (counts.get(value) ?? 0) + 1);
}

export function categoryForRank(rank: MobRank): MobCategory {
  return rank === "normal" ? "regular" : "elite";
}

export function representativeCoordinate(area: SpawnArea): { x: number; y: number } {
  return {
    x: (area.minX + area.maxX) / 2,
    y: (area.minY + area.maxY) / 2,
  };
}

export function createMobId(name: string, rank: MobRank, mapId: string): string {
  return `mob-${hashText(`${normalizeText(name)}\u0000${rank}\u0000${normalizeText(mapId)}`)}`;
}

export function createCandidateId(
  mobId: string,
  mapId: string,
  area: SpawnArea,
): string {
  return `mob-candidate-${hashText(`${mobId}\u0000${normalizeText(mapId)}\u0000${canonicalArea(area)}`)}`;
}

export function createAuthoringEntry(
  draft: MobAuthoringDraft,
  existingId?: string,
): MobAuthoringEntry {
  return {
    id: existingId ?? createMobId(draft.name, draft.rank, draft.mapId),
    name: draft.name,
    rank: draft.rank,
    mapId: draft.mapId,
    spawnAreas: [...draft.spawnAreas],
    source: draft.source,
  };
}

export function changeAuthoringMap(
  draft: MobAuthoringDraft,
  mapId: string,
): MobAuthoringDraft {
  if (draft.mapId === mapId) return draft;
  return { ...draft, mapId, spawnAreas: [] };
}

export function addOrUpdateAuthoringEntry(
  entries: readonly MobAuthoringEntry[],
  draft: MobAuthoringDraft,
  existingId?: string,
): MobAuthoringEntry[] {
  const nextEntry = createAuthoringEntry(draft, existingId);
  if (!existingId) return [...entries, nextEntry];
  return entries.map((entry) => (entry.id === existingId ? nextEntry : entry));
}

export function removeAuthoringEntry(
  entries: readonly MobAuthoringEntry[],
  entryId: string,
): MobAuthoringEntry[] {
  return entries.filter((entry) => entry.id !== entryId);
}

export function addSpawnArea(
  areas: readonly SpawnArea[],
  area: SpawnArea,
): SpawnArea[] {
  return [...areas, area];
}

export function updateSpawnArea(
  areas: readonly SpawnArea[],
  index: number,
  area: SpawnArea,
): SpawnArea[] {
  if (!Number.isInteger(index) || index < 0 || index >= areas.length) return [...areas];
  return areas.map((current, currentIndex) => (currentIndex === index ? area : current));
}

export function removeSpawnArea(
  areas: readonly SpawnArea[],
  index: number,
): SpawnArea[] {
  if (!Number.isInteger(index) || index < 0 || index >= areas.length) return [...areas];
  return areas.filter((_, currentIndex) => currentIndex !== index);
}

export function makeAuthoringData(entries: readonly MobAuthoringEntry[]): MobAuthoringData {
  return {
    schemaVersion: AUTHORING_SCHEMA_VERSION,
    dataRevision: `authoring-${hashText(canonicalEntries(entries))}`,
    entries: entries.map((entry) => ({ ...entry, spawnAreas: [...entry.spawnAreas] })),
  };
}

export function validateAuthoringData(
  input: unknown,
  mapMaster: MapMasterV1,
): AuthoringValidationResult<MobAuthoringData> {
  const diagnostics: AuthoringDiagnostic[] = [];
  if (
    !isObject(input) ||
    !hasExactKeys(input, AUTHORING_ROOT_KEYS) ||
    input.schemaVersion !== AUTHORING_SCHEMA_VERSION ||
    !isNonEmptyString(input.dataRevision) ||
    !Array.isArray(input.entries)
  ) {
    diagnostic(
      diagnostics,
      "authoring",
      "invalid-root",
      "authoring data の root、schemaVersion、dataRevision または entries が不正です。",
    );
    return { valid: false, diagnostics };
  }

  const entries: MobAuthoringEntry[] = [];
  const entryIds = new Map<string, number>();
  const semanticKeys = new Map<string, number>();
  const candidateIds = new Map<string, number>();

  input.entries.forEach((value, index) => {
    const scope = `authoring.entries[${index}]`;
    if (!isObject(value) || !hasExactKeys(value, ENTRY_KEYS)) {
      diagnostic(diagnostics, scope, "invalid-entry", "Mob authoring record の field 構成が不正です。");
      return;
    }

    const id = typeof value.id === "string" ? value.id : "";
    const name = typeof value.name === "string" ? value.name : "";
    const rank = isMobRank(value.rank) ? value.rank : null;
    const mapId = typeof value.mapId === "string" ? value.mapId : "";
    const source = typeof value.source === "string" ? value.source : "";
    const rawAreas = Array.isArray(value.spawnAreas) ? value.spawnAreas : null;
    const validId = isNonEmptyString(id);
    const validName = isNonEmptyString(name);
    const validRank = rank !== null;
    const validMapId = isNonEmptyString(mapId);
    const validAreas = rawAreas !== null;
    if (!validId) diagnostic(diagnostics, scope, "invalid-id", "Mob ID が不正です。");
    if (!validName) diagnostic(diagnostics, scope, "empty-name", "モブ名は空にできません。");
    if (!validRank) diagnostic(diagnostics, scope, "invalid-rank", "rank が不正です。");
    if (!validMapId) diagnostic(diagnostics, scope, "invalid-map", "map ID が不正です。");
    if (!validAreas) diagnostic(diagnostics, scope, "no-spawn-areas", "spawnArea が配列でありません。");
    if (!isNonEmptyString(source)) diagnostic(diagnostics, scope, "empty-source", "出典は空にできません。", validId ? id : undefined);
    if (!validId || !validName || !validRank || !validMapId || !validAreas || rank === null || rawAreas === null) return;

    const entry: MobAuthoringEntry = {
      id,
      name,
      rank,
      mapId,
      source,
      spawnAreas: rawAreas.filter(isSpawnArea),
    };
    entries.push(entry);
    incrementCount(entryIds, entry.id);
    incrementCount(semanticKeys, `${normalizeText(entry.name).toLocaleLowerCase("en-US")}\u0000${entry.rank}\u0000${entry.mapId}`);

    const map = mapMaster.maps.find((candidate) => candidate.id === entry.mapId);
    if (!map) {
      diagnostic(diagnostics, scope, "unknown-map", "map master に存在しない map を参照しています。", entry.id);
    }
    if (entry.spawnAreas.length === 0) {
      diagnostic(diagnostics, scope, "no-spawn-areas", "spawnArea が1件以上必要です。", entry.id);
    }
    if (entry.spawnAreas.length !== rawAreas.length) {
      diagnostic(diagnostics, scope, "invalid-spawn-area", "spawnArea の座標は有限値である必要があります。", entry.id);
    }
    entry.spawnAreas.forEach((area, areaIndex) => {
      const areaScope = `${scope}.spawnAreas[${areaIndex}]`;
      if (area.minX > area.maxX || area.minY > area.maxY) {
        diagnostic(diagnostics, areaScope, "invalid-order", "spawnArea の min/max の大小関係が不正です。", entry.id);
        return;
      }
      if (map && !areaInsideBounds(area, map.bounds)) {
        diagnostic(diagnostics, areaScope, "out-of-bounds", "spawnArea が map bounds の外側です。", entry.id);
      }
      incrementCount(candidateIds, createCandidateId(entry.id, entry.mapId, area));
    });
  });

  duplicateDiagnostics(entryIds, "authoring.entries", "duplicate-id", "Mob ID が重複しています。", diagnostics);
  duplicateDiagnostics(semanticKeys, "authoring.entries", "duplicate-mob", "同じ name、rank、map の Mob が重複登録されています。", diagnostics);
  duplicateDiagnostics(candidateIds, "authoring.candidates", "duplicate-candidate-id", "candidate ID が重複しています。", diagnostics);

  const data: MobAuthoringData = {
    schemaVersion: AUTHORING_SCHEMA_VERSION,
    dataRevision: input.dataRevision,
    entries,
  };
  return { valid: diagnostics.length === 0, data, diagnostics };
}

export function resolveSourceId(source: string, mapMaster: MapMasterV1): string | null {
  const normalized = normalizeText(source);
  const exactId = mapMaster.sources.find((candidate) => candidate.id === normalized);
  if (exactId) return exactId.id;
  const matches = mapMaster.sources.filter(
    (candidate) => candidate.label === normalized || candidate.reference === normalized,
  );
  return matches.length === 1 ? matches[0]!.id : null;
}

function fromMasterDiagnostic(value: MasterDiagnostic): AuthoringDiagnostic {
  return {
    severity: value.severity,
    scope: `runtime.${value.scope}`,
    code: value.code,
    message: value.message,
    ...(value.recordId ? { recordId: value.recordId } : {}),
  };
}

export function generateRuntimeMaster(
  authoringData: MobAuthoringData,
  mapMaster: MapMasterV1,
): RuntimeGenerationResult {
  const validation = validateAuthoringData(authoringData, mapMaster);
  if (!validation.valid || !validation.data) {
    return { valid: false, diagnostics: validation.diagnostics };
  }

  const diagnostics: AuthoringDiagnostic[] = [];
  const maps = new Map(mapMaster.maps.map((map) => [map.id, map]));
  const sortedEntries = [...validation.data.entries].sort((left, right) => compareCodePoints(left.id, right.id));
  const mobs = [];

  for (const entry of sortedEntries) {
    const sourceId = resolveSourceId(entry.source, mapMaster);
    if (!sourceId) {
      diagnostic(
        diagnostics,
        `authoring.entries.${entry.id}`,
        "source-not-registered",
        "出典が map master の共通 source catalog に登録されていないため、runtime master を生成できません。",
        entry.id,
      );
      continue;
    }
    if (!maps.has(entry.mapId)) continue;
    mobs.push({
      id: entry.id,
      name: entry.name,
      aliases: [],
      category: categoryForRank(entry.rank),
      rank: entry.rank,
      mapId: entry.mapId,
      sourceIds: [sourceId],
      candidates: [...entry.spawnAreas]
        .sort((left, right) =>
          left.minX - right.minX ||
          left.minY - right.minY ||
          left.maxX - right.maxX ||
          left.maxY - right.maxY,
        )
        .map((area) => {
          const coordinate = representativeCoordinate(area);
          return {
            id: createCandidateId(entry.id, entry.mapId, area),
            x: coordinate.x,
            y: coordinate.y,
            sourceIds: [sourceId],
          };
        }),
    });
  }

  if (diagnostics.length > 0) return { valid: false, diagnostics };

  const runtime: MobMasterV1 = {
    schemaVersion: 1,
    dataRevision: `mob-${hashText(canonicalEntries(validation.data.entries))}`,
    mobs,
  };
  const runtimeValidation = validateMobMaster(runtime, mapMaster);
  diagnostics.push(...runtimeValidation.diagnostics.map(fromMasterDiagnostic));
  if (!runtimeValidation.usable || !runtimeValidation.data || diagnostics.length > 0) {
    return { valid: false, diagnostics };
  }
  return { valid: true, data: runtimeValidation.data, diagnostics: [] };
}

function availableStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadAuthoringData(
  mapMaster: MapMasterV1,
  storage: Storage | null = availableStorage(),
): AuthoringValidationResult<MobAuthoringData> {
  if (!storage) {
    return { valid: false, diagnostics: [{ severity: "warning", scope: "storage", code: "unavailable", message: "localStorage を利用できません。" }] };
  }
  try {
    const raw = storage.getItem(AUTHORING_STORAGE_KEY);
    if (raw === null) return { valid: true, data: makeAuthoringData([]), diagnostics: [] };
    const result = validateAuthoringData(JSON.parse(raw) as unknown, mapMaster);
    return result.valid ? result : { valid: false, diagnostics: result.diagnostics };
  } catch {
    return { valid: false, diagnostics: [{ severity: "error", scope: "storage", code: "restore-failed", message: "保存済み authoring data を復元できませんでした。元の保存データは変更していません。" }] };
  }
}

export function saveAuthoringData(
  data: MobAuthoringData,
  storage: Storage | null = availableStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(AUTHORING_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function formatArea(area: SpawnArea): string {
  return `(${area.minX}, ${area.minY}) – (${area.maxX}, ${area.maxY})`;
}
