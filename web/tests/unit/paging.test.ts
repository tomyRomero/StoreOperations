import { describe, expect, it } from "vitest";
import { pageHref, pageNumbers, showingRange } from "@/lib/paging";

describe("pageHref", () => {
  it("keeps every other filter and sets the page", () => {
    expect(pageHref("/products", { q: "brush", category: ["1", "2"], page: "3" }, 2)).toBe(
      "/products?q=brush&category=1&category=2&page=2",
    );
  });

  it("leaves the page out for page 1, so the first page has one address", () => {
    expect(pageHref("/products", { q: "brush", page: "4" }, 1)).toBe("/products?q=brush");
    expect(pageHref("/products", { page: "4" }, 1)).toBe("/products");
  });

  it("skips parameters that aren't set", () => {
    expect(pageHref("/admin/orders", { status: undefined, q: "A1" }, 2)).toBe("/admin/orders?q=A1&page=2");
  });
});

describe("pageNumbers", () => {
  it("shows every page when there are only a few", () => {
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(pageNumbers(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("shows the ends and the current page's neighbors, with gaps between", () => {
    expect(pageNumbers(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
    expect(pageNumbers(1, 12)).toEqual([1, 2, "gap", 12]);
    expect(pageNumbers(12, 12)).toEqual([1, "gap", 11, 12]);
  });

  it("fills a gap of one page with that page instead of an ellipsis", () => {
    expect(pageNumbers(4, 12)).toEqual([1, 2, 3, 4, 5, "gap", 12]);
  });
});

describe("showingRange", () => {
  it("counts the items on this page", () => {
    expect(showingRange(1, 8, 12)).toBe("Showing 1–8 of 12");
    expect(showingRange(2, 8, 12)).toBe("Showing 9–12 of 12");
  });

  it("says when there's nothing", () => {
    expect(showingRange(1, 8, 0)).toBe("Nothing to show");
  });
});
