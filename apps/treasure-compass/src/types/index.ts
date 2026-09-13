import type {
  TreasurePointRef,
  TreasureSessionState,
  TreasureVersion,
} from "@treasure-compass/treasure-domain";

export type {
  MapCurrentLocation,
  TreasureOrderMode,
  TreasurePointRef,
  TreasureRegistration,
  TreasureRouteReference,
  TreasureSessionState,
  TreasureVersion,
} from "@treasure-compass/treasure-domain";

/** 内部 legacy lookup でのみ使用するグレード番号。利用者向け表示には使わない。 */
export type Grade = number;

export type PointDivision = "P" | "T" | "R" | "Z";

export interface Point {
  stableId?: string;
  mapId?: string;
  gradeSetId?: string;
  grade?: Grade;
  version?: TreasureVersion;
  pointNo: number;
  division: PointDivision;
  block: string;
  posX: number;
  posY: number;
  posZ: number;
  posT: number;
  time: number;
  pointName: string;
}

export interface MapDataItem {
  mapId?: string;
  region: string;
  mapNo: number;
  mapName: string;
  mapNameShort: string;
  point: Point[];
}

export interface MapData {
  mapSize: number;
  mapData: MapDataItem[];
}

export interface TreasureCandidate {
  pointRef: TreasurePointRef;
  grade: Grade;
  version: TreasureVersion;
  point: Point;
  map: MapDataItem;
}

export interface TreasureCatalog {
  mapData: MapData;
  candidates: TreasureCandidate[];
  masterIdentity: {
    mapSchemaVersion: number;
    mapDataRevision: string;
    appSchemaVersion: number;
    appDataRevision: string;
  };
}

export interface UserItem {
  memberNo: number;
  memberName: string;
  mapNo: number;
  mapName: string;
  mapNameShort: string;
  mapPoint: Point;
  registrationId?: string;
  pointRef?: TreasurePointRef;
  version?: TreasureVersion;
  completed?: boolean;
}

export interface RouteStep {
  registrationId?: string;
  mapId?: string;
  orderNo: number;
  memberNo: number;
  mapNo: number;
  mapName: string;
  mapNameShort: string;
  memberName: string;
  point: Point;
  startPoint?: Point;
  teleportPoint?: Point;
  isCompleted: boolean;
}

export interface RouteTieCandidate {
  readonly route: RouteStep[];
  readonly totalDistance: number;
}

export type TreasureUnresolvedReason =
  | "master-not-loaded"
  | "master-identity-mismatch"
  | "point-ref-not-found";

export interface TreasureUnresolvedReference {
  registrationId: string | null;
  memberName?: string;
  pointRef: TreasurePointRef;
  reason: TreasureUnresolvedReason;
  source: "registration" | "currentTarget" | "mapCurrentLocation";
}

export interface TreasureSession extends TreasureSessionState {
  readonly sessionRevision: number;
}

export interface ShortestPathResult {
  steps: RouteStep[];
  totalDistance: number;
}

export type LoadStatus = "idle" | "loading" | "success" | "error";
