"use server"


import { revalidatePath} from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Orders from "../models/orders.model";
import { ObjectId } from "mongodb";

//Pagination and Search Supported User Fetch Function
export const fetchUsers = async ({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: "asc" | "desc";
}) => {
  try {
    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Construct the query to find users matching the search criteria
    const query = {
      $or: [
        { username: { $regex: regex } },
        {email: { $regex: regex }},
        { _id: ObjectId.isValid(searchString) ? new ObjectId(searchString) : null },
      ],
    };

    // Find users based on the query, apply pagination and sorting
    const users = await User.find(query)
      .skip(skipAmount)
      .limit(pageSize)

    // Count the total number of users matching the search criteria
    const totalUsersCount = await User.countDocuments(query);

    // Determine if there are more users beyond the current page
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
   return { users:[], isNext:false}
  }
};


// Function to fetch user by ID
export const getUser = async (userId: string) => {
  try {
    // Use the find method on the User model to retrieve all users
    connectToDB();
    const user = await User.findById(userId)
    return user;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {}
  }
};

//Function to fetch user by ID for Client 
export const getUserClient = async (userId: string) => {
  try {
    // Use the find method on the User model to retrieve all users
    connectToDB();
    const user = await User.findById(userId)
    const userObject = {
      username : user.username,
      email: user.email,
      date: user.date
    }
    return userObject;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      username: "Error",
      email: "Error",
      date: "Error",
    }
  }
};

// Function modified for client components
export const getUserForClient = async (userId: string) =>
{
  try {
    // Use the find method on the User model to retrieve all users
    connectToDB();
    const user = await User.findById(userId);
    // Convert mongoose document to plain JavaScript object
    const plainUser = {
      email: user.email,
      username: user.username,
      password: user.password,
      admin: user.admin,
      stripeId: user.stripeId,
      date: user.date
    }
    return plainUser;
  } catch (error) {
    console.error("Error fetching users:", error);
    const plainUser = {
      email: "null",
      username: "null",
      password: "null",
      admin: "null",
      stripeId: "null",
      date: "null"
    }
    return plainUser;
  }
}


export const revalidate = (path: string)=> {
  revalidatePath(path)
}

export const getAdminUser = async () => {
  try {
    // Use the findOne method on the User model to retrieve the admin user
    const adminUser = await User.findOne({ admin: true });
    return adminUser;
  } catch (error) {
    console.error("Error fetching admin user:", error);
    throw error;
  }
};

// Get all orders to render on admin page, sorted by most recent
export const findAllOrdersForAdmin = async () => {
  try {
    // Find all orders in the database and sort them by createdAt field in descending order
    const orders = await Orders.find().sort({ createdAt: -1 });

    // Return the array of orders
    return orders;
  } catch (error) {
    // If an error occurs during the process, log the error message
    console.error('Error finding all orders for admin:', error);
    // Return an empty array to indicate an error occurred
    return [];
  }
};

