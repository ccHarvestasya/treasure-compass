import { treasurePointRefsEqual } from "@treasure-compass/treasure-domain";
import type {
  TreasurePointRef,
  TreasureSessionState,
  TreasureVersion,
} from "@/types";
import type { MasterIdentity, PersistedTreasureRoot } from "@/persistence/storage";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasOnlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

export function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  return hasOnlyKeys(value, keys) && Object.keys(value).length === keys.length;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().normalize("NFC").length > 0;
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function normalizedVersion(value: unknown): value is TreasureVersion {
  return value === "3.x" || value === "4.x" || value === "5.x" || value === "6.x" || value === "7.x";
}

function isPointRef(value: unknown): value is TreasurePointRef {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["gradeSetId", "mapId", "pointId"]) &&
    isNonEmptyString(value.gradeSetId) &&
    isNonEmptyString(value.mapId) &&
    isNonEmptyString(value.pointId)
  );
}

export function isMasterIdentity(value: unknown): value is MasterIdentity {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, [
      "mapSchemaVersion",
      "mapDataRevision",
      "appSchemaVersion",
      "appDataRevision",
    ]) &&
    isInteger(value.mapSchemaVersion) &&
    value.mapSchemaVersion >= 1 &&
    isNonEmptyString(value.mapDataRevision) &&
    isInteger(value.appSchemaVersion) &&
    value.appSchemaVersion >= 1 &&
    isNonEmptyString(value.appDataRevision)
  );
}

function validateV3State(value: unknown): value is TreasureSessionState {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, [
      "registrations",
      "playlistOrder",
      "orderMode",
      "listSelection",
      "currentTarget",
      "mapCurrentLocations",
      "incompleteRoute",
    ]) ||
    !Array.isArray(value.registrations) ||
    value.registrations.length > 8 ||
    !Array.isArray(value.playlistOrder) ||
    !value.playlistOrder.every(isNonEmptyString) ||
    new Set(value.playlistOrder).size !== value.playlistOrder.length ||
    (value.orderMode !== "auto" && value.orderMode !== "manual") ||
    !(value.listSelection === null || isNonEmptyString(value.listSelection)) ||
    !(value.currentTarget === null || isNonEmptyString(value.currentTarget)) ||
    !Array.isArray(value.mapCurrentLocations) ||
    !Array.isArray(value.incompleteRoute)
  ) {
    return false;
  }

  const playlistOrder = value.playlistOrder as string[];
  const registrations = value.registrations;
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const item of registrations) {
    if (
      !isRecord(item) ||
      !hasOnlyKeys(item, [
        "registrationId",
        "memberName",
        "version",
        "pointRef",
        "completed",
        "playlistPosition",
      ]) ||
      !isNonEmptyString(item.registrationId) ||
      ids.has(item.registrationId) ||
      !isNonEmptyString(item.memberName) ||
      item.memberName !== item.memberName.trim().normalize("NFC") ||
      names.has(item.memberName) ||
      !normalizedVersion(item.version) ||
      !isPointRef(item.pointRef) ||
      typeof item.completed !== "boolean" ||
      !isInteger(item.playlistPosition) ||
      item.playlistPosition < 0 ||
      item.playlistPosition >= registrations.length
    ) {
      return false;
    }
    ids.add(item.registrationId);
    names.add(item.memberName);
  }
  if (
    playlistOrder.length !== registrations.length ||
    playlistOrder.some((id) => !ids.has(id)) ||
    registrations.some((registration) =>
      playlistOrder[registration.playlistPosition] !== registration.registrationId,
    ) ||
    (value.listSelection !== null && !ids.has(value.listSelection)) ||
    (value.currentTarget !== null && !ids.has(value.currentTarget))
  ) {
    return false;
  }

  const locations = value.mapCurrentLocations;
  const locationMaps = new Set<string>();
  for (const item of locations) {
    if (
      !isRecord(item) ||
      !hasOnlyKeys(item, ["mapId", "pointRef"]) ||
      !isNonEmptyString(item.mapId) ||
      locationMaps.has(item.mapId) ||
      !isPointRef(item.pointRef) ||
      item.pointRef.mapId !== item.mapId
    ) {
      return false;
    }
    locationMaps.add(item.mapId);
  }

  const incompleteIds: string[] = [];
  for (const item of value.incompleteRoute) {
    if (
      !isRecord(item) ||
      !hasOnlyKeys(item, ["registrationId", "pointRef"]) ||
      !isNonEmptyString(item.registrationId) ||
      incompleteIds.includes(item.registrationId) ||
      !isPointRef(item.pointRef)
    ) {
      return false;
    }
    const registration = registrations.find(
      (candidate) => candidate.registrationId === item.registrationId,
    );
    if (
      !registration ||
      registration.completed ||
      !treasurePointRefsEqual(registration.pointRef, item.pointRef)
    ) {
      return false;
    }
    incompleteIds.push(item.registrationId);
  }
  const expectedIncomplete = playlistOrder.filter(
    (id) => !registrations.find((registration) => registration.registrationId === id)?.completed,
  );
  return expectedIncomplete.length === incompleteIds.length &&
    expectedIncomplete.every((id, index) => incompleteIds[index] === id);
}

export function validatePersistedTreasureRoot(
  value: unknown,
): value is PersistedTreasureRoot {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["schemaVersion", "sessionRevision", "masterIdentity", "state"]) &&
    value.schemaVersion === 3 &&
    isInteger(value.sessionRevision) &&
    value.sessionRevision >= 1 &&
    isMasterIdentity(value.masterIdentity) &&
    validateV3State(value.state)
  );
}
