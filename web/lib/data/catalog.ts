import "server-only";

import { SortOrder } from "mongoose";
import { connectToDB } from "../mongoose";
import Category from "../models/category.model";
import Product from "../models/product.model";
import { CategoryType } from "@/app/types/global";

// Public catalog reads for Server Components. These are plain server functions,
// not server actions, so the browser can't call them directly.

const toProductSummary = (element: any) => ({
  stripeProductId: element.stripeProductId,
  name: element.name,
  description: element.description,
  stock: element.stock.toString(),
  price: element.price.toString(),
  category: element.category,
  photo: element.photo,
  date: element.date,
});

export const getAllCategories = async () => {
  try {
    await connectToDB();
    const data = await Category.find({});

    const categories: CategoryType[] = data.map((element) => ({
      id: element.id,
      title: element.title,
      photo: element.photo,
      date: element.date,
    }));

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
};

export const getDeals = async () => {
  try {
    await connectToDB();
    const data = await Product.find({ deal: true });

    return data.map((element) => ({
      ...toProductSummary(element),
      oldPrice: element.oldPrice,
      dealDescription: element.dealDescription,
    }));
  } catch (error) {
    console.error("Error fetching deals:", error);
    return [];
  }
};

// Paginated products with category filtering and price sorting, for the products page
export const getAllProducts = async (pageNumber = 1, pageSize = 20, categories: string[] = [], sort = "lowest") => {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const categoryFilter = categories.length > 0 ? { category: { $in: categories } } : {};
    const sortFilter: Record<string, SortOrder> = sort === "lowest" ? { price: 1 } : { price: -1 };

    const data = await Product.find(categoryFilter).sort(sortFilter).skip(skipAmount).limit(pageSize);
    const products = data.map(toProductSummary);

    const totalProductsCount = await Product.countDocuments(categoryFilter);
    const totalPages = Math.ceil(totalProductsCount / pageSize);
    const isNext = totalProductsCount > skipAmount + products.length;

    return { results: products, isNext, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};

// Related products: same categories, optionally excluding one product, unsorted
export const getAllProductsWithoutSort = async (
  pageNumber = 1,
  pageSize = 20,
  categories: string[] = [],
  excludeProductId?: string
) => {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const categoryFilter = categories.length > 0 ? { category: { $in: categories } } : {};
    const exclusionFilter = excludeProductId ? { stripeProductId: { $ne: excludeProductId } } : {};
    const combinedFilter: Record<string, any> = { ...categoryFilter, ...exclusionFilter };

    const data = await Product.find(combinedFilter).skip(skipAmount).limit(pageSize);
    const products = data.map(toProductSummary);

    const totalProductsCount = await Product.countDocuments(combinedFilter);
    const totalPages = Math.ceil(totalProductsCount / pageSize);
    const isNext = totalProductsCount > skipAmount + products.length;

    return { results: products, isNext, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { results: [], isNext: false, totalPages: 0 };
  }
};

// Paginated product search by name or category, for the search page
export const getAllProductsWithSearch = async ({
  pageNumber = 1,
  pageSize = 20,
  searchQuery = "",
  sortOrder = "desc",
}: {
  pageNumber?: number;
  pageSize?: number;
  searchQuery?: string;
  sortOrder?: "asc" | "desc";
}) => {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const searchRegex = new RegExp(searchQuery, "i");

    const searchQueryFilter =
      searchQuery && searchQuery.trim() !== ""
        ? { $or: [{ name: { $regex: searchRegex } }, { category: { $regex: searchRegex } }] }
        : {};
    const sortFilter: Record<string, 1 | -1> = sortOrder === "asc" ? { createdAt: 1 } : { createdAt: -1 };

    const data = await Product.find(searchQueryFilter).sort(sortFilter).skip(skipAmount).limit(pageSize);
    const products = data.map(toProductSummary);

    const totalProductsCount = await Product.countDocuments(searchQueryFilter);
    const totalPages = Math.ceil(totalProductsCount / pageSize);
    const isNext = totalProductsCount > skipAmount + products.length;

    return { results: products, isNext, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { results: [] as ReturnType<typeof toProductSummary>[], isNext: false, totalPages: 0 };
  }
};

// A product with its deal details, for the product page
export const findProductWithDeal = async (id: string) => {
  try {
    await connectToDB();
    const product = await Product.findOne({ stripeProductId: id });
    if (!product) return null;

    const { name, description, stock, price, category, photo, oldPrice, deal, dealDescription } = product;
    return { name, description, stock, price, category, photo, oldPrice, deal, dealDescription };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};
