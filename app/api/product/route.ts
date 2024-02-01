import { connectToDB } from '@/lib/mongoose';
import { dollarsToCents, isBase64Image } from '@/lib/utils';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { updateCreateProduct } from '@/lib/actions/user.actions';

const key = process.env.STRIPE_SECRET_KEY

const stripeInstance = new Stripe(key? key : "");


//Use Axios to make api request amongst api, server to server
const postImage = async (data: any) => {
    try {
      const currentURL = process.env.AXIOS_URL;
  
      const response = await axios.post(`${currentURL}/api/S3`, data);
      const filename = response.data.filename;
      return filename;
    } catch (error) {
      return false;
    }
  };

  const getImageData = async (key: string ): Promise<string> => {
    try {
      const encodedKey = encodeURIComponent(key);
      const currentURL = process.env.AXIOS_URL;
  
      // Use Axios for the GET request
      const getResponse = await axios.get(`${currentURL}/api/S3?key=${encodedKey}`);
  
      if (getResponse.status === 200) {
        // Request was successful, handle the response
        const getResponseData = getResponse.data;
        const match = key.match(/[^.]+$/);
        const result = match ? match[0] : 'jpg';
        let base64 = `data:image/${result};base64,` + getResponseData;
        return base64;
      } else {
        // Request failed, handle the error
        console.error('Error:', getResponse.statusText);
        return "";
      }
    } catch (error) {
      console.error('Error:', error);
      return "";
    }
  };

  const createOrUpdateStripeProduct = async (productId: string, name: string, productprice: number, image: string, description: string) => {
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

//Product Post
export async function POST(req: Request){

    try{
    const body = await req.json()
    let { id, name, description, stock, price, category, photo, imgChanged} = body;

    connectToDB();
    const pictureId = nanoid()

    const blob = photo;
    const data ={
      image : blob,
      name : `${pictureId}_category_picture`
    }

    const productPrice = dollarsToCents(Number(price))

      
      // Logic to upload to S3 bucket if image has changed or is new image
       const hasImageChanged = isBase64Image(blob);
       
       if (imgChanged && hasImageChanged) 
       {
        const imgRes = await postImage(data);

        if(imgRes.length > 0)
        {
            const imgGetRes = await getImageData(imgRes);
            if(imgGetRes)
            {
                photo = imgRes;
            }
        }
      
      }
       
      //Create or Update stripe product with price
      const stripeProductId = await createOrUpdateStripeProduct(id, name, productPrice, photo, description)

      //If successfull update the database and add a new product reflecting what we did in stripe
      if(stripeProductId)
      {
      updateCreateProduct(stripeProductId, name, description, Number(stock), Number(price), category, photo)
      }

    return NextResponse.json({ message: "Product successfully created/updated"}, {status: 201})
}catch(error)
{
   console.log(error)
   return NextResponse.json({ message: `Error Occured: ${error}`}, {status: 500})
}
}

