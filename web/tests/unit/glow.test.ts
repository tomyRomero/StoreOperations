import { describe, expect, it } from "vitest";
import { glowFor, glows } from "@/lib/glow";

describe("glowFor", () => {
  it("gives a product the same glow every time", () => {
    expect(glowFor(7)).toBe(glowFor(7));
  });

  it("never gives neighbouring products the same glow", () => {
    for (let id = 1; id < 50; id++) expect(glowFor(id)).not.toBe(glowFor(id + 1));
  });

  it("uses every glow", () => {
    expect(new Set([1, 2, 3, 4, 5, 6].map(glowFor)).size).toBe(glows.length);
  });
});
