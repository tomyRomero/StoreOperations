import "server-only";

import { connectToDB } from "../mongoose";
import { getSessionUser, requireUser } from "../guards";
import User from "../models/user.model";
import Orders from "../models/orders.model";
import Addresses from "../models/addresses.model";
import Cart from "../models/cart.model";
import { Address } from "@/app/types/global";

// Reads scoped to the signed-in customer, for Server Components.
// The user id always comes from the session, never from the caller.

export const getCurrentUserProfile = async () => {
  const { id } = await requireUser();
  const user = await User.findById(id)
    .select("username email date")
    .lean<{ username: string; email: string; date: string }>();
  if (!user) return null;
  return { id, username: user.username, email: user.email, date: user.date };
};

// The signed-in customer's orders, newest first
export const findOrdersForCurrentUser = async (pageNumber = 1, pageSize = 10) => {
  const { id } = await requireUser();
  const skipAmount = (pageNumber - 1) * pageSize;

  const orders = await Orders.find({ user: id }).sort({ createdAt: -1 }).skip(skipAmount).limit(pageSize);
  const totalOrdersCount = await Orders.countDocuments({ user: id });
  const isNext = totalOrdersCount > skipAmount + orders.length;

  return { orders, isNext };
};

// One order, only if it belongs to the signed-in customer
export const findOrderForCurrentUser = async (orderId: string) => {
  const { id } = await requireUser();
  return Orders.findOne({ orderId: String(orderId), user: id });
};

export const getCurrentUserAddresses = async (): Promise<Address[]> => {
  const { id } = await requireUser();
  const userAddresses = await Addresses.findOne({ user: id });
  return userAddresses ? userAddresses.addresses.map((item: any) => item.address) : [];
};

// Whether a product is already in the signed-in customer's cart; false for guests
export const isInCurrentUserCart = async (productId: string) => {
  const user = await getSessionUser();
  if (!user) return false;

  await connectToDB();
  const cart = await Cart.findOne({ user: user.id });
  return Boolean(cart?.products.some((item: any) => item.product.toString() === String(productId)));
};
