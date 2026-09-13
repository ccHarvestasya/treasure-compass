import { treasurePointRefsEqual } from "@treasure-compass/treasure-domain";
import type { MasterIdentity } from "@/persistence/storage";
import type {
  TreasureCatalog,
  TreasurePointRef,
  TreasureSessionState,
  TreasureUnresolvedReference,
} from "@/types";

function masterIdentityEqual(
  left: MasterIdentity,
  right: TreasureCatalog["masterIdentity"],
): boolean {
  return left.mapSchemaVersion === right.mapSchemaVersion &&
    left.mapDataRevision === right.mapDataRevision &&
    left.appSchemaVersion === right.appSchemaVersion &&
    left.appDataRevision === right.appDataRevision;
}

function candidateExists(
  catalog: TreasureCatalog | null,
  pointRef: TreasurePointRef,
): boolean {
  return catalog?.candidates.some((candidate) =>
    treasurePointRefsEqual(candidate.pointRef, pointRef),
  ) ?? false;
}

export function buildUnresolvedReferences(
  session: TreasureSessionState,
  catalog: TreasureCatalog | null,
  persistedMasterIdentity: MasterIdentity | null,
): TreasureUnresolvedReference[] {
  const reason = (
    pointRef: TreasurePointRef,
  ): TreasureUnresolvedReference["reason"] | null => {
    if (!catalog) return "master-not-loaded";
    if (candidateExists(catalog, pointRef)) return null;
    return persistedMasterIdentity && !masterIdentityEqual(
      persistedMasterIdentity,
      catalog.masterIdentity,
    )
      ? "master-identity-mismatch"
      : "point-ref-not-found";
  };
  const unresolved: TreasureUnresolvedReference[] = [];
  for (const registration of session.registrations) {
    const unresolvedReason = reason(registration.pointRef);
    if (unresolvedReason) {
      unresolved.push({
        registrationId: registration.registrationId,
        memberName: registration.memberName,
        pointRef: { ...registration.pointRef },
        reason: unresolvedReason,
        source: "registration",
      });
    }
  }
  if (session.currentTarget) {
    const registration = session.registrations.find(
      (entry) => entry.registrationId === session.currentTarget,
    );
    const unresolvedReason = registration ? reason(registration.pointRef) : null;
    if (registration && unresolvedReason) {
      unresolved.push({
        registrationId: registration.registrationId,
        memberName: registration.memberName,
        pointRef: { ...registration.pointRef },
        reason: unresolvedReason,
        source: "currentTarget",
      });
    }
  }
  for (const location of session.mapCurrentLocations) {
    const unresolvedReason = reason(location.pointRef);
    if (unresolvedReason) {
      unresolved.push({
        registrationId: null,
        pointRef: { ...location.pointRef },
        reason: unresolvedReason,
        source: "mapCurrentLocation",
      });
    }
  }
  return unresolved;
}
