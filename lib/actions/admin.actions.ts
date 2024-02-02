"use server"


import { revalidatePath} from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Category from "../models/category.model";
import { CategoryType, ProductType } from "@/app/types/global";

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


export const revalidate = (path: string)=> {
  revalidatePath(path)
}
