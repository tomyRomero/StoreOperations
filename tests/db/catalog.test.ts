import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import Category from "@/lib/models/category.model";
import Product from "@/lib/models/product.model";
import { findProduct, getAllCategoriesForProduct } from "@/lib/actions/store.actions";
import { clearTestDb, connectTestDb, disconnectTestDb } from "../helpers/db";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(disconnectTestDb);

describe("catalog reads", () => {
  it("returns the fields of a product by its id", async () => {
    await Product.create({
      stripeProductId: "prod_test_1",
      name: "Oil Paint Set",
      description: "Twelve colors",
      stock: 12,
      price: 34.99,
      category: "Paint",
      photo: "seed/products/oilpaint.jpg",
    });

    await expect(findProduct("prod_test_1")).resolves.toEqual({
      name: "Oil Paint Set",
      description: "Twelve colors",
      stock: 12,
      price: 34.99,
      category: "Paint",
      photo: "seed/products/oilpaint.jpg",
    });
  });

  it("returns null for an unknown product", async () => {
    await expect(findProduct("prod_missing")).resolves.toBeNull();
  });

  it("lists category titles", async () => {
    await Category.create([
      { title: "Paint", photo: "paint.jpg" },
      { title: "Canvas", photo: "canvas.jpg" },
    ]);
    const titles = await getAllCategoriesForProduct();
    expect(titles).toEqual(expect.arrayContaining(["Paint", "Canvas"]));
  });
});
