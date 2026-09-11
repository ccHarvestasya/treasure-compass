export const CONFIGURED_LEGACY_DATASETS = [
  "g8",
  "g10",
  "g12",
  "g14",
  "g17",
] as const;

export type ConfiguredLegacyDataset =
  (typeof CONFIGURED_LEGACY_DATASETS)[number];

interface LegacyPoint {
  readonly pointNo: number;
  readonly division: string;
  readonly block: unknown;
  readonly posX: number;
  readonly posY: number;
  readonly posZ: unknown;
  readonly posT: unknown;
  readonly time: unknown;
  readonly pointName: string;
}

interface LegacyMap {
  readonly region: unknown;
  readonly mapNo: number;
  readonly mapName: string;
  readonly mapNameShort: string;
  readonly point: readonly LegacyPoint[];
}

interface LegacyData {
  readonly mapSize: number;
  readonly mapData: readonly LegacyMap[];
}

export interface LegacyRecordReport {
  readonly dataset: ConfiguredLegacyDataset;
  readonly mapNo: number;
  readonly pointNo: number;
  readonly disposition:
    "treasure-candidate" | "aetheryte-candidate" | "excluded";
  readonly reason?: "unsupported-division";
  readonly canonicalCoordinate?: { readonly x: number; readonly y: number };
  readonly droppedFields: readonly ["block", "posZ", "posT", "time"];
}

export interface LegacyDatasetReport {
  readonly dataset: ConfiguredLegacyDataset;
  readonly status: "inventoried" | "invalid-input";
  readonly bounds?: {
    readonly minX: 1;
    readonly maxX: number;
    readonly minY: 1;
    readonly maxY: number;
  };
  readonly records: readonly LegacyRecordReport[];
}

export interface LegacyTreasureMigrationReport {
  readonly configuredInputs: readonly ConfiguredLegacyDataset[];
  readonly missingConfiguredInputs: readonly ConfiguredLegacyDataset[];
  readonly excludedInputs: readonly string[];
  readonly datasets: readonly LegacyDatasetReport[];
  readonly adoptionBlockedBy: readonly [
    "stable-id-map",
    "map-identity-review",
    "source-review",
    "license-review",
  ];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLegacyPoint(value: unknown): value is LegacyPoint {
  return (
    isObject(value) &&
    typeof value.pointNo === "number" &&
    Number.isInteger(value.pointNo) &&
    typeof value.division === "string" &&
    typeof value.posX === "number" &&
    Number.isFinite(value.posX) &&
    typeof value.posY === "number" &&
    Number.isFinite(value.posY) &&
    typeof value.pointName === "string" &&
    "block" in value &&
    "posZ" in value &&
    "posT" in value &&
    "time" in value
  );
}

function isLegacyMap(value: unknown): value is LegacyMap {
  return (
    isObject(value) &&
    typeof value.mapNo === "number" &&
    Number.isInteger(value.mapNo) &&
    typeof value.mapName === "string" &&
    typeof value.mapNameShort === "string" &&
    Array.isArray(value.point) &&
    value.point.every(isLegacyPoint) &&
    "region" in value
  );
}

function isLegacyData(value: unknown): value is LegacyData {
  return (
    isObject(value) &&
    typeof value.mapSize === "number" &&
    Number.isFinite(value.mapSize) &&
    value.mapSize >= 0 &&
    Array.isArray(value.mapData) &&
    value.mapData.every(isLegacyMap)
  );
}

export function buildLegacyTreasureMigrationReport(
  inputs: Readonly<Record<string, unknown>>,
): LegacyTreasureMigrationReport {
  const configured = new Set<string>(CONFIGURED_LEGACY_DATASETS);
  const excludedInputs = Object.keys(inputs)
    .filter((name) => !configured.has(name))
    .sort();
  const missingConfiguredInputs = CONFIGURED_LEGACY_DATASETS.filter(
    (name) => !(name in inputs),
  );
  const datasets = CONFIGURED_LEGACY_DATASETS.flatMap(
    (dataset): LegacyDatasetReport[] => {
      if (!(dataset in inputs)) return [];
      const input = inputs[dataset];
      if (!isLegacyData(input))
        return [{ dataset, status: "invalid-input", records: [] }];
      const records = input.mapData.flatMap((map) =>
        map.point.map((point): LegacyRecordReport => {
          const disposition =
            point.division === "P"
              ? "treasure-candidate"
              : point.division === "T"
                ? "aetheryte-candidate"
                : "excluded";
          return {
            dataset,
            mapNo: map.mapNo,
            pointNo: point.pointNo,
            disposition,
            ...(disposition === "excluded"
              ? { reason: "unsupported-division" as const }
              : {}),
            ...(disposition !== "excluded"
              ? {
                  canonicalCoordinate: {
                    x: point.posX / 10,
                    y: point.posY / 10,
                  },
                }
              : {}),
            droppedFields: ["block", "posZ", "posT", "time"],
          };
        }),
      );
      return [
        {
          dataset,
          status: "inventoried",
          bounds: {
            minX: 1,
            maxX: 1 + input.mapSize / 10,
            minY: 1,
            maxY: 1 + input.mapSize / 10,
          },
          records,
        },
      ];
    },
  );

  return {
    configuredInputs: CONFIGURED_LEGACY_DATASETS,
    missingConfiguredInputs,
    excludedInputs,
    datasets,
    adoptionBlockedBy: [
      "stable-id-map",
      "map-identity-review",
      "source-review",
      "license-review",
    ],
  };
}
