import { findProduct } from "@/lib/actions/store.actions";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const calculateTax = async (items: {product: string, quantity: number}[], currency: string, address:any) => {
  const taxCalculation = await stripe.tax.calculations.create({
    currency,
    customer_details: {
     address,
      address_source: "shipping",
    },
    line_items: await Promise.all(items.map(async (item) => await buildLineItem(item))),
  });
  console.log("tax calculation: ", taxCalculation)
  return taxCalculation;
};

function convertToCents(decimalValue: number) {
  // Multiply the decimal value by 100 to get the equivalent value in cents
  return Math.round(decimalValue * 100); // Rounding to handle floating point precision issues
}

const buildLineItem = async (item: {product: string, quantity: number}) => {

   const product = await findProduct(item.product)

   if(product)
   {
    const amount = product?.price * item.quantity
    const cents = convertToCents(amount)

    console.log(`line item ${item.product} build: `, cents)
    return {
      amount: cents, // Amount in cents
      reference: item.product, // Unique reference for the item in the scope of the calculation
    };
   }else{
    console.log("product not found error")
    throw Error("Product not found!")
   }

};

const calculateOrderAmount = async (items: any[], address:any, user:any, orderId: string) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client

  const tax = await calculateTax(items, "usd" , address.address)
  console.log("calculate tax: ", tax)

  console.log("my route items: ", items)
  console.log("my route address: ", address )
  console.log("my route user: ", user)
  console.log("my route orderId: ", orderId)

  return 1400;
};

export async function POST(req: Request, res: NextApiResponse) {

   // Extract the items from the request body
   const body = await req.json();
   const { address , items, user, orderId } = body;


   // Stringify the items array
   const stringifiedItems = JSON.stringify(items);

   // Create metadata object
   const metadata = {
     userId: user,
     order: stringifiedItems // Pass the stringified items array
   };

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: await calculateOrderAmount(items, address, user, orderId),
      currency: "usd",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional 
      // because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata,
      description: "Thanks for your purchase!",
      receipt_email: "tomyfletcher99@hotmail.com"
    });

    // Return the client secret along with the status code 201
    return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { status: 201 });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    return NextResponse.json({ message: `Internal Server Error`}, {status: 500})
  }
}
