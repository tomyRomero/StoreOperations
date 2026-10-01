"use client";

import { useRouter } from "next/navigation";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { toast } from "../ui/use-toast";
import AddressForm from "./AddressForm";

// The account page's "add an address": saves it, then goes back to the address book
const AddAddressForm = () => {
  const router = useRouter();

  return (
    <Card className="p-2">
      <CardHeader className="space-y-2">
        <CardTitle className="text-heading2-bold">Shipping Address</CardTitle>
        <CardDescription>Save an address for faster checkout. We ship within the United States.</CardDescription>
      </CardHeader>
      <CardContent>
        <AddressForm
          onSaved={() => {
            toast({ title: "Address saved" });
            router.push("/account/myaddresses");
            router.refresh();
          }}
        />
      </CardContent>
    </Card>
  );
};

export default AddAddressForm;
