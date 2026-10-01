import { describe, expect, it } from "vitest";
import { activeFilterCount, parseProductFilters, productFiltersHref } from "@/lib/product-filters";

describe("parseProductFilters", () => {
  it("reads every filter from the address", () => {
    expect(
      parseProductFilters({ q: " brush ", category: ["2", "3"], inStock: "1", min: "5", max: "30.5", sort: "price-asc", page: "2" }),
    ).toEqual({ q: "brush", categoryIds: [2, 3], inStock: true, minCents: 500, maxCents: 3050, sort: "price-asc", page: 2 });
  });

  it("falls back to the defaults for anything it can't read", () => {
    expect(parseProductFilters({ category: ["two", "2", "2"], min: "cheap", sort: "random", page: "-1" })).toEqual({
      q: "",
      categoryIds: [2],
      inStock: false,
      minCents: null,
      maxCents: null,
      sort: "newest",
      page: 1,
    });
  });
});

describe("productFiltersHref", () => {
  it("leaves the defaults out, so every view has one address", () => {
    expect(productFiltersHref(parseProductFilters({}))).toBe("/products");
    expect(productFiltersHref(parseProductFilters({ sort: "newest", page: "1" }))).toBe("/products");
  });

  it("round-trips the filters", () => {
    const href = productFiltersHref(parseProductFilters({ q: "oil paint", category: "1", inStock: "1", min: "7.5", max: "40", sort: "price-desc" }));

    expect(href).toBe("/products?q=oil+paint&category=1&inStock=1&min=7.50&max=40&sort=price-desc");
  });
});

describe("activeFilterCount", () => {
  it("counts categories, availability and the price range, not search or sort", () => {
    expect(activeFilterCount(parseProductFilters({ q: "brush", sort: "price-asc" }))).toBe(0);
    expect(activeFilterCount(parseProductFilters({ category: ["1", "2"], inStock: "1", min: "5", max: "10" }))).toBe(4);
  });
});
