import {
  deriveTreasureSession,
  fillTreasureAutoOrder,
  treasurePointRefKey,
  treasurePointRefsEqual,
} from "@treasure-compass/treasure-domain";
import type {
  Point,
  RouteStep,
  RouteTieCandidate,
  TreasureCatalog,
  TreasureSessionState,
} from "@/types";
import { calcShortestRoute } from "@/utils/distance";

function routeInputs(session: TreasureSessionState, catalog: TreasureCatalog) {
  return session.registrations.flatMap((registration) => {
    if (registration.completed) return [];
    const candidate = catalog.candidates.find((entry) =>
      treasurePointRefsEqual(entry.pointRef, registration.pointRef),
    );
    if (!candidate) return [];
    return [{
      registrationId: registration.registrationId,
      memberNo: session.registrations.indexOf(registration),
      memberName: registration.memberName,
      mapId: candidate.map.mapId,
      mapNo: candidate.map.mapNo,
      mapName: candidate.map.mapName,
      mapNameShort: candidate.map.mapNameShort,
      mapPoint: candidate.point,
    }];
  });
}

function mapCurrentPoints(
  session: TreasureSessionState,
  catalog: TreasureCatalog,
): Record<string, Point> {
  const result: Record<string, Point> = {};
  for (const location of session.mapCurrentLocations) {
    const candidate = catalog.candidates.find((entry) =>
      treasurePointRefsEqual(entry.pointRef, location.pointRef),
    );
    if (candidate) result[location.mapId] = candidate.point;
  }
  return result;
}

function toRouteSteps(
  orderedSteps: ReturnType<typeof calcShortestRoute>["orderedSteps"],
): RouteStep[] {
  return orderedSteps.map((step, index) => ({
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

export function projectTreasureRoute(
  session: TreasureSessionState,
  catalog: TreasureCatalog | null,
): { route: RouteStep[]; tieCandidates: RouteTieCandidate[] } {
  if (!catalog) return { route: [], tieCandidates: [] };

  if (session.orderMode === "auto") {
    const inputs = routeInputs(session, catalog);
    if (inputs.length === 0) return { route: [], tieCandidates: [] };
    const result = calcShortestRoute(
      inputs,
      catalog.mapData.mapData,
      mapCurrentPoints(session, catalog),
    );
    if (result.failure) return { route: [], tieCandidates: [] };
    return {
      route: toRouteSteps(result.orderedSteps),
      tieCandidates: (result.tieCandidates ?? []).map((candidate) => ({
        route: toRouteSteps(candidate.orderedSteps),
        totalDistance: candidate.totalDistance,
      })),
    };
  }

  const byRef = new Map(
    catalog.candidates.map((candidate) => [treasurePointRefKey(candidate.pointRef), candidate]),
  );
  const route = session.incompleteRoute
    .flatMap((reference) => {
      const registration = session.registrations.find(
        (entry) => entry.registrationId === reference.registrationId,
      );
      const candidate = byRef.get(treasurePointRefKey(reference.pointRef));
      if (!registration || !candidate) return [];
      return [{
        orderNo: 0,
        registrationId: registration.registrationId,
        memberNo: session.registrations.indexOf(registration),
        mapId: candidate.map.mapId,
        mapNo: candidate.map.mapNo,
        mapName: candidate.map.mapName,
        mapNameShort: candidate.map.mapNameShort,
        memberName: registration.memberName,
        point: candidate.point,
        isCompleted: registration.completed,
      } satisfies RouteStep];
    })
    .map((step, index) => ({ ...step, orderNo: index + 1 }));
  return { route, tieCandidates: [] };
}

export function calculateTreasureSession(
  session: TreasureSessionState,
  catalog: TreasureCatalog | null,
): { session: TreasureSessionState; routeError: string | null } {
  const prepared = deriveTreasureSession(session);
  if (prepared.orderMode === "manual" || !catalog) {
    return { session: prepared, routeError: null };
  }
  const inputs = routeInputs(prepared, catalog);
  if (inputs.length === 0) return { session: prepared, routeError: null };
  const result = calcShortestRoute(
    inputs,
    catalog.mapData.mapData,
    mapCurrentPoints(prepared, catalog),
  );
  if (result.failure) {
    return {
      session: prepared,
      routeError: `有効なエーテライトがないマップ: ${result.failure.mapNos.join(", ")}`,
    };
  }
  const calculatedOrder = result.orderedSteps.flatMap((step) =>
    step.registrationId ? [step.registrationId] : [],
  );
  const playlistOrder = fillTreasureAutoOrder(
    prepared.playlistOrder,
    prepared.registrations,
    calculatedOrder,
  );
  return {
    session: deriveTreasureSession({ ...prepared, playlistOrder }),
    routeError: null,
  };
}
