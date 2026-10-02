"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, Plus, Truck } from "lucide-react";
import { Button } from "../ui/button";
import AddressForm from "../forms/AddressForm";
import { useCart } from "../cart/CartProvider";
import { CheckoutBagSummary } from "./CheckoutBagSummary";
import type { Address } from "@/lib/api/types";
import { shippingFor, toFreeShipping, type ShippingSettings } from "@/lib/cart";
import { addressLines } from "@/lib/format";
import { formatMoney } from "@/lib/money";

type Props = {
  addresses: Address[];
  // The address checkout last used, so "change address" starts from it
  selectedId?: number;
  shipping: ShippingSettings;
};

const legend = "mb-3.5 font-sans text-lg font-semibold";

// Checkout's first step: where the order ships. Tax depends on it, so it comes before payment. Saved
// addresses are radio cards; a new one is added right here. Beside it, the order as the bag has it.
const ChooseAddress = ({ addresses, selectedId, shipping }: Props) => {
  const router = useRouter();
  const { cart } = useCart();
  const initial = addresses.find((a) => a.id === selectedId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
  const [chosenId, setChosenId] = useState(initial?.id);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [going, setGoing] = useState(false);
  const subtotal = cart?.subtotalCents ?? 0;
  const shippingCents = shippingFor(subtotal, shipping);
  const missing = toFreeShipping(subtotal, shipping);

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
          <legend className={legend}>Ship to</legend>
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

        {shipping && (
          <section aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className={legend}>
              Delivery
            </h2>
            <div className="flex items-center gap-4 rounded-[20px] border border-glow-violet/60 bg-glow-violet/8 px-5 py-4.5">
              <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-foreground/6">
                <Truck className="size-[22px]" strokeWidth={1.8} />
              </span>
              <span className="grid grow gap-0.5">
                <span className="text-[15px] font-semibold">Standard shipping, tracked</span>
                <span className="text-[13px] text-muted-foreground">
                  {missing === null ? "To any address in the United States" : missing === 0 ? "Free on this order" : `Add ${formatMoney(missing)} more to your bag and it's free`}
                </span>
              </span>
              <span className="font-mono text-[15px] font-medium">{shippingCents === 0 ? "Free" : shippingCents === null ? "" : formatMoney(shippingCents)}</span>
            </div>
          </section>
        )}

        {!adding && (
          <div className="flex flex-wrap-reverse items-center justify-between gap-4">
            <Link href="/cart" className="inline-flex items-center gap-1.5 text-[15px] text-ink-2 hover:text-foreground">
              <ArrowLeft className="size-4" aria-hidden />
              Back to bag
            </Link>
            <button
              type="button"
              disabled={chosenId === undefined || going}
              onClick={() => chosenId !== undefined && continueWith(chosenId)}
              className="inline-flex h-[58px] items-center gap-2.5 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_0_0_6px_color-mix(in_oklab,var(--foreground)_5%,transparent),0_20px_50px_color-mix(in_oklab,var(--glow-violet)_30%,transparent)] transition-colors hover:bg-primary/85 disabled:opacity-60 max-sm:w-full max-sm:justify-center"
            >
              {going && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              Continue to payment
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <CheckoutBagSummary shipping={shipping} />
    </div>
  );
};

export default ChooseAddress;
