import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import Cors from "micro-cors";
import Stripe from 'stripe';
import { headers } from "next/headers";
import { createOrder } from "@/lib/actions/store.actions";

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

const callCreateOrder = (orderId: string, userId:string, items: Object, address: Object, pricing: Object)=> {
     // Define the order parameters
     const orderParams = {
        orderId: '123456789',
        user: 'user123',
        items: [
            { product: 'prod_PTnGrkkqBubibe', quantity: 1 },
            { product: 'prod_PUTi3fXB2PE52I', quantity: 1 },
            { product: 'prod_PTnPdXB9uFvwRW', quantity: 1 },
            { product: 'prod_PTnNUhUVhYlui9', quantity: 1 }
        ],
        address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345'
        },
        pricing: {
            subtotal: 100,
            tax: 10,
            total: 110
        }
    };

    // Call the createOrder function with the order parameters
    createOrder(orderParams)
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
            // Extract relevant data from paymentIntent
            const paymentMethodId = paymentIntent.payment_method;
            
            const metadata = paymentIntent.metadata;
            console.log("metadata: ", metadata)
           
            const {total, subtotal, userId, address , taxAmount, order, orderId , shipping} = metadata
            const addressObject = JSON.parse(address);
            const orderObject = JSON.parse(order);
        }
        else if (event.type === 'payment_intent.payment_failed')
        {
            const data = event.data.object;
            console.log("Payment failed: ", data)
        }else if( event.type === 'payment_intent.created')
        {
            // console.log("payment_intent created: ", event.data.object )
            console.log("payment created metadata: ", event.data.object.metadata )

            const metadata = event.data.object.metadata 
            // Parse address string to object
            const address = JSON.parse(metadata.address);
            console.log("address object: ", address)
            // Parse items string to JSON array
            const order = JSON.parse(metadata.order);
            console.log("order object: ", order)
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