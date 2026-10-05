import { describe, expect, it } from "vitest";
import { accentDeclarations, accentFamily, contrast, isHexColor } from "@/lib/brand-colors";
import { storeThemes } from "@/lib/themes";

const night = storeThemes.night_studio.surfaces;
const worst = (hex: string, surfaces: string[]) => Math.min(...surfaces.map((s) => contrast(hex, s)));

describe("contrast", () => {
  it("matches WCAG's ratios", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrast("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});

describe("accentFamily", () => {
  // Pale, loud, dark, gray and pure colors: every one comes out readable in both modes and both themes
  const picks = ["#ffd400", "#c8f43a", "#0a0a40", "#808080", "#ffffff", "#000000", "#ff0000", "#5b3fd9", "#1f3bdb"];

  for (const theme of Object.values(storeThemes)) {
    for (const pick of picks) {
      it(`makes ${pick} readable on ${theme.label}`, () => {
        const family = accentFamily(pick, theme.surfaces);
        expect(worst(family.accent.light, theme.surfaces.light)).toBeGreaterThanOrEqual(4.5);
        expect(worst(family.accent.dark, theme.surfaces.dark)).toBeGreaterThanOrEqual(4.5);
        expect(worst(family.ink.light, theme.surfaces.light)).toBeGreaterThanOrEqual(7);
        expect(worst(family.ink.dark, theme.surfaces.dark)).toBeGreaterThanOrEqual(7);
        expect(contrast(family.onAccent.light, family.accent.light)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(family.onAccent.dark, family.accent.dark)).toBeGreaterThanOrEqual(4.5);
        for (const text of family.glowText.light) expect(worst(text, theme.surfaces.light)).toBeGreaterThanOrEqual(4.5);
        for (const text of family.glowText.dark) expect(worst(text, theme.surfaces.dark)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("keeps a color that already passes on a light page as it is", () => {
    expect(accentFamily("#5b3fd9", night).accent.light).toBe("#5b3fd9");
  });

  it("keeps the store's hue: a blue stays blue", () => {
    const [r, , b] = accentFamily("#1f3bdb", night).accent.dark.match(/[0-9a-f]{2}/g)!.map((h) => parseInt(h, 16));
    expect(b).toBeGreaterThan(r);
  });
});

describe("accentDeclarations", () => {
  it("writes the accent tokens with a light and a dark value", () => {
    const css = accentDeclarations("#1F3BDB", night);
    expect(css).toMatch(/--accent: light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)/);
    expect(css).toContain("--glow-violet: #");
  });

  it("writes nothing for anything but a hex color", () => {
    expect(isHexColor("red")).toBe(false);
    expect(accentDeclarations("}body{display:none", night)).toBe("");
  });
});
