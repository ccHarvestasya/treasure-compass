import type { MapDataItem, Point, RouteStep } from "@/types";

function calcDistance(a: Point, b: Point): number {
  return Math.hypot(b.posX - a.posX, b.posY - a.posY);
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += 1) {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const permutation of permutations(rest)) {
      result.push([items[index]!, ...permutation]);
    }
  }
  return result;
}

function mapKey(map: { mapId?: string; mapNo: number }): string {
  return map.mapId?.normalize("NFC") ?? String(map.mapNo);
}

function compareCodePointStrings(left: string, right: string): number {
  const leftPoints = Array.from(left);
  const rightPoints = Array.from(right);
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    const leftCodePoint = leftPoints[index]!.codePointAt(0)!;
    const rightCodePoint = rightPoints[index]!.codePointAt(0)!;
    if (leftCodePoint !== rightCodePoint) return leftCodePoint - rightCodePoint;
  }
  return leftPoints.length - rightPoints.length;
}

function comparePoint(left: Point | undefined, right: Point | undefined): number {
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;
  return left.posX - right.posX || left.posY - right.posY || compareCodePointStrings(left.stableId ?? "", right.stableId ?? "");
}

function compareRouteSteps(
  left: Array<{ registrationId?: string; mapId?: string; mapNo: number; startPoint?: Point; point: Point }>,
  right: Array<{ registrationId?: string; mapId?: string; mapNo: number; startPoint?: Point; point: Point }>,
): number {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftStep = left[index];
    const rightStep = right[index];
    if (!leftStep && !rightStep) continue;
    if (!leftStep) return -1;
    if (!rightStep) return 1;
    const mapComparison = compareCodePointStrings(
      (leftStep.mapId ?? String(leftStep.mapNo)).normalize("NFC"),
      (rightStep.mapId ?? String(rightStep.mapNo)).normalize("NFC"),
    );
    if (mapComparison !== 0) return mapComparison;
    const xComparison = leftStep.point.posX - rightStep.point.posX;
    if (xComparison !== 0) return xComparison;
    const yComparison = leftStep.point.posY - rightStep.point.posY;
    if (yComparison !== 0) return yComparison;
    const targetComparison = compareCodePointStrings(
      leftStep.point.stableId ?? leftStep.registrationId ?? "",
      rightStep.point.stableId ?? rightStep.registrationId ?? "",
    );
    if (targetComparison !== 0) return targetComparison;
  }
  for (let index = 0; index < length; index += 1) {
    const leftStep = left[index];
    const rightStep = right[index];
    if (!leftStep && !rightStep) continue;
    if (!leftStep) return -1;
    if (!rightStep) return 1;
    const startComparison = comparePoint(leftStep.startPoint, rightStep.startPoint);
    if (startComparison !== 0) return startComparison;
  }
  return 0;
}

export interface ShortestRouteInput {
  registrationId?: string;
  memberNo: number;
  memberName: string;
  mapId?: string;
  mapNo: number;
  mapName: string;
  mapNameShort: string;
  mapPoint: Point;
}

export interface ShortestRouteResult {
  orderedSteps: Array<{
    registrationId?: string;
    memberNo: number;
    mapId?: string;
    mapNo: number;
    mapName: string;
    mapNameShort: string;
    memberName: string;
    point: Point;
    startPoint?: Point;
    teleportPoint?: Point;
  }>;
  totalDistance: number;
  tieCandidates?: Array<{
    orderedSteps: ShortestRouteResult["orderedSteps"];
    totalDistance: number;
  }>;
  failure?: { reason: "missing-aetheryte"; mapNos: number[] };
}

