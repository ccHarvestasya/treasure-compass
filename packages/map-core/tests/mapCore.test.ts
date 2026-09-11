import { describe, expect, it } from "vitest";
import { containsCoordinate, distance2d, isValidBounds } from "../src/index.ts";

describe("map-core", () => {
  const bounds = { minX: 1, maxX: 42, minY: 1, maxY: 42 };

  it("包含境界を有効な二次元座標として扱う", () => {
    expect(isValidBounds(bounds)).toBe(true);
    expect(containsCoordinate(bounds, { x: 1, y: 42 })).toBe(true);
    expect(containsCoordinate(bounds, { x: 0.9, y: 42 })).toBe(false);
  });

  it("共通 bounds は負の範囲も表現できる", () => {
    expect(isValidBounds({ minX: -10, maxX: 10, minY: -5, maxY: 5 })).toBe(
      true,
    );
  });

  it("Z を使わず二次元距離を計算する", () => {
    expect(distance2d({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
    expect(distance2d({ x: Number.NaN, y: 1 }, { x: 4, y: 5 })).toBeNaN();
  });
});
