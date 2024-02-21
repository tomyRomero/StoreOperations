"use server"

import { revalidatePath} from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Category from "../models/category.model";
import { Address, CategoryType, ProductType } from "@/app/types/global";
import Product from "../models/product.model";
import { Stripe } from 'stripe';
import { SortOrder } from 'mongoose';
import Cart from "../models/cart.model";
import Addresses from "../models/addresses.model";
import Orders from "../models/orders.model";
import Activity from "../models/activity.model";
import { createOrUpdateStripeProduct } from "@/app/api/product/route";
import { dollarsToCents } from "../utils";
import Store from "../models/store.model";

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

  // Delete Category and all the products in that category
// Delete Category
export const deleteCategoryById = async (categoryId: string) => {
  try {
    // Step 1: Find the category by its id
    connectToDB();
    const category = await Category.findOne({ id: categoryId });

    // Step 2: If the category is found, delete associated products
    if (category) {
      // Step 3: Find all products associated with the category
      const productsToDelete = await Product.find({ category: category.title });
      console.log("products to delete: ", productsToDelete)

      // Step 4: Archive products from Stripe and delete them from the database
      await Promise.all(productsToDelete.map(async (product) => {
        await archiveStripeProduct(product.stripeProductId);
        await product.deleteOne();
      }));

      // Step 5: Delete the category
      await category.deleteOne();

      revalidatePath("/admincategories");

      console.log(`Deleted ${productsToDelete.length} products associated with the category and archived them from Stripe.`);
      return true;
    } else {
      console.log('Category not found.');
      return false;
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};
  
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
      // Find the product by ID
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

  //find product with deal details if applicable

    //Find Product by id
    export const findProductWithDeal = async (id:string) => {
      try{
        connectToDB();
        // Find the product by ID
        const product = await Product.findOne({stripeProductId: id});
        
        const {name, description, stock, price, category, photo , oldPrice, deal, dealDescription } = product
    
        //destructure the object because objects can't be passed from server to client 
        return {name, description, stock, price, category, photo, oldPrice, deal, dealDescription }
        
        }catch(error)
        {
          console.error("Error fetching category:", error);
          return null; 
        }
      
    }

//Find Product by ID and include ID and other Deal Params
  export const findProductForDeal = async (id:string) => {
    try{
      connectToDB();
      // Find the product by ID
      const product = await Product.findOne({stripeProductId: id});
      
      const {stripeProductId, name, description, stock, price, category, photo, deal , oldPrice , dealDescription} = product
  
      //destructure the object because objects can't be passed from server to client 
      return {name, description, stock, price, category, photo, stripeProductId, deal , oldPrice, dealDescription}
      
      }catch(error)
      {
        console.error("Error fetching product:", error);
        return null; 
      }
    
  }


  //Make Deal for Product
  export const makeDeal = async (id: string, newPrice: string, dealDescription: string) => {
    try{
    const existingProduct = await Product.findOne({stripeProductId: id});

    if(existingProduct)
    {

      //Update Stripe Product with new price 
      await createOrUpdateStripeProduct(id, existingProduct.name, dollarsToCents(Number(newPrice)), existingProduct.photo, existingProduct.description)

      existingProduct.deal = true;
      existingProduct.oldPrice = existingProduct.price
      existingProduct.price = Number(newPrice);
      existingProduct.dealDescription = dealDescription;

      await existingProduct.save()

      console.log("made new deal: ", existingProduct)
      return true;
    }else{
      console.log("Product does not exist for deal")
      return false;
    }

    }catch(error){
      console.error("Error making deal:", error);
      return false;
    }
  }

  //Remove Deal from Product
  export const removeDeal = async (id: string) => {
    try{
    const existingProduct = await Product.findOne({stripeProductId: id});

    if(existingProduct)
    {

      //Update Stripe Product with old price before deal
      await createOrUpdateStripeProduct(id, existingProduct.name, dollarsToCents(Number(existingProduct.oldPrice)), existingProduct.photo, existingProduct.description)

      existingProduct.deal = false;
      existingProduct.price = Number(existingProduct.oldPrice);
      existingProduct.oldPrice = 0
      existingProduct.dealDescription = "";

      await existingProduct.save()

      console.log("removed deal: ", existingProduct)
      return true;
    }else{
      console.log("Product does not exist for deal")
      return false;
    }

    }catch(error){
      console.error("Error removing deal:", error);
      return false;
    }
  }

  //Function that returns all products with deals
  export const getDeals = async () => {
    try {
      // Use the find method on the Product model to retrieve products with a "deal" property set to true
      const data = await Product.find({ deal: true });
  
      const deals = data.map((element) => ({
        stripeProductId: element.stripeProductId,
        name: element.name,
        description: element.description,
        stock: element.stock.toString(),
        price: element.price.toString(),
        category: element.category,
        photo: element.photo,
        date: element.date,
        oldPrice: element.oldPrice,
        dealDescription: element.dealDescription,
      }));
  
      return deals;
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  };
  

  // Get all pagination products data with category filtering and sorting , used for products page
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
  //Used to find related products 
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
      return {results: [], isNext: false, totalPages: 0}
    } 
  };

  // Get all pagination products data with search and pagination, used for search page
  export const getAllProductsWithSearch = async ({
    pageNumber = 1,
    pageSize = 20,
    searchQuery = '',
    sortOrder = 'desc' // Default sort order is descending
  }: {
    pageNumber?: number;
    pageSize?: number;
    searchQuery?: string;
    sortOrder?: 'asc' | 'desc'; // Define sortOrder parameter to accept only 'asc' or 'desc'
  }) => {
    try {
      // Calculate the number of products to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;

      // Create a case-insensitive regular expression for the provided search query.
      const searchRegex = new RegExp(searchQuery, 'i');

      // Construct the query to find products matching the search criteria
      const searchQueryFilter = searchQuery && searchQuery.trim() !== ''
        ? {
          $or: [
            { name: { $regex: searchRegex } },
            { category: { $regex: searchRegex } }, 
          ],
        }
        : {};

      // Build the sort filter based on the 'sortOrder' parameter
      const sortFilter: Record<string, 1 | -1> = sortOrder === 'asc' ? { createdAt: 1 } : { createdAt: -1 };

      // Use the find method on the Product model to retrieve paginated products with search and sorting
      const data = await Product.find(searchQueryFilter)
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

      // Calculate total count of products with search
      const totalProductsCount = await Product.countDocuments(searchQueryFilter);

      // Calculate total pages
      const totalPages = Math.ceil(totalProductsCount / pageSize);

      // Calculate if there are more products
      const isNext = totalProductsCount > skipAmount + products.length;

      return { results: products, isNext, totalPages };
    } catch (error) {
      console.error('Error fetching products:', error);
      const results: any[] = [];
      const isNext = false;
      const totalPages = 0;
      return { results, isNext, totalPages };
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
  
// Function to add a product to a user's cart
export const addProductToCart = async (userId: string, productId: string, quantity = 1) => {
  try {
    let addedToCart = false; // Flag to indicate whether the product was added to the cart

      // User is signed in, follow the original logic
      const user = await User.findById(userId);

      if (!user) {
        console.error('User not found');
        return addedToCart;
      } else {
        console.log("User Found: ", user)
      }

      const product = await Product.findOne({ stripeProductId: productId });

      if (!product) {
        console.error('Product not found');
        return addedToCart;
      } else {
        console.log("Product Found: ", product)
      }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
          cart = await Cart.create({ user: userId, products: [] });
          console.log("Cart not found, creating new one: ", cart)
        } else {
          console.log("Cart found associated with user, updating...")
        }

        const productToAdd = { product: productId, quantity };

        const existingProductIndex = cart.products.findIndex(
          (item: any) => item.product.toString() === productId.toString()
        );

        if (existingProductIndex !== -1) {
          console.log("Found product in cart");
          cart.products[existingProductIndex].quantity += quantity;
          console.log(`Added ${quantity} more quantity to the product in cart`);
          addedToCart = true;
        } else {
            console.log("Product not in cart, adding")
            cart.products.push(productToAdd);
            addedToCart = true;
        }

        await cart.save();
        console.log(`Product added to cart for user ${userId}`);
     
    
    return addedToCart; // Return the flag indicating whether the product was added to the cart
  } catch (error) {
    console.error('Error adding product to cart:', error);
    return false; // Return false in case of an error
  }
}

// Function to remove a product from a user's cart by its qunatatity or all together
export const removeProductFromCart = async (
  userId: string,
  productId: string,
  removeQuantity: number = 1,
  removeAll: boolean = false
) => {
  try {
      // User is signed in, follow the original logic
      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        console.error('Cart not found for the user');
        return;
      } else {
        console.log("Cart found associated with user, updating...")
      }

      // Find the index of the product in the cart
      const productIndex = cart.products.findIndex(
        (item: any) => item.product.toString() === productId.toString()
      );

      if (productIndex !== -1) {
        // Product found in the cart

        if (removeAll || cart.products[productIndex].quantity <= removeQuantity) {
          // Remove the entire product from the cart if removeAll is true or if the remaining quantity is less than or equal to removeQuantity
          cart.products.splice(productIndex, 1);
          console.log(`Product removed from cart for user ${userId}`);
        } else {
          // Decrease the quantity
          cart.products[productIndex].quantity -= removeQuantity;
          console.log(`Decreased quantity by ${removeQuantity} for the product in cart`);
        }

        await cart.save();
      } else {
        console.log(`Product ${productId} not found in the cart.`);
      }
  } catch (error) {
    console.error('Error removing product from cart:', error);
  }
}

// Function to check if a product is inside a cart alreayd
export const insideCart = async (userId: string, productId: string )=> {
  try{
    //Look for Cart that belongs to user
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      //Cart does not exist so therefore product is not found in cart
      return false;
    } else {
      console.log("Cart found associated with user, checking to see if product is inside")

      const existingProductIndex = cart.products.findIndex(
      (item: any) => item.product.toString() === productId.toString()
      );

      if (existingProductIndex !== -1) {
        console.log("Found product in cart");
        return true;
      } else {
          console.log("Product not in cart")
        return false;
      }
    }
    
  }catch(error)
  {
    console.log(error)
    return false;
  }
}

