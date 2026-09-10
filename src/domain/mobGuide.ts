import type {
  MobGuideCandidate,
  MobGuideItem,
  MobGuideSnapshot,
  MobMasterData,
  MobRouteState,
  MobRouteStep,
  MobSession,
} from '@/types';
import { formatCoordinate, normalizeCoordinate, normalizeIdentifier, normalizeText } from './normalization';
import { mobCandidateId } from './mobMaster';

const START_MARKER = 'MOB-COMPASS/1';
const END_MARKER = 'END-MOB-COMPASS';
const FIELD_SEPARATOR = ' | ';
const UNRESERVED = /^[A-Za-z0-9._~-]$/u;
const ENCODED_BYTE = /^[0-9A-F]{2}$/u;
const RUN = /^[A-Za-z0-9_-]+$/u;
const REVISION = /^(?:0|[1-9][0-9]*)$/u;
const ISSUED_AT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;

export type MobGuideFailure = 'malformed' | 'stale' | 'conflict' | 'different-run';

export interface MobGuideParseResult {
  ok: boolean;
  snapshot?: MobGuideSnapshot;
  failure?: MobGuideFailure;
  reason?: string;
}

export type MobGuideComparison = 'stale' | 'duplicate' | 'conflict' | 'newer';

function fail(reason: string): MobGuideParseResult {
  return { ok: false, failure: 'malformed', reason };
}

