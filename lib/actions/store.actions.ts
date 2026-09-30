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
import { createOrUpdateStripeProduct } from "../stripe-products";
import { dollarsToCents } from "../utils";
import Store from "../models/store.model";
  

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
