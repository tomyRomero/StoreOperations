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

// The two Store settings the cart needs; null while they can't be loaded
export type ShippingSettings = { shippingFlatRateCents: number; freeShippingThresholdCents: number | null } | null;

// What shipping will cost this cart, from Store settings: null when it can't be said (settings
// unavailable), 0 when it's free
export function shippingFor(subtotalCents: number, settings: ShippingSettings): number | null {
  if (!settings) return null;
  if (settings.freeShippingThresholdCents !== null && subtotalCents >= settings.freeShippingThresholdCents) return 0;
  return settings.shippingFlatRateCents;
}

// How much more the cart needs for free shipping, 0 once it ships free. Null when the store has no
// threshold, or ships everything free anyway.
export function toFreeShipping(subtotalCents: number, settings: ShippingSettings): number | null {
  if (!settings || settings.freeShippingThresholdCents === null || settings.shippingFlatRateCents === 0) return null;
  return Math.max(0, settings.freeShippingThresholdCents - subtotalCents);
}

// What the sale prices take off the regular ones, across the cart
export function cartSavings(cart: Cart): number {
  return cart.lines.reduce((sum, line) => sum + Math.max(0, (line.compareAtPriceCents ?? line.priceCents) - line.priceCents) * line.quantity, 0);
}
