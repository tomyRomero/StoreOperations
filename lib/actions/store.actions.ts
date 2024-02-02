"use server"

import { revalidatePath} from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Category from "../models/category.model";
import { CategoryType, ProductType } from "@/app/types/global";
import Product from "../models/product.model";
import { Stripe } from 'stripe';
import { SortOrder } from 'mongoose';

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
      return null;
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
      return []
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
        return null; 
      }
    
  }
  
  // Get all pagination products data with category filtering and sorting
  export const getAllProducts = async (pageNumber = 1, pageSize = 20, categories: string[] = [], sort = 'lowest') => {
    try {
      // Calculate the number of products to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;
  
      // Build the category filter
      const categoryFilter = categories.length > 0 ? { category: { $in: categories } } : {};
  
      // Build the sort filter based on the 'sort' parameter
      const sortFilter: Record<string, SortOrder> = sort === 'lowest' ? { price: 1 } : { price: -1 };
  
      // Use the find method on the Product model to retrieve paginated products with category filtering and sorting
      const data = await Product.find(categoryFilter)
        .sort(sortFilter)
        .skip(skipAmount)
        .limit(pageSize);
  
      const products = data.map((element) => ({
        stripeProductId: element.stripeProductId,
        name: element.name,
        description: element.description,
        stock: element.stock.toString(),
        price: element.price.toString(),
        category: element.category,
        photo: element.photo,
        date: element.date,
      }));
  
      // Calculate total count of products with category filtering
      const totalProductsCount = await Product.countDocuments(categoryFilter);
  
      // Calculate total pages
      const totalPages = Math.ceil(totalProductsCount / pageSize); 
  
      // Calculate if there are more products
      const isNext = totalProductsCount > skipAmount + products.length;
  
      return { results: products, isNext, totalPages };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  };
  
  //Get pagination products however this time include the option to exlcude a product and also dont do any sorting/lowest/highest logic
  //Used to find related products and also used for admin dashboard
  export const getAllProductsWithoutSort = async (
    pageNumber = 1,
    pageSize = 20,
    categories: string[] = [],
    excludeProductId?: string // Optional parameter for excluding a product by ID
  ) => {
    try {
      // Calculate the number of products to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;
  
      // Build the category filter
      const categoryFilter = categories.length > 0 ? { category: { $in: categories } } : {};
  
      // Build the exclusion filter based on the 'excludeProductId' parameter
      const exclusionFilter = excludeProductId ? { stripeProductId: { $ne: excludeProductId } } : {};
  
      // Combine all filters
      const combinedFilter: Record<string, any> = { ...categoryFilter, ...exclusionFilter };
  
      // Use the find method on the Product model to retrieve paginated products with category filtering and exclusion
      const data = await Product.find(combinedFilter)
        .skip(skipAmount)
        .limit(pageSize);
  
      const products = data.map((element) => ({
        stripeProductId: element.stripeProductId,
        name: element.name,
        description: element.description,
        stock: element.stock.toString(),
        price: element.price.toString(),
        category: element.category,
        photo: element.photo,
        date: element.date,
      }));
  
      // Calculate total count of products with category filtering and exclusion
      const totalProductsCount = await Product.countDocuments(combinedFilter);
  
      // Calculate total pages
      const totalPages = Math.ceil(totalProductsCount / pageSize);
  
      // Calculate if there are more products
      const isNext = totalProductsCount > skipAmount + products.length;
  
      return { results: products, isNext, totalPages };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
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
        revalidatePath("/adminproducts")
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
  