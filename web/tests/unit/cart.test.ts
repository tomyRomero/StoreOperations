import { describe, expect, it } from "vitest";
import type { Cart } from "@/lib/api/types";
import { shippingFor, withQuantity } from "@/lib/cart";

const line = (productId: number, priceCents: number, quantity: number) => ({
  productId,
  name: `Product ${productId}`,
  priceCents,
  compareAtPriceCents: null,
  imageUrl: "/api/images/x.jpg",
  quantity,
  stock: 10,
  lineTotalCents: priceCents * quantity,
  issue: null,
});

const cart: Cart = { lines: [line(1, 699, 2), line(2, 1850, 1)], itemCount: 3, subtotalCents: 3248, canCheckout: true };

describe("withQuantity", () => {
  it("changes one line and the totals", () => {
    const next = withQuantity(cart, 1, 3);

    expect(next.lines[0]).toMatchObject({ quantity: 3, lineTotalCents: 2097 });
    expect(next.itemCount).toBe(4);
    expect(next.subtotalCents).toBe(3947);
  });

  it("removes the line at zero", () => {
    const next = withQuantity(cart, 2, 0);

    expect(next.lines.map((l) => l.productId)).toEqual([1]);
    expect(next).toMatchObject({ itemCount: 2, subtotalCents: 1398 });
  });
});

describe("shippingFor", () => {
  const flat = { shippingFlatRateCents: 1000, freeShippingThresholdCents: null };
  const threshold = { shippingFlatRateCents: 1000, freeShippingThresholdCents: 5000 };

  it("charges the flat rate", () => {
    expect(shippingFor(3248, flat)).toBe(1000);
    expect(shippingFor(4999, threshold)).toBe(1000);
  });

  it("is free from the threshold up", () => {
    expect(shippingFor(5000, threshold)).toBe(0);
  });

  it("can't say without the settings", () => {
    expect(shippingFor(3248, null)).toBeNull();
  });
});
