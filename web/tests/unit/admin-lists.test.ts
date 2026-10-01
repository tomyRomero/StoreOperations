import { describe, expect, it } from "vitest";
import { listHref, nextSort, oneOf, pageNumber, sortDirection, withParams } from "@/lib/admin-lists";

describe("admin list addresses", () => {
  it("leave out empty parameters and page 1", () => {
    expect(listHref("/admin/orders", { q: "", status: "pending", page: 1 })).toBe("/admin/orders?status=pending");
    expect(listHref("/admin/orders", { q: undefined, page: 3 })).toBe("/admin/orders?page=3");
    expect(listHref("/admin/orders", {})).toBe("/admin/orders");
  });

  it("go back to page 1 when anything but the page changes", () => {
    expect(withParams({ q: "ada", page: "3" }, { status: "shipped" })).toEqual({ q: "ada", status: "shipped" });
    expect(withParams({ q: "ada", page: "3" }, { page: 4 })).toEqual({ q: "ada", page: "4" });
    expect(withParams({ status: "shipped" }, { status: undefined })).toEqual({ status: undefined });
  });

  it("accept only known values", () => {
    expect(oneOf("shipped", ["pending", "shipped"] as const)).toBe("shipped");
    expect(oneOf("lost", ["pending", "shipped"] as const)).toBeUndefined();
    expect(oneOf(["pending", "shipped"], ["pending", "shipped"] as const)).toBe("pending");
    expect(pageNumber("0")).toBe(1);
    expect(pageNumber("x")).toBe(1);
    expect(pageNumber("4")).toBe(4);
  });
});

describe("sortable columns", () => {
  it("know which way they are sorted", () => {
    expect(sortDirection("total", "total")).toBe("ascending");
    expect(sortDirection("total_desc", "total")).toBe("descending");
    expect(sortDirection("placed_desc", "total")).toBe("none");
    expect(sortDirection(undefined, "total")).toBe("none");
  });

  it("start in their natural direction, then turn around", () => {
    expect(nextSort("placed_desc", "total", true)).toBe("total_desc");
    expect(nextSort("placed_desc", "name", false)).toBe("name");
    expect(nextSort("total_desc", "total", true)).toBe("total");
    expect(nextSort("total", "total", true)).toBe("total_desc");
  });
});
