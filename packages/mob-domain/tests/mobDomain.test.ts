import { describe, expect, it } from "vitest";
import { MOB_COMPASS_MODES } from "../src/index.ts";

describe("mob-domain boundary", () => {
  it("ソロとパーティを独立した mode 値として公開する", () => {
    expect(MOB_COMPASS_MODES).toEqual(["solo", "party"]);
  });
});
