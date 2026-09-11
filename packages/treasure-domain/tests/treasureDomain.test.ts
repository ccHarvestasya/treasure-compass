import { describe, expect, it } from "vitest";
import { TREASURE_MEMBER_SLOTS } from "../src/index.ts";

describe("treasure-domain boundary", () => {
  it("Treasure の登録枠を8枠に固定する", () => {
    expect(TREASURE_MEMBER_SLOTS).toBe(8);
  });
});
