import { validateMapMaster } from "@treasure-compass/master-data";
import mapMasterJson from "@treasure-compass/master-data/data/map-master.v1.json";
import type { MobCatalog } from "@treasure-compass/mob-domain";

const mapValidation = validateMapMaster(mapMasterJson);

export const mobCatalog: MobCatalog = {
  maps: (mapValidation.data?.maps ?? []).map((map) => ({
    id: map.id,
    name: map.name,
    shortName: map.shortName,
    expansionId: map.expansionId,
    aetherytes: map.aetherytes.map((aetheryte) => ({
      id: aetheryte.id,
      name: aetheryte.name,
      x: aetheryte.x,
      y: aetheryte.y,
    })),
  })),
  // No formally approved mob-master asset is present in this repository.
  // Keep the empty, validated boundary until the data-preparation gate passes.
  mobs: [],
  masterIdentity: {
    mapSchemaVersion: mapValidation.data?.schemaVersion ?? 1,
    mapDataRevision: mapValidation.data?.dataRevision ?? "unavailable",
    mobSchemaVersion: 1,
    mobDataRevision: "unavailable",
  },
};

export const mobMasterAvailable = mobCatalog.mobs.length > 0;
export const mobMasterDiagnostics = mapValidation.diagnostics;
