import {
  MAP_MASTER_IDS_BY_GRADE,
  STORAGE_KEY_GRADE,
  STORAGE_KEY_MEMBERS,
  VERSION_BY_GRADE,
} from "@/constants";
import type {
  Grade,
  MapCurrentLocation,
  TreasurePointRef,
  TreasureSession,
  TreasureSessionState,
  TreasureVersion,
} from "@/types";
import pointMappings from "@treasure-compass/master-data/migration/legacy-treasure-point.v1.json";
import mapMasterJson from "@treasure-compass/master-data/data/map-master.v1.json";
import treasureMasterJson from "@treasure-compass/master-data/data/treasure-master.v1.json";

export const STORAGE_KEY_TREASURE_SESSION =
  "treasure-compass:treasure-session:v3";
export const STORAGE_KEY_LEGACY_TREASURE_SESSION =
  "treasure-compass:treasure-session:v2";
export const STORAGE_KEY_LEGACY_SESSIONS = "treasure-compass:sessions:v1";

export interface MasterIdentity {
  readonly mapSchemaVersion: number;
  readonly mapDataRevision: string;
  readonly appSchemaVersion: number;
  readonly appDataRevision: string;
}

export interface PersistedTreasureRoot {
  readonly schemaVersion: 3;
  readonly sessionRevision: number;
  readonly masterIdentity: MasterIdentity;
  readonly state: TreasureSessionState;
}

export interface ReadTreasureResult {
  readonly snapshot: PersistedTreasureRoot | null;
  readonly restoreFailure: boolean;
  readonly migrated: boolean;
  /** coordinator が snapshot を公開した後にだけ呼び出す旧 key cleanup */
  readonly cleanupLegacy?: () => void;
}

const LEGACY_GRADES = new Set([8, 10, 12, 14, 17, 18]);
const LEGACY_POINT_KEYS = [
  "pointNo",
  "division",
  "block",
  "posX",
  "posY",
  "posZ",
  "posT",
  "time",
  "pointName",
] as const;
const DEFAULT_MASTER_IDENTITY: MasterIdentity = {
  mapSchemaVersion: mapMasterJson.schemaVersion,
  mapDataRevision: mapMasterJson.dataRevision,
  appSchemaVersion: treasureMasterJson.schemaVersion,
  appDataRevision: treasureMasterJson.dataRevision,
};

function getStorage(): Storage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return hasOnlyKeys(value, keys) && Object.keys(value).length === keys.length;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().normalize("NFC").length > 0;
}

function normalizedName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().normalize("NFC");
  return normalized.length > 0 ? normalized : null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isVersion(value: unknown): value is TreasureVersion {
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

function isMasterIdentity(value: unknown): value is MasterIdentity {
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

function refsEqual(left: TreasurePointRef, right: TreasurePointRef): boolean {
  return (
    left.gradeSetId === right.gradeSetId &&
    left.mapId === right.mapId &&
    left.pointId === right.pointId
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
      !isVersion(item.version) ||
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
    if (!registration || registration.completed || !refsEqual(registration.pointRef, item.pointRef)) {
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

export function validatePersistedTreasureRoot(value: unknown): value is PersistedTreasureRoot {
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

interface LegacyPoint {
  readonly pointNo: number;
  readonly division: "P" | "T" | "R" | "Z";
  readonly block: string;
  readonly posX: number;
  readonly posY: number;
  readonly posZ: number;
  readonly posT: number;
  readonly time: number;
  readonly pointName: string;
  readonly stableId?: string;
}

interface LegacyMember {
  readonly memberNo: number;
  readonly memberName: string;
  readonly mapNo: number;
  readonly mapName: string;
  readonly mapNameShort: string;
  readonly mapPoint: LegacyPoint;
}

interface LegacyState {
  readonly grade: Grade;
  readonly members: (LegacyMember | null)[];
  readonly route?: LegacyRouteStep[];
  readonly isManualSort?: boolean;
  readonly currentMapPoints?: Record<string, LegacyPoint>;
}

interface LegacyRouteStep {
  readonly orderNo: number;
  readonly memberNo: number;
  readonly mapNo: number;
  readonly mapName: string;
  readonly mapNameShort: string;
  readonly memberName: string;
  readonly point: LegacyPoint;
  readonly teleportPoint?: LegacyPoint;
  readonly isCompleted: boolean;
}

function isLegacyPoint(value: unknown): value is LegacyPoint {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, [...LEGACY_POINT_KEYS, "stableId"]) &&
    isInteger(value.pointNo) &&
    (value.division === "P" || value.division === "T" || value.division === "R" || value.division === "Z") &&
    typeof value.block === "string" &&
    isFiniteNumber(value.posX) &&
    isFiniteNumber(value.posY) &&
    isFiniteNumber(value.posZ) &&
    isFiniteNumber(value.posT) &&
    isFiniteNumber(value.time) &&
    typeof value.pointName === "string" &&
    (value.stableId === undefined || isNonEmptyString(value.stableId))
  );
}

function isLegacyMember(value: unknown): value is LegacyMember {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["memberNo", "memberName", "mapNo", "mapName", "mapNameShort", "mapPoint"]) &&
    isInteger(value.memberNo) && value.memberNo >= 0 && value.memberNo < 8 &&
    typeof value.memberName === "string" &&
    isInteger(value.mapNo) &&
    isNonEmptyString(value.mapName) &&
    isNonEmptyString(value.mapNameShort) &&
    isLegacyPoint(value.mapPoint)
  );
}

function isLegacyRouteStep(value: unknown): value is LegacyRouteStep {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["orderNo", "memberNo", "mapNo", "mapName", "mapNameShort", "memberName", "point", "teleportPoint", "isCompleted"]) &&
    isInteger(value.orderNo) && value.orderNo > 0 &&
    isInteger(value.memberNo) && value.memberNo >= 0 && value.memberNo < 8 &&
    isInteger(value.mapNo) && typeof value.mapName === "string" &&
    typeof value.mapNameShort === "string" && typeof value.memberName === "string" &&
    isLegacyPoint(value.point) &&
    (value.teleportPoint === undefined || isLegacyPoint(value.teleportPoint)) &&
    typeof value.isCompleted === "boolean"
  );
}

