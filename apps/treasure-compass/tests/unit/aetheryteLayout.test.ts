import { describe, expect, it } from "vitest";
import {
  createAetheryteLabelCandidates,
  getAetheryteLabelWidth,
  layoutAetherytes,
  projectCanonicalCoordinate,
  rectanglesOverlap,
} from "../../src/utils/aetheryteLayout";

const bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };

describe("aetheryteLayout", () => {
  it("NFC後のcode point数でラベル幅を計算する", () => {
    expect(getAetheryteLabelWidth("か\u3099"))
      .toBe(24);
    expect(getAetheryteLabelWidth("町"))
      .toBe(24);
  });

  it("8方向をNからNWの順で4px間隔に配置する", () => {
    const candidates = createAetheryteLabelCandidates(
      { x: 50, y: 50 },
      24,
    );

    expect(candidates.map((candidate) => candidate.direction)).toEqual([
      "N",
      "NE",
      "E",
      "SE",
      "S",
      "SW",
      "W",
      "NW",
    ]);
    expect(candidates[0]).toMatchObject({ left: 38, top: 22, width: 24, height: 24 });
    expect(candidates[1]).toMatchObject({ left: 54, top: 22 });
    expect(candidates[2]).toMatchObject({ left: 54, top: 38 });
    expect(candidates[3]).toMatchObject({ left: 54, top: 54 });
    expect(candidates[4]).toMatchObject({ left: 38, top: 54 });
    expect(candidates[5]).toMatchObject({ left: 22, top: 54 });
    expect(candidates[6]).toMatchObject({ left: 22, top: 38 });
    expect(candidates[7]).toMatchObject({ left: 22, top: 22 });
  });

  it("矩形の辺接触は衝突とせず、正の面積だけを衝突とする", () => {
    expect(
      rectanglesOverlap(
        { left: 0, top: 0, width: 10, height: 10 },
        { left: 10, top: 0, width: 10, height: 10 },
      ),
    ).toBe(false);
    expect(
      rectanglesOverlap(
        { left: 0, top: 0, width: 10, height: 10 },
        { left: 9, top: 0, width: 10, height: 10 },
      ),
    ).toBe(true);
  });

  it("bounds投影とviewport外候補を適用する", () => {
    expect(projectCanonicalCoordinate(0, 0, bounds, { width: 200, height: 100 })).toEqual({
      x: 0,
      y: 0,
    });
    const layout = layoutAetherytes(
      [{ id: "edge", name: "町", x: 50, y: 0 }],
      bounds,
      { width: 100, height: 100 },
    );
    expect(layout.labels).toHaveLength(1);
    expect(layout.labels[0]?.direction).toBe("SE");
  });

  it("ラベルは最大8件で、安定IDの表示を優先する", () => {
    const records = Array.from({ length: 9 }, (_, index) => ({
      id: String.fromCharCode(97 + index),
      name: "町",
      x: 5 + index * 11,
      y: 50,
    }));
    const layout = layoutAetherytes(records, bounds, { width: 1000, height: 100 });
    expect(layout.labels).toHaveLength(8);
    expect(layout.labels.map((label) => label.id)).toEqual(
      ["a", "b", "c", "d", "e", "f", "g", "h"],
    );

    const tie = layoutAetherytes(
      [
        { id: "b", name: "町", x: 0, y: 0 },
        { id: "a", name: "町", x: 0, y: 0 },
      ],
      bounds,
      { width: 30, height: 30 },
    );
    expect(tie.labels.map((label) => label.id)).toEqual(["a"]);
  });

  it("配置不能でもアイコンは全件返し、ラベルだけを省略する", () => {
    const layout = layoutAetherytes(
      [{ id: "icon-only", name: "長い町名", x: 50, y: 50 }],
      bounds,
      { width: 10, height: 10 },
    );
    expect(layout.icons).toHaveLength(1);
    expect(layout.labels).toHaveLength(0);
  });
});
