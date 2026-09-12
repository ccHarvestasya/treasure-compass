import { describe, expect, it } from "vitest";
import type { Point, RouteStep } from "../../src/types";
import {
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
    memberNo: orderNo - 1,
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

  it("完了済み地点を除外し、残りを詰めて出力する", () => {
    const completed = [{ ...steps[0], isCompleted: true }, steps[1]];
    expect(generateOneLineMacro(completed)).toBe("/p 1.Bob");
    expect(generateMultiLineMacro(completed)).toBe("/p 1.Bob Ruby (7.5, 29.6)");
    expect(generateOneLineMacro([{ ...steps[0], isCompleted: true }])).toBe("");
  });

  it("generateMultiLineMacro returns empty string for empty array", () => {
    expect(generateMultiLineMacro([])).toBe("");
  });

  it("generateMultiLineMacro formats route in multi line", () => {
    expect(generateMultiLineMacro(steps)).toBe(
      "/p 1.Alice Memory (20.5, 23.0)\n/p 2.Bob Ruby (7.5, 29.6)",
    );
  });

});
