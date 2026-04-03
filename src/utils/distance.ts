import type { Point, MapDataItem, RouteStep } from '@/types';
import { TELEPORT_TIME_COST } from '@/constants';

/** 2点間の3D距離（テレポートタイムコスト込み） */
function calcDistance(a: Point, b: Point): number {
  const dx = b.posX - a.posX;
  const dy = b.posY - a.posY;
  const dz = b.posZ - a.posZ;
  const teleportCost = b.division === 'T' ? TELEPORT_TIME_COST : 0;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) + teleportCost;
}

/** 配列の順列をすべて生成 */
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

/** 最短経路の計算結果 */
export interface ShortestRouteResult {
  orderedSteps: Array<{
    mapNo: number;
    mapName: string;
    mapNameShort: string;
    memberName: string;
    point: Point;
    teleportPoint?: Point;
  }>;
  totalDistance: number;
}

/** 
 * メンバーリストから最短巡回経路を計算する
 * マップごとにグループ化し、テレポートポイントを始点として
 * permutationで全パターンを評価する
 */
export function calcShortestRoute(
  members: Array<{ memberName: string; mapNo: number; mapName: string; mapNameShort: string; mapPoint: Point }>,
  allMapData: MapDataItem[],
): ShortestRouteResult {
  // マップNoでグループ化
  const mapGroups = new Map<number, typeof members>();
  for (const m of members) {
    const arr = mapGroups.get(m.mapNo) ?? [];
    arr.push(m);
    mapGroups.set(m.mapNo, arr);
  }

  // マップが1つしかない場合も含めて、マップ訪問順の最適化
  const mapNos = Array.from(mapGroups.keys());

  let bestSteps: ShortestRouteResult['orderedSteps'] = [];
  let bestDistance = Infinity;

  // マップ訪問順の全順列を試す（マップ数が少ないので許容範囲）
  for (const mapOrder of permutations(mapNos)) {
    let totalDist = 0;
    const steps: ShortestRouteResult['orderedSteps'] = [];
    let prevPoint: Point | null = null;

    for (const mapNo of mapOrder) {
      const group = mapGroups.get(mapNo)!;
      const mapInfo = allMapData.find(m => m.mapNo === mapNo);
      const teleportPoints = mapInfo?.point.filter(p => p.division === 'T') ?? [];

      // このマップ内でのメンバー順序の最適化
      // テレポートポイントからの最短順序を計算
      let bestMapSteps: typeof steps = [];
      let bestMapDist = Infinity;

      const tryFromStart = (startPoint: Point | null, teleportPoint?: Point) => {
        for (const memberOrder of permutations(group)) {
          let dist = 0;
          let cur = startPoint;
          if (teleportPoint && cur) {
            dist += calcDistance(cur, teleportPoint);
            cur = teleportPoint;
          }
          for (const m of memberOrder) {
            if (cur) dist += calcDistance(cur, m.mapPoint);
            cur = m.mapPoint;
          }
          if (dist < bestMapDist) {
            bestMapDist = dist;
            bestMapSteps = memberOrder.map(m => ({
              mapNo: m.mapNo,
              mapName: m.mapName,
              mapNameShort: m.mapNameShort,
              memberName: m.memberName,
              point: m.mapPoint,
              teleportPoint: teleportPoint,
            }));
            // teleportPointはマップ最初のstepにのみ付与
            if (bestMapSteps.length > 0 && teleportPoint) {
              bestMapSteps = bestMapSteps.map((s, i) => ({
                ...s,
                teleportPoint: i === 0 ? teleportPoint : undefined,
              }));
            }
          }
        }
      };

      // テレポートなし(前マップ最後の地点から直接)
      tryFromStart(prevPoint);

      // テレポートあり（各Tポイントから）
      for (const tp of teleportPoints) {
        tryFromStart(prevPoint, tp);
      }

      totalDist += bestMapDist;
      steps.push(...bestMapSteps);
      if (bestMapSteps.length > 0) {
        prevPoint = bestMapSteps[bestMapSteps.length - 1].point;
      }
    }

    if (totalDist < bestDistance) {
      bestDistance = totalDist;
      bestSteps = steps;
    }
  }

  return { orderedSteps: bestSteps, totalDistance: bestDistance };
}

/** RouteStep配列に変換 */
export function toRouteSteps(
  result: ShortestRouteResult['orderedSteps'],
): RouteStep[] {
  return result.map((s, i) => ({
    orderNo: i + 1,
    mapNo: s.mapNo,
    mapName: s.mapName,
    mapNameShort: s.mapNameShort,
    memberName: s.memberName,
    point: s.point,
    teleportPoint: s.teleportPoint,
    isCompleted: false,
  }));
}
