import { create } from 'zustand';
import type {
  Grade,
  MapData,
  MobCandidate,
  MobMasterData,
  MobOperationResult,
  MobSelection,
  MobSession,
  Product,
  RouteStep,
  UserItem,
} from '@/types';
import { DEFAULT_GRADE, FULL_PARTY } from '@/constants';
import { calcShortestRoute, toRouteSteps } from '@/utils/distance';
import { normalizeCoordinate, normalizeText } from '@/domain/normalization';
import { candidateFromMaster, mobCandidateId, resolveMap, resolveMob } from '@/domain/mobMaster';
import { addMobCandidate, adoptMobRoute, createEmptyMobSession, removeMobTarget, reorderMobManual, setMobCandidateConfirmation, setMobRouteFailure, setMobTargetCompletion, updateMasterClassifications } from '@/domain/mobSession';
import { calculateMobRoute, isCurrentMobRoute } from '@/domain/mobRoute';
import { parseMobGuide, compareMobGuides, mobSessionFromGuide, serializeMobGuide, snapshotFromMobSession } from '@/domain/mobGuide';
import { parseMobInput } from '@/domain/mobInput';
import { readPersistedSessions, writePersistedSessions } from '@/persistence/storage';

const restored = readPersistedSessions();
const initialTreasure = restored.snapshot?.treasure ?? {
  grade: DEFAULT_GRADE,
  members: Array<UserItem | null>(FULL_PARTY).fill(null),
};
const initialProduct = restored.snapshot?.product ?? 'treasure';
const initialMob = (() => {
  const session = restored.snapshot?.mob ?? createEmptyMobSession();
  if (session.run && session.route.status === 'ready') {
    session.route = { ...session.route, status: 'stale', steps: [], transitions: 'unknown' };
    session.currentSelections = {};
  }
  return session;
})();

let runCounter = 0;

function newRunId(): string {
  runCounter += 1;
  return `run-${Date.now().toString(36)}-${runCounter.toString(36)}`;
}

function emptyMembers(): (UserItem | null)[] {
  return Array<UserItem | null>(FULL_PARTY).fill(null);
}

function countTransitions(steps: Array<{ mapId: string }>): number {
  let transitions = 0;
  for (let index = 1; index < steps.length; index += 1) if (steps[index].mapId !== steps[index - 1].mapId) transitions += 1;
  return transitions;
}

function makeMobRouteStep(session: MobSession, mobId: string, selection: MobSelection, master: MobMasterData | null) {
  const target = session.targets[mobId];
  const candidate = target?.candidates[selection.candidateId];
  const map = master?.maps.find((entry) => entry.id === selection.mapId);
  if (!target || !candidate) return null;
  const classification = master?.mobs
    .find((mob) => mob.id === mobId)
    ?.locations.find((location) => mobCandidateId(location.mapId, location.x, location.y) === candidate.id)
    ?.classification ?? candidate.classification;
  return {
    order: 0,
    mobId,
    mobName: target.mobName,
    candidateId: candidate.id,
    mapId: candidate.mapId,
    mapName: map?.name ?? candidate.mapName,
    mapNameShort: map?.mapNameShort ?? candidate.mapNameShort,
    mapNo: map?.mapNo ?? candidate.mapNo,
    x: candidate.x,
    y: candidate.y,
    classification,
    userConfirmed: candidate.userConfirmed,
    complete: target.complete,
  };
}