//get all the items within a cart
export const getCartItems = async (userId: string) => {
  try {
    // Look for Cart that belongs to the user
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Cart does not exist
      console.log("No cart found for logged in user")
      return [];
    } else {
      console.log("cart found for logged in user")
       // Serialize the products array to prevent circular references/max stack errors
       const serializedProducts = JSON.stringify(cart.products);
       
       // Parse the serialized products back to an object
       const parsedProducts = JSON.parse(serializedProducts);
 
       return parsedProducts;
    }
  } catch (error) {
    console.error("Error retrieving cart items:", error);
    return [];
  }
};

// Function to sync local storage with the user's account cart
export const syncLocalStorageWithServerCart = async (localStorageCart: {product: string, quantity: number}[], userId: string) => {
  try {
    // Get the user's cart from the server
    let serverCart = await Cart.findOne({ user: userId });

    if (!serverCart) {
      console.log('Cart not found for the user, creating a new one...');
      serverCart = new Cart({ user: userId, products: [] });
    } else {
      console.log('Cart found associated with user, updating...');
    }

    // Update the server cart based on the local storage cart
    localStorageCart.forEach(({ product, quantity }: any) => {
      const productIndex = serverCart.products.findIndex(
        (item: any) => item.product.toString() === product.toString()
      );

      if (productIndex !== -1) {
        // Product found in the server cart, update quantity if needed
        serverCart.products[productIndex].quantity = Math.max(
          serverCart.products[productIndex].quantity,
          quantity
        );
      } else {
        // Product not found in the server cart, add it
        serverCart.products.push({ product, quantity });
      }
    });

    // Save the updated server cart
    await serverCart.save();

    console.log('Cart synchronization complete.');
    
    // Return a success indicator
    return { success: true, message: 'Cart synchronization successful' };
  } catch (error) {
    console.error('Error syncing local storage with server cart:', error);

    // Return an error message
    return { success: false, message: 'Error syncing cart with server' };
  }
};

