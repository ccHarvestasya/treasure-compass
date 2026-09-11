import { describe, expect, it } from "vitest";
import { buildLegacyTreasureMigrationReport } from "../src/legacy-report.ts";

const pointBase = {
  block: "A",
  posZ: 99,
  posT: 88,
  time: 77,
  pointName: "地点",
};

describe("legacy Treasure migration report", () => {
  it("設定済み grade だけを棚卸しし、g11 は明示的に除外する", () => {
    const report = buildLegacyTreasureMigrationReport({
      g8: {
        mapSize: 431,
        mapData: [
          {
            region: "地域",
            mapNo: 1,
            mapName: "地図",
            mapNameShort: "短縮",
            point: [
              { ...pointBase, pointNo: 1, division: "P", posX: 105, posY: 207 },
              { ...pointBase, pointNo: 2, division: "R", posX: 100, posY: 200 },
            ],
          },
        ],
      },
      g11: { mapSize: 431, mapData: [] },
    });

    expect(report.excludedInputs).toEqual(["g11"]);
    expect(report.missingConfiguredInputs).toEqual([
      "g10",
      "g12",
      "g14",
      "g17",
    ]);
    expect(report.datasets[0]?.bounds).toEqual({
      minX: 1,
      maxX: 44.1,
      minY: 1,
      maxY: 44.1,
    });
    expect(report.datasets[0]?.records[0]).toMatchObject({
      disposition: "treasure-candidate",
      canonicalCoordinate: { x: 10.5, y: 20.7 },
      droppedFields: ["block", "posZ", "posT", "time"],
    });
    expect(report.datasets[0]?.records[1]).toMatchObject({
      disposition: "excluded",
      reason: "unsupported-division",
    });
    expect(report.adoptionBlockedBy).toContain("source-review");
  });
});
