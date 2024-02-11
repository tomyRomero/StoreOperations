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
import { nanoid } from 'nanoid';
import Addresses from "../models/addresses.model";
import Orders from "../models/orders.model";
import Activity from "../models/activity.model";
import { redirect } from "next/navigation";

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

    const orderId = nanoid(); 

    const checkout= {
      status: "readyForPayment",
      address: address,
      orderid: orderId
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

//get address and orderId from checkout that was created when we selected our address.
export const getAddressAndOrderIdFromCheckout = async (userId: string) => {
  try {
    const existing = await User.findById(userId);

    if (existing && existing.checkout && existing.checkout.address && existing.checkout.orderid) {
      console.log("success in getting checkout")
      console.log({address: existing.checkout.address, orderId: existing.checkout.orderid})
      return { address: existing.checkout.address, orderId: existing.checkout.orderid };
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
      // Create a new instance of the Orders model with the provided parameters
      const newOrder = new Orders({
          orderId: params.orderId,
          user: params.user,
          items: params.items,
          status: params.status || 'pending', // If status is not provided, default to 'pending'
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
              status: params.status
          }
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

//Get all orders that belong to user
export const findAllOrdersForUser = async (userId: string) => {
  try {
    // Find all orders in the database belonging to the provided userId
    const orders = await Orders.find({ user: userId });

    // Return the array of orders
    return orders;
  } catch (error) {
    // If an error occurs during the process, log the error message
    console.error('Error finding all orders for user:', error);
    // Return an empty array to indicate an error occurred
    return [];
  }
};

//Function that returns all activities with pagination
export const getAllActivity = async (pageNumber: number = 1, pageSize: number = 10): Promise<{ activities: typeof Activity[], isNext: boolean }> => {
  try {
    // Calculate the number of activities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Use Mongoose's find() method to retrieve paginated activity entries
    const activities = await Activity.find()
      .skip(skipAmount)
      .limit(pageSize);

    // Calculate total count of activities
    const totalActivitiesCount = await Activity.countDocuments();

    // Calculate if there are more activities
    const isNext = totalActivitiesCount > skipAmount + activities.length;

    // Return the retrieved activity entries and whether there are more activities
    return { activities, isNext };
  } catch (error) {
    // If an error occurs during the process, log the error message and return an empty array
    console.error('Error retrieving all activity:', error);
    const activities: any = []
    const isNext =  false
    return { activities, isNext };
  }
};

//Update the stock of products after purchase
export const updateProductStockAfterPurchase = async (items: {product: string, quantity: number}[]) => {
  try {
      // Map each item to a promise that finds the corresponding product
      const productPromises = items.map(async (item) => {
          const product = await findProduct(item.product);
          return { item, product };
      });

      // Execute all promises concurrently
      const products = await Promise.all(productPromises);

      // Map each product to a promise that updates the stock
      const updatePromises = products.map(async ({ item, product }) => {
          if (product) {
              const newStock = product.stock - item.quantity;
              // Update the stock of the product in the database
              await Product.updateOne({ stripeProductId: item.product }, { stock: newStock });
              console.log(`Updated stock for product ${product.name}: ${product.stock} -> ${newStock}`);
          } else {
              console.error(`Product not found for ID: ${item.product}`);
          }
      });

      // Execute all update promises concurrently
      await Promise.all(updatePromises);

      console.log('All product stocks updated successfully.');
  } catch (error) {
      console.error('Error updating product stock after purchase:', error);
  }
};