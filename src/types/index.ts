/** グレード番号。constants/index.ts の GRADE_CONFIG に追加するだけで新グレードが使えます。 */
export type Grade = number;

export type PointDivision = 'P' | 'T' | 'R' | 'Z';

export interface Point {
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

export interface UserItem {
  memberNo: number;
  memberName: string;
  mapNo: number;
  mapName: string;
  mapNameShort: string;
  mapPoint: Point;
}

export interface RouteStep {
  orderNo: number;
  mapNo: number;
  mapName: string;
  mapNameShort: string;
  memberName: string;
  point: Point;
  teleportPoint?: Point;
  isCompleted: boolean;
}

export interface ShortestPathResult {
  steps: RouteStep[];
  totalDistance: number;
}

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';