/** マップ遷移数を先に固定し、同一マップ内の X/Y 距離だけを最小化する。 */
export function calcShortestRoute(
  members: ShortestRouteInput[],
  allMapData: MapDataItem[],
  currentMapPoints: Readonly<Record<string, Point>> = {},
): ShortestRouteResult {
  if (members.length === 0) return { orderedSteps: [], totalDistance: 0 };
  const mapGroups = new Map<string, ShortestRouteInput[]>();
  for (const member of members) {
    const key = member.mapId ?? String(member.mapNo);
    const group = mapGroups.get(key) ?? [];
    group.push(member);
    mapGroups.set(key, group);
  }

  let bestSteps: ShortestRouteResult["orderedSteps"] = [];
  let bestDistance = Infinity;
  const bestTieCandidates: Array<{
    orderedSteps: ShortestRouteResult["orderedSteps"];
    totalDistance: number;
  }> = [];
  const mapOrders = permutations([...mapGroups.keys()]);

  for (const mapOrder of mapOrders) {
    let totalDistance = 0;
    const steps: ShortestRouteResult["orderedSteps"] = [];
    const mapCandidateGroups: ShortestRouteResult["orderedSteps"][][] = [];
    for (const key of mapOrder) {
      const group = mapGroups.get(key)!;
      const mapInfo = allMapData.find((map) => mapKey(map) === key);
      const teleportPoints = mapInfo?.point.filter((point) => point.division === "T") ?? [];
      const currentPoint = currentMapPoints[key];
      let bestMapDistance = Infinity;
      const bestMapCandidates: ShortestRouteResult["orderedSteps"][] = [];

      const starts: Array<{ startPoint: Point; teleportPoint?: Point }> =
        currentPoint
          ? [{ startPoint: currentPoint }]
          : teleportPoints.map((point) => ({ startPoint: point, teleportPoint: point }));
      if (starts.length === 0) {
        return {
          orderedSteps: [],
          totalDistance: Infinity,
          failure: { reason: "missing-aetheryte", mapNos: [group[0]!.mapNo] },
        };
      }

      for (const start of starts) {
        for (const order of permutations(group)) {
          let distance = 0;
          let current: Point | null = start.startPoint;
          for (const member of order) {
            if (current) distance += calcDistance(current, member.mapPoint);
            current = member.mapPoint;
          }
          const candidateSteps = order.map((member, index) => ({
            registrationId: member.registrationId,
            memberNo: member.memberNo,
            mapId: member.mapId,
            mapNo: member.mapNo,
            mapName: member.mapName,
            mapNameShort: member.mapNameShort,
            memberName: member.memberName,
            point: member.mapPoint,
            ...(index === 0 ? { startPoint: start.startPoint } : {}),
            ...(index === 0 && start.teleportPoint
              ? { teleportPoint: start.teleportPoint }
              : {}),
          }));
          if (distance < bestMapDistance) {
            bestMapDistance = distance;
            bestMapCandidates.length = 0;
            bestMapCandidates.push(candidateSteps);
          } else if (distance === bestMapDistance) {
            bestMapCandidates.push(candidateSteps);
          }
        }
      }
      bestMapCandidates.sort((left, right) => compareRouteSteps(left, right));
      const bestMapSteps = bestMapCandidates[0] ?? [];
      totalDistance += bestMapDistance;
      steps.push(...bestMapSteps);
      mapCandidateGroups.push(bestMapCandidates);
    }

    const routeCandidates: ShortestRouteResult["orderedSteps"][] = [steps];
    let offset = 0;
    for (const candidates of mapCandidateGroups) {
      const selected = candidates[0] ?? [];
      for (const alternative of candidates.slice(1)) {
        routeCandidates.push([
          ...steps.slice(0, offset),
          ...alternative,
          ...steps.slice(offset + selected.length),
        ]);
      }
      offset += selected.length;
    }
    for (const routeCandidate of routeCandidates) {
      if (totalDistance < bestDistance) {
        bestDistance = totalDistance;
        bestSteps = routeCandidate;
        bestTieCandidates.length = 0;
        bestTieCandidates.push({ orderedSteps: routeCandidate, totalDistance });
      } else if (totalDistance === bestDistance) {
        bestTieCandidates.push({ orderedSteps: routeCandidate, totalDistance });
        if (compareRouteSteps(routeCandidate, bestSteps) < 0) bestSteps = routeCandidate;
      }
    }
  }
  const uniqueCandidates = new Map<string, { orderedSteps: ShortestRouteResult["orderedSteps"]; totalDistance: number }>();
  for (const candidate of bestTieCandidates) {
    const key = candidate.orderedSteps.map((step) =>
      `${step.mapId ?? step.mapNo}:${step.point.posX}:${step.point.posY}:${step.point.stableId ?? step.registrationId ?? ""}:${step.startPoint?.stableId ?? ""}`,
    ).join("|");
    uniqueCandidates.set(key, candidate);
  }
  const tieCandidates = [...uniqueCandidates.values()].sort((left, right) =>
    compareRouteSteps(left.orderedSteps, right.orderedSteps),
  );
  return {
    orderedSteps: bestSteps,
    totalDistance: bestDistance,
    tieCandidates,
  };
}

export function toRouteSteps(
  result: ShortestRouteResult["orderedSteps"],
): RouteStep[] {
  return result.map((step, index) => ({
    orderNo: index + 1,
    registrationId: step.registrationId,
    memberNo: step.memberNo,
    mapId: step.mapId,
    mapNo: step.mapNo,
    mapName: step.mapName,
    mapNameShort: step.mapNameShort,
    memberName: step.memberName,
    point: step.point,
    startPoint: step.startPoint,
    teleportPoint: step.teleportPoint,
    isCompleted: false,
  }));
}
