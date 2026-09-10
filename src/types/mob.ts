import type { Point } from './index';

export type Product = 'treasure' | 'mob';
export type MobMode = 'auto' | 'manual';
export type MobClassification = 'confirmed' | 'candidate';
export type MobRouteStatus = 'empty' | 'ready' | 'failure' | 'stale';

export interface MobMasterMap {
  id: string;
  name: string;
  aliases?: string[];
  mapNo?: number;
  mapNameShort?: string;
  image?: string;
  validRange?: { min: number; max: number };
}

export interface MobMasterLocation {
  mapId: string;
  x: number;
  y: number;
  /** 高さは表示用の補足情報であり、candidate identity や route には使わない。 */
  z?: number;
  classification: MobClassification;
  point?: Point;
}

export interface MobMasterMob {
  id: string;
  name: string;
  aliases?: string[];
  locations: MobMasterLocation[];
}

export interface MobMovementOption {
  fromMapId: string;
  toMapId: string;
  fee?: number;
  loadTime?: number;
  teleportPoint?: Point;
}

export interface MobMasterData {
  identity: string;
  generation: number;
  maps: MobMasterMap[];
  mobs: MobMasterMob[];
  movement: MobMovementOption[];
}

export interface MobCandidate {
  id: string;
  mapId: string;
  mapName: string;
  mapNameShort: string;
  mapNo?: number;
  x: number;
  y: number;
  classification: MobClassification;
  userConfirmed: boolean;
}

export interface MobTarget {
  mobId: string;
  mobName: string;
  candidates: Record<string, MobCandidate>;
  complete: boolean;
}

export interface MobSelection {
  mobId: string;
  candidateId: string;
  mapId: string;
  x: number;
  y: number;
}

export interface MobRouteStep {
  order: number;
  mobId: string;
  mobName: string;
  candidateId: string;
  mapId: string;
  mapName: string;
  mapNameShort: string;
  mapNo?: number;
  x: number;
  y: number;
  classification: MobClassification;
  userConfirmed: boolean;
  complete: boolean;
  teleportPoint?: Point;
}

export interface MobRouteAlternative {
  selection: MobSelection;
  fee?: number;
  loadTime?: number;
}

export interface MobRouteTie {
  mobId: string;
  selectedCandidateId: string;
  alternatives: MobRouteAlternative[];
}

export interface MobRouteState {
  status: MobRouteStatus;
  steps: MobRouteStep[];
  order: string[];
  transitions: number | 'unknown';
  fee?: number;
  loadTime?: number;
  ties: MobRouteTie[];
  failure?: MobFailureReason;
  sessionVersion: number;
  masterGeneration: number;
}

export type MobFailureReason =
  | 'no-master'
  | 'invalid-target'
  | 'candidate-unavailable'
  | 'movement-data-missing'
  | 'supplement-missing'
  | 'stale-result'
  | 'master-mismatch';

export interface MobGuideCandidate {
  mobId: string;
  mobName: string;
  candidateId: string;
  mapId: string;
  x: number;
  y: number;
  classification: MobClassification;
  confirmation: 'confirmed' | 'unconfirmed';
}

export interface MobGuideItem {
  order: number | '-';
  mobId: string;
  mobName: string;
  selectedCandidateId: string | 'none';
  completion: 'complete' | 'incomplete';
}

export interface MobGuideSnapshot {
  run: string;
  revision: number;
  issuedAt: string;
  mode: MobMode;
  transitions: number | 'unknown';
  candidates: MobGuideCandidate[];
  items: MobGuideItem[];
}

export interface MobSession {
  run: string | null;
  revision: number | null;
  issuedAt: string | null;
  mode: MobMode | null;
  targets: Record<string, MobTarget>;
  manualOrder: string[];
  currentSelections: Record<string, MobSelection>;
  selectionHistory: Record<string, MobSelection>;
  route: MobRouteState;
  acceptedGuide: MobGuideSnapshot | null;
  sessionVersion: number;
}

export type MobOperationFailure =
  | 'invalid'
  | 'conflict'
  | 'duplicate'
  | 'guide-malformed'
  | 'guide-different-run'
  | 'guide-stale'
  | 'guide-duplicate'
  | 'guide-conflict'
  | 'guide-newer'
  | 'master-mismatch'
  | 'route-calculation'
  | 'persistence-write';

export interface MobOperationResult {
  ok: boolean;
  kind?: 'accepted' | 'duplicate' | 'invalid' | 'conflict' | 'failure';
  failure?: MobOperationFailure;
  reason?: string;
  rowResults?: MobRowResult[];
  guide?: MobGuideSnapshot;
}

export interface MobRowResult {
  status: 'valid' | 'duplicate' | 'invalid' | 'conflict';
  reason?: string;
  mobId?: string;
  candidateId?: string;
}
