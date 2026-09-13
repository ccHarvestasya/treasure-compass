export const MOB_COMPASS_MODES = ["solo", "party"] as const;

export type MobCompassMode = (typeof MOB_COMPASS_MODES)[number];
export type MobOrderMode = "auto" | "manual";
export type MobCategory = "regular" | "elite";
export type MobRank = "normal" | "b" | "a" | "s" | "ss";
export type MobCandidateStatus = "unexplored" | "explored" | "unresolved";

export interface MobCandidate {
  readonly id: string;
  readonly mapId: string;
  readonly x: number;
  readonly y: number;
}

export interface MobMasterEntry {
  readonly id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly category: MobCategory;
  readonly rank: MobRank;
  readonly mapId: string;
  readonly candidates: readonly MobCandidate[];
}

export interface MobAetheryte {
  readonly id: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
}

export interface MobMapProjection {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly expansionId: string;
  readonly aetherytes: readonly MobAetheryte[];
}

export interface MobMasterIdentity {
  readonly mapSchemaVersion: number;
  readonly mapDataRevision: string;
  readonly mobSchemaVersion: number;
  readonly mobDataRevision: string;
}

export interface MobCatalog {
  readonly maps: readonly MobMapProjection[];
  readonly mobs: readonly MobMasterEntry[];
  readonly masterIdentity: MobMasterIdentity;
}

export interface MobCandidateProgress {
  readonly candidateId: string;
  readonly status: MobCandidateStatus;
}

export interface MobTargetState {
  readonly targetId: string;
  readonly mobId: string;
  readonly mobName: string;
  readonly category: MobCategory;
  readonly rank: MobRank;
  readonly candidates: readonly MobCandidateProgress[];
  readonly selectedCandidateId: string | null;
  readonly completed: boolean;
  readonly unfound: boolean;
}

export interface MobVisit {
  readonly visitId: string;
  readonly targetId: string;
  readonly candidateId: string;
}

export interface MobMapCurrentLocation {
  readonly mapId: string;
  readonly candidateId: string;
}

export interface MobSession {
  readonly mode: MobCompassMode;
  readonly sessionRevision: number;
  readonly masterIdentity: MobMasterIdentity;
  readonly targets: readonly MobTargetState[];
  readonly visitOrder: readonly string[];
  readonly orderMode: MobOrderMode;
  readonly currentVisitId: string | null;
  readonly mapCurrentLocations: readonly MobMapCurrentLocation[];
  readonly nextUndo: MobSession | null;
}

export interface PersistedMobRoot {
  readonly schemaVersion: 1;
  readonly sessionRevision: number;
  readonly masterIdentity: MobMasterIdentity;
  readonly state: {
    readonly targets: readonly MobTargetState[];
    readonly visitOrder: readonly string[];
    readonly orderMode: MobOrderMode;
    readonly currentVisitId: string | null;
    readonly mapCurrentLocations: readonly MobMapCurrentLocation[];
  };
}

export interface MobSearchFilters {
  readonly expansionId?: string;
  readonly categories?: readonly MobCategory[];
  readonly ranks?: readonly MobRank[];
}

export interface MobRouteStep extends MobVisit {
  readonly mapId: string;
  readonly x: number;
  readonly y: number;
  readonly mobName: string;
  readonly rank: MobRank;
  readonly startPoint?: MobAetheryte;
}

export interface MobRouteResult {
  readonly kind: "success" | "empty" | "failure";
  readonly steps: readonly MobRouteStep[];
  readonly tieCandidates: readonly (readonly MobRouteStep[])[];
  readonly reason?: "master-unresolved";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const expected = new Set(keys);
  return Object.keys(value).length === keys.length && Object.keys(value).every((key) => expected.has(key));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function codePointCompare(left: string, right: string): number {
  const a = Array.from(left.normalize("NFC"));
  const b = Array.from(right.normalize("NFC"));
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    const leftCodePoint = a[index]!.codePointAt(0)!;
    const rightCodePoint = b[index]!.codePointAt(0)!;
    if (leftCodePoint !== rightCodePoint) return leftCodePoint - rightCodePoint;
  }
  return a.length - b.length;
}