function projectManualRoute(session: MobSession, master: MobMasterData | null): MobSession {
  const next = structuredClone(session);
  const failure = master ? (hasMasterMismatch(next, master) ? 'master-mismatch' : undefined) : next.run ? 'no-master' : undefined;
  const activeOrder = next.manualOrder.filter((mobId) => Boolean(next.targets[mobId]) && !next.targets[mobId].complete);
  const steps = activeOrder
    .map((mobId) => {
      const selection = next.selectionHistory[mobId];
      if (!selection || !master) return null;
      const masterMob = master.mobs.find((mob) => mob.id === mobId);
      const location = masterMob?.locations.find((entry) => mobCandidateId(entry.mapId, entry.x, entry.y) === selection.candidateId);
      return location ? makeMobRouteStep(next, mobId, selection, master) : null;
    })
    .filter((step): step is NonNullable<typeof step> => step !== null)
    .map((step, index) => ({ ...step, order: index + 1 }));
  const hasAllSelections = activeOrder.every((mobId) => {
    const selection = next.selectionHistory[mobId];
    const masterMob = master?.mobs.find((mob) => mob.id === mobId);
    return Boolean(selection && next.targets[mobId].candidates[selection.candidateId] && masterMob?.locations.some((location) => mobCandidateId(location.mapId, location.x, location.y) === selection.candidateId));
  });
  next.route = {
    status: failure ? 'failure' : 'ready',
    steps,
    order: activeOrder,
    transitions: activeOrder.length === 0 ? 0 : hasAllSelections ? countTransitions(steps) : 'unknown',
    ties: [],
    failure,
    sessionVersion: next.sessionVersion,
    masterGeneration: master?.generation ?? next.route.masterGeneration,
  };
  next.currentSelections = { ...next.selectionHistory };
  return next;
}

function planMobSession(session: MobSession, master: MobMasterData | null): MobSession {
  if (!master) return setMobRouteFailure(session, 'no-master', session.route.masterGeneration);
  const result = calculateMobRoute(session, master);
  if (!result.ok || !result.route || !result.selections) return setMobRouteFailure(session, result.failure ?? 'invalid-target', master.generation);
  return adoptMobRoute(session, result.route, result.selections);
}

function reconcileMobSession(session: MobSession, master: MobMasterData): MobSession {
  const next = structuredClone(session);
  for (const target of Object.values(next.targets)) {
    const masterMob = master.mobs.find((mob) => mob.id === target.mobId);
    if (!masterMob) continue;
    for (const candidate of Object.values(target.candidates)) {
      const location = masterMob.locations.find((entry) => mobCandidateId(entry.mapId, entry.x, entry.y) === candidate.id);
      const map = master.maps.find((entry) => entry.id === candidate.mapId);
      if (location && map) {
        candidate.classification = location.classification;
        candidate.mapName = map.name;
        candidate.mapNameShort = map.mapNameShort ?? map.name;
        candidate.mapNo = map.mapNo;
      }
    }
  }
  return next;
}

function hasMasterMismatch(session: MobSession, master: MobMasterData): boolean {
  for (const target of Object.values(session.targets)) {
    const masterMob = master.mobs.find((mob) => mob.id === target.mobId);
    if (!masterMob) return true;
    for (const candidate of Object.values(target.candidates)) {
      if (!master.maps.some((map) => map.id === candidate.mapId) || !masterMob.locations.some((location) => mobCandidateId(location.mapId, location.x, location.y) === candidate.id)) return true;
    }
  }
  return false;
}

function snapshotForPersistence(product: Product, grade: Grade, members: (UserItem | null)[], mob: MobSession) {
  return { version: 1 as const, product, treasure: { grade, members }, mob };
}

