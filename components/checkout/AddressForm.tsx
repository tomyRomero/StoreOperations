"use client"

import React, { useEffect, useState } from "react";
import { AddressElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AddressMode } from "@stripe/stripe-js";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createCheckout} from "@/lib/actions/store.actions";
import { useSession } from "next-auth/react";
import { toast } from "../ui/use-toast";
import { Address } from "@/app/types/global";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { useRouter } from "next/navigation";

interface SavedAddresses{
    savedAddresses: Address[];
}

const AddressForm = ({savedAddresses}: SavedAddresses) => {
  const [message, setMessage] = useState<string | null | undefined>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null); // Store the shipping address
  const [saveAddress, setSaveAddress] = useState(false); // State variable for switch value
  const [useExisting, setUseExisting] = useState(false);

  const router = useRouter();
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
       
            const proccessed = await createCheckout(session.user.id, shippingAddress, saveAddress)
            if(proccessed){
                toast({
                    title: "Procceding to Payment",
                })
            }

            setTimeout(()=> {
              router.push("/checkout")
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

  const handleSwitchToggle = () => {
    setSaveAddress((prevValue) => !prevValue); 
  };

  const handleAddressSelectChange = (value: string) => {
   
    if (value === "no-address") {
      // Reset the shipping address when "Select Address" is chosen
      setShippingAddress(null);
      setUseExisting(false);
    } else {
      // Handle the case when another address is selected
      const myJSONAddress = JSON.parse(value)
      setShippingAddress(myJSONAddress)
      setUseExisting(true);
    }
  };

  return (
    <Card className="p-2">
      <CardHeader className="space-y-2">
        <CardTitle className="text-heading2-bold">Shipping Address</CardTitle>
        <CardDescription>Select an existing address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <div className="flex items-center gap-4">
            <Select onValueChange={handleAddressSelectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an existing address" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value={`no-address`}>Enter New Address</SelectItem>
                {savedAddresses.length > 0 &&
                (
                    savedAddresses.map((address, index) => 
                    <SelectItem key={index} value={JSON.stringify(address)}>{`${address.name} - ${address.address.line1}, ${address.address.city}, ${address.address.country}`}</SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800">
    <div>
        
    <CardDescription className={`py-2`}>{ useExisting ? "Existing Address Selected: Click Above on the Select to Select Enter New Address If you prefer a new one." : "Or use a new one"}</CardDescription>
      <form id="address-form" onSubmit={handleSubmit}>
        <div className={`${useExisting ? "hidden" : ""}`}>
        {/* Shipping Address Element */}
        <div className={"mt-4"}>
          <AddressElement
            id="shipping-address"
            options={shippingElementOptions}
            onChange={handleAddressChange}
          />
        </div>
        <div className="flex items-center space-x-2 py-2">
          <Switch id="saveAddress" checked={saveAddress} onCheckedChange={handleSwitchToggle}  className="cursor-pointer"/>
          <Label htmlFor="saveAddress">Save Address</Label>
        </div>
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
                Proceed to Payment
          </Button>
        </div>
      </form>
    </div>
    </div>
      </CardContent>
    </Card>
  );
}

export default AddressForm;
