import { describe, expect, it } from 'vitest';
import type { MobMasterData, MobSession } from '../../src/types';
import { normalizeCoordinate, normalizeText } from '../../src/domain/normalization';
import { candidateFromMaster, mobCandidateId, parseMobLocationEdit, updateMobMasterLocation, validateMobMaster } from '../../src/domain/mobMaster';
import { addMobCandidate, adoptMobRoute, createEmptyMobSession, setMobTargetCompletion, updateMasterClassifications } from '../../src/domain/mobSession';
import { calculateMobRoute, isCurrentMobRoute } from '../../src/domain/mobRoute';
import { compareMobGuides, parseMobGuide, serializeMobGuide, snapshotFromMobSession } from '../../src/domain/mobGuide';
import { parseMobInput } from '../../src/domain/mobInput';

const master: MobMasterData = {
  identity: 'fixture',
  generation: 1,
  maps: [
    { id: 'map-a', name: 'Map A', mapNo: 1, mapNameShort: 'A' },
    { id: 'map-b', name: 'Map B', mapNo: 2, mapNameShort: 'B' },
  ],
  mobs: [
    {
      id: 'alpha',
      name: 'Alpha',
      locations: [
        { mapId: 'map-a', x: 10, y: 10, classification: 'confirmed' },
        { mapId: 'map-b', x: 20, y: 20, classification: 'candidate' },
      ],
    },
    {
      id: 'beta',
      name: 'Beta',
      locations: [{ mapId: 'map-b', x: 30, y: 30, classification: 'confirmed' }],
    },
  ],
  movement: [
    { fromMapId: 'map-a', toMapId: 'map-b', fee: 100, loadTime: 5 },
    { fromMapId: 'map-b', toMapId: 'map-a', fee: 100, loadTime: 5 },
  ],
};

function sessionWithCandidates() {
  let session: MobSession = { ...createEmptyMobSession(), run: 'run-1', mode: 'auto' };
  for (const [mobId, mobName, location] of [
    ['alpha', 'Alpha', master.mobs[0].locations[0]],
    ['beta', 'Beta', master.mobs[1].locations[0]],
  ] as const) {
    const candidate = candidateFromMaster(master, location);
    if (!candidate) throw new Error('fixture candidate missing');
    session = addMobCandidate(session, { mobId, mobName, candidate }).session;
  }
  const result = calculateMobRoute(session, master);
  if (!result.ok || !result.route || !result.selections) throw new Error('fixture route missing');
  return adoptMobRoute(session, result.route, result.selections);
}