function candidateSort(left: MobCandidate, right: MobCandidate): number {
  return left.x - right.x || left.y - right.y || codePointCompare(left.id, right.id);
}

function targetCandidate(target: MobTargetState, candidateId: string): MobCandidateProgress | undefined {
  return target.candidates.find((candidate) => candidate.candidateId === candidateId);
}

function makeVisitId(targetId: string, candidateId: string): string {
  return `${targetId}:${candidateId}`;
}

function targetVisits(session: MobSession, target: MobTargetState): MobVisit[] {
  if (target.completed) return [];
  if (session.mode === "party") {
    return target.selectedCandidateId
      ? [{ visitId: makeVisitId(target.targetId, target.selectedCandidateId), targetId: target.targetId, candidateId: target.selectedCandidateId }]
      : [];
  }
  if (target.category === "elite" && target.rank === "b") {
    return target.candidates.flatMap((candidate) => candidate.status === "unexplored"
      ? [{ visitId: makeVisitId(target.targetId, candidate.candidateId), targetId: target.targetId, candidateId: candidate.candidateId }]
      : []);
  }
  return target.selectedCandidateId && targetCandidate(target, target.selectedCandidateId)?.status === "unexplored"
    ? [{ visitId: makeVisitId(target.targetId, target.selectedCandidateId), targetId: target.targetId, candidateId: target.selectedCandidateId }]
    : [];
}

function sortVisits(visits: readonly MobVisit[], catalog: MobCatalog): MobVisit[] {
  const mobs = new Map(catalog.mobs.map((mob) => [mob.id, mob]));
  return [...visits].sort((left, right) => {
    const leftMob = mobs.get(left.targetId);
    const rightMob = mobs.get(right.targetId);
    const leftCandidate = leftMob?.candidates.find((candidate) => candidate.id === left.candidateId);
    const rightCandidate = rightMob?.candidates.find((candidate) => candidate.id === right.candidateId);
    return codePointCompare(leftCandidate?.mapId ?? "", rightCandidate?.mapId ?? "") ||
      (leftCandidate?.x ?? 0) - (rightCandidate?.x ?? 0) ||
      (leftCandidate?.y ?? 0) - (rightCandidate?.y ?? 0) ||
      codePointCompare(left.candidateId, right.candidateId) ||
      codePointCompare(left.targetId, right.targetId);
  });
}

function syncVisitOrder(session: MobSession, catalog: MobCatalog): MobSession {
  const active = session.targets.flatMap((target) => targetVisits(session, target));
  const activeIds = new Set(active.map((visit) => visit.visitId));
  const existing = session.visitOrder.filter((id) => activeIds.has(id));
  const missing = active.filter((visit) => !existing.includes(visit.visitId));
  if (session.orderMode === "auto") return { ...session, visitOrder: sortVisits(active, catalog) .map((visit) => visit.visitId) };
  return { ...session, visitOrder: [...existing, ...missing.map((visit) => visit.visitId)] };
}

function parseVisitId(session: MobSession, value: string): MobVisit | null {
  const separator = value.indexOf(":");
  if (separator <= 0) return null;
  const targetId = value.slice(0, separator);
  const candidateId = value.slice(separator + 1);
  return session.targets.some((target) => target.targetId === targetId) && candidateId
    ? { visitId: value, targetId, candidateId }
    : null;
}

export function normalizeMobText(value: string): string {
  return value.trim().normalize("NFC");
}

export function isMobEligible(mode: MobCompassMode, mob: Pick<MobMasterEntry, "rank">): boolean {
  return mode === "solo" || mob.rank === "a" || mob.rank === "s" || mob.rank === "ss";
}

