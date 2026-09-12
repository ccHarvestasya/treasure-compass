import { containsCoordinate, isValidBounds } from "@treasure-compass/map-core";
import type {
  AetheryteRecord,
  ExpansionRecord,
  GradeSetRecord,
  LicenseRecord,
  MapMasterV1,
  MapRecord,
  MasterDiagnostic,
  MasterValidationResult,
  MobCandidateRecord,
  MobCategory,
  MobMasterV1,
  MobRank,
  MobRecord,
  SourceRecord,
  TravelEdgeRecord,
  TreasureMasterV1,
  TreasurePointRecord,
} from "./types.ts";

type JsonObject = Record<string, unknown>;

const MAP_ROOT_KEYS = [
  "schemaVersion",
  "dataRevision",
  "expansions",
  "maps",
  "travelEdges",
  "sources",
  "licenses",
] as const;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: JsonObject, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown, allowEmpty = true): value is string[] {
  return (
    Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.every(isNonEmptyString) &&
    new Set(value).size === value.length
  );
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function error(
  diagnostics: MasterDiagnostic[],
  scope: string,
  code: string,
  message: string,
  recordId?: string,
): void {
  diagnostics.push({
    severity: "error",
    scope,
    code,
    message,
    ...(recordId ? { recordId } : {}),
  });
}

function validEnvelope(
  input: unknown,
  rootKeys: readonly string[],
  scope: string,
  diagnostics: MasterDiagnostic[],
): input is JsonObject & { schemaVersion: 1; dataRevision: string } {
  if (!isObject(input)) {
    error(
      diagnostics,
      scope,
      "invalid-root",
      "ルートは object である必要があります。",
    );
    return false;
  }
  if (!hasExactKeys(input, rootKeys)) {
    error(
      diagnostics,
      scope,
      "unknown-field",
      "ルートに未知の field があります。",
    );
    return false;
  }
  if (input.schemaVersion !== 1) {
    error(
      diagnostics,
      scope,
      "unsupported-schema",
      "schemaVersion 1 のみ利用できます。",
    );
    return false;
  }
  if (!isNonEmptyString(input.dataRevision)) {
    error(
      diagnostics,
      scope,
      "invalid-revision",
      "dataRevision は空でない文字列が必要です。",
    );
    return false;
  }
  return true;
}

function removeIdCollisions<T extends { readonly id: string }>(
  records: readonly T[],
  scope: string,
  diagnostics: MasterDiagnostic[],
): T[] {
  const counts = new Map<string, number>();
  for (const record of records)
    counts.set(record.id, (counts.get(record.id) ?? 0) + 1);
  const collisions = new Set(
    [...counts].filter(([, count]) => count > 1).map(([id]) => id),
  );
  for (const id of collisions) {
    error(
      diagnostics,
      scope,
      "duplicate-id",
      "重複 ID の全 record を除外しました。",
      id,
    );
  }
  return records.filter((record) => !collisions.has(record.id));
}

function hasKnownSources(
  sourceIds: readonly string[],
  sourceIdsCatalog: ReadonlySet<string>,
): boolean {
  return sourceIds.every((id) => sourceIdsCatalog.has(id));
}

function parseSources(
  value: unknown,
  diagnostics: MasterDiagnostic[],
): SourceRecord[] {
  if (!Array.isArray(value)) {
    error(
      diagnostics,
      "map.sources",
      "invalid-array",
      "sources は配列である必要があります。",
    );
    return [];
  }
  const parsed: SourceRecord[] = [];
  value.forEach((item, index) => {
    const scope = `map.sources[${index}]`;
    if (
      !isObject(item) ||
      !hasExactKeys(item, ["id", "label", "reference", "verifiedAt"]) ||
      !isNonEmptyString(item.id) ||
      !isNonEmptyString(item.label) ||
      !isNonEmptyString(item.reference) ||
      !isNonEmptyString(item.verifiedAt)
    ) {
      error(
        diagnostics,
        scope,
        "invalid-record",
        "source record の形が不正です。",
      );
      return;
    }
    parsed.push({
      id: item.id,
      label: item.label,
      reference: item.reference,
      verifiedAt: item.verifiedAt,
    });
  });
  return removeIdCollisions(parsed, "map.sources", diagnostics);
}

function parseLicenses(
  value: unknown,
  diagnostics: MasterDiagnostic[],
): LicenseRecord[] {
  if (!Array.isArray(value)) {
    error(
      diagnostics,
      "map.licenses",
      "invalid-array",
      "licenses は配列である必要があります。",
    );
    return [];
  }
  const parsed: LicenseRecord[] = [];
  value.forEach((item, index) => {
    const scope = `map.licenses[${index}]`;
    if (
      !isObject(item) ||
      !hasExactKeys(item, ["id", "name", "notice"]) ||
      !isNonEmptyString(item.id) ||
      !isNonEmptyString(item.name) ||
      !isNonEmptyString(item.notice)
    ) {
      error(
        diagnostics,
        scope,
        "invalid-record",
        "license record の形が不正です。",
      );
      return;
    }
    parsed.push({ id: item.id, name: item.name, notice: item.notice });
  });
  return removeIdCollisions(parsed, "map.licenses", diagnostics);
}

function parseExpansions(
  value: unknown,
  diagnostics: MasterDiagnostic[],
): ExpansionRecord[] {
  if (!Array.isArray(value)) {
    error(
      diagnostics,
      "map.expansions",
      "invalid-array",
      "expansions は配列である必要があります。",
    );
    return [];
  }
  const parsed: ExpansionRecord[] = [];
  value.forEach((item, index) => {
    const scope = `map.expansions[${index}]`;
    if (
      !isObject(item) ||
      !hasExactKeys(item, ["id", "name", "order", "sourceIds"]) ||
      !isNonEmptyString(item.id) ||
      !isNonEmptyString(item.name) ||
      !Number.isInteger(item.order) ||
      !isFiniteNonNegative(item.order) ||
      !isStringArray(item.sourceIds, false)
    ) {
      error(
        diagnostics,
        scope,
        "invalid-record",
        "expansion record の形が不正です。",
      );
      return;
    }
    parsed.push({
      id: item.id,
      name: item.name,
      order: item.order,
      sourceIds: item.sourceIds,
    });
  });
  return removeIdCollisions(parsed, "map.expansions", diagnostics);
}

function parseAetherytes(
  value: unknown,
  mapId: string,
  diagnostics: MasterDiagnostic[],
): AetheryteRecord[] {
  if (!Array.isArray(value)) {
    error(
      diagnostics,
      "map.aetherytes",
      "invalid-array",
      "aetherytes は配列である必要があります。",
      mapId,
    );
    return [];
  }
  const parsed: AetheryteRecord[] = [];
  value.forEach((item, index) => {
    const scope = `map.${mapId}.aetherytes[${index}]`;
    if (
      !isObject(item) ||
      !hasExactKeys(item, ["id", "name", "x", "y", "sourceIds"]) ||
      !isNonEmptyString(item.id) ||
      !isNonEmptyString(item.name) ||
      !isFiniteNonNegative(item.x) ||
      !isFiniteNonNegative(item.y) ||
      !isStringArray(item.sourceIds, false)
    ) {
      error(
        diagnostics,
        scope,
        "invalid-record",
        "aetheryte record の形が不正です。",
      );
      return;
    }
    parsed.push({
      id: item.id,
      name: item.name,
      x: item.x,
      y: item.y,
      sourceIds: item.sourceIds,
    });
  });
  return parsed;
}

function parseMaps(
  value: unknown,
  diagnostics: MasterDiagnostic[],
): MapRecord[] {
  if (!Array.isArray(value)) {
    error(
      diagnostics,
      "map.maps",
      "invalid-array",
      "maps は配列である必要があります。",
    );
    return [];
  }
  const parsed: MapRecord[] = [];
  value.forEach((item, index) => {
    const scope = `map.maps[${index}]`;
    if (
      !isObject(item) ||
      !hasExactKeys(item, [
        "id",
        "name",
        "shortName",
        "aliases",
        "expansionId",
        "sourceIds",
        "bounds",
        "image",
        "aetherytes",
      ]) ||
      !isNonEmptyString(item.id) ||
      !isNonEmptyString(item.name) ||
      !isNonEmptyString(item.shortName) ||
      !isStringArray(item.aliases) ||
      !isNonEmptyString(item.expansionId) ||
      !isStringArray(item.sourceIds, false) ||
      !isObject(item.bounds) ||
      !hasExactKeys(item.bounds, ["minX", "maxX", "minY", "maxY"]) ||
      !isFiniteNumber(item.bounds.minX) ||
      !isFiniteNumber(item.bounds.maxX) ||
      !isFiniteNumber(item.bounds.minY) ||
      !isFiniteNumber(item.bounds.maxY) ||
      !isObject(item.image) ||
      !hasExactKeys(item.image, ["asset", "licenseId"]) ||
      !isNonEmptyString(item.image.asset) ||
      !isNonEmptyString(item.image.licenseId)
    ) {
      error(
        diagnostics,
        scope,
        "invalid-record",
        "map record の形が不正です。",
      );
      return;
    }
    const bounds = {
      minX: item.bounds.minX,
      maxX: item.bounds.maxX,
      minY: item.bounds.minY,
      maxY: item.bounds.maxY,
    };
    if (!isValidBounds(bounds)) {
      error(diagnostics, scope, "invalid-record", "map bounds が不正です。");
      return;
    }
    parsed.push({
      id: item.id,
      name: item.name,
      shortName: item.shortName,
      aliases: item.aliases,
      expansionId: item.expansionId,
      sourceIds: item.sourceIds,
      bounds,
      image: { asset: item.image.asset, licenseId: item.image.licenseId },
      aetherytes: parseAetherytes(item.aetherytes, item.id, diagnostics),
    });
  });
  return removeIdCollisions(parsed, "map.maps", diagnostics);
}

function parseTravelEdges(
  value: unknown,
  diagnostics: MasterDiagnostic[],
): TravelEdgeRecord[] {
  if (!Array.isArray(value)) {
    error(
      diagnostics,
      "map.travelEdges",
      "invalid-array",
      "travelEdges は配列である必要があります。",
    );
    return [];
  }
  const parsed: TravelEdgeRecord[] = [];
  value.forEach((item, index) => {
    const scope = `map.travelEdges[${index}]`;
    if (
      !isObject(item) ||
      !hasExactKeys(item, [
        "fromMapId",
        "toAetheryteId",
        "fee",
        "loadTime",
        "sourceIds",
      ]) ||
      !isNonEmptyString(item.fromMapId) ||
      !isNonEmptyString(item.toAetheryteId) ||
      !Number.isInteger(item.fee) ||
      !isFiniteNonNegative(item.fee) ||
      !isFiniteNonNegative(item.loadTime) ||
      !isStringArray(item.sourceIds, false)
    ) {
      error(
        diagnostics,
        scope,
        "invalid-record",
        "travel edge record の形が不正です。",
      );
      return;
    }
    parsed.push({
      fromMapId: item.fromMapId,
      toAetheryteId: item.toAetheryteId,
      fee: item.fee,
      loadTime: item.loadTime,
      sourceIds: item.sourceIds,
    });
  });
  return parsed;
}

export function validateMapMaster(
  input: unknown,
): MasterValidationResult<MapMasterV1> {
  const diagnostics: MasterDiagnostic[] = [];
  if (!validEnvelope(input, MAP_ROOT_KEYS, "map", diagnostics)) {
    return { usable: false, diagnostics };
  }
  if (
    !Array.isArray(input.expansions) ||
    !Array.isArray(input.maps) ||
    !Array.isArray(input.sources) ||
    !Array.isArray(input.licenses)
  ) {
    error(
      diagnostics,
      "map",
      "invalid-root-collection",
      "master の必須 collection は配列である必要があります。",
    );
    return { usable: false, diagnostics };
  }

  const sources = parseSources(input.sources, diagnostics);
  const licenses = parseLicenses(input.licenses, diagnostics);
  const sourceIds = new Set(sources.map(({ id }) => id));
  const licenseIds = new Set(licenses.map(({ id }) => id));
  const expansions = removeIdCollisions(
    parseExpansions(input.expansions, diagnostics).filter((record) => {
      const valid = hasKnownSources(record.sourceIds, sourceIds);
      if (!valid)
        error(
          diagnostics,
          "map.expansions",
          "unknown-source",
          "未知の source を参照しています。",
          record.id,
        );
      return valid;
    }),
    "map.expansions",
    diagnostics,
  );
  const expansionIds = new Set(expansions.map(({ id }) => id));
  const rawMaps = parseMaps(input.maps, diagnostics);
  const globallyUniqueAetherytes = removeIdCollisions(
    rawMaps.flatMap((map) => map.aetherytes),
    "map.aetherytes",
    diagnostics,
  );
  const validAetheryteIds = new Set(
    globallyUniqueAetherytes.map(({ id }) => id),
  );
  const maps = rawMaps.flatMap((map): MapRecord[] => {
    if (!expansionIds.has(map.expansionId)) {
      error(
        diagnostics,
        "map.maps",
        "unknown-expansion",
        "未知の expansion を参照しています。",
        map.id,
      );
      return [];
    }
    if (!licenseIds.has(map.image.licenseId)) {
      error(
        diagnostics,
        "map.maps",
        "unknown-license",
        "未知の license を参照しています。",
        map.id,
      );
      return [];
    }
    if (!hasKnownSources(map.sourceIds, sourceIds)) {
      error(
        diagnostics,
        "map.maps",
        "unknown-source",
        "未知の source を参照しています。",
        map.id,
      );
      return [];
    }
    const aetherytes = map.aetherytes.filter((aetheryte) => {
      const valid =
        validAetheryteIds.has(aetheryte.id) &&
        hasKnownSources(aetheryte.sourceIds, sourceIds) &&
        containsCoordinate(map.bounds, aetheryte);
      if (!valid) {
        error(
          diagnostics,
          "map.aetherytes",
          "invalid-reference-or-coordinate",
          "出典または座標が不正です。",
          aetheryte.id,
        );
      }
      return valid;
    });
    return [{ ...map, aetherytes }];
  });
  const mapIds = new Set(maps.map(({ id }) => id));
  const retainedAetheryteIds = new Set(
    maps.flatMap(({ aetherytes }) => aetherytes.map(({ id }) => id)),
  );
  const travelEdges =
    "travelEdges" in input
      ? parseTravelEdges(input.travelEdges, diagnostics).filter((edge) => {
          const valid =
            mapIds.has(edge.fromMapId) &&
            retainedAetheryteIds.has(edge.toAetheryteId) &&
            hasKnownSources(edge.sourceIds, sourceIds);
          if (!valid)
            error(
              diagnostics,
              "map.travelEdges",
              "invalid-reference",
              "travel edge の参照が不正です。",
            );
          return valid;
        })
      : [];
  return {
    usable: true,
    data: {
      schemaVersion: 1,
      dataRevision: input.dataRevision,
      expansions,
      maps,
      // 入力では省略可能。旧データとの互換時だけ検証し、現行データでは空配列となる。
      travelEdges,
      sources,
      licenses,
    },
    diagnostics,
  };
}

function validProductRecordBase(
  item: JsonObject,
  keys: readonly string[],
): item is JsonObject & { id: string; sourceIds: string[] } {
  return (
    hasExactKeys(item, keys) &&
    isNonEmptyString(item.id) &&
    isStringArray(item.sourceIds, false)
  );
}

function validateProductEnvelope(
  input: unknown,
  collectionKey: "gradeSets" | "mobs",
  scope: string,
  diagnostics: MasterDiagnostic[],
): input is JsonObject & { schemaVersion: 1; dataRevision: string } {
  return validEnvelope(
    input,
    ["schemaVersion", "dataRevision", collectionKey],
    scope,
    diagnostics,
  );
}

export function validateTreasureMaster(
  input: unknown,
  mapMaster: MapMasterV1,
): MasterValidationResult<TreasureMasterV1> {
  const diagnostics: MasterDiagnostic[] = [];
  if (!validateProductEnvelope(input, "gradeSets", "treasure", diagnostics)) {
    return { usable: false, diagnostics };
  }
  if (!Array.isArray(input.gradeSets)) {
    error(
      diagnostics,
      "treasure.gradeSets",
      "invalid-array",
      "gradeSets は配列である必要があります。",
    );
    return { usable: false, diagnostics };
  }
  const sourceIds = new Set(mapMaster.sources.map(({ id }) => id));
  const maps = new Map(mapMaster.maps.map((map) => [map.id, map]));
  const parsed: GradeSetRecord[] = [];
  input.gradeSets.forEach((item, index) => {
    const scope = `treasure.gradeSets[${index}]`;
    if (
      !isObject(item) ||
      !validProductRecordBase(item, [
        "id",
        "label",
        "grades",
        "sourceIds",
        "points",
      ]) ||
      !isNonEmptyString(item.label) ||
      !Array.isArray(item.grades) ||
      item.grades.length === 0 ||
      !item.grades.every(
        (grade) =>
          Number.isInteger(grade) && typeof grade === "number" && grade > 0,
      ) ||
      new Set(item.grades).size !== item.grades.length ||
      !Array.isArray(item.points) ||
      !hasKnownSources(item.sourceIds, sourceIds)
    ) {
      error(
        diagnostics,
        scope,
        "invalid-record",
        "grade set record の形または出典が不正です。",
      );
      return;
    }
    const points: TreasurePointRecord[] = [];
    item.points.forEach((point, pointIndex) => {
      const pointScope = `${scope}.points[${pointIndex}]`;
      if (
        !isObject(point) ||
        !validProductRecordBase(point, [
          "id",
          "mapId",
          "label",
          "x",
          "y",
          "sourceIds",
        ]) ||
        !isNonEmptyString(point.mapId) ||
        !isNonEmptyString(point.label) ||
        !isFiniteNonNegative(point.x) ||
        !isFiniteNonNegative(point.y) ||
        !hasKnownSources(point.sourceIds, sourceIds)
      ) {
        error(
          diagnostics,
          pointScope,
          "invalid-record",
          "Treasure point record の形または出典が不正です。",
        );
        return;
      }
      const map = maps.get(point.mapId);
      if (
        !map ||
        map.aetherytes.length === 0 ||
        !containsCoordinate(map.bounds, { x: point.x, y: point.y })
      ) {
        error(
          diagnostics,
          pointScope,
          "invalid-map-or-coordinate",
          "map、aetheryte または座標が不正です。",
          point.id,
        );
        return;
      }
      points.push({
        id: point.id,
        mapId: point.mapId,
        label: point.label,
        x: point.x,
        y: point.y,
        sourceIds: point.sourceIds,
      });
    });
    const uniquePoints = removeIdCollisions(
      points,
      `${scope}.points`,
      diagnostics,
    );
    if (uniquePoints.length === 0) {
      error(
        diagnostics,
        scope,
        "no-valid-points",
        "有効な地点がない grade set を除外しました。",
        item.id,
      );
      return;
    }
    parsed.push({
      id: item.id,
      label: item.label,
      grades: item.grades,
      sourceIds: item.sourceIds,
      points: uniquePoints,
    });
  });
  const globallyUniquePoints = removeIdCollisions(
    parsed.flatMap(({ points }) => points),
    "treasure.points",
    diagnostics,
  );
  const globallyUniquePointIds = new Set(
    globallyUniquePoints.map(({ id }) => id),
  );
  const gradeSets = removeIdCollisions(
    parsed.flatMap((gradeSet): GradeSetRecord[] => {
      const points = gradeSet.points.filter(({ id }) =>
        globallyUniquePointIds.has(id),
      );
      if (points.length === 0) {
        error(
          diagnostics,
          "treasure.gradeSets",
          "no-valid-points",
          "ID 衝突の除外後に有効な地点がない grade set を除外しました。",
          gradeSet.id,
        );
        return [];
      }
      return [{ ...gradeSet, points }];
    }),
    "treasure.gradeSets",
    diagnostics,
  );
  return {
    usable: true,
    data: { schemaVersion: 1, dataRevision: input.dataRevision, gradeSets },
    diagnostics,
  };
}

function categoryAndRankAgree(category: MobCategory, rank: MobRank): boolean {
  return (
    (category === "regular" && rank === "normal") ||
    (category === "elite" && rank !== "normal")
  );
}

export function validateMobMaster(
  input: unknown,
  mapMaster: MapMasterV1,
): MasterValidationResult<MobMasterV1> {
  const diagnostics: MasterDiagnostic[] = [];
  if (!validateProductEnvelope(input, "mobs", "mob", diagnostics)) {
    return { usable: false, diagnostics };
  }
  if (!Array.isArray(input.mobs)) {
    error(
      diagnostics,
      "mob.mobs",
      "invalid-array",
      "mobs は配列である必要があります。",
    );
    return { usable: false, diagnostics };
  }
  const sourceIds = new Set(mapMaster.sources.map(({ id }) => id));
  const maps = new Map(mapMaster.maps.map((map) => [map.id, map]));
  const categories = new Set<MobCategory>(["regular", "elite"]);
  const ranks = new Set<MobRank>(["normal", "b", "a", "s", "ss"]);
  const parsed: MobRecord[] = [];
  input.mobs.forEach((item, index) => {
    const scope = `mob.mobs[${index}]`;
    if (
      !isObject(item) ||
      !validProductRecordBase(item, [
        "id",
        "name",
        "aliases",
        "category",
        "rank",
        "mapId",
        "sourceIds",
        "candidates",
      ]) ||
      !isNonEmptyString(item.name) ||
      !isStringArray(item.aliases) ||
      !isNonEmptyString(item.category) ||
      !categories.has(item.category as MobCategory) ||
      !isNonEmptyString(item.rank) ||
      !ranks.has(item.rank as MobRank) ||
      !isNonEmptyString(item.mapId) ||
      !Array.isArray(item.candidates) ||
      !hasKnownSources(item.sourceIds, sourceIds)
    ) {
      error(
        diagnostics,
        scope,
        "invalid-record",
        "mob record の形または出典が不正です。",
      );
      return;
    }
    const category = item.category as MobCategory;
    const rank = item.rank as MobRank;
    const map = maps.get(item.mapId);
    if (
      !categoryAndRankAgree(category, rank) ||
      !map ||
      map.aetherytes.length === 0
    ) {
      error(
        diagnostics,
        scope,
        "invalid-rank-or-map",
        "category/rank または map が不正です。",
        item.id,
      );
      return;
    }
    const candidates: MobCandidateRecord[] = [];
    item.candidates.forEach((candidate, candidateIndex) => {
      const candidateScope = `${scope}.candidates[${candidateIndex}]`;
      if (
        !isObject(candidate) ||
        !validProductRecordBase(candidate, ["id", "x", "y", "sourceIds"]) ||
        !isFiniteNonNegative(candidate.x) ||
        !isFiniteNonNegative(candidate.y) ||
        !hasKnownSources(candidate.sourceIds, sourceIds) ||
        !containsCoordinate(map.bounds, { x: candidate.x, y: candidate.y })
      ) {
        error(
          diagnostics,
          candidateScope,
          "invalid-record",
          "candidate の形、出典または座標が不正です。",
        );
        return;
      }
      candidates.push({
        id: candidate.id,
        x: candidate.x,
        y: candidate.y,
        sourceIds: candidate.sourceIds,
      });
    });
    const uniqueCandidates = removeIdCollisions(
      candidates,
      `${scope}.candidates`,
      diagnostics,
    );
    if (uniqueCandidates.length === 0) {
      error(
        diagnostics,
        scope,
        "no-valid-candidates",
        "有効な候補地点がない mob を除外しました。",
        item.id,
      );
      return;
    }
    parsed.push({
      id: item.id,
      name: item.name,
      aliases: item.aliases,
      category,
      rank,
      mapId: item.mapId,
      sourceIds: item.sourceIds,
      candidates: uniqueCandidates,
    });
  });
  const globallyUniqueCandidates = removeIdCollisions(
    parsed.flatMap(({ candidates }) => candidates),
    "mob.candidates",
    diagnostics,
  );
  const globallyUniqueCandidateIds = new Set(
    globallyUniqueCandidates.map(({ id }) => id),
  );
  const mobs = removeIdCollisions(
    parsed.flatMap((mob): MobRecord[] => {
      const candidates = mob.candidates.filter(({ id }) =>
        globallyUniqueCandidateIds.has(id),
      );
      if (candidates.length === 0) {
        error(
          diagnostics,
          "mob.mobs",
          "no-valid-candidates",
          "ID 衝突の除外後に有効な候補地点がない mob を除外しました。",
          mob.id,
        );
        return [];
      }
      return [{ ...mob, candidates }];
    }),
    "mob.mobs",
    diagnostics,
  );
  return {
    usable: true,
    data: { schemaVersion: 1, dataRevision: input.dataRevision, mobs },
    diagnostics,
  };
}

export function masterIdentity(
  mapMaster: Pick<MapMasterV1, "schemaVersion" | "dataRevision">,
  productMaster: Pick<
    TreasureMasterV1 | MobMasterV1,
    "schemaVersion" | "dataRevision"
  >,
): string {
  return `${mapMaster.schemaVersion}:${mapMaster.dataRevision}|${productMaster.schemaVersion}:${productMaster.dataRevision}`;
}
