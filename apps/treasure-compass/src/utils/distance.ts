import type { Point, MapDataItem, RouteStep } from '@/types';
/** 2点間のゲーム内 X/Y 二次元距離 */
function calcDistance(a: Point, b: Point): number {
  const dx = b.posX - a.posX;
  const dy = b.posY - a.posY;
  return Math.hypot(dx, dy);
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

function routeTieKey(
  steps: Array<{ mapNo: number; memberNo: number; point: Point }>,
): string {
  return steps
    .map((step) =>
      [step.mapNo, step.point.posX, step.point.posY, step.memberNo, step.point.pointNo].join(":"),
    )
    .join("|");
}

function memberTieKey(
  members: Array<{ memberNo: number }>,
): string {
  return members.map((member) => String(member.memberNo).padStart(4, "0")).join(",");
}

/** 最短経路の計算結果 */
export interface ShortestRouteResult {
  orderedSteps: Array<{
    memberNo: number;
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
  members: Array<{
    memberNo: number;
    memberName: string;
    mapNo: number;
    mapName: string;
    mapNameShort: string;
    mapPoint: Point;
  }>,
  allMapData: MapDataItem[],
  currentMapPoints: Readonly<Record<string, Point>> = {},
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

    for (const mapNo of mapOrder) {
      const group = mapGroups.get(mapNo)!;
      const mapInfo = allMapData.find(m => m.mapNo === mapNo);
      const teleportPoints = mapInfo?.point.filter(p => p.division === 'T') ?? [];
      const currentPoint = currentMapPoints[String(mapNo)];

      // このマップ内でのメンバー順序の最適化
      // テレポートポイントからの最短順序を計算
      let bestMapSteps: typeof steps = [];
      let bestMapDist = Infinity;

      const tryFromStart = (startPoint: Point | null, teleportPoint?: Point) => {
        for (const memberOrder of permutations(group)) {
          let dist = 0;
          let cur = startPoint;
          if (teleportPoint) cur = teleportPoint;
          for (const m of memberOrder) {
            if (cur) dist += calcDistance(cur, m.mapPoint);
            cur = m.mapPoint;
          }
          if (
            dist < bestMapDist ||
            (dist === bestMapDist &&
              memberTieKey(memberOrder) < memberTieKey(bestMapSteps))
          ) {
            bestMapDist = dist;
            bestMapSteps = memberOrder.map(m => ({
              memberNo: m.memberNo,
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

      if (currentPoint) {
        tryFromStart(currentPoint);
      } else {
        // 現在地点がないマップはエーテライトを起点とする。
        for (const tp of teleportPoints) {
          tryFromStart(null, tp);
        }
        if (teleportPoints.length === 0) tryFromStart(null);
      }

      totalDist += bestMapDist;
      steps.push(...bestMapSteps);
    }

    if (
      totalDist < bestDistance ||
      (totalDist === bestDistance && routeTieKey(steps) < routeTieKey(bestSteps))
    ) {
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
    memberNo: s.memberNo,
    mapNo: s.mapNo,
    mapName: s.mapName,
    mapNameShort: s.mapNameShort,
    memberName: s.memberName,
    point: s.point,
    teleportPoint: s.teleportPoint,
    isCompleted: false,
  }));
}