export function filterMobs(
  catalog: MobCatalog,
  mode: MobCompassMode,
  query: string,
  filters: MobSearchFilters = {},
): MobMasterEntry[] {
  const normalizedQuery = normalizeMobText(query).toLocaleLowerCase("en-US");
  return catalog.mobs.filter((mob) => {
    if (!isMobEligible(mode, mob)) return false;
    if (filters.expansionId && catalog.maps.find((map) => map.id === mob.mapId)?.expansionId !== filters.expansionId) return false;
    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(mob.category)) return false;
    if (filters.ranks && filters.ranks.length > 0 && !filters.ranks.includes(mob.rank)) return false;
    if (!normalizedQuery) return true;
    return [mob.name, ...mob.aliases].some((name) => normalizeMobText(name).toLocaleLowerCase("en-US").includes(normalizedQuery));
  });
}

export function createEmptyMobSession(mode: MobCompassMode, catalog: MobCatalog): MobSession {
  return {
    mode,
    sessionRevision: 0,
    masterIdentity: catalog.masterIdentity,
    targets: [],
    visitOrder: [],
    orderMode: "auto",
    currentVisitId: null,
    mapCurrentLocations: [],
    nextUndo: null,
  };
}

function cloneWithoutUndo(session: MobSession): MobSession {
  return { ...session, targets: session.targets.map((target) => ({ ...target, candidates: target.candidates.map((candidate) => ({ ...candidate })) })), visitOrder: [...session.visitOrder], mapCurrentLocations: session.mapCurrentLocations.map((location) => ({ ...location })), nextUndo: null };
}

function buildTarget(mob: MobMasterEntry, existing?: MobTargetState, selectedCandidateId?: string): MobTargetState {
  const candidateMap = new Map(existing?.candidates.map((candidate) => [candidate.candidateId, candidate.status]));
  const candidates = mob.candidates.map((candidate) => ({ candidateId: candidate.id, status: candidateMap.get(candidate.id) ?? "unexplored" as const }));
  const selected = mob.rank === "b" && mob.category === "elite"
    ? null
    : selectedCandidateId ?? existing?.selectedCandidateId ?? [...mob.candidates].sort(candidateSort)[0]?.id ?? null;
  return {
    targetId: mob.id,
    mobId: mob.id,
    mobName: mob.name,
    category: mob.category,
    rank: mob.rank,
    candidates,
    selectedCandidateId: selected,
    completed: existing?.completed ?? false,
    unfound: existing?.unfound ?? false,
  };
}

export function registerMob(
  session: MobSession,
  catalog: MobCatalog,
  mobId: string,
  selectedCandidateId?: string,
): MobSession | null {
  const mob = catalog.mobs.find((candidate) => candidate.id === mobId);
  if (!mob || !isMobEligible(session.mode, mob)) return null;
  if (session.mode === "party" && (!selectedCandidateId || !mob.candidates.some((candidate) => candidate.id === selectedCandidateId))) return null;
  const existing = session.targets.find((target) => target.targetId === mob.id);
  const nextTarget = buildTarget(mob, existing, selectedCandidateId);
  const next = {
    ...session,
    targets: existing ? session.targets.map((target) => target.targetId === mob.id ? nextTarget : target) : [...session.targets, nextTarget],
    nextUndo: null,
  };
  return syncVisitOrder(next, catalog);
}

export function selectCurrentVisit(session: MobSession, visitIdValue: string | null): MobSession | null {
  if (visitIdValue !== null && !session.visitOrder.includes(visitIdValue)) return null;
  return { ...session, currentVisitId: visitIdValue, nextUndo: null };
}

export function setMobOrderMode(session: MobSession, catalog: MobCatalog, mode: MobOrderMode): MobSession {
  const next = { ...session, orderMode: mode, nextUndo: null };
  return mode === "auto" ? syncVisitOrder(next, catalog) : next;
}

