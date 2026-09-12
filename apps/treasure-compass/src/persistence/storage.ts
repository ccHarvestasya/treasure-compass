import {
  FULL_PARTY,
  GRADES,
  STORAGE_KEY_GRADE,
  STORAGE_KEY_MEMBERS,
} from "@/constants";
import type { Grade, Point, RouteStep, UserItem } from "@/types";

export const STORAGE_KEY_TREASURE_SESSION =
  "treasure-compass:treasure-session:v2";
export const STORAGE_KEY_LEGACY_SESSIONS = "treasure-compass:sessions:v1";

export interface PersistedTreasureSession {
  grade: Grade;
  members: (UserItem | null)[];
  route?: RouteStep[];
  isManualSort?: boolean;
  activeStep?: number;
  bulkText?: string;
  currentMapPoints?: Record<string, Point>;
}

export interface ReadTreasureResult {
  snapshot: PersistedTreasureSession | null;
  restoreFailure: boolean;
}

function storage(): Storage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
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

function isValidPoint(value: unknown): value is Point {
  return (
    isRecord(value) &&
    Number.isInteger(value.pointNo) &&
    (value.division === "P" || value.division === "T" || value.division === "R" || value.division === "Z") &&
    typeof value.block === "string" &&
    Number.isFinite(value.posX) &&
    Number.isFinite(value.posY) &&
    Number.isFinite(value.posZ) &&
    Number.isFinite(value.posT) &&
    Number.isFinite(value.time) &&
    typeof value.pointName === "string"
  );
}

function isValidRouteStep(value: unknown): value is RouteStep {
  return (
    isRecord(value) &&
    Number.isInteger(value.orderNo) &&
    Number.isInteger(value.memberNo) &&
    Number.isInteger(value.mapNo) &&
    typeof value.mapName === "string" &&
    typeof value.mapNameShort === "string" &&
    typeof value.memberName === "string" &&
    isValidPoint(value.point) &&
    (value.teleportPoint === undefined || isValidPoint(value.teleportPoint)) &&
    typeof value.isCompleted === "boolean"
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
  const snapshot: PersistedTreasureSession = {
    grade: value.grade,
    members: value.members,
  };
  if (value.route !== undefined) {
    const route = value.route;
    const isManualSort = value.isManualSort;
    const activeStep = value.activeStep;
    const bulkText = value.bulkText;
    const currentMapPoints = value.currentMapPoints;
    if (
      !Array.isArray(route) ||
      !route.every(isValidRouteStep) ||
      typeof isManualSort !== "boolean" ||
      typeof activeStep !== "number" ||
      !Number.isInteger(activeStep) ||
      activeStep < 0 ||
      typeof bulkText !== "string" ||
      !isRecord(currentMapPoints) ||
      !Object.values(currentMapPoints).every(isValidPoint)
    ) {
      return null;
    }
    snapshot.route = route;
    snapshot.isManualSort = isManualSort;
    snapshot.activeStep = activeStep;
    snapshot.bulkText = bulkText;
    snapshot.currentMapPoints = currentMapPoints as Record<string, Point>;
  }
  return snapshot;
}

function parseCurrentSession(value: unknown): PersistedTreasureSession | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["schemaVersion", "sessionRevision", "state"]) ||
    (value.schemaVersion !== 1 && value.schemaVersion !== 2) ||
    typeof value.sessionRevision !== "number" ||
    !Number.isInteger(value.sessionRevision) ||
    value.sessionRevision < 1
  ) {
    return null;
  }
  return parseTreasure(value.state);
}

function parseLegacySeparateKeys(
  currentStorage: Storage,
): PersistedTreasureSession | null {
  try {
    const gradeRaw = currentStorage.getItem(STORAGE_KEY_GRADE);
    const membersRaw = currentStorage.getItem(STORAGE_KEY_MEMBERS);
    if (gradeRaw === null && membersRaw === null) return null;
    if (gradeRaw === null || membersRaw === null) return null;
    const grade: unknown = JSON.parse(gradeRaw);
    const members: unknown = JSON.parse(membersRaw);
    return parseTreasure({ grade, members });
  } catch {
    return null;
  }
}

function parseLegacyIntegratedSession(
  value: unknown,
): PersistedTreasureSession | null {
  if (!isRecord(value) || value.version !== 1) return null;
  return parseTreasure(value.treasure);
}

function removeLegacyRecords(currentStorage: Storage): void {
  for (const key of [
    STORAGE_KEY_LEGACY_SESSIONS,
    STORAGE_KEY_GRADE,
    STORAGE_KEY_MEMBERS,
  ]) {
    try {
      currentStorage.removeItem(key);
    } catch {
      // The new record remains the migration marker even if cleanup fails.
    }
  }
}

export function readPersistedTreasure(): ReadTreasureResult {
  const currentStorage = storage();
  if (!currentStorage) return { snapshot: null, restoreFailure: false };
  let currentRaw: string | null;
  try {
    currentRaw = currentStorage.getItem(STORAGE_KEY_TREASURE_SESSION);
  } catch {
    return { snapshot: null, restoreFailure: true };
  }

  if (currentRaw !== null) {
    try {
      const snapshot = parseCurrentSession(JSON.parse(currentRaw));
      return snapshot
        ? { snapshot, restoreFailure: false }
        : { snapshot: null, restoreFailure: true };
    } catch {
      return { snapshot: null, restoreFailure: true };
    }
  }

  let legacyRaw: string | null;
  try {
    legacyRaw = currentStorage.getItem(STORAGE_KEY_LEGACY_SESSIONS);
  } catch {
    return { snapshot: null, restoreFailure: true };
  }

  let legacySnapshot: PersistedTreasureSession | null = null;
  if (legacyRaw !== null) {
    try {
      legacySnapshot = parseLegacyIntegratedSession(JSON.parse(legacyRaw));
    } catch {
      return { snapshot: null, restoreFailure: true };
    }
    if (!legacySnapshot) return { snapshot: null, restoreFailure: true };
  } else {
    let hasSeparateLegacyRecord = false;
    try {
      hasSeparateLegacyRecord =
        currentStorage.getItem(STORAGE_KEY_GRADE) !== null ||
        currentStorage.getItem(STORAGE_KEY_MEMBERS) !== null;
    } catch {
      return { snapshot: null, restoreFailure: true };
    }
    if (!hasSeparateLegacyRecord) {
      return { snapshot: null, restoreFailure: false };
    }
    legacySnapshot = parseLegacySeparateKeys(currentStorage);
    if (!legacySnapshot) return { snapshot: null, restoreFailure: true };
  }

  if (!writePersistedTreasure(legacySnapshot)) {
    return { snapshot: null, restoreFailure: true };
  }

  removeLegacyRecords(currentStorage);
  return { snapshot: legacySnapshot, restoreFailure: false };
}

export function writePersistedTreasure(
  snapshot: PersistedTreasureSession,
): boolean {
  const currentStorage = storage();
  if (!currentStorage) return false;
  try {
    const hasFullSnapshot =
      snapshot.route !== undefined &&
      snapshot.isManualSort !== undefined &&
      snapshot.activeStep !== undefined &&
      snapshot.bulkText !== undefined &&
      snapshot.currentMapPoints !== undefined;
    currentStorage.setItem(
      STORAGE_KEY_TREASURE_SESSION,
      JSON.stringify({
        schemaVersion: hasFullSnapshot ? 2 : 1,
        sessionRevision: 1,
        state: snapshot,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
