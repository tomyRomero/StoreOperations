"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { AddressFields, addressFieldsSchema } from "../forms/AddressFields";
import { useCart } from "../cart/CartProvider";
import { CheckoutBagSummary } from "./CheckoutBagSummary";
import { ContinueToPayment, DeliveryOption, stepLegend } from "./ShippingStep";
import type { ShippingSettings } from "@/lib/cart";
import { readGuestDetails, saveGuestDetails } from "@/lib/guest-checkout";
import { signInPath } from "@/lib/sign-in-path";

const FormSchema = addressFieldsSchema.extend({
  email: z.string().trim().min(1, "Enter your email").email("Enter an email address").max(256, "Use at most 256 characters"),
});

type Values = z.infer<typeof FormSchema>;

const empty: Values = { email: "", recipientName: "", line1: "", line2: "", city: "", state: "", postalCode: "" };

// Checkout's first step without an account: where the order's emails go and where it ships. Coming
// back to change something starts from what was entered.
export function GuestDetails({ shipping }: { shipping: ShippingSettings }) {
  const router = useRouter();
  const { cart } = useCart();
  const [going, setGoing] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(FormSchema), defaultValues: empty });

  // Read after the first render: the server can't see this tab's storage
  useEffect(() => {
    const saved = readGuestDetails();
    if (!saved) return;
    const { address } = saved;
    form.reset({
      email: saved.email,
      recipientName: address.recipientName,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state ?? "",
      postalCode: address.postalCode ?? "",
    });
  }, [form]);

  const onSubmit = ({ email, ...address }: Values) => {
    setGoing(true);
    saveGuestDetails({ email, address: { ...address, line2: address.line2 || null, countryCode: "US" } });
    router.push("/checkout");
  };

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-9">
          <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] lg:text-5xl">Where should it go?</h1>
          <div className="-mt-3 lg:hidden">
            <CheckoutBagSummary shipping={shipping} variant="folded" />
          </div>

          <fieldset className="grid gap-4">
            <legend className={stepLegend}>Contact</legend>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormDescription>Your confirmation and tracking go here. No account needed.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Have an account?{" "}
              <Link href={signInPath("/address")} className="font-semibold text-accent underline-offset-3 hover:underline">
                Sign in
              </Link>{" "}
              to use your saved addresses.
            </p>
          </fieldset>

          <fieldset className="grid gap-4">
            <legend className={stepLegend}>Ship to</legend>
            <p className="-mt-2 text-sm text-muted-foreground">We ship within the United States. Tax is worked out for this address.</p>
            <AddressFields />
          </fieldset>

          {shipping && <DeliveryOption shipping={shipping} subtotalCents={cart?.subtotalCents ?? 0} />}

          <ContinueToPayment going={going} />
        </form>
      </Form>

      <CheckoutBagSummary shipping={shipping} />
    </div>
  );
}
