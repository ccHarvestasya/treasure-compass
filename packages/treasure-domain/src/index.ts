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
