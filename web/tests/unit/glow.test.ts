import { describe, expect, it } from "vitest";
import { glowFor, glows } from "@/lib/glow";

describe("glowFor", () => {
  it("never gives neighbouring products the same glow", () => {
    for (let id = 1; id < 50; id++) expect(glowFor(id)).not.toBe(glowFor(id + 1));
  });

  it("uses every glow", () => {
    expect(new Set(glows.map((_, id) => glowFor(id))).size).toBe(glows.length);
  });
});
