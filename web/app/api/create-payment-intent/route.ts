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

const buildLineItem = async (item: { product: string, quantity: number }) => {
  try {
      const product = await findProduct(item.product);
      
      if (product) {
          const amount = product.price * item.quantity;
          const cents = convertToCents(amount);
          console.log(`line item ${item.product} build: `, cents);
          return {
              amount: cents, // Amount in cents
              reference: item.product, // Unique reference for the item in the scope of the calculation
          };
      } else {
          console.log("Product not found when building Line Item");
          throw new Error("Product not found");
      }
  } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error("Error fetching product");
  }
};


const calculateOrderAmount = async (items:  {product: string, quantity: number}[], address: any, shipping: number) => {
  try {
      const tax = await calculateTax(items, "usd", address.address);
      console.log("details: ",JSON.stringify(tax.tax_breakdown[0].tax_rate_details, null, 2));
      // Calculate the subtotal of all items
      let subtotal = 0;
      for (const item of items) {
          const product = await findProduct(item.product);
          if (product) {
              subtotal += product.price * item.quantity;
          }
      }

      // Calculate the total amount including subtotal, tax, and shipping
      const totalAmount = tax.amount_total + convertToCents(shipping);

      return {
          subtotal: convertToCents(subtotal),
          taxAmount: convertToCents(tax.tax_amount_exclusive),
          myShipping: convertToCents(shipping),
          total: totalAmount,
          taxId: tax.id
      };
  } catch (error) {
      console.error("Error calculating order amount:", error);
      throw new Error("Error calculating order amount");
  }
};

export async function POST(req: Request, res: NextApiResponse) {
  try {

   // Extract the items from the request body
   const body = await req.json();
   const { address , items, user, shipping } = body;

   // Stringify the items array
   const stringifiedItems = JSON.stringify(items);

   

    const { subtotal, taxAmount, total , myShipping, taxId } = await calculateOrderAmount(items, address, shipping);

    // Create metadata object
   const metadata = {
    userId: user,
    order: stringifiedItems,
    address: JSON.stringify(address),
    total: total.toString(),
    subtotal: subtotal.toString(),
    taxAmount: taxAmount.toString(),
    shipping: myShipping.toString(),
    taxId: taxId
  };
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional 
      // because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata,
    });


     // Convert subtotal, taxAmount, myShipping, and total back to dollars
     const subtotalDollars = subtotal / 100;
     const taxAmountDollars = taxAmount / 100;
     const myShippingDollars = myShipping / 100;
     const totalDollars = total /100;
 
    // Return the client secret along with other details in the response
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      address: address,
      subtotal: subtotalDollars,
      tax: taxAmountDollars,
      shipping: myShippingDollars,
      total: totalDollars, 
      items: items, 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    return NextResponse.json({ message: `Internal Server Error`}, {status: 500})
  }
}
