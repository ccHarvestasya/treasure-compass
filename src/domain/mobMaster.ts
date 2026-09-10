import type {
  MobMasterData,
  MobMasterLocation,
  MobMasterMap,
  MobMasterMob,
  MobCandidate,
} from '@/types';
import { formatCoordinate, normalizeCoordinateNumber, normalizeIdentifier, normalizeText } from './normalization';

export interface MobMasterValidation {
  ok: boolean;
  data?: MobMasterData;
  reason?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validateMap(raw: unknown): MobMasterMap | null {
  if (!isRecord(raw)) return null;
  const id = normalizeIdentifier(raw.id);
  const name = normalizeText(raw.name);
  if (!id || !name) return null;
  const aliases = raw.aliases === undefined
    ? undefined
    : Array.isArray(raw.aliases)
      ? raw.aliases.map(normalizeText)
      : null;
  if (aliases === null || aliases?.some((alias) => alias === null)) return null;
  const mapNo = raw.mapNo;
  if (mapNo !== undefined && (typeof mapNo !== 'number' || !Number.isInteger(mapNo) || mapNo < 0)) return null;
  if (raw.mapNameShort !== undefined && !normalizeText(raw.mapNameShort)) return null;
  if (raw.image !== undefined && typeof raw.image !== 'string') return null;
  const range = raw.validRange;
  if (range !== undefined) {
    if (!isRecord(range) || !finiteNonNegative(range.min) || !finiteNonNegative(range.max) || range.min > range.max) return null;
  }
  return {
    id,
    name,
    aliases: aliases?.filter((alias): alias is string => alias !== null),
    mapNo: mapNo as number | undefined,
    mapNameShort: raw.mapNameShort as string | undefined,
    image: raw.image as string | undefined,
    validRange: range as { min: number; max: number } | undefined,
  };
}

function validateLocation(raw: unknown, maps: Map<string, MobMasterMap>): MobMasterLocation | null {
  if (!isRecord(raw)) return null;
  const mapId = normalizeIdentifier(raw.mapId);
  const x = typeof raw.x === 'number' ? normalizeCoordinateNumber(raw.x) : null;
  const y = typeof raw.y === 'number' ? normalizeCoordinateNumber(raw.y) : null;
  const classification = raw.classification;
  const map = mapId ? maps.get(mapId) : undefined;
  if (!mapId || !map || x === null || y === null) return null;
  if (map.validRange && (x < map.validRange.min || x > map.validRange.max || y < map.validRange.min || y > map.validRange.max)) return null;
  if (classification !== 'confirmed' && classification !== 'candidate') return null;
  return { mapId, x, y, classification };
}

function validateMob(raw: unknown, maps: Map<string, MobMasterMap>): MobMasterMob | null {
  if (!isRecord(raw)) return null;
  const id = normalizeIdentifier(raw.id);
  const name = normalizeText(raw.name);
  if (!id || !name || !Array.isArray(raw.locations)) return null;
  const aliases = raw.aliases === undefined
    ? undefined
    : Array.isArray(raw.aliases)
      ? raw.aliases.map(normalizeText)
      : null;
  if (aliases === null || aliases?.some((alias) => alias === null)) return null;
  const locations = raw.locations.map((location) => validateLocation(location, maps));
  if (locations.some((location) => location === null)) return null;
  const unique = new Set(locations.map((location) => `${location!.mapId}@${formatCoordinate(location!.x)},${formatCoordinate(location!.y)}`));
  if (unique.size !== locations.length) return null;
  return {
    id,
    name,
    aliases: aliases?.filter((alias): alias is string => alias !== null),
    locations: locations.filter((location): location is MobMasterLocation => location !== null),
  };
}

export function validateMobMaster(raw: unknown): MobMasterValidation {
  if (!isRecord(raw) || !Array.isArray(raw.maps) || !Array.isArray(raw.mobs) || !Array.isArray(raw.movement)) {
    return { ok: false, reason: 'master schema is invalid' };
  }
  const identity = normalizeIdentifier(raw.identity);
  const generation = raw.generation;
  if (!identity || typeof generation !== 'number' || !Number.isSafeInteger(generation) || generation < 0) {
    return { ok: false, reason: 'master identity or generation is invalid' };
  }
  const maps = raw.maps.map(validateMap);
  if (maps.some((map) => map === null)) return { ok: false, reason: 'master map is invalid' };
  const mapList = maps.filter((map): map is MobMasterMap => map !== null);
  const mapsById = new Map(mapList.map((map) => [map.id, map]));
  if (mapsById.size !== mapList.length) return { ok: false, reason: 'master map id is duplicated' };
  const mobs = raw.mobs.map((mob) => validateMob(mob, mapsById));
  if (mobs.some((mob) => mob === null)) return { ok: false, reason: 'master mob is invalid' };
  const mobList = mobs.filter((mob): mob is MobMasterMob => mob !== null);
  const mobIds = new Set(mobList.map((mob) => mob.id));
  if (mobIds.size !== mobList.length) return { ok: false, reason: 'master mob id is duplicated' };
  const movement = raw.movement.map((value) => {
    if (!isRecord(value)) return null;
    const fromMapId = normalizeIdentifier(value.fromMapId);
    const toMapId = normalizeIdentifier(value.toMapId);
    if (!fromMapId || !toMapId || !mapsById.has(fromMapId) || !mapsById.has(toMapId) || fromMapId === toMapId) return null;
    if (value.fee !== undefined && !finiteNonNegative(value.fee)) return null;
    if (value.loadTime !== undefined && !finiteNonNegative(value.loadTime)) return null;
    return {
      fromMapId,
      toMapId,
      fee: typeof value.fee === 'number' ? value.fee : undefined,
      loadTime: typeof value.loadTime === 'number' ? value.loadTime : undefined,
    };
  });
  if (movement.some((value) => value === null)) return { ok: false, reason: 'master movement is invalid' };
  return {
    ok: true,
    data: {
      identity,
      generation,
      maps: mapList,
      mobs: mobList,
      movement: movement.filter((value): value is NonNullable<typeof value> => value !== null),
    },
  };
}

export function mobCandidateId(mapId: string, x: number, y: number): string {
  return `${mapId}@${formatCoordinate(x)},${formatCoordinate(y)}`;
}

export function resolveMob(master: MobMasterData, value: string): MobMasterMob | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return master.mobs.find((mob) => mob.id === normalized || mob.name === normalized || mob.aliases?.includes(normalized)) ?? null;
}

export function resolveMap(master: MobMasterData, value: string): MobMasterMap | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return master.maps.find((map) => map.id === normalized || map.name === normalized || map.aliases?.includes(normalized)) ?? null;
}

export function candidateFromMaster(master: MobMasterData, location: MobMasterLocation): MobCandidate | null {
  const map = master.maps.find((entry) => entry.id === location.mapId);
  if (!map) return null;
  return {
    id: mobCandidateId(location.mapId, location.x, location.y),
    mapId: location.mapId,
    mapName: map.name,
    mapNameShort: map.mapNameShort ?? map.name,
    mapNo: map.mapNo,
    x: location.x,
    y: location.y,
    classification: location.classification,
    userConfirmed: false,
  };
}