function encodeField(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let output = '';
  for (const byte of bytes) {
    const char = String.fromCharCode(byte);
    output += byte < 128 && UNRESERVED.test(char) ? char : `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
  }
  return output;
}

function decodeField(value: string): string | null {
  const bytes: number[] = [];
  for (let index = 0; index < value.length;) {
    const char = value[index];
    if (char === '%') {
      const hex = value.slice(index + 1, index + 3);
      if (!ENCODED_BYTE.test(hex)) return null;
      bytes.push(Number.parseInt(hex, 16));
      index += 3;
      continue;
    }
    if (!UNRESERVED.test(char)) return null;
    bytes.push(char.charCodeAt(0));
    index += 1;
  }
  try {
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    return normalizeText(decoded);
  } catch {
    return null;
  }
}

function splitFields(line: string, expected: number): string[] | null {
  const fields = line.split(FIELD_SEPARATOR);
  return fields.length === expected ? fields : null;
}

function parseCandidateIdentifier(value: string): { mapId: string; x: number; y: number } | null {
  const at = value.indexOf('@');
  if (at <= 0 || at !== value.lastIndexOf('@')) return null;
  const mapId = normalizeIdentifier(value.slice(0, at));
  const coordinates = value.slice(at + 1).split(',');
  if (!mapId || coordinates.length !== 2) return null;
  const x = normalizeCoordinate(coordinates[0]);
  const y = normalizeCoordinate(coordinates[1]);
  if (x === null || y === null || formatCoordinate(x) !== coordinates[0] || formatCoordinate(y) !== coordinates[1]) return null;
  return { mapId, x, y };
}

function parseNumber(value: string): number | null {
  if (!REVISION.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function validateIssuedAt(value: string): boolean {
  return ISSUED_AT.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

function canonicalSnapshot(snapshot: MobGuideSnapshot): string {
  const candidates = [...snapshot.candidates].sort((a, b) => a.mobId.localeCompare(b.mobId, 'en') || a.candidateId.localeCompare(b.candidateId, 'en'));
  const items = [...snapshot.items].sort((a, b) => a.mobId.localeCompare(b.mobId, 'en'));
  return JSON.stringify({ ...snapshot, candidates, items });
}

export function compareMobGuides(current: MobGuideSnapshot, incoming: MobGuideSnapshot): MobGuideComparison {
  if (incoming.revision < current.revision) return 'stale';
  if (incoming.revision > current.revision) return 'newer';
  return canonicalSnapshot(current) === canonicalSnapshot(incoming) ? 'duplicate' : 'conflict';
}

export function snapshotFromMobSession(
  session: MobSession,
  revision: number,
  issuedAt: string,
  master?: MobMasterData,
): MobGuideSnapshot | null {
  if (!session.run || !session.mode || !Number.isSafeInteger(revision) || revision < 0 || !validateIssuedAt(issuedAt)) return null;
  const targetIds = Object.keys(session.targets);
  const activeIds = targetIds.filter((mobId) => !session.targets[mobId].complete);
  if (session.mode === 'auto' && activeIds.length > 0 && (session.route.status !== 'ready' || session.route.sessionVersion !== session.sessionVersion || !master || session.route.masterGeneration !== master.generation)) return null;

  const candidates: MobGuideCandidate[] = [];
  for (const target of Object.values(session.targets)) {
    for (const candidate of Object.values(target.candidates)) {
      const masterLocation = master?.mobs
        .find((mob) => mob.id === target.mobId)
        ?.locations.find((location) => mobCandidateId(location.mapId, location.x, location.y) === candidate.id);
      candidates.push({
        mobId: target.mobId,
        mobName: target.mobName,
        candidateId: candidate.id,
        mapId: candidate.mapId,
        x: candidate.x,
        y: candidate.y,
        classification: masterLocation?.classification ?? candidate.classification,
        confirmation: candidate.userConfirmed ? 'confirmed' : 'unconfirmed',
      });
    }
  }

  const order = session.mode === 'auto' ? session.route.order : session.manualOrder;
  const positions = new Map(order.map((mobId, index) => [mobId, index + 1]));
  const items: MobGuideItem[] = targetIds.map((mobId) => {
    const target = session.targets[mobId];
    const selection = session.mode === 'auto'
      ? session.currentSelections[mobId]
      : session.selectionHistory[mobId];
    return {
      order: target.complete ? '-' : (positions.get(mobId) ?? '-'),
      mobId,
      mobName: target.mobName,
      selectedCandidateId: selection?.candidateId ?? 'none',
      completion: target.complete ? 'complete' : 'incomplete',
    };
  });
  const transitions = targetIds.length === 0 || activeIds.length === 0 ? 0 : session.route.transitions;
  if (session.mode === 'auto' && typeof transitions !== 'number') return null;
  return { run: session.run, revision, issuedAt, mode: session.mode, transitions, candidates, items };
}

export function serializeMobGuide(snapshot: MobGuideSnapshot): string {
  const lines = [
    START_MARKER,
    `run: ${snapshot.run}`,
    `revision: ${snapshot.revision}`,
    `issued-at: ${snapshot.issuedAt}`,
    `mode: ${snapshot.mode}`,
    `transitions: ${snapshot.transitions}`,
  ];
  for (const candidate of snapshot.candidates) {
    lines.push([
      'candidate:',
      candidate.mobId,
      candidate.mobName,
      candidate.candidateId,
      candidate.mapId,
      `${formatCoordinate(candidate.x)},${formatCoordinate(candidate.y)}`,
      candidate.classification,
      candidate.confirmation,
    ].map((value, index) => index === 0 ? value : encodeField(value)).join(FIELD_SEPARATOR));
  }
  for (const item of snapshot.items) {
    lines.push([
      'item:',
      String(item.order),
      item.mobId,
      item.mobName,
      item.selectedCandidateId,
      item.completion,
    ].map((value, index) => index === 0 ? value : encodeField(value)).join(FIELD_SEPARATOR));
  }
  lines.push(END_MARKER);
  return lines.join('\n');
}

export function parseMobGuide(text: string): MobGuideParseResult {
  if (typeof text !== 'string' || text.includes('\r') && !text.includes('\r\n')) return fail('guide must be text with LF or CRLF line endings');
  const normalized = text.replaceAll('\r\n', '\n');
  const withoutTerminalLineEnding = normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized;
  const lines = withoutTerminalLineEnding.split('\n');
  if (lines.length < 7 || lines.some((line) => line.length === 0)) return fail('guide block is incomplete or contains an empty line');
  if (lines[0] !== START_MARKER || lines[lines.length - 1] !== END_MARKER) return fail('guide boundary is invalid');

  const singleton = new Map<string, string>();
  const candidates: MobGuideCandidate[] = [];
  const items: MobGuideItem[] = [];
  for (const line of lines.slice(1, -1)) {
    if (line.startsWith('candidate:')) {
      const fields = splitFields(line, 8);
      if (!fields || fields[0] !== 'candidate:') return fail('candidate row is malformed');
      const decoded = fields.slice(1).map(decodeField);
      if (decoded.some((field) => field === null)) return fail('candidate field encoding is invalid');
      const [mobId, mobName, candidateId, mapId, coordinate, classification, confirmation] = decoded as string[];
      const parsedId = parseCandidateIdentifier(candidateId);
      const coordinateParts = coordinate.split(',');
      if (!normalizeIdentifier(mobId) || !normalizeText(mobName) || !parsedId || !normalizeIdentifier(mapId) || coordinateParts.length !== 2) return fail('candidate identity is invalid');
      const x = normalizeCoordinate(coordinateParts[0]);
      const y = normalizeCoordinate(coordinateParts[1]);
      if (x === null || y === null || formatCoordinate(x) !== coordinateParts[0] || formatCoordinate(y) !== coordinateParts[1] || parsedId.mapId !== mapId || parsedId.x !== x || parsedId.y !== y || candidateId !== mobCandidateId(mapId, x, y)) return fail('candidate identity and coordinates do not match');
      if (classification !== 'confirmed' && classification !== 'candidate') return fail('candidate classification is invalid');
      if (confirmation !== 'confirmed' && confirmation !== 'unconfirmed') return fail('candidate confirmation is invalid');
      if (candidates.some((candidate) => candidate.candidateId === candidateId)) return fail('candidate is duplicated');
      candidates.push({ mobId, mobName, candidateId, mapId, x, y, classification, confirmation });
      continue;
    }
    if (line.startsWith('item:')) {
      const fields = splitFields(line, 6);
      if (!fields || fields[0] !== 'item:') return fail('item row is malformed');
      const decoded = fields.slice(1).map(decodeField);
      if (decoded.some((field) => field === null)) return fail('item field encoding is invalid');
      const [orderText, mobId, mobName, selectedCandidateId, completion] = decoded as string[];
      const order = orderText === '-' ? '-' : parseNumber(orderText);
      if (order === null || !normalizeIdentifier(mobId) || !normalizeText(mobName) || (selectedCandidateId !== 'none' && !parseCandidateIdentifier(selectedCandidateId))) return fail('item identity is invalid');
      if (completion !== 'complete' && completion !== 'incomplete') return fail('item completion is invalid');
      if (items.some((item) => item.mobId === mobId)) return fail('item is duplicated');
      if (completion === 'complete' && order !== '-') return fail('complete item must have no order');
      items.push({ order, mobId, mobName, selectedCandidateId, completion });
      continue;
    }
    const separator = line.indexOf(': ');
    if (separator <= 0) return fail('unknown guide row');
    const key = line.slice(0, separator);
    const value = line.slice(separator + 2);
    if (!['run', 'revision', 'issued-at', 'mode', 'transitions'].includes(key) || singleton.has(key)) return fail('guide header is duplicated or unknown');
    singleton.set(key, value);
  }

  const run = singleton.get('run');
  const revision = singleton.get('revision');
  const issuedAt = singleton.get('issued-at');
  const mode = singleton.get('mode');
  const transitionsText = singleton.get('transitions');
  if (!run || !RUN.test(run) || !revision || parseNumber(revision) === null || !issuedAt || !validateIssuedAt(issuedAt) || (mode !== 'auto' && mode !== 'manual') || !transitionsText) return fail('required guide header is missing or invalid');
  const transitions = transitionsText === 'unknown' ? 'unknown' : parseNumber(transitionsText);
  if (transitions === null || (transitions !== 'unknown' && transitions < 0)) return fail('transitions is invalid');

  const itemsByMob = new Map(items.map((item) => [item.mobId, item]));
  const candidatesByMob = new Map<string, MobGuideCandidate[]>();
  for (const candidate of candidates) {
    const list = candidatesByMob.get(candidate.mobId) ?? [];
    list.push(candidate);
    candidatesByMob.set(candidate.mobId, list);
  }
  for (const item of items) {
    const mobCandidates = candidatesByMob.get(item.mobId) ?? [];
    if (item.completion === 'incomplete' && mobCandidates.length === 0) return fail('incomplete item has no candidates');
    if (item.selectedCandidateId !== 'none' && !mobCandidates.some((candidate) => candidate.candidateId === item.selectedCandidateId)) return fail('item selection does not belong to the mob');
    if (mobCandidates.some((candidate) => candidate.mobName !== item.mobName)) return fail('item and candidate mob names do not match');
  }
  for (const candidate of candidates) if (!itemsByMob.has(candidate.mobId)) return fail('candidate has no item');
  const incomplete = items.filter((item) => item.completion === 'incomplete');
  const orders = incomplete.map((item) => item.order).sort((a, b) => Number(a) - Number(b));
  if (orders.some((order, index) => order !== index + 1)) return fail('item order is not contiguous');
  if (incomplete.length === 0 && transitions !== 0) return fail('empty or complete guide must have zero transitions');
  if (mode === 'manual' && incomplete.some((item) => item.selectedCandidateId === 'none') && transitions !== 'unknown') return fail('manual guide with an unresolved order must use unknown transitions');
  if (mode === 'auto' && incomplete.some((item) => item.selectedCandidateId === 'none')) return fail('auto item has no selected candidate');
  if (mode === 'auto' && transitions === 'unknown') return fail('auto guide cannot use unknown transitions');
  return {
    ok: true,
    snapshot: {
      run,
      revision: parseNumber(revision)!,
      issuedAt,
      mode,
      transitions,
      candidates,
      items,
    },
  };
}

export function mobSessionFromGuide(snapshot: MobGuideSnapshot, base: MobSession): { session: MobSession; route: MobRouteState } {
  const next = structuredClone(base);
  next.run = snapshot.run;
  next.revision = snapshot.revision;
  next.issuedAt = snapshot.issuedAt;
  next.mode = snapshot.mode;
  next.targets = {};
  next.manualOrder = [];
  next.currentSelections = {};
  next.selectionHistory = {};
  for (const item of snapshot.items) {
    next.targets[item.mobId] = {
      mobId: item.mobId,
      mobName: item.mobName,
      candidates: {},
      complete: item.completion === 'complete',
    };
  }
  for (const candidate of snapshot.candidates) {
    next.targets[candidate.mobId].candidates[candidate.candidateId] = {
      id: candidate.candidateId,
      mapId: candidate.mapId,
      mapName: candidate.mapId,
      mapNameShort: candidate.mapId,
      x: candidate.x,
      y: candidate.y,
      classification: candidate.classification,
      userConfirmed: candidate.confirmation === 'confirmed',
    };
  }
  for (const item of snapshot.items) {
    if (item.order !== '-') next.manualOrder[item.order - 1] = item.mobId;
    if (item.selectedCandidateId !== 'none') {
      const candidate = next.targets[item.mobId].candidates[item.selectedCandidateId];
      next.currentSelections[item.mobId] = { mobId: item.mobId, candidateId: item.selectedCandidateId, mapId: candidate.mapId, x: candidate.x, y: candidate.y };
      next.selectionHistory[item.mobId] = structuredClone(next.currentSelections[item.mobId]);
    }
  }
  next.manualOrder = next.manualOrder.filter((mobId): mobId is string => Boolean(mobId));
  next.sessionVersion += 1;
  const steps: MobRouteStep[] = snapshot.items
    .filter((item): item is MobGuideItem & { order: number } => item.order !== '-' && item.selectedCandidateId !== 'none')
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const candidate = next.targets[item.mobId].candidates[item.selectedCandidateId];
      return {
        order: item.order,
        mobId: item.mobId,
        mobName: item.mobName,
        candidateId: candidate.id,
        mapId: candidate.mapId,
        mapName: candidate.mapName,
        mapNameShort: candidate.mapNameShort,
        mapNo: candidate.mapNo,
        x: candidate.x,
        y: candidate.y,
        classification: candidate.classification,
        userConfirmed: candidate.userConfirmed,
        complete: false,
      };
    });
  const route: MobRouteState = {
    status: snapshot.items.length === 0 || snapshot.items.every((item) => item.completion === 'complete') ? 'empty' : 'ready',
    steps,
    order: next.manualOrder,
    transitions: snapshot.transitions,
    ties: [],
    sessionVersion: next.sessionVersion,
    masterGeneration: next.route.masterGeneration,
  };
  next.route = route;
  next.acceptedGuide = structuredClone(snapshot);
  return { session: next, route };
}
