"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Category from "../models/category.model";
import mongoose from "mongoose";

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

//Function to fetch all categories
export const getAllCategories = async () => {
  try {
    // Use the find method on the User model to retrieve all users
    connectToDB();
    const categories = await Category.find({}).lean();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; 
  }
};

//Function to fetch a category by ID
export const findCategory = async (id: string) => {
  try{
  connectToDB();
  // Find the category by ID
  const category = await Category.findOne({id: id});
  return category;
  
  }catch(error)
  {
    console.error("Error fetching category:", error);
    throw error; 
  }

}

  
