import type { Grade, MobSession, Product, UserItem } from '@/types';
import { DEFAULT_GRADE, FULL_PARTY, STORAGE_KEY_GRADE, STORAGE_KEY_MEMBERS } from '@/constants';
import { createEmptyMobSession } from '@/domain/mobSession';
import { mobCandidateId } from '@/domain/mobMaster';
import { normalizeCoordinateNumber, normalizeText } from '@/domain/normalization';
import { parseMobGuide, serializeMobGuide } from '@/domain/mobGuide';

export const STORAGE_KEY_SESSIONS = 'treasure-compass:sessions:v1';

export interface PersistedSessions {
  version: 1;
  product: Product;
  treasure: {
    grade: Grade;
    members: (UserItem | null)[];
  };
  mob: MobSession;
}

export interface ReadSessionsResult {
  snapshot: PersistedSessions | null;
  restoreFailure: boolean;
}

function storage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidMember(value: unknown): value is UserItem | null {
  if (value === null) return true;
  if (!isRecord(value) || !Number.isInteger(value.memberNo) || !normalizeText(value.memberName) || !Number.isInteger(value.mapNo) || !normalizeText(value.mapName) || !normalizeText(value.mapNameShort) || !isRecord(value.mapPoint)) return false;
  return Number.isInteger(value.mapPoint.pointNo) && (value.mapPoint.division === 'P' || value.mapPoint.division === 'T' || value.mapPoint.division === 'R' || value.mapPoint.division === 'Z') && typeof value.mapPoint.block === 'string' && Number.isFinite(value.mapPoint.posX) && Number.isFinite(value.mapPoint.posY) && Number.isFinite(value.mapPoint.posZ) && Number.isFinite(value.mapPoint.posT) && Number.isFinite(value.mapPoint.time) && typeof value.mapPoint.pointName === 'string';
}

function isValidMobSession(value: unknown): value is MobSession {
  if (!isRecord(value) || !('targets' in value) || !isRecord(value.targets) || !Array.isArray(value.manualOrder) || !isRecord(value.currentSelections) || !isRecord(value.selectionHistory) || !isRecord(value.route)) return false;
  const targets = value.targets;
  if (value.run !== null && (typeof value.run !== 'string' || !/^[A-Za-z0-9_-]+$/u.test(value.run))) return false;
  if (value.revision !== null && (typeof value.revision !== 'number' || !Number.isSafeInteger(value.revision) || value.revision < 0)) return false;
  if (value.issuedAt !== null && (typeof value.issuedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value.issuedAt) || !Number.isFinite(Date.parse(value.issuedAt)) || new Date(value.issuedAt).toISOString() !== value.issuedAt)) return false;
  if (value.mode !== null && value.mode !== 'auto' && value.mode !== 'manual') return false;
  if (value.run === null && value.mode !== null || value.run !== null && value.mode === null) return false;
  if (typeof value.sessionVersion !== 'number' || !Number.isSafeInteger(value.sessionVersion) || value.sessionVersion < 0) return false;
  const targetIds = Object.keys(targets);
  if (new Set(value.manualOrder).size !== value.manualOrder.length || value.manualOrder.some((id) => typeof id !== 'string' || !targets[id])) return false;
  for (const [mobId, rawTarget] of Object.entries(targets)) {
    if (!isRecord(rawTarget) || rawTarget.mobId !== mobId || !/^[A-Za-z0-9._~-]+$/u.test(mobId) || !normalizeText(rawTarget.mobName) || typeof rawTarget.complete !== 'boolean' || !isRecord(rawTarget.candidates)) return false;
    for (const [candidateId, rawCandidate] of Object.entries(rawTarget.candidates)) {
      if (!isRecord(rawCandidate) || rawCandidate.id !== candidateId || typeof rawCandidate.mapId !== 'string' || !/^[A-Za-z0-9._~-]+$/u.test(rawCandidate.mapId) || !normalizeText(rawCandidate.mapName) || !normalizeText(rawCandidate.mapNameShort) || typeof rawCandidate.x !== 'number' || typeof rawCandidate.y !== 'number' || normalizeCoordinateNumber(rawCandidate.x) !== rawCandidate.x || normalizeCoordinateNumber(rawCandidate.y) !== rawCandidate.y || candidateId !== mobCandidateId(rawCandidate.mapId, rawCandidate.x, rawCandidate.y) || (rawCandidate.classification !== 'confirmed' && rawCandidate.classification !== 'candidate') || typeof rawCandidate.userConfirmed !== 'boolean') return false;
    }
  }
  const validSelection = (selection: unknown, mobId: string): boolean => {
    if (!isRecord(selection) || selection.mobId !== mobId || typeof selection.candidateId !== 'string' || typeof selection.mapId !== 'string' || typeof selection.x !== 'number' || typeof selection.y !== 'number') return false;
    const target = targets[mobId];
    const candidate = isRecord(target) && isRecord(target.candidates) ? target.candidates[selection.candidateId] : undefined;
    return isRecord(candidate)
      && candidate.mapId === selection.mapId
      && candidate.x === selection.x
      && candidate.y === selection.y;
  };
  for (const [mobId, selection] of Object.entries(value.currentSelections)) if (!validSelection(selection, mobId)) return false;
  for (const [mobId, selection] of Object.entries(value.selectionHistory)) if (!validSelection(selection, mobId)) return false;
  const route = value.route;
  if (route.status !== 'empty' && route.status !== 'ready' && route.status !== 'failure' && route.status !== 'stale' || !Array.isArray(route.steps) || !Array.isArray(route.order) || !Array.isArray(route.ties) || !Number.isSafeInteger(route.sessionVersion) || !Number.isSafeInteger(route.masterGeneration) || (typeof route.transitions !== 'number' && route.transitions !== 'unknown')) return false;
  if (route.order.some((mobId) => typeof mobId !== 'string' || !targets[mobId]) || new Set(route.order).size !== route.order.length) return false;
  for (const rawStep of route.steps) {
    const target = isRecord(rawStep) && typeof rawStep.mobId === 'string' ? targets[rawStep.mobId] : undefined;
    if (!isRecord(rawStep) || !isRecord(target) || !isRecord(target.candidates) || typeof rawStep.candidateId !== 'string' || !target.candidates[rawStep.candidateId] || typeof rawStep.order !== 'number' || !Number.isSafeInteger(rawStep.order) || rawStep.order < 1) return false;
  }
  if (value.acceptedGuide !== null) {
    if (!isRecord(value.acceptedGuide) || value.run === null || value.revision === null || value.issuedAt === null) return false;
    try {
      const parsed = parseMobGuide(serializeMobGuide(value.acceptedGuide as never));
      if (!parsed.ok || !parsed.snapshot || parsed.snapshot.run !== value.run || parsed.snapshot.revision !== value.revision || parsed.snapshot.issuedAt !== value.issuedAt) return false;
    } catch {
      return false;
    }
  }
  if (value.revision === null && value.issuedAt !== null || value.revision !== null && value.issuedAt === null) return false;
  return targetIds.length === 0 || value.run !== null;
}