//Take server cart and check all products inside have a quantity that do not pass the stock of the products
//Basically make sure everything is in stock before processing the checkout
export const cartItemsInStock = async (userId: string) => {
  try {
    // Look for Cart that belongs to the user
    const cart = await Cart.findOne({ user: userId });

    if (!cart || !cart.products || cart.products.length === 0) {
      // Cart does not exist or has no products
      console.log("No cart found or cart has no products for the logged-in user");
      return false;
    } else {
      console.log("Cart found for logged-in user");
      let allStock = true;

      // Use Promise.all to wait for all asynchronous operations in the loop
      await Promise.all(cart.products.map(async (product: { product: string, quantity: number }, index: number) => {
        // Access the current product
        console.log(`Product at index ${index}:`, product);

        // For each product in cart get its id and find it in the database
        const dbProduct = await Product.findOne({ stripeProductId: product.product });

        if (dbProduct) {
          if (dbProduct.stock) {
            product.quantity > dbProduct.stock
              ? (allStock = false,
                console.log(
                  `product ${dbProduct.name} NOT in stock for cart quantity, stock: ${dbProduct.stock}, cart quantity: ${product.quantity}`
                ))
              : console.log(`product ${dbProduct.name} in stock, stock: ${dbProduct.stock}, cart quantity: ${product.quantity}`);
          } else {
            // If stock does not exist then all of the stock is not valid
            allStock = false;
          }
        } else {
          // Set the stock to false because I cannot find the product, it might've been removed
          allStock = false;
        }
      }));

      console.log(`Proceed to checkout? : ${allStock}`);
      return allStock;
    }
  } catch (error) {
    console.error("Error retrieving cart items:", error);
    return false;
  }
};

