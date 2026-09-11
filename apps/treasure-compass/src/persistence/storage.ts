import {
  DEFAULT_GRADE,
  FULL_PARTY,
  GRADES,
  STORAGE_KEY_GRADE,
  STORAGE_KEY_MEMBERS,
} from "@/constants";
import type { Grade, UserItem } from "@/types";

export const STORAGE_KEY_SESSIONS = "treasure-compass:sessions:v1";

export interface PersistedTreasureSession {
  grade: Grade;
  members: (UserItem | null)[];
}

export interface ReadTreasureResult {
  snapshot: PersistedTreasureSession | null;
  restoreFailure: boolean;
}

const EMPTY_LEGACY_MOB_SESSION = {
  run: null,
  revision: null,
  issuedAt: null,
  mode: null,
  targets: {},
  manualOrder: [],
  currentSelections: {},
  selectionHistory: {},
  route: {
    status: "empty",
    steps: [],
    order: [],
    transitions: 0,
    ties: [],
    sessionVersion: 0,
    masterGeneration: 0,
  },
  acceptedGuide: null,
  sessionVersion: 0,
} as const;

function storage(): Storage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isGrade(value: unknown): value is Grade {
  return typeof value === "number" && GRADES.includes(value);
}

function isValidMember(value: unknown): value is UserItem | null {
  if (value === null) return true;
  if (
    !isRecord(value) ||
    !Number.isInteger(value.memberNo) ||
    typeof value.memberName !== "string" ||
    value.memberName.trim().length === 0 ||
    !Number.isInteger(value.mapNo) ||
    typeof value.mapName !== "string" ||
    value.mapName.trim().length === 0 ||
    typeof value.mapNameShort !== "string" ||
    value.mapNameShort.trim().length === 0 ||
    !isRecord(value.mapPoint)
  ) {
    return false;
  }
  const point = value.mapPoint;
  return (
    Number.isInteger(point.pointNo) &&
    (point.division === "P" ||
      point.division === "T" ||
      point.division === "R" ||
      point.division === "Z") &&
    typeof point.block === "string" &&
    Number.isFinite(point.posX) &&
    Number.isFinite(point.posY) &&
    Number.isFinite(point.posZ) &&
    Number.isFinite(point.posT) &&
    Number.isFinite(point.time) &&
    typeof point.pointName === "string"
  );
}

function parseTreasure(value: unknown): PersistedTreasureSession | null {
  if (
    !isRecord(value) ||
    !isGrade(value.grade) ||
    !Array.isArray(value.members)
  )
    return null;
  if (
    value.members.length !== FULL_PARTY ||
    value.members.some((member) => !isValidMember(member))
  ) {
    return null;
  }
  return { grade: value.grade, members: value.members };
}

function parseOlderKeys(
  currentStorage: Storage,
): PersistedTreasureSession | null {
  try {
    const gradeRaw = currentStorage.getItem(STORAGE_KEY_GRADE);
    const membersRaw = currentStorage.getItem(STORAGE_KEY_MEMBERS);
    const grade: unknown = gradeRaw ? JSON.parse(gradeRaw) : DEFAULT_GRADE;
    const members: unknown = membersRaw
      ? JSON.parse(membersRaw)
      : Array<UserItem | null>(FULL_PARTY).fill(null);
    return parseTreasure({ grade, members });
  } catch {
    return null;
  }
}

export function readPersistedTreasure(): ReadTreasureResult {
  const currentStorage = storage();
  if (!currentStorage) return { snapshot: null, restoreFailure: false };
  let raw: string | null;
  try {
    raw = currentStorage.getItem(STORAGE_KEY_SESSIONS);
  } catch {
    return { snapshot: null, restoreFailure: true };
  }
  if (!raw)
    return { snapshot: parseOlderKeys(currentStorage), restoreFailure: false };
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1) {
      return { snapshot: null, restoreFailure: true };
    }
    const snapshot = parseTreasure(value.treasure);
    return snapshot
      ? { snapshot, restoreFailure: false }
      : { snapshot: null, restoreFailure: true };
  } catch {
    return { snapshot: null, restoreFailure: true };
  }
}

function legacyMobForWrite(
  currentStorage: Storage,
): Record<string, unknown> | typeof EMPTY_LEGACY_MOB_SESSION {
  try {
    const currentRaw = currentStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!currentRaw) return EMPTY_LEGACY_MOB_SESSION;
    const current: unknown = JSON.parse(currentRaw);
    return isRecord(current) && current.version === 1 && isRecord(current.mob)
      ? current.mob
      : EMPTY_LEGACY_MOB_SESSION;
  } catch {
    return EMPTY_LEGACY_MOB_SESSION;
  }
}

export function writePersistedTreasure(
  snapshot: PersistedTreasureSession,
): boolean {
  const currentStorage = storage();
  if (!currentStorage) return false;
  try {
    currentStorage.setItem(
      STORAGE_KEY_SESSIONS,
      JSON.stringify({
        version: 1,
        product: "treasure",
        treasure: snapshot,
        mob: legacyMobForWrite(currentStorage),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
