import "server-only";

import { Types } from "mongoose";
import { requireAdmin } from "../guards";
import User from "../models/user.model";
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
