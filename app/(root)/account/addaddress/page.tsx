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
import AddAddressForm from "@/components/forms/AddAddressForm"

//call loadStripe outside of a component’s render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const appearance: StripeElementsOptions['appearance'] = {
    theme: 'stripe',
  };

  const options = {
    appearance,
  };


const page = ()=> {

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(()=> {
    const initialize = async ()=> {
      if(!session)
      {
        router.push("/")
      }
    } 

    initialize();
  }, [])

  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
          <div className="flex items-center gap-4 pb-4">
          <Button size="icon" variant="outline" onClick={()=> {router.push("/account")}}>
            <Image 
            src={"/assets/back.png"}
            alt={"back icon"}
            width={24}
            height={24}
            />
            <span className="sr-only">Back</span>
          </Button>
          <h4>Back</h4>
        </div>
        <Elements stripe={stripePromise} options={options}>
            <AddAddressForm />
        </Elements>
    </section>
  )
}

export default page;