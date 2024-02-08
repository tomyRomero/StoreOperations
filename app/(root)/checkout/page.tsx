"use client"

import { cartItemsInStock, getAddressAndOrderIdFromCheckout, getCartItems } from '@/lib/actions/store.actions';
import React, { useEffect, useState } from 'react'
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { StripeElementsOptions, loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label, Separator } from '@radix-ui/react-dropdown-menu';
import Loading from '@/app/(auth)/loading';
import { Address } from '@/app/types/global';

//call loadStripe outside of a component’s render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const page = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [subtotal, setSubTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<any>(null); // Store the shipping address
  const [loading, setLoading] = useState(true)

  const { data: session } = useSession();
  const router = useRouter();

  const createPaymentIntent = async (
    address: Address, 
    items: {
      product: string, 
      quantity: number
  }[],
    user: string,
    orderId: string
  ) => {
     // Create PaymentIntent as soon as the page loads
     fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      //This is where I stringify the cart items
      body: JSON.stringify({ items: items , user: user, address: address, orderId: orderId}),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      });

  }

  useEffect(()=> {
    const initialize = async ()=> {

      if(!session)
      {
        router.push("/cart")
      }else{
        //Check to make sure the cart that is gonna be used for checkout has all its quantity of products in stock
        const allow = await cartItemsInStock(session.user.id)
    
        //Then user can purchase products because they are in stock
        if(!allow)
        {
          router.push("/cart")
        }else{
          //Users are suppose to provide address before payment for tax purposes, if there is no address povided, push to address page
          //Naturally users are directed to address after cart but there may be cases where someone might access the checkout url before doing so.
          const result = await getAddressAndOrderIdFromCheckout(session.user.id)
          
          //Earlier we checked if all cartItems were in stock, now we can send them to our payment gateaway
          const items = await getCartItems(session.user.id)

          if(result)
          {
            //result will return an address and a unique orderID that was created when the checkout procedure started in address page
            const { address, orderId } = result;
             //load create payment intent from stripe and use custom payment flow
            await createPaymentIntent(address, items , session.user.id , orderId);
          }else{
            router.push("/address")
          }
         
          setLoading(false)
        }
      }

    } 

    initialize();
  }, [])

  const appearance: StripeElementsOptions['appearance'] = {
    theme: 'stripe',
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      {!loading ? ( <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="outline" onClick={()=> {router.push("/cart")}}>
            <Image 
            src={"/assets/back.png"}
            alt={"back icon"}
            width={24}
            height={24}
            />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="font-semibold text-lg md:text-xl">Checkout</h1>
        </div>
        <div className="flex flex-col md:grid md:grid-cols-6 gap-6">
          <div className="md:col-span-4 lg:col-span-3 xl:col-span-4 flex flex-col gap-6">
            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            )}
            </div>
      <div className="md:col-span-2 lg:col-span-3 xl:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className='text-heading4-bold'>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="gap-2 flex">
                    <Label className="text-body-bold">Subtotal: </Label>
                    <div className="text-right ml-auto">$120.00</div>
                  </div>
                  <div className="gap-2 flex">
                    <Label className="text-body-bold">Shipping</Label>
                    <div className="text-right ml-auto">$10.00</div>
                  </div>
                  <div className="gap-2 flex">
                    <Label className="text-body-bold">Tax</Label>
                    <div className="text-right ml-auto">$5.00</div>
                  </div>
                  <Separator />
                  <div className="gap-2 flex">
                    <Label className="text-body-bold">Total</Label>
                    <div className="text-right ml-auto">$135.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
      </main>) : (<Loading />)}
      
    </section>
  )
}

export default page