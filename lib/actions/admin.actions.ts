"use server"


import { revalidatePath} from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Orders from "../models/orders.model";
import { ObjectId } from "mongodb";
import Category from "../models/category.model";
import Product from "../models/product.model";

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
