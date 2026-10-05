import { describe, expect, it } from "vitest";
import { matchParts } from "@/lib/highlight";

describe("matchParts", () => {
  it("splits around the match, keeping the text's own capitals", () => {
    expect(matchParts("Fine Brush", "brush")).toEqual(["Fine ", "Brush", ""]);
    expect(matchParts("Brush Set", " BRU ")).toEqual(["", "Bru", "sh Set"]);
  });

  it("marks only the first place it appears", () => {
    expect(matchParts("Paint Paint", "paint")).toEqual(["", "Paint", " Paint"]);
  });

  it("is null when there's nothing to mark", () => {
    expect(matchParts("Canvas Sign", "oil")).toBeNull();
    expect(matchParts("Canvas Sign", "  ")).toBeNull();
  });
});