//create Checkout so that user can proceed to payment as well as store addresses the user wants 
export const createCheckout = async (userId: string, address:Address, store: boolean) => {
  try{
    const existing = await User.findById(userId)

    const checkout= {
      address: address
    }

    if(existing)
    {
      //if user exists update the checkout object that we will be using to ensure we can proceed to payment
      existing.checkout = checkout;
      await existing.save();

      console.log("saved checkout")
      console.log(existing)

      if (store) {
        // Check if the user already has addresses stored
        let userAddresses = await Addresses.findOne({ user: userId });

        if (!userAddresses) {
            // If no addresses are stored, create a new document with the provided address
            userAddresses = await new Addresses({
                user: userId,
                addresses: [{ address: address }]
            });

            console.log("created address list for user")
        } else {
            // If addresses are already stored, append the new address to the existing list
            await userAddresses.addresses.push({ address: address });
            console.log("added new address to address list")
        }

        await userAddresses.save();
    }

    return true;
    }else{
      console.log("Did not find user when updating checkout")
      return false;
    }

  }catch(error)
  {
    console.log(`an error occured updating checkout: ${error}`)
    return false;
  }
}

//get address and orderId from checkout that was created when we selected our address.
export const getAddressFromCheckout = async (userId: string) => {
  try {
    const existing = await User.findById(userId);

    if (existing && existing.checkout && existing.checkout.address) {
      console.log("success in getting checkout")
      console.log({address: existing.checkout.address})
      return { address: existing.checkout.address };
    } else {
      console.log("something wrong happened")
      return false // Either no user, no checkout, or no address in the checkout
    }
  } catch (error) {
    console.log(`An error occurred while fetching address from checkout: ${error}`);
    return false;
  }
};

//Remove checkout object when payment is proccessed
export const removeCheckout = async (userId: string) => {
  try {
    const existing = await User.findById(userId);

    if (existing) {
      // Remove the checkout object from the user document
      existing.checkout = undefined;
      await existing.save();

      console.log("Removed checkout");
      console.log(existing);

      return true;
    } else {
      console.log("User not found when removing checkout");
      return false;
    }
  } catch (error) {
    console.log(`An error occurred while removing checkout: ${error}`);
    return false;
  }
};

//Remove the current cart associated with user when payment is proccessed
export const removeUserCart = async (userId: string) => {
  try {
    // Find the user's cart document
    const userCart = await Cart.findOne({ user: userId });

    if (userCart) {
      // If the cart document exists, remove it
      await Cart.deleteOne({ user: userId });
      console.log('User cart removed successfully.');
      return { success: true, message: 'User cart removed successfully' };
    } else {
      // If the cart document does not exist, log a message indicating so
      console.log('User cart not found.');
      return { success: false, message: 'User cart not found' };
    }
  } catch (error) {
    // If an error occurs during the process, log the error message
    console.error('Error removing user cart:', error);
    return { success: false, message: 'Error removing user cart' };
  }
};

