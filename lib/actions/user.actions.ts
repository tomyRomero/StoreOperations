"use server"

import { revalidatePath} from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Category from "../models/category.model";
import mongoose from "mongoose";
import { CategoryType, ProductType } from "@/app/types/global";
import Product from "../models/product.model";
import { Stripe } from 'stripe';

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
    // Use the find method on the Category model to retrieve all Categories
    connectToDB();
    const data = (await Category.find({}));

    const categories:CategoryType[]= []

    //Transform server mongodb data to regular data so that i can pass it along to client components
    data.forEach(element => {
      categories.push({
        id: element.id,
        title: element.title,
        photo: element.photo,
        date: element.date
      })
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw null;
  }
};

//Function to fetch all categories
export const getAllCategoriesForProduct = async () => {
  try {
    // Use the find method on the User model to retrieve all users
    connectToDB();
    const data = (await Category.find({}));

    const categories: string[] = []

    data.forEach(element => {
      categories.push(element.title)
    });

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
  
  const {title, photo} = category

  //destructure the object because objects can't be passed from server to client 
  return {title, photo};
  
  }catch(error)
  {
    console.error("Error fetching category:", error);
    throw error; 
  }

}

//Delete Category 
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

//For Category creation
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

//For Product creation
export const updateCreateProduct = async (
  stripeId: string,
  name: string, 
  description: string, 
  stock: number,
  price: number,
  category: string, 
  photo: string) => {

    try{
      const existing = await Product.findOne({stripeProductId : stripeId});
  
      if(!existing)
      {
        await Product.create(
            {
                stripeProductId: stripeId,
                name: name,
                description: description,
                stock: stock, 
                price: price,
                category: category,
                photo: photo
            }
        )
        
      }else{
        existing.name = name;
        existing.description = description;
        existing.stock = stock;
        existing.price = price;
        existing.category = category;
        existing.photo = photo;
        await existing.save();
      }
  
    }catch(error)
    {
      console.log(error)
      throw error;
    }

}

//Find Product by id
export const findProduct = async (id:string) => {
  try{
    connectToDB();
    // Find the category by ID
    const product = await Product.findOne({stripeProductId: id});
    
    const {name, description, stock, price, category, photo } = product

    //destructure the object because objects can't be passed from server to client 
    return {name, description, stock, price, category, photo }
    
    }catch(error)
    {
      console.error("Error fetching category:", error);
      throw error; 
    }
  
}

//Get all products data
export const getAllProducts = async () => {
  try {
    // Use the find method on the Product model to retrieve all products
    connectToDB();
    const data = (await Product.find({}));

    const products:ProductType[]= []

    //Transform server mongodb data to regular data so that i can pass it along to client components
    data.forEach(element => {
      products.push({
        stripeProductId: element.stripeProductId,
        name: element.name,
        description: element.description,
        stock: element.stock.toString(), 
        price: element.price.toString(),
        category: element.category,
        photo: element.photo,
        date: element.date
      })
    });

    return products;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw null;
  }
};


// Archive Product and its Price in Stripe
export const archiveStripeProduct = async (productId: string) => {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const stripeInstance = new Stripe(key ? key : "");

    const existingProduct = await stripeInstance.products.retrieve(productId);
    const defaultPrice = existingProduct.default_price;

    // Archive the product
    const archivedProduct = await stripeInstance.products.update(productId, {
      active: false,
    });

    console.log("Product Archived: ", archivedProduct);

    // Archive the product's price
    if (defaultPrice) {
      const archivePrice = await stripeInstance.prices.update(defaultPrice.toString(), {
        active: false,
      });

      console.log("Price of Archived Product archived: ", archivePrice);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};


//Delete Product
export const deleteProductById = async (stripeId : string) => {
  try {
    // Step 1: Find the Product by its id
    connectToDB();
    const product = await Product.findOne({ 
    stripeProductId: stripeId });


    // Step 2: If the Product is found, delete it
    if (product) {
      await archiveStripeProduct(stripeId)
      await product.deleteOne();
      return true
    } else {
      console.log('Product not found.');
      return false
    }
  } catch (error) {
    console.error('Error deleting Product:', error);
    return false
  }
}

export const revalidate = (path: string)=> {
  revalidatePath(path)
}
