import { FULL_PARTY } from "@/constants";
import {
  readPersistedTreasure,
  sessionFromPersisted,
  writePersistedTreasure,
} from "@/persistence/storage";
import type {
  MapData,
  RouteStep,
  RouteTieCandidate,
  TreasureCandidate,
  TreasureCatalog,
  TreasureRegistration,
  TreasureSession,
  TreasureSessionState,
  TreasureUnresolvedReference,
} from "@/types";
import type { MasterIdentity } from "@/persistence/storage";
import {
  cloneTreasureSession,
  deriveTreasureSession,
  normalizeTreasureMemberName,
  nextUncompletedRegistration,
  replaceTreasureMapCurrentLocation,
  treasurePointRefsEqual,
} from "@treasure-compass/treasure-domain";
import { calculateTreasureSession, projectTreasureRoute } from "@/store/routeProjection";
import { buildUnresolvedReferences } from "@/store/unresolvedReferences";
import { create } from "zustand";

const restored = readPersistedTreasure();
const initialSession = sessionFromPersisted(restored.snapshot);
const emptySessionState: TreasureSessionState = {
  registrations: [],
  playlistOrder: [],
  orderMode: "auto",
  listSelection: null,
  currentTarget: null,
  mapCurrentLocations: [],
  incompleteRoute: [],
};

interface UndoFrame {
  readonly session: TreasureSessionState;
}

export interface BulkRegistrationProposal {
  readonly memberName: string;
  readonly candidate: TreasureCandidate;
  readonly lineNumbers: number[];
}

export interface BulkRegistrationRejection {
  readonly memberName: string;
  readonly lineNumbers: number[];
  readonly reason: "conflict" | "capacity" | "save-failure";
}

export interface BulkApplyResult {
  readonly applied: number;
  readonly appliedLineNumbers: number[];
  readonly rejected: BulkRegistrationRejection[];
}

function allocateRegistrationId(
  registrations: readonly TreasureRegistration[],
  startNumber: number,
): { registrationId: string; nextNumber: number } {
  const ids = new Set(registrations.map((registration) => registration.registrationId));
  let number = startNumber;
  let registrationId = `registration-${number}`;
  while (ids.has(registrationId)) {
    number += 1;
    registrationId = `registration-${number}`;
  }
  return { registrationId, nextNumber: number + 1 };
}

function createRegistration(
  registrationId: string,
  memberName: string,
  candidate: TreasureCandidate,
  completed: boolean,
  playlistPosition: number,
): TreasureRegistration {
  return {
    registrationId,
    memberName,
    version: candidate.version,
    pointRef: { ...candidate.pointRef },
    completed,
    playlistPosition,
  };
}

function withAutomaticTarget(session: TreasureSessionState): TreasureSessionState {
  if (session.currentTarget !== null) return session;
  const target = nextUncompletedRegistration(session, null);
  return target === null ? session : { ...session, currentTarget: target };
}

interface AppState {
  catalog: TreasureCatalog | null;
  mapData: MapData | null;
  setCatalog: (catalog: TreasureCatalog | null) => void;
  mapDataError: string | null;
  setMapDataError: (message: string | null) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  session: TreasureSession;
  registrations: TreasureRegistration[];
  playlistOrder: string[];
  orderMode: "auto" | "manual";
  listSelection: string | null;
  currentTarget: string | null;
  mapCurrentLocations: TreasureSessionState["mapCurrentLocations"];
  unresolvedReferences: TreasureUnresolvedReference[];
  masterIdentity: MasterIdentity | null;
  undoFrames: UndoFrame[];
  undoPhase: "next" | "back" | null;
  route: RouteStep[];
  routeTieCandidates: RouteTieCandidate[];
  routeError: string | null;
  draftMemberNames: string[];
  bulkText: string;
  modalMemberNo: number | null;
  modalRegistrationId: string | null;
  clearAllData: () => boolean;
  setManualSort: (value: boolean) => boolean;
  setDraftMemberName: (memberNo: number, name: string) => void;
  clearDraftMemberName: (memberNo: number) => void;
  setBulkText: (text: string) => void;
  openModal: (memberNoOrRegistrationId: number | string | null) => void;
  closeModal: () => void;
  registerManual: (memberName: string, candidate: TreasureCandidate) => boolean;
  applyBulkProposal: (proposal: BulkRegistrationProposal[]) => BulkApplyResult;
  selectListItem: (registrationId: string | null) => boolean;
  play: () => boolean;
  playRegistration: (registrationId: string) => boolean;
  next: () => boolean;
  back: () => boolean;
  completeRegistration: (registrationId: string) => boolean;
  cancelRegistration: (registrationId: string) => boolean;
  removeRegistration: (registrationId: string) => boolean;
  moveRegistration: (registrationId: string, direction: "up" | "down") => boolean;
  reorderRegistrations: (activeRegistrationId: string, overRegistrationId: string) => boolean;
  recalcRoute: () => boolean;
}

