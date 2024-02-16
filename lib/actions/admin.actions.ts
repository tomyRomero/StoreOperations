"use server"


import { revalidatePath} from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Orders from "../models/orders.model";

// Function to fetch all users
export const getAllUsers = async () => {
  try {
    // Use the find method on the User model to retrieve all users
    connectToDB();
    const users = await User.find({});
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
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