function isLegacyState(value: unknown, complete: boolean): value is LegacyState {
  if (!isRecord(value) || !hasOnlyKeys(value, complete
    ? ["grade", "members", "route", "isManualSort", "activeStep", "bulkText", "currentMapPoints"]
    : ["grade", "members"]) ||
    !isInteger(value.grade) || !LEGACY_GRADES.has(value.grade) ||
    !Array.isArray(value.members) || value.members.length !== 8 ||
    !value.members.every((member) => member === null || isLegacyMember(member))) {
    return false;
  }
  const memberNos = value.members.filter(isLegacyMember).map((member) => member.memberNo);
  if (new Set(memberNos).size !== memberNos.length) return false;
  if (!complete) return true;
  return (
    Array.isArray(value.route) && value.route.length <= 8 &&
    value.route.every(isLegacyRouteStep) &&
    new Set(value.route.map((step) => step.orderNo)).size === value.route.length &&
    typeof value.isManualSort === "boolean" &&
    isInteger(value.activeStep) && value.activeStep >= 0 &&
    typeof value.bulkText === "string" &&
    isRecord(value.currentMapPoints) &&
    Object.values(value.currentMapPoints).every(isLegacyPoint)
  );
}

function refForLegacyPoint(grade: number, mapNo: number, pointNo: number): TreasurePointRef | null {
  const mappings = pointMappings as unknown as { mappings: Array<{ grade: number; mapNo: number; pointNo: number; pointId: string }> };
  const mapping = mappings.mappings.find((candidate) =>
    candidate.grade === grade && candidate.mapNo === mapNo && candidate.pointNo === pointNo,
  );
  const mapId = MAP_MASTER_IDS_BY_GRADE[grade]?.[mapNo - 1];
  const version = VERSION_BY_GRADE[grade];
  if (!mapping || !mapId || !version) return null;
  return {
    gradeSetId: `treasure-grade-${grade}`,
    mapId,
    pointId: mapping.pointId,
  };
}

