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

function registrationById(
  session: TreasureSessionState,
  registrationId: string,
): TreasureRegistration | undefined {
  return session.registrations.find(
    (registration) => registration.registrationId === registrationId,
  );
}

export function selectTreasureRegistration(
  session: TreasureSessionState,
  registrationId: string | null,
): TreasureSessionState | null {
  if (registrationId !== null && !registrationById(session, registrationId)) {
    return null;
  }
  if (session.listSelection === registrationId) return session;
  return { ...session, listSelection: registrationId };
}

export function playTreasureSelection(
  session: TreasureSessionState,
): TreasureSessionState {
  const target = session.listSelection ?? nextUncompletedRegistration(session, null);
  if (target === session.currentTarget) return session;
  return { ...session, currentTarget: target };
}

export function playTreasureRegistration(
  session: TreasureSessionState,
  registrationId: string,
): TreasureSessionState | null {
  if (!registrationById(session, registrationId)) return null;
  if (
    session.listSelection === registrationId &&
    session.currentTarget === registrationId
  ) {
    return session;
  }
  return {
    ...session,
    listSelection: registrationId,
    currentTarget: registrationId,
  };
}

export function ensureTreasureCurrentTarget(
  session: TreasureSessionState,
): TreasureSessionState {
  if (session.currentTarget !== null) return session;
  const target = nextUncompletedRegistration(session, null);
  return target === null ? session : { ...session, currentTarget: target };
}

function setTreasureCompletion(
  session: TreasureSessionState,
  registrationId: string,
  completed: boolean,
): TreasureSessionState | null {
  const registration = registrationById(session, registrationId);
  if (!registration || registration.completed === completed) return null;
  return deriveTreasureSession({
    ...session,
    registrations: session.registrations.map((entry) =>
      entry.registrationId === registrationId
        ? { ...entry, completed }
        : entry,
    ),
  });
}

export function advanceTreasureTarget(
  session: TreasureSessionState,
): TreasureSessionState | null {
  const currentId = session.currentTarget;
  const current = currentId === null ? undefined : registrationById(session, currentId);
  if (!current || current.completed) return null;
  const completedSession = replaceTreasureMapCurrentLocation(
    {
      ...session,
      registrations: session.registrations.map((registration) =>
        registration.registrationId === current.registrationId
          ? { ...registration, completed: true }
          : registration,
      ),
    },
    current.pointRef,
  );
  return deriveTreasureSession({
    ...completedSession,
    currentTarget: nextUncompletedRegistration(
      completedSession,
      current.registrationId,
    ),
  });
}

export function completeTreasureRegistration(
  session: TreasureSessionState,
  registrationId: string,
): TreasureSessionState | null {
  const registration = registrationById(session, registrationId);
  if (!registration || registration.completed) return null;
  return setTreasureCompletion(
    replaceTreasureMapCurrentLocation(session, registration.pointRef),
    registrationId,
    true,
  );
}

export function cancelTreasureRegistration(
  session: TreasureSessionState,
  registrationId: string,
): TreasureSessionState | null {
  return setTreasureCompletion(session, registrationId, false);
}

export function removeTreasureRegistration(
  session: TreasureSessionState,
  registrationId: string,
): TreasureSessionState | null {
  if (!registrationById(session, registrationId)) return null;
  return deriveTreasureSession({
    ...session,
    registrations: session.registrations.filter(
      (registration) => registration.registrationId !== registrationId,
    ),
    playlistOrder: session.playlistOrder.filter((id) => id !== registrationId),
    listSelection:
      session.listSelection === registrationId ? null : session.listSelection,
    currentTarget:
      session.currentTarget === registrationId ? null : session.currentTarget,
  });
}

export function moveTreasureRegistration(
  session: TreasureSessionState,
  registrationId: string,
  direction: "up" | "down",
): TreasureSessionState | null {
  const index = session.playlistOrder.indexOf(registrationId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= session.playlistOrder.length) {
    return null;
  }
  const playlistOrder = [...session.playlistOrder];
  [playlistOrder[index], playlistOrder[target]] = [
    playlistOrder[target]!,
    playlistOrder[index]!,
  ];
  return deriveTreasureSession({ ...session, playlistOrder, orderMode: "manual" });
}

export function setTreasureManualOrder(
  session: TreasureSessionState,
): TreasureSessionState {
  return deriveTreasureSession({ ...session, orderMode: "manual" });
}

export function reorderTreasureRegistrations(
  session: TreasureSessionState,
  activeRegistrationId: string,
  overRegistrationId: string,
): TreasureSessionState | null {
  const index = session.playlistOrder.indexOf(activeRegistrationId);
  const target = session.playlistOrder.indexOf(overRegistrationId);
  if (index < 0 || target < 0) return null;
  if (index === target) return session;
  const playlistOrder = [...session.playlistOrder];
  const [moved] = playlistOrder.splice(index, 1);
  if (!moved) return null;
  playlistOrder.splice(target, 0, moved);
  return deriveTreasureSession({ ...session, playlistOrder, orderMode: "manual" });
}

export function restoreTreasureSessionState(
  session: TreasureSessionState,
  listSelection: string | null,
): TreasureSessionState {
  return { ...cloneTreasureSession(session), listSelection };
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
