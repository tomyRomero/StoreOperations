import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import Cors from "micro-cors";
import Stripe from 'stripe';
import { headers } from "next/headers";
import { Readable } from "stream";

const cors = Cors({
    allowMethods: ["POST", "HEAD"],
  });

// Set secret key. Remember to switch to  ive secret key in production.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

const test = async () => {
    // Step 1: Create a new customer
const customer = await stripe.customers.create({
    email: 'customer@example.com',
    // Add more optional fields as needed
  });
  
  // Step 2: Attach a payment method to the customer
  const paymentMethodId = 'payment_method_id'; // Replace with the ID of the payment method you want to attach
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id,
  });
}

  


// Define the webhook endpoint
export async function POST(req: NextApiRequest, res: NextApiResponse) {

    try{
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
            console.log("event occured")

            // Handle payment intent success event
            const paymentIntent = event.data.object;
            console.log('PaymentIntent succeeded payment intent data object:', paymentIntent);

            // Extract relevant data from paymentIntent
            const paymentMethodId = paymentIntent.payment_method;
            console.log("Payment method ID:", paymentMethodId);

            // Extract relevant data from paymentIntent and perform necessary actions
            const amount = paymentIntent.amount / 100; // Amount in cents, convert to dollars if needed
            const currency = paymentIntent.currency;
            const customerId = paymentIntent.customer;
            // Handle further processing based on paymentIntent data
            console.log("amount: ", amount)
            console.log("currency: ", currency)
            console.log("customer: ", customerId)

            const shipping = paymentIntent.shipping;
            console.log("shipping: ", shipping)

            const metadata = paymentIntent.metadata;
            console.log("metadata: ", metadata)
        }else if (event.type === 'payment_intent.payment_failed')
        {
            const data = event.data.object;
            console.log("Payment failed: ", data)
        }else if( event.type === 'payment_intent.created')
        {
            console.log("payment_intent created: ", event.data.object )
            console.log("payment created metadata: ", event.data.object.metadata )
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