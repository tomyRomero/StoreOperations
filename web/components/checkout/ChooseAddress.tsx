"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { AddressForm } from "../forms/AddressForm";
import { useCart } from "../cart/CartProvider";
import { CheckoutBagSummary } from "./CheckoutBagSummary";
import { ContinueToPayment, DeliveryOption, stepLegend } from "./ShippingStep";
import type { Address } from "@/lib/api/types";
import type { ShippingSettings } from "@/lib/cart";
import { addressLines } from "@/lib/format";

type Props = {
  addresses: Address[];
  // The address checkout last used, so "change address" starts from it
  selectedId?: number;
  shipping: ShippingSettings;
};

// Checkout's first step. Tax depends on the address, so it comes before payment.
export function ChooseAddress({ addresses, selectedId, shipping }: Props) {
  const router = useRouter();
  const { cart } = useCart();
  const initial = addresses.find((a) => a.id === selectedId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
  const [chosenId, setChosenId] = useState(initial?.id);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [going, setGoing] = useState(false);

  const continueWith = (id: number) => {
    setGoing(true);
    router.push(`/checkout?address=${id}`);
  };

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
      <div className="grid gap-9">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] lg:text-5xl">Where should it go?</h1>
        <div className="-mt-3 lg:hidden">
          <CheckoutBagSummary shipping={shipping} variant="folded" />
        </div>

        <fieldset>
          <legend className={stepLegend}>Ship to</legend>
          <p className="-mt-2 mb-3.5 text-sm text-muted-foreground">We ship within the United States. Tax is worked out for this address.</p>
          {addresses.length > 0 && !adding && (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="group relative grid cursor-pointer content-start gap-2 rounded-[20px] border bg-card p-5 transition-colors hover:border-foreground/22 has-checked:border-glow-violet/60 has-checked:bg-glow-violet/8 has-checked:shadow-[0_0_0_4px_color-mix(in_oklab,var(--glow-violet)_12%,transparent)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={chosenId === address.id}
                    onChange={() => setChosenId(address.id)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-semibold">
                      {address.recipientName}
                      {address.isDefault && <span className="ml-2 font-mono text-xs font-medium text-accent">Default</span>}
                    </span>
                    <span aria-hidden className="size-5 shrink-0 rounded-full border-[1.5px] border-input bg-background transition-all group-has-checked:border-[6px] group-has-checked:border-glow-violet" />
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {addressLines(address).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </label>
              ))}
            </div>
          )}
          {adding ? (
            <div className="grid gap-4 rounded-[20px] border bg-card p-5 sm:p-6">
              <h2 className="font-sans text-base font-semibold">New address</h2>
              <AddressForm submitLabel="Save and continue to payment" autoFocus={addresses.length > 0} onSaved={(address) => continueWith(address.id)} />
              {addresses.length > 0 && (
                <Button variant="ghost" className="w-fit" onClick={() => setAdding(false)}>
                  Use a saved address instead
                </Button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-foreground/20 text-[15px] font-medium text-ink-2 transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <Plus className="size-4" aria-hidden />
              Add a new address
            </button>
          )}
        </fieldset>

        {shipping && <DeliveryOption shipping={shipping} subtotalCents={cart?.subtotalCents ?? 0} />}

        {!adding && <ContinueToPayment going={going} disabled={chosenId === undefined} onContinue={() => chosenId !== undefined && continueWith(chosenId)} />}
      </div>

      <CheckoutBagSummary shipping={shipping} />
    </div>
  );
}