function migrateLegacyState(state: LegacyState, complete: boolean): PersistedTreasureRoot | null {
  const occupied = state.members.filter((member): member is LegacyMember => member !== null);
  const registrations = occupied.map((member) => {
    const pointRef = refForLegacyPoint(state.grade, member.mapNo, member.mapPoint.pointNo);
    const name = normalizedName(member.memberName);
    return pointRef && name
      ? { member, pointRef, name }
      : null;
  });
  if (registrations.some((registration) => registration === null)) return null;
  const resolved = registrations as Array<{ member: LegacyMember; pointRef: TreasurePointRef; name: string }>;
  if (new Set(resolved.map(({ name }) => name)).size !== resolved.length) return null;
  const byMemberNo = new Map(resolved.map(({ member, pointRef, name }) => [
    member.memberNo,
    { member, pointRef, name },
  ]));
  const route = complete ? state.route ?? [] : [];
  const sortedRoute = [...route].sort((left, right) => left.orderNo - right.orderNo);
  const routeRegistrations: string[] = [];
  const completed = new Set<number>();
  for (const step of sortedRoute) {
    const member = byMemberNo.get(step.memberNo);
    const pointRef = refForLegacyPoint(state.grade, step.mapNo, step.point.pointNo);
    if (!member || !pointRef || !refsEqual(member.pointRef, pointRef) || routeRegistrations.includes(String(step.memberNo))) {
      return null;
    }
    routeRegistrations.push(String(step.memberNo));
    if (step.isCompleted) completed.add(step.memberNo);
  }
  const orderedMembers = [
    ...routeRegistrations.map((memberNo) => byMemberNo.get(Number(memberNo))!),
    ...resolved
      .filter(({ member }) => !routeRegistrations.includes(String(member.memberNo)))
      .sort((left, right) => left.member.memberNo - right.member.memberNo),
  ];
  const sessionRegistrations = orderedMembers.map(({ member, pointRef, name }, index) => ({
    registrationId: `legacy-registration-${member.memberNo}`,
    memberName: name,
    version: VERSION_BY_GRADE[state.grade]!,
    pointRef,
    completed: completed.has(member.memberNo),
    playlistPosition: index,
  }));
  const playlistOrder = sessionRegistrations.map((registration) => registration.registrationId);
  const mapCurrentLocations: MapCurrentLocation[] = [];
  if (complete) {
    for (const [mapNo, point] of Object.entries(state.currentMapPoints ?? {})) {
      const pointRef = refForLegacyPoint(state.grade, Number(mapNo), point.pointNo);
      const mapId = MAP_MASTER_IDS_BY_GRADE[state.grade]?.[Number(mapNo) - 1];
      if (!pointRef || !mapId) return null;
      mapCurrentLocations.push({ mapId, pointRef });
    }
  }
  const v3State: TreasureSessionState = {
    registrations: sessionRegistrations,
    playlistOrder,
    orderMode: complete && state.isManualSort ? "manual" : "auto",
    listSelection: null,
    currentTarget: null,
    mapCurrentLocations,
    incompleteRoute: sessionRegistrations
      .filter((registration) => !registration.completed)
      .map((registration) => ({
        registrationId: registration.registrationId,
        pointRef: registration.pointRef,
      })),
  };
  return {
    schemaVersion: 3,
    sessionRevision: 1,
    masterIdentity: DEFAULT_MASTER_IDENTITY,
    state: v3State,
  };
}

function decodeLegacyRoot(value: unknown): PersistedTreasureRoot | null {
  if (!isRecord(value) ||
    !(
      hasExactKeys(value, ["schemaVersion", "sessionRevision", "state"]) ||
      (hasExactKeys(value, ["schemaVersion", "sessionRevision", "masterIdentity", "state"]) &&
        isMasterIdentity(value.masterIdentity))
    ) ||
    (value.schemaVersion !== 1 && value.schemaVersion !== 2) ||
    !isInteger(value.sessionRevision) || value.sessionRevision < 1 ||
    !isLegacyState(value.state, value.schemaVersion === 2)) return null;
  return migrateLegacyState(value.state, value.schemaVersion === 2);
}

function decodeIntegrated(value: unknown): PersistedTreasureRoot | null {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "product", "treasure", "mob"]) ||
    value.version !== 1 || (value.product !== undefined && typeof value.product !== "string") ||
    (value.mob !== undefined && !isRecord(value.mob)) ||
    !isLegacyState(value.treasure, false)) return null;
  return migrateLegacyState(value.treasure, false);
}

function decodeSeparate(currentStorage: Storage): PersistedTreasureRoot | null {
  const gradeRaw = currentStorage.getItem(STORAGE_KEY_GRADE);
  const membersRaw = currentStorage.getItem(STORAGE_KEY_MEMBERS);
  if (gradeRaw === null || membersRaw === null) return null;
  let grade: unknown;
  let members: unknown;
  try {
    grade = JSON.parse(gradeRaw);
    members = JSON.parse(membersRaw);
  } catch {
    return null;
  }
  if (!Array.isArray(members)) return null;
  const state = { grade: grade as Grade, members };
  return isLegacyState(state, false)
    ? migrateLegacyState(state, false)
    : null;
}

