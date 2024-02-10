"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import AddressForm from "@/components/checkout/AddressForm"
import React, { useEffect, useState } from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {StripeElementsOptions, loadStripe} from '@stripe/stripe-js';
import { useSession } from "next-auth/react"
import { Address } from "@/app/types/global"
import { getUserAddresses } from "@/lib/actions/store.actions"


//call loadStripe outside of a component’s render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const appearance: StripeElementsOptions['appearance'] = {
    theme: 'stripe',
  };

  const options = {
    appearance,
  };


const page = ()=> {
  const [addresses, setAddress] = useState<Address[]>([])

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(()=> {
    const initialize = async ()=> {
      if(!session)
      {
        router.push("/cart")
      }else{
        if(session.user.id)
        {
            setAddress( await getUserAddresses(session.user.id))
        }
      }
    } 

    initialize();
  }, [])

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
          <div className="flex items-center gap-4 pb-4">
          <Button size="icon" variant="outline" onClick={()=> {router.push("/cart")}}>
            <Image 
            src={"/assets/back.png"}
            alt={"back icon"}
            width={24}
            height={24}
            />
            <span className="sr-only">Back</span>
          </Button>
          <h4>Back to Cart</h4>
        </div>
        <Elements stripe={stripePromise} options={options}>
            <AddressForm savedAddresses={addresses} />
        </Elements>
    </section>
  )
}

export default page;