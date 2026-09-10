import type {
  MobCandidate,
  MobFailureReason,
  MobMasterData,
  MobMasterLocation,
  MobRouteState,
  MobRouteAlternative,
  MobRouteStep,
  MobRouteTie,
  MobSelection,
  MobSession,
} from '@/types';
import { mobCandidateId } from './mobMaster';

interface ResolvedCandidate {
  candidate: MobCandidate;
  masterLocation: MobMasterLocation;
  mapName: string;
  mapNameShort: string;
  mapNo?: number;
}

interface MovementChoice {
  fee?: number;
  loadTime?: number;
  teleportPoint?: MobRouteStep['teleportPoint'];
}

interface RouteCandidate {
  steps: MobRouteStep[];
  selections: Record<string, MobSelection>;
  transitions: number;
  fee?: number;
  loadTime?: number;
  key: string;
}

export interface MobRouteCalculationResult {
  ok: boolean;
  route?: MobRouteState;
  selections?: Record<string, MobSelection>;
  failure?: MobFailureReason;
  affectedMobIds?: string[];
}

function compareRouteKey(a: RouteCandidate, b: RouteCandidate): number {
  for (let index = 0; index < a.steps.length; index += 1) {
    const left = a.steps[index];
    const right = b.steps[index];
    if (left.mapId !== right.mapId) return left.mapId < right.mapId ? -1 : 1;
    if (left.x !== right.x) return left.x < right.x ? -1 : 1;
    if (left.y !== right.y) return left.y < right.y ? -1 : 1;
    if (left.mobId !== right.mobId) return left.mobId < right.mobId ? -1 : 1;
  }
  return 0;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += 1) {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const tail of permutations(rest)) result.push([items[index], ...tail]);
  }
  return result;
}

function findResolvedCandidate(master: MobMasterData, mobId: string, candidate: MobCandidate): ResolvedCandidate | null {
  const mob = master.mobs.find((entry) => entry.id === mobId);
  const map = master.maps.find((entry) => entry.id === candidate.mapId);
  if (!mob || !map) return null;
  const expectedId = mobCandidateId(candidate.mapId, candidate.x, candidate.y);
  const location = mob.locations.find((entry) => mobCandidateId(entry.mapId, entry.x, entry.y) === expectedId);
  if (!location) return null;
  if (map.validRange && (candidate.x < map.validRange.min || candidate.x > map.validRange.max || candidate.y < map.validRange.min || candidate.y > map.validRange.max)) return null;
  return {
    candidate,
    masterLocation: location,
    mapName: map.name,
    mapNameShort: map.mapNameShort ?? map.name,
    mapNo: map.mapNo,
  };
}

function movementChoices(master: MobMasterData, fromMapId: string, toMapId: string): MovementChoice[] {
  if (fromMapId === toMapId) return [{ fee: 0, loadTime: 0 }];
  return master.movement
    .filter((movement) => movement.fromMapId === fromMapId && movement.toMapId === toMapId)
    .map((movement) => ({
      fee: movement.fee,
      loadTime: movement.loadTime,
      teleportPoint: movement.teleportPoint,
    }));
}

function candidateKey(candidate: ResolvedCandidate, mobId: string): string {
  return `${candidate.candidate.mapId}\u0000${candidate.candidate.x.toFixed(1)}\u0000${candidate.candidate.y.toFixed(1)}\u0000${mobId}`;
}

function buildRouteCandidates(
  session: MobSession,
  master: MobMasterData,
  mobIds: string[],
  resolved: Map<string, ResolvedCandidate[]>,
): RouteCandidate[] {
  const candidates: RouteCandidate[] = [];
  for (const order of permutations(mobIds)) {
    const selected: ResolvedCandidate[] = [];
    const choose = (index: number) => {
      if (index === order.length) {
        const makeMovementChoices = (movementIndex: number, choices: MovementChoice[]) => {
          if (selected.length <= 1 || movementIndex === selected.length) {
            let transitions = 0;
            let fee: number | undefined = 0;
            let loadTime: number | undefined = 0;
            const steps: MobRouteStep[] = [];
            const selections: Record<string, MobSelection> = {};
            let previousMapId: string | null = null;

            for (let stepIndex = 0; stepIndex < selected.length; stepIndex += 1) {
              const entry = selected[stepIndex];
              const mobId = order[stepIndex];
              const movement = choices[stepIndex - 1];
              if (previousMapId !== null && previousMapId !== entry.candidate.mapId) transitions += 1;
              if (movement) {
                fee = fee === undefined || movement.fee === undefined ? undefined : fee + movement.fee;
                loadTime = loadTime === undefined || movement.loadTime === undefined ? undefined : loadTime + movement.loadTime;
              }
              const selection: MobSelection = {
                mobId,
                candidateId: entry.candidate.id,
                mapId: entry.candidate.mapId,
                x: entry.candidate.x,
                y: entry.candidate.y,
              };
              selections[mobId] = selection;
              steps.push({
                order: stepIndex + 1,
                mobId,
                mobName: session.targets[mobId].mobName,
                candidateId: entry.candidate.id,
                mapId: entry.candidate.mapId,
                mapName: entry.mapName,
                mapNameShort: entry.mapNameShort,
                mapNo: entry.mapNo,
                x: entry.candidate.x,
                y: entry.candidate.y,
                classification: entry.masterLocation.classification,
                userConfirmed: entry.candidate.userConfirmed,
                complete: false,
                teleportPoint: movement?.teleportPoint,
              });
              previousMapId = entry.candidate.mapId;
            }
            candidates.push({
              steps,
              selections,
              transitions,
              fee,
              loadTime,
              key: steps.map((step) => `${candidateKey(selected[step.order - 1], step.mobId)}`).join('\u0001'),
            });
            return;
          }

          const fromMapId = selected[movementIndex - 1].candidate.mapId;
          const toMapId = selected[movementIndex].candidate.mapId;
          const choicesForEdge = movementChoices(master, fromMapId, toMapId);
          if (choicesForEdge.length === 0) return;
          for (const choice of choicesForEdge) makeMovementChoices(movementIndex + 1, [...choices, choice]);
        };
        makeMovementChoices(1, []);
        return;
      }
      const options = resolved.get(order[index]) ?? [];
      for (const option of options) {
        selected.push(option);
        choose(index + 1);
        selected.pop();
      }
    };
    choose(0);
  }
  return candidates;
}