export function moveMobVisit(session: MobSession, visitIdValue: string, direction: "up" | "down"): MobSession | null {
  const index = session.visitOrder.indexOf(visitIdValue);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= session.visitOrder.length) return null;
  const visitOrder = [...session.visitOrder];
  [visitOrder[index], visitOrder[target]] = [visitOrder[target]!, visitOrder[index]!];
  return { ...session, visitOrder, orderMode: "manual", nextUndo: null };
}

export function completeMobTarget(session: MobSession, targetId: string): MobSession | null {
  const target = session.targets.find((candidate) => candidate.targetId === targetId);
  if (!target || target.completed) return null;
  return {
    ...session,
    targets: session.targets.map((candidate) => candidate.targetId === targetId ? { ...candidate, completed: true } : candidate),
    visitOrder: session.visitOrder.filter((visitIdValue) => !visitIdValue.startsWith(`${targetId}:`)),
    currentVisitId: session.currentVisitId?.startsWith(`${targetId}:`) ? null : session.currentVisitId,
    nextUndo: null,
  };
}

export function cancelMobTarget(session: MobSession, targetId: string, catalog: MobCatalog): MobSession | null {
  const target = session.targets.find((candidate) => candidate.targetId === targetId);
  if (!target?.completed) return null;
  const targets = session.targets.map((candidate) => candidate.targetId === targetId ? { ...candidate, completed: false, unfound: false } : candidate);
  return syncVisitOrder({ ...session, targets, nextUndo: null }, catalog);
}

function firstBVisit(session: MobSession): MobVisit | null {
  return session.visitOrder.map((id) => parseVisitId(session, id)).find((visit) => {
    if (!visit) return false;
    const target = session.targets.find((candidate) => candidate.targetId === visit.targetId);
    return target?.category === "elite" && target.rank === "b";
  }) ?? null;
}

export function completeBNext(session: MobSession, catalog: MobCatalog): MobSession | null {
  const selected = session.currentVisitId ? parseVisitId(session, session.currentVisitId) : null;
  const selectedTarget = selected ? session.targets.find((target) => target.targetId === selected.targetId) : undefined;
  const current = selectedTarget?.category === "elite" && selectedTarget.rank === "b" ? selected : firstBVisit(session);
  if (!current) return null;
  const target = session.targets.find((candidate) => candidate.targetId === current.targetId);
  if (!target || target.category !== "elite" || target.rank !== "b") return null;
  const candidate = target.candidates.find((entry) => entry.candidateId === current.candidateId);
  const mob = catalog.mobs.find((entry) => entry.id === target.mobId);
  if (!candidate || candidate.status !== "unexplored" || !mob) return null;
  const before = cloneWithoutUndo(session);
  const targets = session.targets.map((entry) => entry.targetId === target.targetId
    ? { ...entry, candidates: entry.candidates.map((entryCandidate) => entryCandidate.candidateId === current.candidateId ? { ...entryCandidate, status: "explored" as const } : entryCandidate), unfound: entry.candidates.every((entryCandidate) => entryCandidate.candidateId === current.candidateId || entryCandidate.status !== "unexplored") }
    : entry);
  const nextBase = { ...session, targets, mapCurrentLocations: [...session.mapCurrentLocations.filter((location) => location.mapId !== mob.mapId), { mapId: mob.mapId, candidateId: current.candidateId }], nextUndo: before };
  const next = syncVisitOrder(nextBase, catalog);
  return { ...next, currentVisitId: next.visitOrder[0] ?? null };
}

export function cancelBNext(session: MobSession): MobSession | null {
  return session.nextUndo ? { ...session.nextUndo, nextUndo: null } : null;
}

