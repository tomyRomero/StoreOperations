"use server"


import { revalidatePath} from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Orders from "../models/orders.model";
import { ObjectId } from "mongodb";
import Category from "../models/category.model";
import Product from "../models/product.model";

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

// Get all orders to render on admin page with pagination support, search, and sorting
export const findAllOrdersForAdmin = async ({
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
    // Calculate the number of orders to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Construct the query to find orders matching the search criteria
    const query: any = {
      $or: [
        { orderId: { $regex: regex } }, 
        { user: ObjectId.isValid(searchString) ? new ObjectId(searchString) : null },
        { status: { $regex: regex } },
      ]
    };

    // Determine the sorting order
    const sortOrder = sortBy === "asc" ? 1 : -1;

    // Find orders based on the query, apply pagination, sorting, and filtering
    const orders = await Orders.find(query)
      .sort({ createdAt: sortOrder }) // Sort by createdAt field
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of orders matching the search criteria
    const totalOrdersCount = await Orders.countDocuments(query);

    // Determine if there are more orders beyond the current page
    const isNext = totalOrdersCount > skipAmount + orders.length;

    return { orders, isNext };
  } catch (error) {
    // If an error occurs during the process, log the error message
    console.error("Error finding all orders for admin:", error);
    // Return an empty array to indicate an error occurred
    return { orders: [], isNext: false };
  }
};

//Function to get all Pagination and Search Categories
export const getAllCategoriesAdmin = async ({
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
    // Calculate the number of categories to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Construct the query to find categories matching the search criteria
    const query = {
      $or: [
        { title: { $regex: regex } },
        { _id: ObjectId.isValid(searchString) ? new ObjectId(searchString) : null },
      ],
    };

    // Find categories based on the query, apply pagination and sorting
    const categories = await Category.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort({ date: sortBy });

    // Count the total number of categories matching the search criteria
    const totalCategoriesCount = await Category.countDocuments(query);

    // Determine if there are more categories beyond the current page
    const isNext = totalCategoriesCount > skipAmount + categories.length;

    return { categories, isNext };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { categories: [], isNext: false };
  }
};

// Pagination and Search Supported Product Fetch Function
export const findProductsAdmin = async ({
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
    // Calculate the number of products to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Construct the query to find products matching the search criteria
      const query: { $or: any[] } = { $or: [] };

      // Add search criteria for name and description
      query.$or.push({ name: { $regex: regex } });
      query.$or.push({ stripeProductId : { $regex: regex } });
      query.$or.push({ category : { $regex: regex } });
  
      // Include the price field only if the search string is a valid number
      if (searchString.trim() !== "" && !isNaN(Number(searchString))) {
        query.$or.push({ price: Number(searchString) });
      }

    // Find products based on the query, apply pagination and sorting
    const products = await Product.find(query)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of products matching the search criteria
    const totalProductsCount = await Product.countDocuments(query);

    // Determine if there are more products beyond the current page
    const isNext = totalProductsCount > skipAmount + products.length;

    return { products, isNext };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], isNext: false };
  }
};
