import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MobMasterData } from '../../src/types';
import { candidateFromMaster } from '../../src/domain/mobMaster';
import { serializeMobGuide } from '../../src/domain/mobGuide';

class FailingStorage {
  private values = new Map<string, string>();
  fail = false;

  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void {
    if (this.fail) throw new Error('write failed');
    this.values.set(key, value);
  }
  removeItem(key: string): void { this.values.delete(key); }
  clear(): void { this.values.clear(); }
}

const storage = new FailingStorage();
const master: MobMasterData = {
  identity: 'store-fixture',
  generation: 1,
  maps: [
    { id: 'map-a', name: 'Map A', mapNo: 1, mapNameShort: 'A' },
    { id: 'map-b', name: 'Map B', mapNo: 2, mapNameShort: 'B' },
  ],
  mobs: [
    { id: 'alpha', name: 'Alpha', locations: [
      { mapId: 'map-a', x: 10, y: 10, classification: 'confirmed' },
      { mapId: 'map-b', x: 20, y: 20, classification: 'candidate' },
    ] },
    { id: 'beta', name: 'Beta', locations: [{ mapId: 'map-b', x: 30, y: 30, classification: 'confirmed' }] },
  ],
  movement: [
    { fromMapId: 'map-a', toMapId: 'map-b', fee: 100, loadTime: 5 },
    { fromMapId: 'map-b', toMapId: 'map-a', fee: 100, loadTime: 5 },
  ],
};

let store: typeof import('../../src/store/useAppStore').useAppStore;

beforeAll(async () => {
  vi.stubGlobal('localStorage', storage);
  store = (await import('../../src/store/useAppStore')).useAppStore;
});

beforeEach(() => {
  storage.fail = false;
  storage.clear();
  store.getState().clearAllData();
  store.getState().setMobMaster(master);
  store.getState().setProduct('mob');
});

function candidate(mobId: string, locationIndex: number) {
  const mob = master.mobs.find((entry) => entry.id === mobId);
  if (!mob) throw new Error('missing mob');
  const value = candidateFromMaster(master, mob.locations[locationIndex]);
  if (!value) throw new Error('missing candidate');
  return value;
}

describe('Mob session application', () => {
  it('keeps candidates in one target and completion at Mob level', () => {
    const first = store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 0));
    const second = store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 1));
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    const session = store.getState().mobSession;
    expect(Object.keys(session.targets)).toEqual(['alpha']);
    expect(Object.keys(session.targets.alpha.candidates)).toHaveLength(2);

    const confirmed = store.getState().confirmMobCandidate('alpha', candidate('alpha', 1).id);
    expect(confirmed.ok).toBe(true);
    expect(store.getState().mobSession.targets.alpha.candidates[candidate('alpha', 1).id].userConfirmed).toBe(true);
    expect(store.getState().completeMob('alpha').ok).toBe(true);
    expect(store.getState().mobSession.targets.alpha.complete).toBe(true);
    expect(store.getState().mobSession.route.transitions).toBe(0);
    expect(Object.keys(store.getState().mobSession.targets.alpha.candidates)).toHaveLength(2);
  });

  it('keeps manual order when manual to auto recalculation fails', () => {
    store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 0));
    store.getState().addMobCandidate('beta', 'Beta', candidate('beta', 0));
    expect(store.getState().reorderMob(['beta', 'alpha']).ok).toBe(true);
    const before = structuredClone(store.getState().mobSession);
    store.getState().setMobMaster({ ...master, movement: [] });
    expect(store.getState().mobSession.mode).toBe('manual');
    const result = store.getState().recalcMobRoute();
    expect(result.failure).toBe('route-calculation');
    expect(store.getState().mobSession.mode).toBe('manual');
    expect(store.getState().mobSession.manualOrder).toEqual(before.manualOrder);
  });

  it('keeps manual state when a successful manual to auto recalculation cannot be saved', () => {
    store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 0));
    store.getState().addMobCandidate('beta', 'Beta', candidate('beta', 0));
    expect(store.getState().reorderMob(['beta', 'alpha']).ok).toBe(true);
    const before = structuredClone(store.getState().mobSession);
    storage.fail = true;
    const result = store.getState().recalcMobRoute();
    expect(result.failure).toBe('persistence-write');
    expect(store.getState().mobSession).toEqual(before);
  });

  it('invalidates an auto route on recalculation failure but keeps selection history', () => {
    store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 0));
    store.getState().addMobCandidate('beta', 'Beta', candidate('beta', 0));
    const before = structuredClone(store.getState().mobSession);
    store.getState().setMobMaster({ ...master, movement: [] });
    expect(store.getState().mobSession.route.status).toBe('failure');
    expect(store.getState().mobSession.currentSelections).toEqual({});
    expect(store.getState().mobSession.selectionHistory).toEqual(before.selectionHistory);
  });

  it('does not commit an accepted candidate when persistence write fails', () => {
    const before = structuredClone(store.getState().mobSession);
    storage.fail = true;
    const result = store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 0));
    expect(result.failure).toBe('persistence-write');
    expect(store.getState().mobSession).toEqual(before);
  });

  it('does not consume guide revision when output persistence fails', async () => {
    store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 0));
    storage.fail = true;
    const failed = await store.getState().outputMobGuide();
    expect(failed.failure).toBe('persistence-write');
    expect(store.getState().mobSession.revision).toBeNull();
    storage.fail = false;
    const success = await store.getState().outputMobGuide();
    expect(success.ok).toBe(true);
    expect(success.guide?.revision).toBe(0);
  });

  it('does not commit guide output after another state-changing operation', async () => {
    store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 0));
    const runBefore = store.getState().mobSession.run;
    const result = await store.getState().outputMobGuide(async () => {
      store.getState().startNewMobRun();
    });
    expect(result.failure).toBe('invalid');
    expect(store.getState().mobSession.run).not.toBe(runBefore);
    expect(store.getState().mobSession.revision).toBeNull();
  });

  it('adopts a valid guide into a runless session and rejects an older revision', async () => {
    store.getState().addMobCandidate('alpha', 'Alpha', candidate('alpha', 0));
    const output = await store.getState().outputMobGuide();
    if (!output.guide) throw new Error('guide fixture missing');
    const guide = serializeMobGuide(output.guide);

    store.getState().clearAllData();
    const adopted = store.getState().importMobGuide(guide);
    expect(adopted.ok).toBe(true);
    expect(store.getState().mobSession.run).toBe(output.guide.run);
    expect(store.getState().mobSession.revision).toBe(0);

    const older = serializeMobGuide({ ...output.guide, revision: 0, issuedAt: '2026-09-10T00:00:00.000Z' });
    const conflict = store.getState().importMobGuide(older);
    expect(conflict.failure).toBe('guide-conflict');
  });
});
