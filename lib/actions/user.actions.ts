"use server"

import { revalidatePath} from "next/cache";
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
    throw null;
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

export const deleteCategoryById = async(categoryId: string) => {
  try {
    // Step 1: Find the category by its id
    connectToDB();
    const category = await Category.findOne({ id: categoryId });

    // Step 2: If the category is found, delete it
    if (category) {
      await category.deleteOne();
      revalidatePath("/admincategories")
      return true
    } else {
      console.log('Category not found.');
      return false
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return false
  }
}

export const updateCreateCategory = async (id: string, title: string, photo: string) =>{
 
  try{
    const existing = await Category.findOne({id : id});

    if(!existing)
    {
      await Category.create(
          {
              title: title,
              photo: photo
          }
      )
      
    }else{
      existing.title = title;
      existing.photo = photo;
      await existing.save();

    }

  }catch(error)
  {
    console.log(error)
    return false
  }
}

export const revalidate = (path: string)=> {
  revalidatePath(path)
}