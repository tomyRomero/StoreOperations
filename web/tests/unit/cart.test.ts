import { describe, expect, it } from "vitest";
import type { Cart } from "@/lib/api/types";
import { cartSavings, shippingFor, toFreeShipping, withQuantity } from "@/lib/cart";

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

describe("toFreeShipping", () => {
  const store = { shippingFlatRateCents: 1000, freeShippingThresholdCents: 7500 };

  it("says how much more ships the cart free, and 0 once it does", () => {
    expect(toFreeShipping(6797, store)).toBe(703);
    expect(toFreeShipping(7500, store)).toBe(0);
    expect(toFreeShipping(9000, store)).toBe(0);
  });

  it("has nothing to say without a threshold or when shipping is free anyway", () => {
    expect(toFreeShipping(1000, { shippingFlatRateCents: 1000, freeShippingThresholdCents: null })).toBeNull();
    expect(toFreeShipping(1000, { shippingFlatRateCents: 0, freeShippingThresholdCents: 7500 })).toBeNull();
    expect(toFreeShipping(1000, null)).toBeNull();
  });
});

describe("cartSavings", () => {
  it("adds up what the sale prices take off, times the quantities", () => {
    const cart: Cart = {
      lines: [{ ...line(1, 3499, 2), compareAtPriceCents: 4499 }, line(2, 699, 3)],
      itemCount: 5,
      subtotalCents: 3499 * 2 + 699 * 3,
      canCheckout: true,
    };
    expect(cartSavings(cart)).toBe(2000);
  });
});