describe('Mob Compass normalization and session', () => {
  it('normalizes Unicode text and rounds decimal coordinates half up', () => {
    expect(normalizeText('  ｱﾙﾌｧ  ')).toBe('ｱﾙﾌｧ');
    expect(normalizeCoordinate('12.34')).toBe(12.3);
    expect(normalizeCoordinate('12.35')).toBe(12.4);
    expect(normalizeCoordinate('.5')).toBeNull();
    expect(normalizeCoordinate('１２.３')).toBeNull();
  });

  it('accepts only known normal input rows and does not reinterpret guide rows', () => {
    const parsed = parseMobInput([
      'mob: Alpha | Map A | 10.04,10',
      'MOB-COMPASS/1',
      'mob: Alpha | Map A | 10.0, 10.0',
    ].join('\n'), master);
    expect(parsed.rows.map((row) => row.result.status)).toEqual(['valid', 'invalid', 'invalid']);
    expect(parsed.rows[0].result.candidateId).toBe('map-a@10.0,10.0');
  });

  it('rejects master locations outside the declared map range', () => {
    const result = validateMobMaster({
      ...master,
      maps: [{ ...master.maps[0], validRange: { min: 0, max: 50 } }, master.maps[1]],
      mobs: [{ ...master.mobs[0], locations: [{ ...master.mobs[0].locations[0], x: 50.1 }] }, master.mobs[1]],
    });
    expect(result.ok).toBe(false);
  });

  it('edits master X/Y/Z while keeping Z outside candidate identity', () => {
    const parsed = parseMobLocationEdit({ mobId: 'alpha', locationIndex: 0, x: '10.0', y: '10.0', z: '-2.5' });
    expect(parsed.ok).toBe(true);
    if (!parsed.edit) throw new Error('edit fixture missing');
    const result = updateMobMasterLocation(master, parsed.edit);
    expect(result.ok).toBe(true);
    expect(result.data?.generation).toBe(2);
    expect(result.data?.mobs[0].locations[0]).toMatchObject({ x: 10, y: 10, z: -2.5 });
    expect(mobCandidateId('map-a', 10, 10)).toBe('map-a@10.0,10.0');
  });

  it('rejects an edited location that duplicates another location', () => {
    const duplicateMaster = structuredClone(master);
    duplicateMaster.mobs[0].locations.push({ mapId: 'map-b', x: 25, y: 25, classification: 'candidate' });
    const parsed = parseMobLocationEdit({ mobId: 'alpha', locationIndex: 1, x: '25', y: '25', z: '' });
    expect(parsed.ok).toBe(true);
    if (!parsed.edit) throw new Error('edit fixture missing');
    expect(updateMobMasterLocation(duplicateMaster, parsed.edit)).toMatchObject({ ok: false });
  });

  it('keeps multiple candidates in one Mob target and makes duplicate a no-op', () => {
    let session: MobSession = { ...createEmptyMobSession(), run: 'run-1', mode: 'manual' };
    const first = candidateFromMaster(master, master.mobs[0].locations[0]);
    const second = candidateFromMaster(master, master.mobs[0].locations[1]);
    if (!first || !second) throw new Error('fixture candidate missing');
    session = addMobCandidate(session, { mobId: 'alpha', mobName: 'Alpha', candidate: first }).session;
    session = addMobCandidate(session, { mobId: 'alpha', mobName: 'Alpha', candidate: second }).session;
    expect(Object.keys(session.targets.alpha.candidates)).toHaveLength(2);
    const duplicate = addMobCandidate(session, { mobId: 'alpha', mobName: 'Alpha', candidate: first });
    expect(duplicate.result.kind).toBe('duplicate');
    expect(duplicate.session).toBe(session);
  });

  it('updates only master classification and keeps confirmation and completion independent', () => {
    const session = sessionWithCandidates();
    const candidate = session.targets.alpha.candidates[mobCandidateId('map-a', 10, 10)];
    candidate.userConfirmed = true;
    const changedMaster = structuredClone(master);
    changedMaster.mobs[0].locations[0].classification = 'candidate';
    const classifications = new Map([[candidate.id, 'candidate' as const]]);
    const updated = updateMasterClassifications(session, classifications);
    expect(updated.targets.alpha.candidates[candidate.id].classification).toBe('candidate');
    expect(updated.targets.alpha.candidates[candidate.id].userConfirmed).toBe(true);
    expect(updated.targets.alpha.complete).toBe(false);
    const completed = setMobTargetCompletion(updated, 'alpha', true);
    expect(completed.targets.alpha.complete).toBe(true);
    expect(completed.targets.alpha.candidates[candidate.id].userConfirmed).toBe(true);
    expect(changedMaster.mobs[0].locations[0].classification).toBe('candidate');
  });
});

