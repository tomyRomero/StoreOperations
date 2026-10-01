import type { Cart } from "./api/types";

// The cart as it will look once a quantity changes (0 removes the line). Shown straight away, until
// the API's answer replaces it.
export function withQuantity(cart: Cart, productId: number, quantity: number): Cart {
  const lines = cart.lines
    .map((line) => (line.productId === productId ? { ...line, quantity, lineTotalCents: line.priceCents * quantity } : line))
    .filter((line) => line.quantity > 0);
  return {
    ...cart,
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  };
}

// What shipping will cost this cart, from Store settings: null when it can't be said (settings
// unavailable), 0 when it's free
export function shippingFor(
  subtotalCents: number,
  settings: { shippingFlatRateCents: number; freeShippingThresholdCents: number | null } | null,
): number | null {
  if (!settings) return null;
  if (settings.freeShippingThresholdCents !== null && subtotalCents >= settings.freeShippingThresholdCents) return 0;
  return settings.shippingFlatRateCents;
}
