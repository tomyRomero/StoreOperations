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

//Get all orders to render on admin page
export const findAllOrdersForAdmin = async () => {
  try {
    // Find all orders in the database
    const orders = await Orders.find();

    // Return the array of orders
    return orders;
  } catch (error) {
    // If an error occurs during the process, log the error message
    console.error('Error finding all orders for admin:', error);
    // Return an empty array to indicate an error occurred
    return [];
  }
};

