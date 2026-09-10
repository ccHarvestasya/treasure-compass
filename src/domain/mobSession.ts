import type {
  MobCandidate,
  MobFailureReason,
  MobOperationResult,
  MobRouteState,
  MobSelection,
  MobSession,
  MobTarget,
} from '@/types';

export function emptyMobRoute(sessionVersion = 0, masterGeneration = 0): MobRouteState {
  return {
    status: 'empty',
    steps: [],
    order: [],
    transitions: 0,
    ties: [],
    sessionVersion,
    masterGeneration,
  };
}
export function createEmptyMobSession(): MobSession {
  return {
    run: null,
    revision: null,
    issuedAt: null,
    mode: null,
    targets: {},
    manualOrder: [],
    currentSelections: {},
    selectionHistory: {},
    route: emptyMobRoute(),
    acceptedGuide: null,
    sessionVersion: 0,
  };
}

function cloneSession(session: MobSession): MobSession {
  return structuredClone(session);
}

export interface CandidateRegistration {
  mobId: string;
  mobName: string;
  candidate: MobCandidate;
}

export function addMobCandidate(
  session: MobSession,
  registration: CandidateRegistration,
): { session: MobSession; result: MobOperationResult } {
  const next = cloneSession(session);
  const existing = next.targets[registration.mobId];
  if (existing?.candidates[registration.candidate.id]) {
    return {
      session,
      result: { ok: true, kind: 'duplicate', rowResults: [{ status: 'duplicate', mobId: registration.mobId, candidateId: registration.candidate.id }] },
    };
  }

  const target: MobTarget = existing ?? {
    mobId: registration.mobId,
    mobName: registration.mobName,
    candidates: {},
    complete: false,
  };
  target.candidates[registration.candidate.id] = registration.candidate;
  next.targets[registration.mobId] = target;
  if (!existing && next.mode === 'manual' && !target.complete) {
    next.manualOrder.push(registration.mobId);
  }
  next.sessionVersion += 1;
  return {
    session: next,
    result: { ok: true, kind: 'accepted', rowResults: [{ status: 'valid', mobId: registration.mobId, candidateId: registration.candidate.id }] },
  };
}

export function removeMobTarget(session: MobSession, mobId: string): MobSession {
  if (!session.targets[mobId]) return session;
  const next = cloneSession(session);
  delete next.targets[mobId];
  next.manualOrder = next.manualOrder.filter((id) => id !== mobId);
  delete next.currentSelections[mobId];
  delete next.selectionHistory[mobId];
  next.sessionVersion += 1;
  return next;
}

export function setMobCandidateConfirmation(
  session: MobSession,
  mobId: string,
  candidateId: string,
  confirmed: boolean,
): MobSession {
  const candidate = session.targets[mobId]?.candidates[candidateId];
  if (!candidate || candidate.userConfirmed === confirmed) return session;
  const next = cloneSession(session);
  next.targets[mobId].candidates[candidateId].userConfirmed = confirmed;
  next.sessionVersion += 1;
  return next;
}

export function setMobTargetCompletion(session: MobSession, mobId: string, complete: boolean): MobSession {
  const target = session.targets[mobId];
  if (!target || target.complete === complete) return session;
  const next = cloneSession(session);
  next.targets[mobId].complete = complete;
  next.sessionVersion += 1;
  return next;
}

export function reorderMobManual(session: MobSession, order: string[]): MobSession {
  const known = new Set(Object.keys(session.targets));
  const normalized = [...new Set(order)].filter((mobId) => known.has(mobId));
  const missing = Object.keys(session.targets).filter((mobId) => !normalized.includes(mobId));
  if (session.mode === 'manual' && normalized.concat(missing).join('\u0000') === session.manualOrder.join('\u0000')) return session;
  const next = cloneSession(session);
  next.manualOrder = normalized.concat(missing);
  next.mode = 'manual';
  next.route = {
    ...next.route,
    status: 'ready',
    steps: [],
    order: next.manualOrder,
    transitions: 'unknown',
    ties: [],
    failure: undefined,
  };
  next.currentSelections = { ...next.currentSelections };
  next.sessionVersion += 1;
  return next;
}

export function updateMasterClassifications(
  session: MobSession,
  classificationByCandidate: Map<string, 'confirmed' | 'candidate'>,
): MobSession {
  const next = cloneSession(session);
  let changed = false;
  for (const target of Object.values(next.targets)) {
    for (const candidate of Object.values(target.candidates)) {
      const classification = classificationByCandidate.get(candidate.id);
      if (classification && classification !== candidate.classification) {
        candidate.classification = classification;
        changed = true;
      }
    }
  }
  if (changed) next.sessionVersion += 1;
  return changed ? next : session;
}

export function setMobRouteFailure(
  session: MobSession,
  reason: MobFailureReason,
  masterGeneration: number,
): MobSession {
  const next = cloneSession(session);
  next.route = {
    status: 'failure',
    steps: [],
    order: [],
    transitions: 'unknown',
    ties: [],
    failure: reason,
    sessionVersion: next.sessionVersion,
    masterGeneration,
  };
  next.currentSelections = {};
  return next;
}

export function adoptMobRoute(
  session: MobSession,
  route: MobRouteState,
  selections: Record<string, MobSelection>,
): MobSession {
  const next = cloneSession(session);
  next.mode = 'auto';
  next.route = structuredClone(route);
  next.manualOrder = route.order;
  next.currentSelections = structuredClone(selections);
  next.selectionHistory = {
    ...next.selectionHistory,
    ...structuredClone(selections),
  };
  return next;
}
