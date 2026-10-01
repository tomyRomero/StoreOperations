import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/api/types";
import { stageProducts } from "@/lib/stage";

const product = (id: number, priceCents: number, compareAtPriceCents: number | null = null) => ({ id, priceCents, compareAtPriceCents }) as Product;
const ids = (products: Product[]) => products.map((p) => p.id);

describe("stageProducts", () => {
  it("puts the biggest saving first, then the newest", () => {
    const deals = [product(1, 900, 1000), product(2, 500, 1000)];
    expect(ids(stageProducts(deals, [product(7, 100), product(8, 100)]))).toEqual([2, 1, 7]);
  });

  it("shows a product on sale and new only once", () => {
    expect(ids(stageProducts([product(1, 900, 1000)], [product(1, 900, 1000), product(2, 100), product(3, 100)]))).toEqual([1, 2, 3]);
  });

  it("makes do with fewer than three", () => {
    expect(ids(stageProducts([], [product(4, 100)]))).toEqual([4]);
  });
});