function parseLegacy(): PersistedSessions | null {
  const currentStorage = storage();
  if (!currentStorage) return null;
  try {
    const gradeRaw = currentStorage.getItem(STORAGE_KEY_GRADE);
    const membersRaw = currentStorage.getItem(STORAGE_KEY_MEMBERS);
    const grade = gradeRaw ? JSON.parse(gradeRaw) : DEFAULT_GRADE;
    const members = membersRaw ? JSON.parse(membersRaw) : Array<UserItem | null>(FULL_PARTY).fill(null);
    if (!Number.isFinite(grade) || !Array.isArray(members) || members.length !== FULL_PARTY || members.some((member) => !isValidMember(member))) return null;
    return { version: 1, product: 'treasure', treasure: { grade, members }, mob: createEmptyMobSession() };
  } catch {
    return null;
  }
}

export function readPersistedSessions(): ReadSessionsResult {
  const currentStorage = storage();
  if (!currentStorage) return { snapshot: null, restoreFailure: false };
  let raw: string | null;
  try {
    raw = currentStorage.getItem(STORAGE_KEY_SESSIONS);
  } catch {
    return { snapshot: null, restoreFailure: true };
  }
  if (!raw) return { snapshot: parseLegacy(), restoreFailure: false };
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1 || value.product !== 'treasure' && value.product !== 'mob' || !isRecord(value.treasure) || !Number.isFinite(value.treasure.grade) || !Array.isArray(value.treasure.members) || value.treasure.members.length !== FULL_PARTY || value.treasure.members.some((member) => !isValidMember(member)) || !isValidMobSession(value.mob)) return { snapshot: null, restoreFailure: true };
    return { snapshot: value as unknown as PersistedSessions, restoreFailure: false };
  } catch {
    return { snapshot: null, restoreFailure: true };
  }
}

export function writePersistedSessions(snapshot: PersistedSessions): boolean {
  const currentStorage = storage();
  if (!currentStorage) return false;
  try {
    currentStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function deletePersistedSessions(): boolean {
  const currentStorage = storage();
  if (!currentStorage) return false;
  try {
    currentStorage.removeItem(STORAGE_KEY_SESSIONS);
    currentStorage.removeItem(STORAGE_KEY_GRADE);
    currentStorage.removeItem(STORAGE_KEY_MEMBERS);
    return true;
  } catch {
    return false;
  }
}