describe('Mob Compass route planner', () => {
  it('selects one candidate per Mob and minimizes map transitions first', () => {
    const session = sessionWithCandidates();
    expect(session.route.status).toBe('ready');
    expect(session.route.transitions).toBe(1);
    expect(session.route.steps).toHaveLength(2);
    expect(new Set(session.route.steps.map((step) => step.mobId))).toEqual(new Set(['alpha', 'beta']));
  });

  it('returns comparable alternatives when a Mob has tied candidates', () => {
    let session: MobSession = { ...createEmptyMobSession(), run: 'run-1', mode: 'auto' };
    const first = candidateFromMaster(master, master.mobs[0].locations[0]);
    const second = candidateFromMaster(master, master.mobs[0].locations[1]);
    if (!first || !second) throw new Error('fixture candidate missing');
    session = addMobCandidate(session, { mobId: 'alpha', mobName: 'Alpha', candidate: first }).session;
    session = addMobCandidate(session, { mobId: 'alpha', mobName: 'Alpha', candidate: second }).session;
    const result = calculateMobRoute(session, master);
    expect(result.ok).toBe(true);
    expect(result.route?.ties[0]?.alternatives.map((alternative) => alternative.selection.candidateId)).toEqual([first.id, second.id].sort());
  });

  it('returns a calculation failure when an active Mob has no valid candidate', () => {
    const session = { ...createEmptyMobSession(), run: 'run-1', mode: 'auto' as const };
    const target = {
      mobId: 'alpha',
      mobName: 'Alpha',
      candidates: {},
      complete: false,
    };
    const result = calculateMobRoute({ ...session, targets: { alpha: target } }, master);
    expect(result.ok).toBe(false);
    expect(result.failure).toBe('candidate-unavailable');
  });

  it('does not invent a movement score when first-axis winners lack supplement data', () => {
    const noMovementMaster = { ...master, movement: [] };
    const session = sessionWithCandidates();
    const result = calculateMobRoute(session, noMovementMaster);
    expect(result.ok).toBe(false);
    expect(result.failure).toBe('movement-data-missing');
  });

  it('does not treat a route from another session revision or master generation as current', () => {
    const session = sessionWithCandidates();
    expect(isCurrentMobRoute(session.route, session, master)).toBe(true);
    expect(isCurrentMobRoute(session.route, { ...session, sessionVersion: session.sessionVersion + 1 }, master)).toBe(false);
    expect(isCurrentMobRoute(session.route, session, { ...master, generation: master.generation + 1 })).toBe(false);
  });
});

describe('Mob Compass guide codec', () => {
  it('round trips a canonical guide with percent encoded fields', () => {
    const session = sessionWithCandidates();
    const snapshot = snapshotFromMobSession(session, 0, '2026-09-11T00:00:00.000Z', master);
    if (!snapshot) throw new Error('fixture snapshot missing');
    const text = serializeMobGuide(snapshot);
    expect(text).toContain('MOB-COMPASS/1');
    expect(text).toContain('%40');
    const parsed = parseMobGuide(text);
    expect(parsed.ok).toBe(true);
    expect(parsed.snapshot).toEqual(snapshot);
    expect(compareMobGuides(snapshot, parsed.snapshot!)).toBe('duplicate');
  });

  it('rejects singleton duplication and does not choose first or last wins', () => {
    const session = sessionWithCandidates();
    const snapshot = snapshotFromMobSession(session, 0, '2026-09-11T00:00:00.000Z', master);
    if (!snapshot) throw new Error('fixture snapshot missing');
    const text = serializeMobGuide(snapshot).replace('revision: 0\n', 'revision: 0\nrevision: 0\n');
    const parsed = parseMobGuide(text);
    expect(parsed.ok).toBe(false);
    expect(parsed.failure).toBe('malformed');
  });

  it('rejects a manual guide with an unresolved item and numeric transitions', () => {
    const text = [
      'MOB-COMPASS/1',
      'run: run-1',
      'revision: 0',
      'issued-at: 2026-09-11T00:00:00.000Z',
      'mode: manual',
      'transitions: 0',
      'item: 1 | alpha | Alpha | none | incomplete',
      'END-MOB-COMPASS',
    ].join('\n');
    expect(parseMobGuide(text).ok).toBe(false);
  });

  it('keeps revision ordering independent from issued-at', () => {
    const session = sessionWithCandidates();
    const older = snapshotFromMobSession(session, 3, '2026-09-11T01:00:00.000Z', master);
    const newer = snapshotFromMobSession(session, 4, '2026-09-10T01:00:00.000Z', master);
    if (!older || !newer) throw new Error('fixture snapshots missing');
    expect(compareMobGuides(older, newer)).toBe('newer');
  });
});
