import { Stripe } from 'stripe';

// Keeps the Stripe product and its default price in sync with a store product.
// Moved out of app/api/product/route.ts: route files may only export route handlers.
const key = process.env.STRIPE_SECRET_KEY
const stripeInstance = new Stripe(key? key : "");

export const createOrUpdateStripeProduct = async (productId: string, name: string, productprice: number, image: string, description: string) => {
  try {

      // If productId is provided, it's an update; otherwise, it's a create
      if (productId.length > 0) {

        // Retrieve the existing product
        const existingProduct = await stripeInstance.products.retrieve(productId);
        const defaultPrice = existingProduct.default_price;
  
        //If product comes with a price, which should always be the case because when creating a product a default price is included
        if (defaultPrice) {
  
        // Retrieve the current details of the price
        const currentPrice = await stripeInstance.prices.retrieve(defaultPrice.toString());

        if(currentPrice.unit_amount === productprice )
        {
          //Price has not changed no need to update price on product
          const updatedProduct = await stripeInstance.products.update(productId, {
            name: name,
            description: description,
            images: [image],
        });

        console.log("Product updated with same price:", updatedProduct);
        return updatedProduct.id
        }else{
            //Price has changed, create a new one, set it and then archive, because a product must have a default price
             
            // Create Price Object first then pass along its ID to update the product and its new price
              const newPrice = await stripeInstance.prices.create({
              product: productId,
              unit_amount: productprice,
              currency: 'usd',
            });

            console.log("New Price: ", newPrice)
          
            //Update Product
            const updatedProduct = await stripeInstance.products.update(productId, {
              name: name,
              description: description,
              images: [image],
              default_price: newPrice.id
          });

        console.log("Product updated with new price:", updatedProduct);

         // archive the old price
         const archiveprice = await stripeInstance.prices.update(
          defaultPrice.toString(),
          {
            active: false,
          }
        );
        console.log("Price archived: ", archiveprice)
       
          return updatedProduct.id
        } 

      }
        
      } else {
          const newProduct = await stripeInstance.products.create({
              name: name,
              description: description,
              shippable: true,
              images: [image],
              default_price_data: {
                  unit_amount: productprice,
                  currency: 'usd',
              },
              expand: ['default_price'],
          });

          console.log("Product created:", newProduct);
          return newProduct.id;
      }
  } catch (error) {
      console.error("Error:", error);
      throw error;
  }
};