interface OrderParams {
  orderId: string;
  user: string;
  items: { product: string; quantity: number;}[];
  status?: string;
  address: { name: string, address: {line1 : string, line2 : string | null, city: string, country: string, postal_code: string , state: string}};
  pricing: { total: string, subtotal: string, taxAmount: string, shipping: string, taxtId: string };
}

//Create Order After Checkout is Completed
export const createOrder = async (params: OrderParams): Promise<boolean> => {
  try {
    // Fetch product details for each item in the order
    const orderItems = await Promise.all(params.items.map(async (item) => {
      try {
        const product = await Product.findOne({ stripeProductId: item.product });
        if (!product) {
          throw new Error(`Product not found for ID: ${item.product}`);
        }
        return {
          productId: product._id, // Extract the product ID
          productName: product.name, // Extract the product name
          productPrice: product.price.toString(), // Convert product price to string and extract
          productImage: product.photo, // Extract the product image
          quantity: item.quantity,
        };
      } catch (error) {
        console.error(`Error fetching product for ID: ${item.product}`, error);
        // Return a placeholder item with the product ID and quantity
        return {
          productId: item.product, // Provide product ID as is
          productName: 'Product Not Found', // Provide default product name
          productPrice: '0', // Provide default product price as string
          productImage: '', // Provide empty product image
          quantity: item.quantity,
        };
      }
    }));

    // Create a new instance of the Orders model with the provided parameters
    const newOrder = new Orders({
      orderId: params.orderId,
      user: params.user,
      items: orderItems,
      status: params.status || 'Pending', // If status is not provided, default to 'pending'
      address: params.address,
      pricing: params.pricing,
    });

    // Save the new order object to the database
    await newOrder.save();

    // Create a new activity entry to log the order creation
    const newActivity = new Activity({
      action: 'order_created',
      timestamp: new Date(),
      details: {
        orderId: params.orderId,
        user: params.user,
        pricing: params.pricing,
        status: params.status,
      },
    });

    // Save the new activity object to the database
    await newActivity.save();

    // If the order creation and activity logging are successful, return true
    return true;
  } catch (error) {
    // If an error occurs during the process, log the error message and return false
    console.error('Error creating order:', error);
    return false;
  }
};

//Find Order for Individual Order Page
export const findOrder = async (orderId: string) => {
  try {
    // Find the order in the database based on orderId
    const order = await Orders.findOne({ orderId });

    if (order) {
      // If the order is found, return it
      return order;
    } else {
      // If the order is not found, return null
      return null;
    }
  } catch (error) {
    // If an error occurs during the process, log the error message
    console.error('Error finding order:', error);
    // Return null to indicate an error occurred
    return null;
  }
};

//Find and update order status as seller
export const updateOrderStatus = async (orderId: string , status: string, estimatedDelivery: string , tracking: string , path: string) =>
{
  try{
  const existing = await Orders.findOne({ orderId });

  if (existing) {
    existing.status = status;
    existing.deliveryDate = estimatedDelivery;
    existing.trackingNumber = tracking;

    await existing.save();
    revalidatePath(path);
    return true;
  }else{
    console.log("existing order not found")
    return null;
  }
}catch(error)
  {
    console.log(error)
    return null;
  }

}

// Function to find all orders for a user with pagination support and sorted by createdAt
export const findAllOrdersForUser = async (userId: string, pageNumber: number = 1, pageSize: number = 10) => {
  try {
    // Calculate the number of orders to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Find orders in the database belonging to the provided userId, with pagination and sorted by createdAt
    const orders = await Orders.find({ user: userId })
      .sort({ createdAt: -1 }) // Sort in descending order of createdAt
      .skip(skipAmount) // Skip the specified number of orders
      .limit(pageSize); // Limit the number of orders returned

    // Calculate total count of orders for the user
    const totalOrdersCount = await Orders.countDocuments({ user: userId });

    // Calculate if there are more orders after the current page
    const isNext = totalOrdersCount > skipAmount + orders.length;

    // Return the retrieved orders and whether there are more orders
    return { orders, isNext };
  } catch (error) {
    // If an error occurs during the process, log the error message
    console.error('Error finding all orders for user:', error);
    // Return an empty array to indicate an error occurred
    return { orders: [], isNext: false };
  }
};

