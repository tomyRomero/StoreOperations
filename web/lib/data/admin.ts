import "server-only";

import { Types } from "mongoose";
import { requireAdmin } from "../guards";
import User from "../models/user.model";
import Orders from "../models/orders.model";
import Category from "../models/category.model";
import Product from "../models/product.model";
import Activity from "../models/activity.model";
import Addresses from "../models/addresses.model";
import Store from "../models/store.model";
import { Address } from "@/app/types/global";

// Admin reads for Server Components. Each one checks for an admin itself, so a
// page can never leak data even if its layout check were bypassed.

// Fields an admin may see about a user. Never the password hash.
const USER_FIELDS = "username email date admin createdAt";

type ListParams = {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: "asc" | "desc";
};

export const fetchUsers = async ({ searchString = "", pageNumber = 1, pageSize = 20 }: ListParams) => {
  await requireAdmin();
  try {
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query = {
      $or: [
        { username: { $regex: regex } },
        { email: { $regex: regex } },
        { _id: Types.ObjectId.isValid(searchString) ? new Types.ObjectId(searchString) : null },
      ],
    };

    const users = await User.find(query).select(USER_FIELDS).skip(skipAmount).limit(pageSize);
    const totalUsersCount = await User.countDocuments(query);
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], isNext: false };
  }
};

export const getUserForAdmin = async (userId: string) => {
  await requireAdmin();
  if (!Types.ObjectId.isValid(userId)) return null;
  return User.findById(userId).select(USER_FIELDS);
};

export const getAddressesForUser = async (userId: string): Promise<Address[]> => {
  await requireAdmin();
  if (!Types.ObjectId.isValid(userId)) return [];
  const userAddresses = await Addresses.findOne({ user: userId });
  return userAddresses ? userAddresses.addresses.map((item: any) => item.address) : [];
};

export const findAllOrdersForAdmin = async ({ searchString = "", pageNumber = 1, pageSize = 20, sortBy = "desc" }: ListParams) => {
  await requireAdmin();
  try {
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query: any = {
      $or: [
        { orderId: { $regex: regex } },
        { user: Types.ObjectId.isValid(searchString) ? new Types.ObjectId(searchString) : null },
        { status: { $regex: regex } },
      ],
    };
    const sortOrder = sortBy === "asc" ? 1 : -1;

    const orders = await Orders.find(query).sort({ createdAt: sortOrder }).skip(skipAmount).limit(pageSize);
    const totalOrdersCount = await Orders.countDocuments(query);
    const isNext = totalOrdersCount > skipAmount + orders.length;

    return { orders, isNext };
  } catch (error) {
    console.error("Error finding all orders for admin:", error);
    return { orders: [], isNext: false };
  }
};

export const findOrderForAdmin = async (orderId: string) => {
  await requireAdmin();
  return Orders.findOne({ orderId: String(orderId) });
};

export const getAllCategoriesAdmin = async ({ searchString = "", pageNumber = 1, pageSize = 20, sortBy = "desc" }: ListParams) => {
  await requireAdmin();
  try {
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query = {
      $or: [
        { title: { $regex: regex } },
        { _id: Types.ObjectId.isValid(searchString) ? new Types.ObjectId(searchString) : null },
      ],
    };

    const categories = await Category.find(query).skip(skipAmount).limit(pageSize).sort({ date: sortBy });
    const totalCategoriesCount = await Category.countDocuments(query);
    const isNext = totalCategoriesCount > skipAmount + categories.length;

    return { categories, isNext };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { categories: [], isNext: false };
  }
};

export const findProductsAdmin = async ({ searchString = "", pageNumber = 1, pageSize = 20 }: ListParams) => {
  await requireAdmin();
  try {
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query: { $or: any[] } = {
      $or: [{ name: { $regex: regex } }, { stripeProductId: { $regex: regex } }, { category: { $regex: regex } }],
    };
    // Match on price only when the search is a number
    if (searchString.trim() !== "" && !isNaN(Number(searchString))) {
      query.$or.push({ price: Number(searchString) });
    }

    const products = await Product.find(query).skip(skipAmount).limit(pageSize);
    const totalProductsCount = await Product.countDocuments(query);
    const isNext = totalProductsCount > skipAmount + products.length;

    return { products, isNext };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], isNext: false };
  }
};

// A product with its deal fields, for the deal form
export const findProductForDeal = async (id: string) => {
  await requireAdmin();
  try {
    const product = await Product.findOne({ stripeProductId: String(id) });
    if (!product) return null;
    const { stripeProductId, name, description, stock, price, category, photo, deal, oldPrice, dealDescription } = product;
    return { name, description, stock, price, category, photo, stripeProductId, deal, oldPrice, dealDescription };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

// Activity log, newest first
export const getAllActivity = async (pageNumber = 1, pageSize = 10) => {
  await requireAdmin();
  try {
    const skipAmount = (pageNumber - 1) * pageSize;
    const activities = await Activity.aggregate([{ $sort: { timestamp: -1 } }, { $skip: skipAmount }, { $limit: pageSize }]);
    const totalActivitiesCount = await Activity.countDocuments();
    const isNext = totalActivitiesCount > skipAmount + pageSize;

    return { activities, isNext };
  } catch (error) {
    console.error("Error retrieving all activity:", error);
    return { activities: [], isNext: false };
  }
};

export const getAllSubscribedEmails = async (): Promise<string[]> => {
  await requireAdmin();
  try {
    const store = await Store.findOne();
    return store?.newsletter ?? [];
  } catch (error) {
    console.error("Error fetching subscribed emails:", error);
    return [];
  }
};
