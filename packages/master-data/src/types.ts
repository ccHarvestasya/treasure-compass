import type { MapBounds } from "@treasure-compass/map-core";

export interface SourceRecord {
  readonly id: string;
  readonly label: string;
  readonly reference: string;
  readonly verifiedAt: string;
}

export interface LicenseRecord {
  readonly id: string;
  readonly name: string;
  readonly notice: string;
}

export interface ExpansionRecord {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly sourceIds: readonly string[];
}

export interface AetheryteRecord {
  readonly id: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly sourceIds: readonly string[];
}

export interface MapRecord {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly aliases: readonly string[];
  readonly expansionId: string;
  readonly sourceIds: readonly string[];
  readonly bounds: MapBounds;
  readonly image: { readonly asset: string; readonly licenseId: string };
  readonly aetherytes: readonly AetheryteRecord[];
}

export interface TravelEdgeRecord {
  readonly fromMapId: string;
  readonly toAetheryteId: string;
  readonly fee: number;
  readonly loadTime: number;
  readonly sourceIds: readonly string[];
}

export interface MapMasterV1 {
  readonly schemaVersion: 1;
  readonly dataRevision: string;
  readonly expansions: readonly ExpansionRecord[];
  readonly maps: readonly MapRecord[];
  readonly travelEdges: readonly TravelEdgeRecord[];
  readonly sources: readonly SourceRecord[];
  readonly licenses: readonly LicenseRecord[];
}

export interface TreasurePointRecord {
  readonly id: string;
  readonly mapId: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly sourceIds: readonly string[];
}

export interface GradeSetRecord {
  readonly id: string;
  readonly label: string;
  readonly grades: readonly number[];
  readonly sourceIds: readonly string[];
  readonly points: readonly TreasurePointRecord[];
}

export interface TreasureMasterV1 {
  readonly schemaVersion: 1;
  readonly dataRevision: string;
  readonly gradeSets: readonly GradeSetRecord[];
}

export type MobCategory = "regular" | "elite";
export type MobRank = "normal" | "b" | "a" | "s" | "ss";

export interface MobCandidateRecord {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly sourceIds: readonly string[];
}

export interface MobRecord {
  readonly id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly category: MobCategory;
  readonly rank: MobRank;
  readonly mapId: string;
  readonly sourceIds: readonly string[];
  readonly candidates: readonly MobCandidateRecord[];
}

export interface MobMasterV1 {
  readonly schemaVersion: 1;
  readonly dataRevision: string;
  readonly mobs: readonly MobRecord[];
}

export interface MasterDiagnostic {
  readonly severity: "error" | "warning";
  readonly scope: string;
  readonly recordId?: string;
  readonly code: string;
  readonly message: string;
}

export interface MasterValidationResult<T> {
  readonly usable: boolean;
  readonly data?: T;
  readonly diagnostics: readonly MasterDiagnostic[];
}
