import {
  calculateMobRoute,
  cancelBNext,
  cancelMobTarget,
  clearMobSession,
  completeBNext,
  completeMobTarget,
  createEmptyMobSession,
  deleteMobTarget,
  encodePersistedMobSession,
  moveMobVisit,
  registerMob,
  researchB,
  restorePersistedMobSession,
  selectCurrentVisit,
  setMobOrderMode,
  validatePersistedMobRoot,
  type MobCatalog,
  type MobCompassMode,
  type MobMasterEntry,
  type MobOrderMode,
  type MobRouteResult,
  type MobSession,
} from "@treasure-compass/mob-domain";

export const MOB_SESSION_KEYS: Record<MobCompassMode, string> = {
  solo: "mob-compass:solo-session:v1",
  party: "mob-compass:party-session:v1",
};
export const MOB_MODE_KEY = "mob-compass:last-mode:v1";

interface MobModePreference {
  readonly schemaVersion: 1;
  readonly revision: 1;
  readonly mode: MobCompassMode;
}

export type MobMutation = (session: MobSession) => MobSession | null;

function storage(): Storage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function isMode(value: unknown): value is MobCompassMode {
  return value === "solo" || value === "party";
}

function readMode(currentStorage: Storage): MobCompassMode | null {
  try {
    const raw = currentStorage.getItem(MOB_MODE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    return Object.keys(record).length === 3 && record.schemaVersion === 1 && record.revision === 1 && isMode(record.mode)
      ? record.mode
      : null;
  } catch {
    return null;
  }
}

function readSession(currentStorage: Storage, mode: MobCompassMode, catalog: MobCatalog): { session: MobSession; failed: boolean } {
  try {
    const raw = currentStorage.getItem(MOB_SESSION_KEYS[mode]);
    if (raw === null) return { session: createEmptyMobSession(mode, catalog), failed: false };
    const parsed: unknown = JSON.parse(raw);
    return validatePersistedMobRoot(parsed)
      ? { session: restorePersistedMobSession(parsed, mode), failed: false }
      : { session: createEmptyMobSession(mode, catalog), failed: true };
  } catch {
    return { session: createEmptyMobSession(mode, catalog), failed: true };
  }
}

function withRevision(session: MobSession, catalog: MobCatalog): MobSession {
  return { ...session, sessionRevision: Math.max(1, session.sessionRevision), masterIdentity: catalog.masterIdentity, nextUndo: null };
}

export class MobCoordinator {
  readonly catalog: MobCatalog;
  private readonly currentStorage: Storage | null;
  private currentMode: MobCompassMode;
  private readonly sessions: Record<MobCompassMode, MobSession>;
  private listeners = new Set<() => void>();
  private failureMessage: string | null = null;

  constructor(catalog: MobCatalog, currentStorage: Storage | null = storage()) {
    this.catalog = catalog;
    this.currentStorage = currentStorage;
    const persistedMode = currentStorage ? readMode(currentStorage) : null;
    this.currentMode = persistedMode ?? "solo";
    const solo = currentStorage ? readSession(currentStorage, "solo", catalog) : { session: createEmptyMobSession("solo", catalog), failed: false };
    const party = currentStorage ? readSession(currentStorage, "party", catalog) : { session: createEmptyMobSession("party", catalog), failed: false };
    this.sessions = { solo: solo.session, party: party.session };
    if (solo.failed || party.failed || (currentStorage !== null && persistedMode === null && this.hasModeRecord(currentStorage))) {
      this.failureMessage = "Mob の保存データを復元できませんでした。該当モードを初期状態で開始します。";
    }
  }

  private hasModeRecord(currentStorage: Storage): boolean {
    try {
      return currentStorage.getItem(MOB_MODE_KEY) !== null;
    } catch {
      return true;
    }
  }

  get mode(): MobCompassMode {
    return this.currentMode;
  }

  get session(): MobSession {
    return this.sessions[this.currentMode];
  }

  get persistenceError(): string | null {
    return this.failureMessage;
  }

  get route(): MobRouteResult {
    return calculateMobRoute(this.session, this.catalog);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  private publish(mode: MobCompassMode, nextSession: MobSession): boolean {
    const currentStorage = this.currentStorage;
    if (!currentStorage) {
      this.failureMessage = "保存領域を利用できません。変更は公開されませんでした。";
      return false;
    }
    const published = withRevision({ ...nextSession, sessionRevision: this.sessions[mode].sessionRevision + 1 }, this.catalog);
    try {
      currentStorage.setItem(MOB_SESSION_KEYS[mode], JSON.stringify(encodePersistedMobSession(published)));
    } catch {
      this.failureMessage = "Mob の変更を保存できませんでした。状態は変更されていません。";
      return false;
    }
    this.sessions[mode] = published;
    this.failureMessage = null;
    this.notify();
    return true;
  }

  mutate(mutation: MobMutation): boolean {
    const next = mutation(this.session);
    return next !== null ? this.publish(this.currentMode, next) : false;
  }

  switchMode(mode: MobCompassMode): boolean {
    if (mode === this.currentMode) return true;
    const currentStorage = this.currentStorage;
    if (!currentStorage) {
      this.failureMessage = "保存領域を利用できません。モードは変更されませんでした。";
      return false;
    }
    const preference: MobModePreference = { schemaVersion: 1, revision: 1, mode };
    try {
      currentStorage.setItem(MOB_MODE_KEY, JSON.stringify(preference));
    } catch {
      this.failureMessage = "Mob のモードを保存できませんでした。モードは変更されませんでした。";
      return false;
    }
    this.currentMode = mode;
    this.failureMessage = null;
    this.notify();
    return true;
  }

  register(mobId: string, candidateId?: string): boolean {
    return this.mutate((session) => registerMob(session, this.catalog, mobId, candidateId));
  }

  select(visitId: string | null): boolean {
    return this.mutate((session) => selectCurrentVisit(session, visitId));
  }

  setOrderMode(mode: MobOrderMode): boolean {
    return this.mutate((session) => setMobOrderMode(session, this.catalog, mode));
  }

  move(visitId: string, direction: "up" | "down"): boolean {
    return this.mutate((session) => moveMobVisit(session, visitId, direction));
  }

  complete(targetId: string): boolean {
    return this.mutate((session) => completeMobTarget(session, targetId));
  }

  cancel(targetId: string): boolean {
    return this.mutate((session) => cancelMobTarget(session, targetId, this.catalog));
  }

  bNext(): boolean {
    return this.mutate((session) => completeBNext(session, this.catalog));
  }

  bCancelNext(): boolean {
    return this.mutate((session) => cancelBNext(session));
  }

  research(targetId: string): boolean {
    return this.mutate((session) => researchB(session, this.catalog, targetId));
  }

  remove(targetId: string): boolean {
    return this.mutate((session) => deleteMobTarget(session, targetId));
  }

  clear(): boolean {
    return this.mutate((session) => clearMobSession(session, this.catalog));
  }

  getMob(mobId: string): MobMasterEntry | undefined {
    return this.catalog.mobs.find((mob) => mob.id === mobId);
  }
}