interface AppState {
  product: Product;
  setProduct: (product: Product) => void;
  grade: Grade;
  setGrade: (grade: Grade) => void;
  setGradeWithReset: (grade: Grade) => void;
  mapData: MapData | null;
  setMapData: (data: MapData | null) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  members: (UserItem | null)[];
  setMember: (memberNo: number, item: UserItem) => void;
  removeMember: (memberNo: number) => void;
  draftMemberNames: string[];
  setDraftMemberName: (memberNo: number, name: string) => void;
  clearDraftMemberName: (memberNo: number) => void;
  clearMembers: () => void;
  clearAllData: () => void;
  route: RouteStep[];
  isManualSort: boolean;
  setRoute: (steps: RouteStep[]) => void;
  setManualSort: (v: boolean) => void;
  activeStep: number;
  setActiveStep: (n: number) => void;
  completeStep: (index: number) => void;
  uncompleteStep: (index: number) => void;
  bulkText: string;
  setBulkText: (text: string) => void;
  modalMemberNo: number | null;
  openModal: (memberNo: number) => void;
  closeModal: () => void;
  recalcRoute: () => void;
  mobMaster: MobMasterData | null;
  mobMasterError: string | null;
  setMobMaster: (master: MobMasterData | null, error?: string) => void;
  mobSession: MobSession;
  mobInputText: string;
  setMobInputText: (text: string) => void;
  mobGuideText: string;
  setMobGuideText: (text: string) => void;
  mobLastResult: MobOperationResult | null;
  clearMobResult: () => void;
  addMob: (mobName: string, mapName: string, x: string, y: string) => MobOperationResult;
  addMobCandidate: (mobId: string, mobName: string, candidate: MobCandidate) => MobOperationResult;
  addMobMasterCandidate: (mobId: string, candidateId: string) => MobOperationResult;
  addMobInput: (text?: string) => MobOperationResult;
  removeMob: (mobId: string) => MobOperationResult;
  confirmMobCandidate: (mobId: string, candidateId: string, confirmed?: boolean) => MobOperationResult;
  completeMob: (mobId: string) => MobOperationResult;
  reorderMob: (order: string[]) => MobOperationResult;
  recalcMobRoute: () => MobOperationResult;
  startNewMobRun: () => MobOperationResult;
  outputMobGuide: (writeExternal?: (text: string) => Promise<void>) => Promise<MobOperationResult>;
  importMobGuide: (text?: string, replace?: boolean) => MobOperationResult;
}

function operationFailure(failure: MobOperationResult['failure'], reason: string): MobOperationResult {
  return { ok: false, kind: 'failure', failure, reason };
}

function commit(
  set: (partial: Partial<AppState>) => void,
  product: Product,
  grade: Grade,
  members: (UserItem | null)[],
  mob: MobSession,
  result: MobOperationResult,
  additional: Partial<AppState> = {},
): MobOperationResult {
  if (!writePersistedSessions(snapshotForPersistence(product, grade, members, mob))) {
    const failure = operationFailure('persistence-write', '保存書込みに失敗しました');
    set({ mobLastResult: failure });
    return failure;
  }
  set({ ...additional, mobSession: mob, mobLastResult: result });
  return result;
}