function dominates(a: RouteCandidate, b: RouteCandidate): boolean {
  if (a.fee === undefined || a.loadTime === undefined || b.fee === undefined || b.loadTime === undefined) return false;
  return a.fee <= b.fee && a.loadTime <= b.loadTime && (a.fee < b.fee || a.loadTime < b.loadTime);
}

function uniqueRoutes(routes: RouteCandidate[]): RouteCandidate[] {
  const seen = new Set<string>();
  return routes.filter((route) => {
    const identity = `${route.key}\u0002${route.fee ?? 'unknown'}\u0002${route.loadTime ?? 'unknown'}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function tieInformation(routes: RouteCandidate[], selected: RouteCandidate): MobRouteTie[] {
  const ties: MobRouteTie[] = [];
  for (const mobId of Object.keys(selected.selections)) {
    const alternativeMap = new Map<string, MobRouteAlternative>();
    for (const route of routes) {
      const selection = route.selections[mobId];
      if (selection && !alternativeMap.has(selection.candidateId)) alternativeMap.set(selection.candidateId, { selection, fee: route.fee, loadTime: route.loadTime });
    }
    if (alternativeMap.size > 1) {
      ties.push({
        mobId,
        selectedCandidateId: selected.selections[mobId].candidateId,
        alternatives: [...alternativeMap.values()].sort((a, b) => a.selection.candidateId < b.selection.candidateId ? -1 : a.selection.candidateId > b.selection.candidateId ? 1 : 0),
      });
    }
  }
  return ties;
}

export function calculateMobRoute(session: MobSession, master: MobMasterData): MobRouteCalculationResult {
  const activeTargets = Object.values(session.targets).filter((target) => !target.complete);
  if (activeTargets.length === 0) {
    return {
      ok: true,
      route: {
        status: 'empty',
        steps: [],
        order: [],
        transitions: 0,
        ties: [],
        sessionVersion: session.sessionVersion,
        masterGeneration: master.generation,
      },
      selections: {},
    };
  }

  const resolved = new Map<string, ResolvedCandidate[]>();
  const affectedMobIds: string[] = [];
  for (const target of activeTargets) {
    const options = Object.values(target.candidates)
      .map((candidate) => findResolvedCandidate(master, target.mobId, candidate))
      .filter((candidate): candidate is ResolvedCandidate => candidate !== null);
    if (options.length === 0) affectedMobIds.push(target.mobId);
    resolved.set(target.mobId, options);
  }
  if (affectedMobIds.length > 0) return { ok: false, failure: 'candidate-unavailable', affectedMobIds };

  const allRoutes = uniqueRoutes(buildRouteCandidates(session, master, activeTargets.map((target) => target.mobId), resolved));
  if (allRoutes.length === 0) {
    return { ok: false, failure: 'movement-data-missing', affectedMobIds: activeTargets.map((target) => target.mobId) };
  }
  const minimumTransitions = Math.min(...allRoutes.map((route) => route.transitions));
  const transitionWinners = allRoutes.filter((route) => route.transitions === minimumTransitions);
  const missingSupplement = transitionWinners.some((route) => route.fee === undefined || route.loadTime === undefined);
  if (transitionWinners.length > 1 && missingSupplement) {
    return { ok: false, failure: 'supplement-missing', affectedMobIds: activeTargets.map((target) => target.mobId) };
  }

  let winners = transitionWinners;
  if (!missingSupplement) {
    winners = transitionWinners.filter((route) => !transitionWinners.some((other) => dominates(other, route)));
  }
  winners.sort(compareRouteKey);
  const selected = winners[0];
  const ties = tieInformation(winners, selected);
  return {
    ok: true,
    selections: selected.selections,
    route: {
      status: 'ready',
      steps: selected.steps,
      order: selected.steps.map((step) => step.mobId),
      transitions: selected.transitions,
      fee: selected.fee,
      loadTime: selected.loadTime,
      ties,
      sessionVersion: session.sessionVersion,
      masterGeneration: master.generation,
    },
  };
}

export function isCurrentMobRoute(
  route: MobRouteState,
  session: MobSession,
  master: MobMasterData,
): boolean {
  return (route.status === 'ready' || route.status === 'empty')
    && route.sessionVersion === session.sessionVersion
    && route.masterGeneration === master.generation;
}