// Function to save an address for a user
export const saveAddress = async (userId: string, address: Address, path: string) => {
  try {
    // Check if the user already has addresses stored
    let userAddresses = await Addresses.findOne({ user: userId });

    if (!userAddresses) {
      // If no addresses are stored, create a new document with the provided address
      userAddresses = await new Addresses({
        user: userId,
        addresses: [{ address: address }]
      });
    } else {
      // If addresses are already stored, append the new address to the existing list
      await userAddresses.addresses.push({ address: address });

    }

    // Save the updated addresses document
    revalidatePath(path)
    await userAddresses.save();

    console.log("Address saved successfully");
    return true;
  } catch (error) {
    console.error(`An error occurred while saving the address: ${error}`);
    return false;
  }
};

//Get all addresses belonging to user
export const getUserAddresses = async (userId: string) => {
  try {
      // Find the user's addresses based on the provided userId
      const userAddresses = await Addresses.findOne({ user: userId });

      if (userAddresses) {
          // If addresses are found, return the addresses array
          const myAddresses = userAddresses.addresses.map((item: any) => item.address);
          console.log("user addresses: " , myAddresses)
          return myAddresses
      } else {
          // If no addresses are found, return an empty array
          return [];
      }
  } catch (error) {
      console.log(`An error occurred while fetching user addresses: ${error}`);
      return [];
  }
};

//Delete address for user
export const deleteAddress = async (userId: string, addressToDelete: Address, path: string) => {
  try {
    // Find the document containing the addresses array for the user
    const query = { user: userId };

    // Use the $pull operator to remove the specified address from the addresses array
    const update = { $pull: { addresses: { address: addressToDelete } } };

    // Set the `new` option to true to return the modified document after update
    const options = { new: true };

    // Perform the update operation
    const updatedDocument = await Addresses.findOneAndUpdate(query, update, options);

    if (updatedDocument) {
      // Address deleted successfully
      console.log('Address deleted successfully:', updatedDocument);
      revalidatePath(path)
      return true;
    } else {
      // Address not found or already deleted
      console.log('Address not found or already deleted');
      return null;
    }
  } catch (error) {
    // Error occurred while deleting the address
    console.error('Error deleting address:', error);
    throw error; // You can handle this error in your application
  }
};

// Function to delete user address by _id
export const deleteAddressById = async (userId: string, addressId: string, path: string) => {
  try {
    // Find the document containing the addresses array for the user
    const query = { user: userId };

    // Use the $pull operator to remove the address with the specified _id from the addresses array
    const update = { $pull: { addresses: { _id: addressId } } };

    // Set the `new` option to true to return the modified document after update
    const options = { new: true };

    // Perform the update operation
    const updatedDocument = await Addresses.findOneAndUpdate(query, update, options);

    if (updatedDocument) {
      // Address deleted successfully
      console.log('Address deleted successfully:', updatedDocument);
      revalidatePath(path);
      return true;
    } else {
      // Address not found or already deleted
      console.log('Address not found or already deleted');
      return null;
    }
  } catch (error) {
    // Error occurred while deleting the address
    console.error('Error deleting address:', error);
    return null; // You can handle this error in your application
  }
};

//Function that returns all activities with pagination
export const getAllActivity = async (pageNumber: number = 1, pageSize: number = 10): Promise<{ activities: typeof Activity[], isNext: boolean }> => {
  try {
    // Calculate the number of activities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Aggregate pipeline to sort activities by date in descending order, to get most recent up on top.
    // skip the specified number of documents, and limit the number of documents returned
    const activities = await Activity.aggregate([
      { $sort: { timestamp: -1 } }, // Sort by timestamp field in descending order
      { $skip: skipAmount }, // Skip the specified number of documents
      { $limit: pageSize } // Limit the number of documents returned
    ]);

    // Calculate if there are more activities
    const totalActivitiesCount = await Activity.countDocuments();
    const isNext = totalActivitiesCount > skipAmount + pageSize;

    // Return the retrieved activity entries and whether there are more activities
    return { activities, isNext };
  } catch (error) {
    // If an error occurs during the process, log the error message and return an empty array
    console.error('Error retrieving all activity:', error);
    return { activities: [], isNext: false };
  }
};

