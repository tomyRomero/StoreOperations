"use client"

import React, { useState } from "react";
import { AddressElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AddressMode } from "@stripe/stripe-js";
import { Button } from "../ui/button";
import { saveAddress} from "@/lib/actions/store.actions";
import { useSession } from "next-auth/react";
import { toast } from "../ui/use-toast";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { useRouter, usePathname} from "next/navigation";


const AddAddressForm = () => {
  const [message, setMessage] = useState<string | null | undefined>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null); // Store the shipping address
  const router = useRouter();
  const path = usePathname();
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Disable form submission until Stripe.js has loaded.
      return;
    }

    // Check if the shipping address is empty
    if (!shippingAddress) {
        setMessage("Shipping address is required");
        return;
    }

    //Submit the shipping address to the server
    if(session?.user.id)
    {
       
            const proccessed = await saveAddress(session.user.id, shippingAddress ,path );
            if(proccessed){
                toast({
                    title: "Address Saved",
                })
            }

            setTimeout(()=> {
              router.push("/account/myaddresses")
            }, 
            1000)
       
    }
    else{
        toast({
            title: "Error Saving Address",
            description: "Was not able to use address at this time",
            variant: "destructive"
        })
    }

    // Reset the message and shipping address state
    setMessage(null);
    setShippingAddress(null);
  };

  const shippingElementOptions = {
    mode: "shipping" as AddressMode, // Specify the mode as 'shipping'
    allowedCountries: ["US"], // Example: Allow only US addresses
    placeholder: "Enter your shipping address", // Placeholder text for the address field
    required: true // Make the address element required
  };

  const handleAddressChange = (event: any) => {
    // Handle the change event of the Address Element and update the shipping address state
    setShippingAddress(event.complete ? event.value : null);
    
  };


  return (
    <Card className="p-2">
      <CardHeader className="space-y-2">
        <CardTitle className="text-heading2-bold">Shipping Address</CardTitle>
        <CardDescription>Save New Address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
 <div className="border-t border-gray-200">
    <div>
        
    <CardDescription className={`py-2`}>{ "Enter a new address that you want to save"}</CardDescription>
      <form id="address-form" onSubmit={handleSubmit}>
       
        {/* Shipping Address Element */}
        <div className={"mt-4"}>
          <AddressElement
            id="shipping-address"
            options={shippingElementOptions}
            onChange={handleAddressChange}
          />
        {message && (
          <div id="payment-message" className="text-center py-2">
            {message}
          </div>
        )}
        </div>
        <div className="mt-4 flex justify-center hover:!cursor-pointer">
          <Button
            disabled={!shippingAddress || !stripe || !elements}
            id="submit"
            className="max-sm:w-full sm:w-3/4 xl:w-2/5 !cursor-pointer"
            type="submit"
          >
                Save Address
          </Button>
        </div>
      </form>
    </div>
    </div>
      </CardContent>
    </Card>
  );
}

export default AddAddressForm;
