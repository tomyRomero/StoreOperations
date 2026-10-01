"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "../ui/button";
import AddressForm from "../forms/AddressForm";
import type { Address } from "@/lib/api/types";
import { addressOneLine } from "@/lib/format";

type Props = {
  addresses: Address[];
  // The address checkout last used, so "change address" starts from it
  selectedId?: number;
};

// Checkout's first step: where the order ships. Tax depends on it, so it comes before payment.
const ChooseAddress = ({ addresses, selectedId }: Props) => {
  const router = useRouter();
  const initial = addresses.find((a) => a.id === selectedId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
  const [chosenId, setChosenId] = useState(initial?.id);
  const [adding, setAdding] = useState(addresses.length === 0);

  const continueWith = (id: number) => router.push(`/checkout?address=${id}`);

  return (
    <Card className="p-2">
      <CardHeader className="space-y-2">
        <CardTitle className="text-heading2-bold">Shipping Address</CardTitle>
        <CardDescription>We ship within the United States. Tax is worked out for this address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.length > 0 && (
          <fieldset className="grid gap-3">
            <legend className="sr-only">Your saved addresses</legend>
            {addresses.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${chosenId === address.id && !adding ? "border-black" : ""}`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={chosenId === address.id && !adding}
                  onChange={() => {
                    setChosenId(address.id);
                    setAdding(false);
                  }}
                  className="h-4 w-4 accent-black"
                />
                <span>{addressOneLine(address)}</span>
              </label>
            ))}
          </fieldset>
        )}

        {adding ? (
          <div className="grid gap-4 border-t pt-6">
            <h3 className="text-heading4-bold">New address</h3>
            <AddressForm submitLabel="Save and continue to payment" onSaved={(address) => continueWith(address.id)} />
            {addresses.length > 0 && (
              <Button variant="ghost" className="w-fit" onClick={() => setAdding(false)}>
                Use a saved address instead
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <Button disabled={chosenId === undefined} onClick={() => chosenId !== undefined && continueWith(chosenId)}>
              Continue to payment
            </Button>
            <Button variant="outline" onClick={() => setAdding(true)}>
              Add a new address
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChooseAddress;
