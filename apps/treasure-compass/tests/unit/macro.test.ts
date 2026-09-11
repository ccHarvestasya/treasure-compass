import { describe, expect, it } from "vitest";
import type { Point, RouteStep } from "../../src/types";
import {
  generateLineOrder,
  generateMultiLineMacro,
  generateOneLineMacro,
} from "../../src/utils/macro";

function makePoint(pointNo: number, posX: number, posY: number): Point {
  return {
    pointNo,
    division: "P",
    block: "",
    posX,
    posY,
    posZ: 0,
    posT: 0,
    time: 0,
    pointName: `Point${pointNo}`,
  };
}

function makeStep(
  orderNo: number,
  memberName: string,
  mapName: string,
  mapNameShort: string,
  posX: number,
  posY: number,
): RouteStep {
  return {
    orderNo,
    mapNo: orderNo,
    mapName,
    mapNameShort,
    memberName,
    point: makePoint(orderNo, posX, posY),
    isCompleted: false,
  };
}

describe("macro utils", () => {
  const steps: RouteStep[] = [
    makeStep(1, "Alice", "Living Memory", "Memory", 205, 230),
    makeStep(2, "Bob", "Ruby Sea", "Ruby", 75, 296),
  ];

  it("generateOneLineMacro returns empty string for empty array", () => {
    expect(generateOneLineMacro([])).toBe("");
  });

  it("generateOneLineMacro formats route in one line", () => {
    expect(generateOneLineMacro(steps)).toBe("/p 1.Alice→2.Bob");
  });

  it("generateMultiLineMacro returns empty string for empty array", () => {
    expect(generateMultiLineMacro([])).toBe("");
  });

  it("generateMultiLineMacro formats route in multi line", () => {
    expect(generateMultiLineMacro(steps)).toBe(
      "/p 1.Alice Memory (20.5, 23.0)\n/p 2.Bob Ruby (7.5, 29.6)",
    );
  });

  it("generateLineOrder returns empty string for empty array", () => {
    expect(generateLineOrder([])).toBe("");
  });

  it("generateLineOrder formats route for line order field", () => {
    expect(generateLineOrder(steps)).toBe("1.Alice(Memory) → 2.Bob(Ruby)");
  });
});
