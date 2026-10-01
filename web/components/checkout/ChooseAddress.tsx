"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import AddressForm from "../forms/AddressForm";
import type { Address } from "@/lib/api/types";
import { addressLines } from "@/lib/format";

type Props = {
  addresses: Address[];
  // The address checkout last used, so "change address" starts from it
  selectedId?: number;
};

// Checkout's first step: where the order ships. Tax depends on it, so it comes before payment.
// Saved addresses are radio cards; a new one is added right here.
const ChooseAddress = ({ addresses, selectedId }: Props) => {
  const router = useRouter();
  const initial = addresses.find((a) => a.id === selectedId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
  const [chosenId, setChosenId] = useState(initial?.id);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [going, setGoing] = useState(false);

  const continueWith = (id: number) => {
    setGoing(true);
    router.push(`/checkout?address=${id}`);
  };

  return (
    <section aria-labelledby="shipping-heading" className="grid gap-6">
      <div className="grid gap-1">
        <h2 id="shipping-heading" className="text-h3">
          Where should we send it?
        </h2>
        <p className="text-sm text-muted-foreground">We ship within the United States. Tax is worked out for this address.</p>
      </div>

      {addresses.length > 0 && (
        <fieldset className="grid gap-3">
          <legend className="sr-only">Your saved addresses</legend>
          {addresses.map((address) => (
            <label
              key={address.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors hover:bg-muted/50 has-[:checked]:border-foreground has-[:checked]:bg-muted/40 has-[:checked]:outline has-[:checked]:outline-1 has-[:checked]:outline-foreground"
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
                className="mt-1 size-4 accent-primary"
              />
              <span className="grid gap-0.5 text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  {address.recipientName}
                  {address.isDefault && <Badge variant="accent">Default</Badge>}
                </span>
                {addressLines(address).map((line) => (
                  <span key={line} className="text-muted-foreground">
                    {line}
                  </span>
                ))}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {adding ? (
        <div className="grid gap-4 rounded-md border p-5">
          <h3 className="font-sans text-base font-semibold">New address</h3>
          <AddressForm submitLabel="Save and continue to payment" onSaved={(address) => continueWith(address.id)} />
          {addresses.length > 0 && (
            <Button variant="ghost" className="w-fit" onClick={() => setAdding(false)}>
              Use a saved address instead
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" disabled={chosenId === undefined} loading={going} onClick={() => chosenId !== undefined && continueWith(chosenId)}>
            Continue to payment
          </Button>
          <Button size="lg" variant="outline" onClick={() => setAdding(true)}>
            <Plus aria-hidden />
            Add a new address
          </Button>
        </div>
      )}
    </section>
  );
};

export default ChooseAddress;
