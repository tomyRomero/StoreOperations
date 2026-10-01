// The brand glows a product can stand in, as CSS colors. globals.css defines them.
export const glows = ["var(--glow-blue)", "var(--glow-pink)", "var(--glow-violet)", "var(--glow-green)", "var(--glow-amber)", "var(--glow-orange)"] as const;

// The glow behind a product, picked from its id: the same in every list, the bag and its own page,
// and neighbours in a list (consecutive ids) never share one
export function glowFor(productId: number): (typeof glows)[number] {
  return glows[Math.abs(productId) % glows.length];
}
