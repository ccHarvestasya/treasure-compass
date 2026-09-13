export const TREASURE_MEMBER_SLOTS = 8;

export const TREASURE_VERSIONS = ["3.x", "4.x", "5.x", "6.x", "7.x"] as const;

export type TreasureVersion = (typeof TREASURE_VERSIONS)[number];

export interface TreasurePointRef {
  readonly gradeSetId: string;
  readonly mapId: string;
  readonly pointId: string;
}

export interface TreasureRegistration {
  readonly registrationId: string;
  readonly memberName: string;
  readonly version: TreasureVersion;
  readonly pointRef: TreasurePointRef;
  readonly completed: boolean;
  readonly playlistPosition: number;
}

export interface MapCurrentLocation {
  readonly mapId: string;
  readonly pointRef: TreasurePointRef;
}

export interface TreasureRouteReference {
  readonly registrationId: string;
  readonly pointRef: TreasurePointRef;
}

export type TreasureOrderMode = "auto" | "manual";

export interface TreasureSessionState {
  readonly registrations: readonly TreasureRegistration[];
  readonly playlistOrder: readonly string[];
  readonly orderMode: TreasureOrderMode;
  readonly listSelection: string | null;
  readonly currentTarget: string | null;
  readonly mapCurrentLocations: readonly MapCurrentLocation[];
  readonly incompleteRoute: readonly TreasureRouteReference[];
}

export function treasurePointRefKey(ref: TreasurePointRef): string {
  return `${ref.gradeSetId}:${ref.mapId}:${ref.pointId}`;
}

export function treasurePointRefsEqual(
  left: TreasurePointRef,
  right: TreasurePointRef,
): boolean {
  return left.gradeSetId === right.gradeSetId &&
    left.mapId === right.mapId &&
    left.pointId === right.pointId;
}

export function cloneTreasureSession(
  session: TreasureSessionState,
): TreasureSessionState {
  return {
    registrations: session.registrations.map((registration) => ({
      ...registration,
      pointRef: { ...registration.pointRef },
    })),
    playlistOrder: [...session.playlistOrder],
    orderMode: session.orderMode,
    listSelection: session.listSelection,
    currentTarget: session.currentTarget,
    mapCurrentLocations: session.mapCurrentLocations.map((location) => ({
      ...location,
      pointRef: { ...location.pointRef },
    })),
    incompleteRoute: session.incompleteRoute.map((route) => ({
      ...route,
      pointRef: { ...route.pointRef },
    })),
  };
}

export function deriveTreasureSession(
  session: TreasureSessionState,
): TreasureSessionState {
  const registrations = session.registrations.map((registration, index) => ({
    ...registration,
    playlistPosition:
      session.playlistOrder.indexOf(registration.registrationId) >= 0
        ? session.playlistOrder.indexOf(registration.registrationId)
        : index,
  }));
  const byId = new Map(
    registrations.map((registration) => [registration.registrationId, registration]),
  );
  return {
    ...session,
    registrations,
    incompleteRoute: session.playlistOrder.flatMap((registrationId) => {
      const registration = byId.get(registrationId);
      return registration && !registration.completed
        ? [{ registrationId, pointRef: { ...registration.pointRef } }]
        : [];
    }),
  };
}

export function replaceTreasureMapCurrentLocation(
  session: TreasureSessionState,
  pointRef: TreasurePointRef,
): TreasureSessionState {
  return {
    ...session,
    mapCurrentLocations: [
      ...session.mapCurrentLocations.filter((location) => location.mapId !== pointRef.mapId),
      { mapId: pointRef.mapId, pointRef: { ...pointRef } },
    ],
  };
}

export function fillTreasureAutoOrder(
  oldOrder: readonly string[],
  registrations: readonly TreasureRegistration[],
  calculatedOrder: readonly string[],
): string[] {
  const byId = new Map(
    registrations.map((registration) => [registration.registrationId, registration]),
  );
  const calculated = [...calculatedOrder];
  return oldOrder
    .map((id) => {
      const registration = byId.get(id);
      if (!registration || registration.completed) return id;
      const next = calculated.shift();
      return next ?? id;
    })
    .concat(calculated);
}

export function normalizeTreasureMemberName(value: string): string {
  return value.trim().normalize("NFC");
}

export function nextUncompletedRegistration(
  session: Pick<TreasureSessionState, "registrations" | "playlistOrder">,
  startAfter: string | null = null,
): string | null {
  const byId = new Map(
    session.registrations.map((registration) => [
      registration.registrationId,
      registration,
    ]),
  );
  const order = session.playlistOrder;
  const start = startAfter === null ? -1 : order.indexOf(startAfter);
  for (let offset = 1; offset <= order.length; offset += 1) {
    const registration = byId.get(order[(start + offset) % order.length]);
    if (registration && !registration.completed) return registration.registrationId;
  }
  return null;
}
