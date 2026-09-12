import { describe, expect, it } from "vitest";
import {
  masterIdentity,
  validateMapMaster,
  validateMobMaster,
  validateTreasureMaster,
} from "../src/index.ts";
import type { MapMasterV1 } from "../src/types.ts";
import treasureMasterJson from "../data/treasure-master.v1.json";
import mapMasterJson from "../data/map-master.v1.json";

const validMapInput = {
  schemaVersion: 1,
  dataRevision: "test-map-1",
  expansions: [
    { id: "exp-1", name: "拡張", order: 1, sourceIds: ["source-1"] },
  ],
  maps: [
    {
      id: "map-1",
      name: "地図",
      shortName: "地図",
      aliases: [],
      expansionId: "exp-1",
      sourceIds: ["source-1"],
      bounds: { minX: 1, maxX: 42, minY: 1, maxY: 42 },
      image: { asset: "map.webp", licenseId: "license-1" },
      aetherytes: [
        {
          id: "aetheryte-1",
          name: "起点",
          x: 10,
          y: 10,
          sourceIds: ["source-1"],
        },
      ],
    },
  ],
  travelEdges: [],
  sources: [
    {
      id: "source-1",
      label: "出典",
      reference: "ref",
      verifiedAt: "2026-09-12",
    },
  ],
  licenses: [{ id: "license-1", name: "条件", notice: "表示条件" }],
};

function validatedMap(): MapMasterV1 {
  const result = validateMapMaster(validMapInput);
  if (!result.data) throw new Error("test fixture is invalid");
  return result.data;
}

describe("master-data validator", () => {
  it("生成済みTreasure masterは全P地点をstable IDで検証できる", () => {
    const mapResult = validateMapMaster(mapMasterJson);
    if (!mapResult.data) throw new Error("map master fixture is invalid");
    const result = validateTreasureMaster(treasureMasterJson, mapResult.data);

    expect(result.usable).toBe(true);
    expect(result.data?.gradeSets.map((set) => set.points.length)).toEqual([
      35,
      48,
      48,
      48,
      48,
    ]);
    expect(
      result.data?.gradeSets.flatMap((set) => set.points).every(({ id }) =>
        /^map-\d{3}-point-\d{3}$/.test(id),
      ),
    ).toBe(true);
  });

  it("未知 schema と未知 root field はファイル全体を利用不可にする", () => {
    expect(
      validateMapMaster({ ...validMapInput, schemaVersion: 2 }).usable,
    ).toBe(false);
    expect(validateMapMaster({ ...validMapInput, extra: true }).usable).toBe(
      false,
    );
  });

  it("必須 root collection の型が違う場合はファイル全体を利用不可にする", () => {
    expect(validateMapMaster({ ...validMapInput, maps: null }).usable).toBe(
      false,
    );
    expect(
      validateTreasureMaster(
        { schemaVersion: 1, dataRevision: "broken", gradeSets: null },
        validatedMap(),
      ).usable,
    ).toBe(false);
  });

  it("travelEdgesを省略したmap masterを空配列として利用できる", () => {
    const withoutTravelEdges = Object.fromEntries(
      Object.entries(validMapInput).filter(([key]) => key !== "travelEdges"),
    );
    const result = validateMapMaster(withoutTravelEdges);

    expect(result.usable).toBe(true);
    expect(result.data?.travelEdges).toEqual([]);
  });

  it("重複 ID は先勝ちにせず衝突した全 record を除外する", () => {
    const duplicate = {
      ...validMapInput,
      maps: [validMapInput.maps[0], { ...validMapInput.maps[0], name: "別名" }],
    };
    const result = validateMapMaster(duplicate);

    expect(result.usable).toBe(true);
    expect(result.data?.maps).toEqual([]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "duplicate-id", recordId: "map-1" }),
      ]),
    );
  });

  it("不正な地点だけを除外し、独立した Treasure record を利用可能にする", () => {
    const input = {
      schemaVersion: 1,
      dataRevision: "test-treasure-1",
      gradeSets: [
        {
          id: "grade-1",
          label: "G8",
          grades: [8],
          sourceIds: ["source-1"],
          points: [
            {
              id: "point-ok",
              mapId: "map-1",
              label: "A",
              x: 10,
              y: 12,
              sourceIds: ["source-1"],
            },
            {
              id: "point-bad",
              mapId: "map-1",
              label: "B",
              x: 50,
              y: 12,
              sourceIds: ["source-1"],
            },
          ],
        },
      ],
    };
    const result = validateTreasureMaster(input, validatedMap());

    expect(result.usable).toBe(true);
    expect(result.data?.gradeSets[0]?.points.map(({ id }) => id)).toEqual([
      "point-ok",
    ]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recordId: "point-bad" }),
      ]),
    );
  });

  it("rank/category 不整合と候補なしの Mob を除外する", () => {
    const input = {
      schemaVersion: 1,
      dataRevision: "test-mob-1",
      mobs: [
        {
          id: "mob-bad",
          name: "不整合",
          aliases: [],
          category: "regular",
          rank: "b",
          mapId: "map-1",
          sourceIds: ["source-1"],
          candidates: [
            { id: "candidate-1", x: 10, y: 10, sourceIds: ["source-1"] },
          ],
        },
      ],
    };
    const result = validateMobMaster(input, validatedMap());

    expect(result.usable).toBe(true);
    expect(result.data?.mobs).toEqual([]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-rank-or-map" }),
      ]),
    );
  });

  it("map と製品 master の両 revision から identity を作る", () => {
    expect(
      masterIdentity(validatedMap(), {
        schemaVersion: 1,
        dataRevision: "product-2",
      }),
    ).toBe("1:test-map-1|1:product-2");
  });
});