export const useAppStore = create<AppState>((set, get) => ({
  product: initialProduct,
  setProduct: (product) => {
    const state = get();
    if (state.product === product) return;
    if (!writePersistedSessions(snapshotForPersistence(product, state.grade, state.members, state.mobSession))) {
      set({ mobLastResult: operationFailure('persistence-write', '保存書込みに失敗しました') });
      return;
    }
    set({ product });
  },
  grade: initialTreasure.grade,
  setGrade: (grade) => {
    const state = get();
    if (!writePersistedSessions(snapshotForPersistence(state.product, grade, state.members, state.mobSession))) {
      set({ mobLastResult: operationFailure('persistence-write', '保存書込みに失敗しました') });
      return;
    }
    set({ grade, mapData: null, isLoading: true });
  },
  setGradeWithReset: (grade) => {
    const state = get();
    const members = emptyMembers();
    if (!writePersistedSessions(snapshotForPersistence(state.product, grade, members, state.mobSession))) {
      set({ mobLastResult: operationFailure('persistence-write', '保存書込みに失敗しました') });
      return;
    }
    set({ grade, mapData: null, isLoading: true, members, draftMemberNames: members.map(() => ''), route: [], bulkText: '', isManualSort: false, activeStep: 0 });
  },
  mapData: null,
  setMapData: (data) => {
    set({ mapData: data });
    get().recalcRoute();
  },
  isLoading: true,
  setIsLoading: (v) => set({ isLoading: v }),
  members: initialTreasure.members,
  setMember: (memberNo, item) => {
    const state = get();
    const members = [...state.members];
    const draftMemberNames = [...state.draftMemberNames];
    members[memberNo] = item;
    draftMemberNames[memberNo] = '';
    if (!writePersistedSessions(snapshotForPersistence(state.product, state.grade, members, state.mobSession))) {
      set({ mobLastResult: operationFailure('persistence-write', '保存書込みに失敗しました') });
      return;
    }
    set({ members, draftMemberNames });
    get().recalcRoute();
  },
  removeMember: (memberNo) => {
    const state = get();
    const members = [...state.members];
    const draftMemberNames = [...state.draftMemberNames];
    members[memberNo] = null;
    draftMemberNames[memberNo] = '';
    if (!writePersistedSessions(snapshotForPersistence(state.product, state.grade, members, state.mobSession))) {
      set({ mobLastResult: operationFailure('persistence-write', '保存書込みに失敗しました') });
      return;
    }
    set({ members, draftMemberNames });
    get().recalcRoute();
  },
  draftMemberNames: initialTreasure.members.map(() => ''),
  setDraftMemberName: (memberNo, name) => {
    const draftMemberNames = [...get().draftMemberNames];
    draftMemberNames[memberNo] = name;
    set({ draftMemberNames });
  },
  clearDraftMemberName: (memberNo) => {
    const draftMemberNames = [...get().draftMemberNames];
    draftMemberNames[memberNo] = '';
    set({ draftMemberNames });
  },
  clearMembers: () => {
    const state = get();
    const members = emptyMembers();
    if (!writePersistedSessions(snapshotForPersistence(state.product, state.grade, members, state.mobSession))) {
      set({ mobLastResult: operationFailure('persistence-write', '保存書込みに失敗しました') });
      return;
    }
    set({ members, draftMemberNames: members.map(() => ''), route: [], isManualSort: false, activeStep: 0 });
  },
  clearAllData: () => {
    const state = get();
    const members = emptyMembers();
    const mob = createEmptyMobSession();
    if (!writePersistedSessions(snapshotForPersistence(state.product, state.grade, members, mob))) {
      set({ mobLastResult: operationFailure('persistence-write', '保存書込みに失敗しました') });
      return;
    }
    set({ members, draftMemberNames: members.map(() => ''), mobSession: mob, route: [], bulkText: '', isManualSort: false, activeStep: 0 });
  },
  route: [],
  isManualSort: false,
  setRoute: (steps) => {
    const state = get();
    const normalized = steps.map((step, index) => ({ ...step, orderNo: index + 1 }));
    if (!writePersistedSessions(snapshotForPersistence(state.product, state.grade, state.members, state.mobSession))) {
      set({ mobLastResult: operationFailure('persistence-write', '保存書込みに失敗しました') });
      return;
    }
    set({ route: normalized, isManualSort: true });
  },
  setManualSort: (v) => set({ isManualSort: v }),
  activeStep: 0,
  setActiveStep: (n) => set({ activeStep: n }),
  completeStep: (index) => {
    const state = get();
    const route = state.route.map((step, i) => i === index ? { ...step, isCompleted: true } : step);
    const nextActive = route.findIndex((step, i) => i > index && !step.isCompleted);
    if (!writePersistedSessions(snapshotForPersistence(state.product, state.grade, state.members, state.mobSession))) return;
    set({ route, activeStep: nextActive >= 0 ? nextActive : index });
  },
  uncompleteStep: (index) => {
    const state = get();
    const route = state.route.map((step, i) => i === index ? { ...step, isCompleted: false } : step);
    if (!writePersistedSessions(snapshotForPersistence(state.product, state.grade, state.members, state.mobSession))) return;
    set({ route, activeStep: index });
  },
  bulkText: '',
  setBulkText: (text) => set({ bulkText: text }),
  modalMemberNo: null,
  openModal: (memberNo) => set({ modalMemberNo: memberNo }),
  closeModal: () => set({ modalMemberNo: null }),
  recalcRoute: () => {
    const state = get();
    if (!state.mapData) return;
    const activeMembers = state.members.filter((member): member is UserItem => member !== null);
    if (activeMembers.length === 0) {
      set({ route: [], isManualSort: false, activeStep: 0 });
      return;
    }
    const result = calcShortestRoute(activeMembers.map((member) => ({ memberName: member.memberName, mapNo: member.mapNo, mapName: member.mapName, mapNameShort: member.mapNameShort, mapPoint: member.mapPoint })), state.mapData.mapData);
    set({ route: toRouteSteps(result.orderedSteps), isManualSort: false, activeStep: 0 });
  },
  mobMaster: null,
  mobMasterError: null,
  setMobMaster: (master, error) => {
    const state = get();
    let mob = state.mobSession;
    if (master) {
      const classifications = new Map<string, 'confirmed' | 'candidate'>();
      for (const target of Object.values(mob.targets)) for (const candidate of Object.values(target.candidates)) {
        const classification = master.mobs.find((entry) => entry.id === target.mobId)?.locations.find((location) => mobCandidateId(location.mapId, location.x, location.y) === candidate.id)?.classification;
        if (classification) classifications.set(candidate.id, classification);
      }
      mob = updateMasterClassifications(reconcileMobSession(mob, master), classifications);
      mob = hasMasterMismatch(mob, master)
        ? setMobRouteFailure(mob, 'master-mismatch', master.generation)
        : mob.mode === 'auto' ? planMobSession(mob, master) : projectManualRoute(mob, master);
    } else if (mob.run) {
      mob = setMobRouteFailure(mob, 'no-master', mob.route.masterGeneration);
    }
    set({ mobMaster: master, mobMasterError: error ?? null, mobSession: mob });
  },
  mobSession: initialMob,
  mobInputText: '',
  setMobInputText: (text) => set({ mobInputText: text }),
  mobGuideText: '',
  setMobGuideText: (text) => set({ mobGuideText: text }),
  mobLastResult: restored.restoreFailure ? operationFailure('invalid', '保存データを復元できませんでした') : null,
  clearMobResult: () => set({ mobLastResult: null }),
  addMob: (mobName, mapName, xText, yText) => {
    const state = get();
    if (!state.mobMaster) {
      const result = operationFailure('invalid', 'Mob マスターデータがありません');
      set({ mobLastResult: result });
      return result;
    }
    const x = normalizeCoordinate(xText);
    const y = normalizeCoordinate(yText);
    const mobNameValue = normalizeText(mobName);
    const mapNameValue = normalizeText(mapName);
    const mob = mobNameValue ? resolveMob(state.mobMaster, mobNameValue) : null;
    const map = mapNameValue ? resolveMap(state.mobMaster, mapNameValue) : null;
    const location = mob && map ? mob.locations.find((entry) => entry.mapId === map.id && entry.x === x && entry.y === y) : null;
    const candidate = location ? candidateFromMaster(state.mobMaster, location) : null;
    if (!mob || !map || !candidate || x === null || y === null) {
      const result = operationFailure('invalid', 'モブ、マップ、座標を確認してください');
      set({ mobLastResult: result });
      return result;
    }
    return get().addMobCandidate(mob.id, mob.name, candidate);
  },
  addMobCandidate: (mobId, mobName, candidate) => {
    const state = get();
    const masterMob = state.mobMaster?.mobs.find((mob) => mob.id === mobId);
    const requestedMobName = normalizeText(mobName);
    const masterCandidate = masterMob?.locations.find((location) => mobCandidateId(location.mapId, location.x, location.y) === candidate.id);
    const resolvedCandidate = masterCandidate && state.mobMaster ? candidateFromMaster(state.mobMaster, masterCandidate) : null;
    if (!masterMob || !requestedMobName || requestedMobName !== masterMob.name && requestedMobName !== masterMob.id && !masterMob.aliases?.includes(requestedMobName) || !masterCandidate || !resolvedCandidate || resolvedCandidate.id !== candidate.id) {
      const result = operationFailure('invalid', '未知のモブです');
      set({ mobLastResult: result });
      return result;
    }
    let working = state.mobSession;
    if (!working.run) working = { ...working, run: newRunId(), mode: 'auto' };
    const applied = addMobCandidate(working, { mobId, mobName: masterMob.name, candidate: resolvedCandidate });
    if (!applied.result.ok || applied.result.kind === 'duplicate') {
      set({ mobLastResult: applied.result });
      return applied.result;
    }
    working = applied.session;
    working = working.mode === 'auto' ? planMobSession(working, state.mobMaster) : projectManualRoute(working, state.mobMaster);
    return commit(set, state.product, state.grade, state.members, working, applied.result);
  },
  addMobMasterCandidate: (mobId, candidateId) => {
    const state = get();
    const masterMob = state.mobMaster?.mobs.find((mob) => mob.id === mobId);
    const location = masterMob?.locations.find((entry) => mobCandidateId(entry.mapId, entry.x, entry.y) === candidateId);
    const candidate = location && state.mobMaster ? candidateFromMaster(state.mobMaster, location) : null;
    if (!masterMob || !candidate) {
      const result = operationFailure('invalid', 'マスター上の候補地点がありません');
      set({ mobLastResult: result });
      return result;
    }
    return get().addMobCandidate(masterMob.id, masterMob.name, candidate);
  },
  addMobInput: (text) => {
    const state = get();
    const parsed = parseMobInput(text ?? state.mobInputText, state.mobMaster ?? undefined);
    let working = state.mobSession;
    let accepted = false;
    const rowResults = parsed.rows.map((entry) => ({ ...entry.result }));
    for (let index = 0; index < parsed.rows.length; index += 1) {
      const entry = parsed.rows[index];
      if (entry.result.status !== 'valid' || !entry.result.mobId || !entry.result.candidateId || !state.mobMaster) continue;
      const mob = state.mobMaster.mobs.find((candidateMob) => candidateMob.id === entry.result.mobId);
      const location = mob?.locations.find((candidateLocation) => mobCandidateId(candidateLocation.mapId, candidateLocation.x, candidateLocation.y) === entry.result.candidateId);
      const candidate = location ? candidateFromMaster(state.mobMaster, location) : null;
      if (!mob || !candidate) {
        rowResults[index] = { status: 'invalid', reason: '地点を解決できません' };
        continue;
      }
      if (!working.run) working = { ...working, run: newRunId(), mode: 'auto' };
      const applied = addMobCandidate(working, { mobId: mob.id, mobName: mob.name, candidate });
      rowResults[index] = { ...applied.result.rowResults?.[0] ?? { status: 'invalid' }, mobId: mob.id, candidateId: candidate.id };
      if (applied.result.kind === 'accepted') {
        accepted = true;
        working = applied.session;
      }
    }
    const result: MobOperationResult = { ok: true, kind: accepted ? 'accepted' : 'duplicate', rowResults };
    if (!accepted) {
      set({ mobLastResult: result });
      return result;
    }
    working = working.mode === 'auto' ? planMobSession(working, state.mobMaster) : projectManualRoute(working, state.mobMaster);
    return commit(set, state.product, state.grade, state.members, working, result);
  },
  removeMob: (mobId) => {
    const state = get();
    if (!state.mobSession.targets[mobId]) {
      const result = operationFailure('invalid', '対象がありません');
      set({ mobLastResult: result });
      return result;
    }
    let working = removeMobTarget(state.mobSession, mobId);
    working = working.mode === 'auto' ? planMobSession(working, state.mobMaster) : projectManualRoute(working, state.mobMaster);
    return commit(set, state.product, state.grade, state.members, working, { ok: true, kind: 'accepted' });
  },
  confirmMobCandidate: (mobId, candidateId, confirmed = true) => {
    const state = get();
    const working = setMobCandidateConfirmation(state.mobSession, mobId, candidateId, confirmed);
    if (working === state.mobSession) {
      const result = operationFailure('invalid', '候補地点がありません');
      set({ mobLastResult: result });
      return result;
    }
    working.route.steps = working.route.steps.map((step) => step.mobId === mobId && step.candidateId === candidateId ? { ...step, userConfirmed: confirmed } : step);
    working.route = { ...working.route, sessionVersion: working.sessionVersion };
    return commit(set, state.product, state.grade, state.members, working, { ok: true, kind: 'accepted' });
  },
  completeMob: (mobId) => {
    const state = get();
    const base = setMobTargetCompletion(state.mobSession, mobId, true);
    if (base === state.mobSession) {
      const result = operationFailure('invalid', '対象がありません');
      set({ mobLastResult: result });
      return result;
    }
    const working = base.mode === 'auto' ? planMobSession(base, state.mobMaster) : projectManualRoute(base, state.mobMaster);
    return commit(set, state.product, state.grade, state.members, working, { ok: true, kind: 'accepted' });
  },
  reorderMob: (order) => {
    const state = get();
    if (state.mobSession.mode === null) {
      const result = operationFailure('invalid', '周回が開始されていません');
      set({ mobLastResult: result });
      return result;
    }
    let working = reorderMobManual(state.mobSession, order);
    working = projectManualRoute(working, state.mobMaster);
    return commit(set, state.product, state.grade, state.members, working, { ok: true, kind: 'accepted' });
  },
  recalcMobRoute: () => {
    const state = get();
    if (!state.mobMaster) {
      const result = operationFailure('route-calculation', 'Mob マスターデータがありません');
      set({ mobLastResult: result });
      return result;
    }
    const calculated = calculateMobRoute(state.mobSession, state.mobMaster);
    if (!calculated.ok || !calculated.route || !calculated.selections) {
      const result = operationFailure('route-calculation', `ルートを計算できません: ${calculated.failure ?? 'unknown'}`);
      if (state.mobSession.mode === 'auto') {
        const failedSession = setMobRouteFailure(state.mobSession, calculated.failure ?? 'invalid-target', state.mobMaster.generation);
        return commit(set, state.product, state.grade, state.members, failedSession, result);
      }
      set({ mobLastResult: result });
      return result;
    }
    const working = adoptMobRoute(state.mobSession, calculated.route, calculated.selections);
    return commit(set, state.product, state.grade, state.members, working, { ok: true, kind: 'accepted' });
  },
  startNewMobRun: () => {
    const state = get();
    const working: MobSession = { ...createEmptyMobSession(), run: newRunId(), mode: 'auto' };
    return commit(set, state.product, state.grade, state.members, working, { ok: true, kind: 'accepted' });
  },
  outputMobGuide: async (writeExternal) => {
    const state = get();
    const session = state.mobSession;
    const nextRevision = session.revision === null ? 0 : session.revision + 1;
    const activeMobCount = Object.values(session.targets).filter((target) => !target.complete).length;
    if (session.mode === 'auto' && activeMobCount > 0 && (!state.mobMaster || !isCurrentMobRoute(session.route, session, state.mobMaster))) {
      const result = operationFailure('route-calculation', '現在の自動ルートが古いか計算不能のため案内を出力できません');
      set({ mobLastResult: result });
      return result;
    }
    const snapshot = snapshotFromMobSession(session, nextRevision, new Date().toISOString(), state.mobMaster ?? undefined);
    if (!snapshot) {
      const result = operationFailure('route-calculation', '現在の状態は案内を出力できません');
      set({ mobLastResult: result });
      return result;
    }
    const guide = serializeMobGuide(snapshot);
    if (writeExternal) {
      try {
        await writeExternal(guide);
      } catch {
        const result = operationFailure('invalid', '案内の外部出力に失敗しました');
        set({ mobLastResult: result });
        return result;
      }
    }
    const current = get();
    if (
      current.mobSession.sessionVersion !== session.sessionVersion
      || current.mobSession.revision !== session.revision
      || current.product !== state.product
      || current.grade !== state.grade
      || JSON.stringify(current.members) !== JSON.stringify(state.members)
      || current.mobMaster?.identity !== state.mobMaster?.identity
      || current.mobMaster?.generation !== state.mobMaster?.generation
    ) {
      const result = operationFailure('invalid', '出力中に状態が変更されました');
      set({ mobLastResult: result });
      return result;
    }
    const working = structuredClone(session);
    working.revision = snapshot.revision;
    working.issuedAt = snapshot.issuedAt;
    working.acceptedGuide = snapshot;
    return commit(set, state.product, state.grade, state.members, working, { ok: true, kind: 'accepted', guide: snapshot });
  },
  importMobGuide: (text, replace = false) => {
    const state = get();
    const parsed = parseMobGuide(text ?? state.mobGuideText);
    if (!parsed.ok || !parsed.snapshot) {
      const result = operationFailure('guide-malformed', parsed.reason ?? '案内が不正です');
      set({ mobLastResult: result });
      return result;
    }
    const incoming = parsed.snapshot;
    const current = state.mobSession;
    if (current.run && incoming.run !== current.run && !replace) {
      const result = operationFailure('guide-different-run', '別の周回の案内です。案内で置換を選択してください');
      set({ mobLastResult: result });
      return result;
    }
    if (current.run === incoming.run && current.acceptedGuide) {
      const comparison = compareMobGuides(current.acceptedGuide, incoming);
      if (comparison === 'stale') {
        const result = operationFailure('guide-stale', '古い案内です');
        set({ mobLastResult: result });
        return result;
      }
      if (comparison === 'duplicate') {
        const result: MobOperationResult = { ok: true, kind: 'duplicate', guide: incoming };
        set({ mobLastResult: result });
        return result;
      }
      if (comparison === 'conflict') {
        const result = operationFailure('guide-conflict', '同じ世代の案内が競合しています');
        set({ mobLastResult: result });
        return result;
      }
    }
    const adopted = mobSessionFromGuide(incoming, current);
    if (state.mobMaster) {
      const classifications = new Map<string, 'confirmed' | 'candidate'>();
      for (const target of Object.values(adopted.session.targets)) for (const candidate of Object.values(target.candidates)) {
        const classification = state.mobMaster.mobs.find((mob) => mob.id === target.mobId)?.locations.find((location) => mobCandidateId(location.mapId, location.x, location.y) === candidate.id)?.classification;
        if (classification) classifications.set(candidate.id, classification);
      }
      adopted.session = updateMasterClassifications(reconcileMobSession(adopted.session, state.mobMaster), classifications);
      if (hasMasterMismatch(adopted.session, state.mobMaster)) {
        adopted.session = setMobRouteFailure(adopted.session, 'master-mismatch', state.mobMaster.generation);
      } else if (incoming.mode === 'manual') {
        adopted.session = projectManualRoute(adopted.session, state.mobMaster);
      } else {
        adopted.session.route = { ...adopted.session.route, masterGeneration: state.mobMaster.generation, sessionVersion: adopted.session.sessionVersion };
        adopted.session.route.steps = adopted.session.route.steps.map((step) => {
          const selection = adopted.session.currentSelections[step.mobId];
          return selection ? makeMobRouteStep(adopted.session, step.mobId, selection, state.mobMaster) ?? step : step;
        }).map((step, index) => ({ ...step, order: index + 1 }));
      }
    } else if (incoming.mode === 'auto' && Object.keys(adopted.session.targets).length > 0) {
      adopted.session = setMobRouteFailure(adopted.session, 'no-master', adopted.session.route.masterGeneration);
    }
    return commit(set, state.product, state.grade, state.members, adopted.session, { ok: true, kind: 'accepted', guide: incoming });
  },
}));

export { emptyMobRoute } from '@/domain/mobSession';
