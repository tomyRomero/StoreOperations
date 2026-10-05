// A store picks one accent color; the storefront needs a family of them. Everything here works in OKLCH,
// where lightness is perceptual: the hue and chroma stay the store's, and only the lightness moves until
// text in the accent passes WCAG contrast on the theme's surfaces, in light mode and in dark mode.

type Oklch = { l: number; c: number; h: number };

// The page and card colors a theme puts text on, in each mode. The accent is checked against every one.
export type Surfaces = { light: string[]; dark: string[] };

export type AccentFamily = {
  // Links, selected states and the focus ring
  accent: { light: string; dark: string };
  // Text on the accent's tint, such as selected chips
  ink: { light: string; dark: string };
  // Text on a solid accent fill
  onAccent: { light: string; dark: string };
  // The three decorative glows, around the accent's hue, and their deeper versions for gradient text
  glows: [string, string, string];
  glowText: { light: [string, string, string]; dark: [string, string, string] };
  // The tinted floor products stand on
  stage: { light: [string, string]; dark: [string, string] };
};

const hexPattern = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string): boolean {
  return hexPattern.test(value);
}

function toLinear(channel: number) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function fromLinear(channel: number) {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function hexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [toLinear(((n >> 16) & 255) / 255), toLinear(((n >> 8) & 255) / 255), toLinear((n & 255) / 255)];
}

function linearToOklch([r, g, b]: [number, number, number]): Oklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
}

function oklchToLinear({ l: L, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6);

// The color at this lightness and hue, with as much of the chroma as the screen can show
function toHex(color: Oklch): string {
  const l = Math.min(1, Math.max(0, color.l));
  let low = 0;
  let high = color.c;
  if (!inGamut(oklchToLinear({ ...color, l }))) {
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinear({ l, c: mid, h: color.h }))) low = mid;
      else high = mid;
    }
    high = low;
  }
  const rgb = oklchToLinear({ l, c: high, h: color.h });
  return `#${rgb
    .map((v) => Math.round(Math.min(1, Math.max(0, fromLinear(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function toOklch(hex: string): Oklch {
  return linearToOklch(hexToLinear(hex));
}

function luminance(hex: string) {
  const [r, g, b] = hexToLinear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// The WCAG 2 contrast ratio, from 1 to 21
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const worst = (hex: string, surfaces: string[]) => Math.min(...surfaces.map((s) => contrast(hex, s)));

// The nearest lightness to the color's own that reaches the ratio on every surface: darker for a light
// page, lighter for a dark one. A color that already passes is left as it is.
function reach(color: Oklch, surfaces: string[], ratio: number, direction: "darker" | "lighter"): string {
  if (worst(toHex(color), surfaces) >= ratio) return toHex(color);
  let passing = direction === "darker" ? 0 : 1;
  let failing = color.l;
  for (let i = 0; i < 30; i++) {
    const mid = (passing + failing) / 2;
    if (worst(toHex({ ...color, l: mid }), surfaces) >= ratio) passing = mid;
    else failing = mid;
  }
  return toHex({ ...color, l: passing });
}

const turn = (h: number, by: number) => (h + by + 360) % 360;

export function accentFamily(hex: string, surfaces: Surfaces): AccentFamily {
  const base = toOklch(hex);
  // A gray stays gray; any color keeps enough chroma to glow
  const chroma = base.c < 0.02 ? base.c : Math.max(base.c, 0.12);
  const glow = (l: number, c: number, h: number) => toHex({ l, c, h });
  // Night Studio's own trio sits pink, violet, blue: the accent's hue in the middle, warmer to one side
  const glows: [string, string, string] = [
    glow(0.68, chroma * 1.1, turn(base.h, 65)),
    glow(Math.min(0.72, Math.max(0.58, base.l)), chroma, base.h),
    glow(0.64, chroma, turn(base.h, -30)),
  ];

  const accentLight = reach(base, surfaces.light, 4.6, "darker");
  const accentDark = reach({ ...base, l: Math.max(base.l, 0.75) }, surfaces.dark, 7, "lighter");

  return {
    accent: { light: accentLight, dark: accentDark },
    ink: {
      light: reach(base, surfaces.light, 7, "darker"),
      dark: reach({ ...base, l: Math.max(base.l, 0.85) }, surfaces.dark, 10, "lighter"),
    },
    onAccent: {
      light: contrast("#ffffff", accentLight) >= 4.5 ? "#ffffff" : "#0c0c12",
      dark: contrast("#09090b", accentDark) >= 4.5 ? "#09090b" : "#ffffff",
    },
    glows,
    glowText: {
      light: glows.map((g) => reach(toOklch(g), surfaces.light, 4.5, "darker")) as [string, string, string],
      dark: glows.map((g) => reach(toOklch(g), surfaces.dark, 4.5, "lighter")) as [string, string, string],
    },
    stage: {
      light: [glow(0.95, Math.min(chroma, 0.035), base.h), glow(0.95, Math.min(chroma, 0.035), turn(base.h, -30))],
      dark: [glow(0.24, Math.min(chroma, 0.07), base.h), glow(0.23, Math.min(chroma, 0.06), turn(base.h, -30))],
    },
  };
}

const pair = (light: string, dark: string) => `light-dark(${light}, ${dark})`;

// The storefront's accent tokens for a store's color, as CSS declarations for :root. Only hex colors and
// numbers go in, so the result is safe to put in a style tag.
export function accentDeclarations(hex: string, surfaces: Surfaces): string {
  if (!isHexColor(hex)) return "";
  const f = accentFamily(hex, surfaces);
  const tint = (alpha: number) => `color-mix(in oklab, ${f.glows[1]} ${alpha}%, transparent)`;
  return [
    `--accent: ${pair(f.accent.light, f.accent.dark)}`,
    `--accent-foreground: ${pair(f.onAccent.light, f.onAccent.dark)}`,
    `--accent-subtle: ${pair(tint(12), tint(18))}`,
    `--accent-ink: ${pair(f.ink.light, f.ink.dark)}`,
    `--ring: ${pair(f.accent.light, f.accent.dark)}`,
    `--glow-pink: ${f.glows[0]}`,
    `--glow-violet: ${f.glows[1]}`,
    `--glow-blue: ${f.glows[2]}`,
    `--brand-text-1: ${pair(f.glowText.light[0], f.glowText.dark[0])}`,
    `--brand-text-2: ${pair(f.glowText.light[1], f.glowText.dark[1])}`,
    `--brand-text-3: ${pair(f.glowText.light[2], f.glowText.dark[2])}`,
    `--stage-violet: ${pair(f.stage.light[0], f.stage.dark[0])}`,
    `--stage-blue: ${pair(f.stage.light[1], f.stage.dark[1])}`,
  ].join("; ");
}