export function researchB(session: MobSession, catalog: MobCatalog, targetId: string): MobSession | null {
  const target = session.targets.find((candidate) => candidate.targetId === targetId);
  if (!target || target.category !== "elite" || target.rank !== "b") return null;
  return syncVisitOrder({
    ...session,
    targets: session.targets.map((entry) => entry.targetId === targetId ? { ...entry, candidates: entry.candidates.map((candidate) => ({ ...candidate, status: "unexplored" as const })), completed: false, unfound: false } : entry),
    currentVisitId: null,
    nextUndo: null,
  }, catalog);
}

export function deleteMobTarget(session: MobSession, targetId: string): MobSession | null {
  if (!session.targets.some((target) => target.targetId === targetId)) return null;
  return {
    ...session,
    targets: session.targets.filter((target) => target.targetId !== targetId),
    visitOrder: session.visitOrder.filter((visitIdValue) => !visitIdValue.startsWith(`${targetId}:`)),
    currentVisitId: session.currentVisitId?.startsWith(`${targetId}:`) ? null : session.currentVisitId,
    nextUndo: null,
  };
}

export function clearMobSession(session: MobSession, catalog: MobCatalog): MobSession {
  return createEmptyMobSession(session.mode, catalog);
}

export function mobVisits(session: MobSession): MobVisit[] {
  const active = new Map(session.targets.flatMap((target) => targetVisits(session, target)).map((visit) => [visit.visitId, visit]));
  return session.visitOrder.flatMap((id) => {
    const visit = active.get(id);
    return visit ? [visit] : [];
  });
}

function distance(left: MobAetheryte, right: MobCandidate): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

export function calculateMobRoute(session: MobSession, catalog: MobCatalog): MobRouteResult {
  const visits = mobVisits(session);
  if (visits.length === 0) return { kind: "empty", steps: [], tieCandidates: [] };
  const mobById = new Map(catalog.mobs.map((mob) => [mob.id, mob]));
  const maps = new Map(catalog.maps.map((map) => [map.id, map]));
  if (visits.some((visit) => {
    const mob = mobById.get(visit.targetId);
    return !mob || !mob.candidates.some((candidate) => candidate.id === visit.candidateId) || !maps.has(mob.mapId);
  })) return { kind: "failure", steps: [], tieCandidates: [], reason: "master-unresolved" };
  const steps = visits.map((visit) => {
    const mob = mobById.get(visit.targetId)!;
    const candidate = mob.candidates.find((entry) => entry.id === visit.candidateId)!;
    const map = maps.get(mob.mapId)!;
    const startPoint = [...map.aetherytes].sort((left, right) => distance(left, candidate) - distance(right, candidate) || codePointCompare(left.id, right.id))[0];
    return { ...visit, mapId: mob.mapId, x: candidate.x, y: candidate.y, mobName: mob.name, rank: mob.rank, ...(startPoint ? { startPoint } : {}) };
  });
  const ordered = session.orderMode === "auto"
    ? [...steps].sort((left, right) => codePointCompare(left.mapId, right.mapId) || left.x - right.x || left.y - right.y || codePointCompare(left.candidateId, right.candidateId))
    : steps;
  return { kind: "success", steps: ordered, tieCandidates: [ordered] };
}

function validIdentity(value: unknown): value is MobMasterIdentity {
  return isRecord(value) && hasExactKeys(value, ["mapSchemaVersion", "mapDataRevision", "mobSchemaVersion", "mobDataRevision"]) &&
    Number.isInteger(value.mapSchemaVersion) && isNonEmptyString(value.mapDataRevision) &&
    Number.isInteger(value.mobSchemaVersion) && isNonEmptyString(value.mobDataRevision);
}

function validCandidateProgress(value: unknown): value is MobCandidateProgress {
  return isRecord(value) && hasExactKeys(value, ["candidateId", "status"]) && isNonEmptyString(value.candidateId) &&
    (value.status === "unexplored" || value.status === "explored" || value.status === "unresolved");
}