function removeLegacyRecords(currentStorage: Storage): void {
  for (const key of [STORAGE_KEY_LEGACY_TREASURE_SESSION, STORAGE_KEY_LEGACY_SESSIONS, STORAGE_KEY_GRADE, STORAGE_KEY_MEMBERS]) {
    try {
      currentStorage.removeItem(key);
    } catch {
      // v3 の存在を移行済み marker として維持する。
    }
  }
}

function publishMigratedSnapshot(snapshot: PersistedTreasureRoot): boolean {
  return writePersistedTreasure(snapshot.state, snapshot.masterIdentity, snapshot.sessionRevision);
}

export function readPersistedTreasure(): ReadTreasureResult {
  const currentStorage = getStorage();
  if (!currentStorage) return { snapshot: null, restoreFailure: false, migrated: false };
  let currentRaw: string | null;
  try {
    currentRaw = currentStorage.getItem(STORAGE_KEY_TREASURE_SESSION);
  } catch {
    return { snapshot: null, restoreFailure: true, migrated: false };
  }
  if (currentRaw !== null) {
    try {
      const parsed: unknown = JSON.parse(currentRaw);
      return validatePersistedTreasureRoot(parsed)
        ? { snapshot: parsed, restoreFailure: false, migrated: false }
        : { snapshot: null, restoreFailure: true, migrated: false };
    } catch {
      return { snapshot: null, restoreFailure: true, migrated: false };
    }
  }

  const legacyKeys = [STORAGE_KEY_LEGACY_TREASURE_SESSION, STORAGE_KEY_LEGACY_SESSIONS];
  for (const key of legacyKeys) {
    let raw: string | null;
    try {
      raw = currentStorage.getItem(key);
    } catch {
      return { snapshot: null, restoreFailure: true, migrated: false };
    }
    if (raw === null) continue;
    let migrated: PersistedTreasureRoot | null = null;
    try {
      const parsed: unknown = JSON.parse(raw);
      migrated = key === STORAGE_KEY_LEGACY_TREASURE_SESSION
        ? decodeLegacyRoot(parsed)
        : decodeIntegrated(parsed);
    } catch {
      migrated = null;
    }
    if (!migrated || !publishMigratedSnapshot(migrated)) {
      return { snapshot: null, restoreFailure: true, migrated: false };
    }
    let cleaned = false;
    return {
      snapshot: migrated,
      restoreFailure: false,
      migrated: true,
      cleanupLegacy: () => {
        if (cleaned) return;
        cleaned = true;
        removeLegacyRecords(currentStorage);
      },
    };
  }

  let hasSeparate = false;
  try {
    hasSeparate = currentStorage.getItem(STORAGE_KEY_GRADE) !== null || currentStorage.getItem(STORAGE_KEY_MEMBERS) !== null;
  } catch {
    return { snapshot: null, restoreFailure: true, migrated: false };
  }
  if (!hasSeparate) return { snapshot: null, restoreFailure: false, migrated: false };
  let migrated: PersistedTreasureRoot | null = null;
  try {
    migrated = decodeSeparate(currentStorage);
  } catch {
    migrated = null;
  }
  if (!migrated || !publishMigratedSnapshot(migrated)) {
    return { snapshot: null, restoreFailure: true, migrated: false };
  }
  let cleaned = false;
  return {
    snapshot: migrated,
    restoreFailure: false,
    migrated: true,
    cleanupLegacy: () => {
      if (cleaned) return;
      cleaned = true;
      removeLegacyRecords(currentStorage);
    },
  };
}

export function writePersistedTreasure(
  state: TreasureSessionState,
  masterIdentity: MasterIdentity = DEFAULT_MASTER_IDENTITY,
  sessionRevision = 1,
): boolean {
  const currentStorage = getStorage();
  if (!currentStorage) return false;
  const root: PersistedTreasureRoot = {
    schemaVersion: 3,
    sessionRevision,
    masterIdentity,
    state,
  };
  if (!validatePersistedTreasureRoot(root)) return false;
  try {
    currentStorage.setItem(STORAGE_KEY_TREASURE_SESSION, JSON.stringify(root));
    return true;
  } catch {
    return false;
  }
}

export function sessionFromPersisted(root: PersistedTreasureRoot | null): TreasureSession {
  return {
    sessionRevision: root?.sessionRevision ?? 0,
    ...(root?.state ?? {
      registrations: [],
      playlistOrder: [],
      orderMode: "auto",
      listSelection: null,
      currentTarget: null,
      mapCurrentLocations: [],
      incompleteRoute: [],
    }),
  };
}