let nextRegistrationNumber = 1;

const useAppStore = create<AppState>((set, get) => {
  const { sessionRevision: restoredRevision, ...restoredState } = initialSession;
  let currentSession = deriveTreasureSession(restoredState);
  const initialCalculated = calculateTreasureSession(currentSession, null);
  currentSession = initialCalculated.session;
  let persistedMasterIdentity: MasterIdentity | null = restored.snapshot?.masterIdentity ?? null;

  const publish = (
    nextSession: TreasureSessionState,
    options: { clearUndo?: boolean; undoFrames?: UndoFrame[]; routeError?: string | null } = {},
  ): boolean => {
    const state = get();
    const nextRevision = state.session.sessionRevision + 1;
    const rootIdentity = state.catalog?.masterIdentity;
    const { sessionRevision: _ignoredRevision, ...persistedSession } = nextSession as TreasureSession;
    if (!writePersistedTreasure(persistedSession, rootIdentity, nextRevision)) return false;
    if (rootIdentity) persistedMasterIdentity = rootIdentity;
    const session: TreasureSession = { ...persistedSession, sessionRevision: nextRevision };
    const routeProjection = projectTreasureRoute(session, state.catalog);
    set({
      session,
      registrations: [...session.registrations],
      playlistOrder: [...session.playlistOrder],
      orderMode: session.orderMode,
      listSelection: session.listSelection,
      currentTarget: session.currentTarget,
      mapCurrentLocations: session.mapCurrentLocations,
      route: routeProjection.route,
      routeTieCandidates: routeProjection.tieCandidates,
      unresolvedReferences: buildUnresolvedReferences(session, state.catalog, persistedMasterIdentity),
      masterIdentity: persistedMasterIdentity,
      routeError: options.routeError ?? null,
      ...(options.clearUndo === false
        ? { undoFrames: options.undoFrames ?? state.undoFrames, undoPhase: options.undoFrames?.length ? "next" as const : state.undoPhase }
        : { undoFrames: options.undoFrames ?? [], undoPhase: null }),
    });
    return true;
  };

  const invalidateUndo = () => set({ undoFrames: [], undoPhase: null });
  const stateForCandidate = (candidate: TreasureCandidate): TreasureCandidate => ({
    ...candidate,
    pointRef: { ...candidate.pointRef },
  });

  const initialState: AppState & { undoFrames: UndoFrame[] } = {
    catalog: null,
    mapData: null,
    setCatalog: (catalog) => {
      const state = get();
      const calculated = calculateTreasureSession(state.session, catalog);
      set({
        catalog,
        mapData: catalog?.mapData ?? null,
        session: { ...calculated.session, sessionRevision: state.session.sessionRevision },
        registrations: [...calculated.session.registrations],
        playlistOrder: [...calculated.session.playlistOrder],
        orderMode: calculated.session.orderMode,
        listSelection: calculated.session.listSelection,
        currentTarget: calculated.session.currentTarget,
        mapCurrentLocations: calculated.session.mapCurrentLocations,
      route: projectTreasureRoute(calculated.session, catalog).route,
      routeTieCandidates: projectTreasureRoute(calculated.session, catalog).tieCandidates,
      unresolvedReferences: buildUnresolvedReferences(calculated.session, catalog, persistedMasterIdentity),
        masterIdentity: persistedMasterIdentity,
        routeError: calculated.routeError,
        isLoading: false,
      });
    },
    mapDataError: restored.restoreFailure ? "保存データを復元できませんでした。初期状態で開始します。" : null,
    setMapDataError: (message) => set({ mapDataError: message }),
    isLoading: true,
    setIsLoading: (value) => set({ isLoading: value }),
    session: { ...currentSession, sessionRevision: restoredRevision },
    registrations: [...currentSession.registrations],
    playlistOrder: [...currentSession.playlistOrder],
    orderMode: currentSession.orderMode,
    listSelection: currentSession.listSelection,
    currentTarget: currentSession.currentTarget,
    mapCurrentLocations: currentSession.mapCurrentLocations,
    unresolvedReferences: buildUnresolvedReferences(currentSession, null, persistedMasterIdentity),
    masterIdentity: persistedMasterIdentity,
    undoFrames: [],
    undoPhase: null,
    route: [],
    routeTieCandidates: [],
    routeError: null,
    draftMemberNames: Array(FULL_PARTY).fill(""),
    bulkText: "",
    modalMemberNo: null,
    modalRegistrationId: null,
    clearAllData: () => {
      const state = get();
      const calculated = calculateTreasureSession(emptySessionState, state.catalog);
      if (!publish(calculated.session, { routeError: calculated.routeError })) return false;
      set({ draftMemberNames: Array(FULL_PARTY).fill(""), bulkText: "", modalMemberNo: null, modalRegistrationId: null });
      invalidateUndo();
      return true;
    },
    setManualSort: (value) => {
      if (value) {
        const state = get();
        const published = publish(deriveTreasureSession({ ...state.session, orderMode: "manual" }));
        if (published) invalidateUndo();
        return published;
      }
      return get().recalcRoute();
    },
    setDraftMemberName: (memberNo, name) => set({ draftMemberNames: get().draftMemberNames.map((draft, index) => index === memberNo ? name : draft) }),
    clearDraftMemberName: (memberNo) => set({ draftMemberNames: get().draftMemberNames.map((draft, index) => index === memberNo ? "" : draft) }),
    setBulkText: (text) => set({ bulkText: text }),
    openModal: (memberNoOrRegistrationId) => {
      if (typeof memberNoOrRegistrationId === "number") set({ modalMemberNo: memberNoOrRegistrationId, modalRegistrationId: get().session.registrations[memberNoOrRegistrationId]?.registrationId ?? null });
      else set({ modalMemberNo: null, modalRegistrationId: memberNoOrRegistrationId });
    },
    closeModal: () => set({ modalMemberNo: null, modalRegistrationId: null }),
    registerManual: (memberName, inputCandidate) => {
      const state = get();
      const name = normalizeTreasureMemberName(memberName);
      if (!name) return false;
      const existing = state.session.registrations.find((registration) => registration.memberName === name);
      const candidate = stateForCandidate(inputCandidate);
      let next: TreasureSessionState;
      if (existing) {
        const same = treasurePointRefsEqual(existing.pointRef, candidate.pointRef);
        next = {
          ...state.session,
          registrations: state.session.registrations.map((registration) => registration.registrationId === existing.registrationId
            ? { ...registration, version: candidate.version, pointRef: { ...candidate.pointRef }, completed: same ? registration.completed : false }
            : registration),
        };
      } else {
        if (state.session.registrations.length >= FULL_PARTY) return false;
        const allocation = allocateRegistrationId(state.session.registrations, nextRegistrationNumber);
        const registrationId = allocation.registrationId;
        next = {
          ...state.session,
          registrations: [...state.session.registrations, createRegistration(registrationId, name, candidate, false, state.session.registrations.length)],
          playlistOrder: [...state.session.playlistOrder, registrationId],
        };
      }
      const calculated = calculateTreasureSession(next, state.catalog);
      if (calculated.routeError || !publish(withAutomaticTarget(calculated.session), { routeError: calculated.routeError })) return false;
      if (!existing) nextRegistrationNumber = allocateRegistrationId(state.session.registrations, nextRegistrationNumber).nextNumber;
      invalidateUndo();
      return true;
    },
    applyBulkProposal: (proposal) => {
      const state = get();
      const byName = new Map<string, { candidate: TreasureCandidate; lineNumbers: number[] }>();
      const conflicting = new Map<string, number[]>();
      for (const entry of proposal) {
        const name = normalizeTreasureMemberName(entry.memberName);
        if (!name) continue;
        const candidate = stateForCandidate(entry.candidate);
        if (conflicting.has(name)) {
          conflicting.set(name, [...(conflicting.get(name) ?? []), ...entry.lineNumbers]);
          continue;
        }
        const previous = byName.get(name);
        if (previous && !treasurePointRefsEqual(previous.candidate.pointRef, candidate.pointRef)) {
          conflicting.set(name, [...previous.lineNumbers, ...entry.lineNumbers]);
          continue;
        }
        byName.set(name, {
          candidate,
          lineNumbers: [...new Set([...(previous?.lineNumbers ?? []), ...entry.lineNumbers])],
        });
      }

      let registrations = [...state.session.registrations];
      let playlistOrder = [...state.session.playlistOrder];
      let applied = 0;
      let nextNumber = nextRegistrationNumber;
      const appliedLineNumbers: number[] = [];
      const rejected: BulkRegistrationRejection[] = [...conflicting.entries()].map(([memberName, lineNumbers]) => ({
        memberName,
        lineNumbers: [...new Set(lineNumbers)],
        reason: "conflict",
      }));
      for (const [memberName, entry] of byName) {
        if (conflicting.has(memberName)) continue;
        const candidate = entry.candidate;
        const existing = registrations.find((registration) => registration.memberName === memberName);
        if (existing) {
          const same = treasurePointRefsEqual(existing.pointRef, candidate.pointRef);
          registrations = registrations.map((registration) => registration.registrationId === existing.registrationId
            ? { ...registration, version: candidate.version, pointRef: { ...candidate.pointRef }, completed: same ? registration.completed : false }
            : registration);
          applied += 1;
          appliedLineNumbers.push(...entry.lineNumbers);
          continue;
        }
        if (registrations.length >= FULL_PARTY) {
          rejected.push({ memberName, lineNumbers: [...entry.lineNumbers], reason: "capacity" });
          continue;
        }
        const allocation = allocateRegistrationId(registrations, nextNumber);
        const registrationId = allocation.registrationId;
        nextNumber = allocation.nextNumber;
        registrations.push(createRegistration(registrationId, memberName, candidate, false, registrations.length));
        playlistOrder.push(registrationId);
        applied += 1;
        appliedLineNumbers.push(...entry.lineNumbers);
      }
      if (applied === 0) return { applied: 0, appliedLineNumbers: [], rejected };

      const calculated = calculateTreasureSession({ ...state.session, registrations, playlistOrder }, state.catalog);
      if (calculated.routeError || !publish(withAutomaticTarget(calculated.session), { routeError: calculated.routeError })) {
        const failedEntries = proposal.flatMap((entry) => {
          const memberName = normalizeTreasureMemberName(entry.memberName);
          return memberName
            ? [{ memberName, lineNumbers: [...entry.lineNumbers], reason: "save-failure" as const }]
            : [];
        });
        return {
          applied: 0,
          appliedLineNumbers: [],
          rejected: failedEntries,
        };
      }
      nextRegistrationNumber = nextNumber;
      invalidateUndo();
      return { applied, appliedLineNumbers: [...new Set(appliedLineNumbers)], rejected };
    },
    selectListItem: (registrationId) => {
      const state = get();
      if (registrationId !== null && !state.session.registrations.some((registration) => registration.registrationId === registrationId)) return false;
      if (state.session.listSelection === registrationId) return true;
      const next = { ...state.session, listSelection: registrationId };
      if (!publish(next)) return false;
      invalidateUndo();
      return true;
    },
    play: () => {
      const state = get();
      const target = state.session.listSelection ?? nextUncompletedRegistration(state.session, null);
      if (target && state.unresolvedReferences.some((reference) => reference.registrationId === target && (reference.source === "registration" || reference.source === "currentTarget"))) return false;
      if (target === state.session.currentTarget) return true;
      const next = { ...state.session, currentTarget: target };
      if (!publish(next)) return false;
      invalidateUndo();
      return true;
    },
    playRegistration: (registrationId) => {
      const state = get();
      if (!state.session.registrations.some((registration) => registration.registrationId === registrationId)) return false;
      if (state.unresolvedReferences.some((reference) => reference.registrationId === registrationId && (reference.source === "registration" || reference.source === "currentTarget"))) return false;
      if (state.session.listSelection === registrationId && state.session.currentTarget === registrationId) return true;
      const next = { ...state.session, listSelection: registrationId, currentTarget: registrationId };
      if (!publish(next)) return false;
      invalidateUndo();
      return true;
    },
    next: () => {
      const state = get();
      const currentId = state.session.currentTarget;
      const current = currentId ? state.session.registrations.find((registration) => registration.registrationId === currentId) : undefined;
      if (!current || current.completed) return false;
      if (state.unresolvedReferences.some((reference) => reference.registrationId === current.registrationId && (reference.source === "registration" || reference.source === "currentTarget"))) return false;
      const before = cloneTreasureSession(state.session);
      let nextSession = replaceTreasureMapCurrentLocation({
        ...state.session,
        registrations: state.session.registrations.map((registration) => registration.registrationId === current.registrationId ? { ...registration, completed: true } : registration),
      }, current.pointRef);
      const nextId = nextUncompletedRegistration(nextSession, current.registrationId);
      nextSession = { ...nextSession, currentTarget: nextId };
      const calculated = calculateTreasureSession(nextSession, state.catalog);
      if (calculated.routeError) return false;
      const nextFrames = state.undoFrames.length > 0 && state.undoPhase !== "back"
        ? [{ session: before }, ...state.undoFrames]
        : [{ session: before }];
      if (!publish(calculated.session, { clearUndo: false, undoFrames: nextFrames, routeError: calculated.routeError })) return false;
      return true;
    },
    back: () => {
      const state = get();
      const frame = state.undoFrames[0];
      if (!frame) return false;
      if (!publish({ ...cloneTreasureSession(frame.session), listSelection: state.session.listSelection }, { clearUndo: false, undoFrames: state.undoFrames.slice(1) })) return false;
      set({ undoPhase: "back" });
      return true;
    },
    completeRegistration: (registrationId) => {
      const state = get();
      const registration = state.session.registrations.find((entry) => entry.registrationId === registrationId);
      if (!registration || registration.completed) return false;
      if (state.unresolvedReferences.some((reference) => reference.registrationId === registrationId && reference.source === "registration")) return false;
      const next = replaceTreasureMapCurrentLocation({
        ...state.session,
        registrations: state.session.registrations.map((entry) => entry.registrationId === registrationId ? { ...entry, completed: true } : entry),
      }, registration.pointRef);
      const calculated = calculateTreasureSession(next, state.catalog);
      if (calculated.routeError || !publish(calculated.session, { routeError: calculated.routeError })) return false;
      invalidateUndo();
      return true;
    },
    cancelRegistration: (registrationId) => {
      const state = get();
      const registration = state.session.registrations.find((entry) => entry.registrationId === registrationId);
      if (!registration || !registration.completed) return false;
      if (state.unresolvedReferences.some((reference) => reference.registrationId === registrationId && reference.source === "registration")) return false;
      const next = { ...state.session, registrations: state.session.registrations.map((entry) => entry.registrationId === registrationId ? { ...entry, completed: false } : entry) };
      const calculated = calculateTreasureSession(next, state.catalog);
      if (calculated.routeError || !publish(calculated.session, { routeError: calculated.routeError })) return false;
      invalidateUndo();
      return true;
    },
    removeRegistration: (registrationId) => {
      const state = get();
      if (!state.session.registrations.some((registration) => registration.registrationId === registrationId)) return false;
      const next = deriveTreasureSession({
        ...state.session,
        registrations: state.session.registrations.filter((registration) => registration.registrationId !== registrationId),
        playlistOrder: state.session.playlistOrder.filter((id) => id !== registrationId),
        listSelection: state.session.listSelection === registrationId ? null : state.session.listSelection,
        currentTarget: state.session.currentTarget === registrationId ? null : state.session.currentTarget,
      });
      const calculated = calculateTreasureSession(next, state.catalog);
      if (calculated.routeError || !publish(calculated.session, { routeError: calculated.routeError })) return false;
      invalidateUndo();
      return true;
    },
    moveRegistration: (registrationId, direction) => {
      const state = get();
      const index = state.session.playlistOrder.indexOf(registrationId);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= state.session.playlistOrder.length) return false;
      const playlistOrder = [...state.session.playlistOrder];
      [playlistOrder[index], playlistOrder[target]] = [playlistOrder[target]!, playlistOrder[index]!];
      if (!publish(deriveTreasureSession({ ...state.session, playlistOrder, orderMode: "manual" }))) return false;
      invalidateUndo();
      return true;
    },
    reorderRegistrations: (activeRegistrationId, overRegistrationId) => {
      const state = get();
      const index = state.session.playlistOrder.indexOf(activeRegistrationId);
      const target = state.session.playlistOrder.indexOf(overRegistrationId);
      if (index < 0 || target < 0) return false;
      if (index === target) return true;
      const playlistOrder = [...state.session.playlistOrder];
      const [moved] = playlistOrder.splice(index, 1);
      if (!moved) return false;
      playlistOrder.splice(target, 0, moved);
      if (!publish(deriveTreasureSession({ ...state.session, playlistOrder, orderMode: "manual" }))) return false;
      invalidateUndo();
      return true;
    },
    recalcRoute: () => {
      const state = get();
      const next = calculateTreasureSession({ ...state.session, orderMode: "auto" }, state.catalog);
      if (next.routeError || !publish(next.session, { routeError: next.routeError })) return false;
      invalidateUndo();
      return true;
    },
  };

  // undoPhase is deliberately runtime-only and never enters the persisted snapshot.
  return initialState as AppState;
});

// create() has published the restored coordinator state before legacy cleanup.
restored.cleanupLegacy?.();

export { useAppStore };
