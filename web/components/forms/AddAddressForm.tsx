"use client";

import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import AddressForm from "./AddressForm";

// The account page's "add an address": saves it, then goes back to the address book
const AddAddressForm = () => {
  const router = useRouter();

  return (
    <AddressForm
      onSaved={() => {
        toast({ variant: "success", title: "Address saved" });
        router.push("/account/myaddresses");
        router.refresh();
      }}
    />
  );
};

export default AddAddressForm;