//Update the stock of products after purchase
export const updateProductStockAfterPurchase = async (items: {product: string, quantity: number}[]) => {
  try {
    // Iterate through each item in the list and update the stock for the corresponding product

    console.log("stock items: ", items)

    for (const item of items) {
      const product = await findProduct(item.product);

      console.log("product stock: ", product)

      if (!product) {
        console.error(`Product not found for ID: ${item.product}`);
        continue;
      }

      // Calculate new stock

      console.log("product stock number: ", product.stock)
      console.log("item quantity: ", item.quantity)
      const newStock = product.stock - item.quantity;
      console.log("new stock cal: ", newStock)
      // Update the stock of the product in the database
      await Product.updateOne({ stripeProductId: item.product }, { stock: newStock });
      console.log(`Updated stock for product ${product.name}: ${product.stock} -> ${newStock}`);
    }

    console.log('All product stocks updated successfully.');
  } catch (error) {
    console.error('Error updating product stock after purchase:', error);
  }
};

// subscribe to Newsletter for admin to send messages
export const subscribeToNewsletter = async (email: string) => {
  try {
    // Find the first document in the Store collection
    console.log('Finding store document...');
    let store = await Store.findOne();

    // If no store document exists, create a new one
    if (!store) {
      console.log('No store document found, creating a new one...');
      store = new Store();
    }

    // Check if the newsletter array exists in the store
    if (!store.newsletter) {
      // If the newsletter array doesn't exist, create it and add the email
      console.log('Creating newsletter array and adding email...');
      store.newsletter = [email];
    } else {
      // If the newsletter array exists, check if the email already exists
      if (store.newsletter.includes(email)) {
        console.log('Email already exists in the newsletter.');
        return 'Email already exists in the newsletter';
      }
      // If the email doesn't exist, push it to the newsletter array
      console.log('Adding email to newsletter...');
      store.newsletter.push(email);
    }

    // Save the updated store document
    console.log('Saving store document...');
    await store.save();

    // Log the activity of user subscribing
    console.log('Logging user subscription activity...');
    const activity = new Activity({
      action: 'user_subscribed',
      details: { userEmail: email }, // Include user's email in the activity details
    });
    await activity.save();

    console.log('Email added to newsletter successfully.');
    return 'Email added to newsletter';
  } catch (error) {
    console.error('Error adding email to newsletter:', error);
    return 'Failed to add email to newsletter';
  }
};




//unsubscribe from Newseletter that admin to send messages from
export const unsubscribeFromNewsletter = async (email: string, path: string) => {
  try {
    // Find the first document in the Store collection
    const store = await Store.findOne();

    if (!store) {
      console.log('No store doucment found that contains emails for newsletter');
      return false
    }

    // Check if the newsletter array exists in the store
    if (!store.newsletter || store.newsletter.length === 0) {
      console.log('No emails in the newsletter');
      return false;
    }

    // Filter out the email from the newsletter array
    store.newsletter = store.newsletter.filter((item: string) => item !== email);

    // Save the updated store document
    await store.save();
    revalidatePath(path)
    console.log('Email removed from newsletter:', email);
    return true;
  } catch (error) {
    console.error('Error removing email from newsletter:', error);
    return false;
  }
};

// Function to get all subscribed emails from the store
export const getAllSubscribedEmails = async () => {
  try {
    // Find the first document in the Store collection
    const store = await Store.findOne();

    // If no store document exists or the newsletter array is empty, return an empty array
    if (!store || !store.newsletter || store.newsletter.length === 0) {
      return [];
    }

    // Return the array of subscribed emails
    return store.newsletter;
  } catch (error) {
    console.error('Error fetching subscribed emails:', error);
    return []
  }
};