function validTarget(value: unknown): value is MobTargetState {
  return isRecord(value) && hasExactKeys(value, ["targetId", "mobId", "mobName", "category", "rank", "candidates", "selectedCandidateId", "completed", "unfound"]) &&
    isNonEmptyString(value.targetId) && value.targetId === value.mobId && isNonEmptyString(value.mobName) &&
    (value.category === "regular" || value.category === "elite") &&
    (value.rank === "normal" || value.rank === "b" || value.rank === "a" || value.rank === "s" || value.rank === "ss") &&
    Array.isArray(value.candidates) && value.candidates.length > 0 && value.candidates.every(validCandidateProgress) &&
    new Set(value.candidates.map((candidate) => candidate.candidateId)).size === value.candidates.length &&
    (value.selectedCandidateId === null || isNonEmptyString(value.selectedCandidateId)) &&
    (value.selectedCandidateId === null || value.candidates.some((candidate) => candidate.candidateId === value.selectedCandidateId)) &&
    typeof value.completed === "boolean" && typeof value.unfound === "boolean";
}

export function encodePersistedMobSession(session: MobSession): PersistedMobRoot {
  return {
    schemaVersion: 1,
    sessionRevision: Math.max(1, session.sessionRevision),
    masterIdentity: session.masterIdentity,
    state: {
      targets: session.targets,
      visitOrder: session.visitOrder,
      orderMode: session.orderMode,
      currentVisitId: session.currentVisitId,
      mapCurrentLocations: session.mapCurrentLocations,
    },
  };
}

export function validatePersistedMobRoot(value: unknown): value is PersistedMobRoot {
  if (!isRecord(value) || !hasExactKeys(value, ["schemaVersion", "sessionRevision", "masterIdentity", "state"])) return false;
  if (value.schemaVersion !== 1 || !isPositiveInteger(value.sessionRevision) || !validIdentity(value.masterIdentity) || !isRecord(value.state)) return false;
  const state = value.state;
  if (!hasExactKeys(state, ["targets", "visitOrder", "orderMode", "currentVisitId", "mapCurrentLocations"]) ||
    !Array.isArray(state.targets) || state.targets.length > 100 || !state.targets.every(validTarget) ||
    !Array.isArray(state.visitOrder) || !state.visitOrder.every(isNonEmptyString) || new Set(state.visitOrder).size !== state.visitOrder.length ||
    (state.orderMode !== "auto" && state.orderMode !== "manual") ||
    (state.currentVisitId !== null && !isNonEmptyString(state.currentVisitId)) ||
    !Array.isArray(state.mapCurrentLocations) ||
    !state.mapCurrentLocations.every((location) => isRecord(location) && hasExactKeys(location, ["mapId", "candidateId"]) && isNonEmptyString(location.mapId) && isNonEmptyString(location.candidateId))
  ) return false;
  const targets = state.targets;
  const targetIds = new Set(targets.map((target) => target.targetId));
  const expectedVisitIds = new Set(targets.flatMap((target) => target.candidates.map((candidate) => makeVisitId(target.targetId, candidate.candidateId))));
  return state.visitOrder.every((id) => expectedVisitIds.has(id)) &&
    (state.currentVisitId === null || state.visitOrder.includes(state.currentVisitId)) &&
    [...targetIds].length === targets.length;
}

export function restorePersistedMobSession(root: PersistedMobRoot, mode: MobCompassMode): MobSession {
  return {
    mode,
    sessionRevision: root.sessionRevision,
    masterIdentity: root.masterIdentity,
    targets: root.state.targets,
    visitOrder: root.state.visitOrder,
    orderMode: root.state.orderMode,
    currentVisitId: root.state.currentVisitId,
    mapCurrentLocations: root.state.mapCurrentLocations,
    nextUndo: null,
  };
}

export function isMobRecordShape(value: unknown): boolean {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.name) && isFiniteNumber(value.x) && isFiniteNumber(value.y);
}
