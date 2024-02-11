import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import Cors from "micro-cors";
import Stripe from 'stripe';
import { headers } from "next/headers";
import { createOrder, removeCheckout, removeUserCart, updateProductStockAfterPurchase } from "@/lib/actions/store.actions";
import axios from "axios";
import { getUser } from "@/lib/actions/admin.actions";

const cors = Cors({
    allowMethods: ["POST", "HEAD"],
  });

// Set secret key. Remember to switch to  ive secret key in production.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

const savePayment = async (customerId: string) => {
  // Step 2: Attach a payment method to the customer
  const paymentMethodId = 'payment_method_id'; // Replace with the ID of the payment method you want to attach
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
}

const callCreateOrder = async (
    orderId: string, userId: string, 
    items: { product: string; quantity: number; }[],
    address: { name: string, address: { line1: string, line2: string | null, city: string, country: string, postal_code: string, state: string } },
    pricing: { total: string, subtotal: string, taxAmount: string, shipping: string, taxtId: string }
) => {
    // Define the order parameters
    const orderParams = {
        orderId: orderId,
        user: userId,
        items: items.map(item => ({
            product: item.product,
            quantity: item.quantity
        })),
        address: address,
        pricing: pricing,
    };

    // Call the createOrder function with the order parameters
    await createOrder(orderParams)
        .then((success) => {
            if (success) {
                console.log('Order created successfully.');
            } else {
                console.log('Failed to create order.');
            }
        })
        .catch((error) => {
            console.error('An error occurred:', error);
        });
}

const convertToDollar = (cents: string)=> {
    const numCents = Number(cents)
    const dollars = numCents / 100

    return dollars.toFixed(2).toString();
}


// Define the webhook endpoint
export async function POST(req: any) {

    try{
         // Check if req.body is null or undefined
         if (!req.body) {
            throw new Error("Request body is empty");
        }

        // Read the request body stream and construct a buffer
        const chunks = [];
        for await (const chunk of req.body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const body = buffer.toString('utf-8');
       
        const signature = headers().get("stripe-signature");
        
        if (!signature) {
            throw new Error("Missing stripe-signature header");
        }

        const event = stripe.webhooks.constructEvent(body, signature, secret);

        // Check if the event is of type payment_intent.succeeded
        if (event.type === 'payment_intent.succeeded') {
            // Handle payment intent success event
            const paymentIntent = event.data.object;    
            const metadata = paymentIntent.metadata;
           
            //destructure data from metadata object
            const {total, subtotal, userId, address , taxAmount, order, orderId , shipping, taxId} = metadata
            //it all comes in strings so convert some of it back to objects
            const addressObject = JSON.parse(address);
            const orderObject = JSON.parse(order);
            const pricingObject = {
                total: convertToDollar(total),
                subtotal: convertToDollar(subtotal),
                taxAmount: convertToDollar(taxAmount),
                shipping: convertToDollar(shipping),
                taxtId: taxId
            };

            //Update the stock of products
            await updateProductStockAfterPurchase(orderObject)

            //Create and save order to database
            await callCreateOrder(orderId, userId, orderObject, addressObject,pricingObject);

            //Remove current checkout associated with user since it got completed
            await removeCheckout(userId);

            //Clear cart belonging to user because they were successfull in checkout
            await removeUserCart(userId);

            //Send Email to User with Order Details!
            const currentURL = process.env.AXIOS_URL;
            
            //Get User Information to send Email
            const user = await getUser(userId)

            const nodeMailerData = {
                email: user.email,
                name: user.username,
                items: orderObject,
                event: "order",
                pricing: pricingObject,
                address: addressObject, 
                orderId: orderId
            }

           await axios.post(`${currentURL}/api/nodemailer`, nodeMailerData);
          
        }
        else if (event.type === 'payment_intent.payment_failed')
        {
            const data = event.data.object;
            const metadata = data.metadata;
            console.log("Payment failed: ", data)
            console.log("payment intent failed: ", metadata)
        }else if( event.type === 'payment_intent.created')
        {
           // Handle payment intent success event
           const paymentIntent = event.data.object;    
           const metadata = paymentIntent.metadata;
           console.log("payment intent created: ", metadata)
        }

        return NextResponse.json({ result: event, ok: true });
    }
    catch(error)
    {
        console.error(error);
        return NextResponse.json(
        {
            message: "something went wrong",
            ok: false,
        },
        { status: 500 }
        );
    }
}