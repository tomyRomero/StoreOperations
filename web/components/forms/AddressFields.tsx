"use client";

import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { usStates } from "@/lib/us-states";

// The store ships within the United States. The API accepts any country, so these rules are where that
// lives; Stripe Tax works out the tax for the address at checkout.
export const addressFieldsSchema = z.object({
  recipientName: z.string().trim().min(1, "Enter the recipient's name").max(100, "Use at most 100 characters"),
  line1: z.string().trim().min(1, "Enter a street address").max(200, "Use at most 200 characters"),
  line2: z.string().trim().max(200, "Use at most 200 characters"),
  city: z.string().trim().min(1, "Enter a city").max(100, "Use at most 100 characters"),
  state: z.string().min(1, "Choose a state"),
  postalCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP code"),
});

export type AddressFieldValues = z.infer<typeof addressFieldsSchema>;

// The address inputs, shared by the address book and guest checkout. They go inside a <Form> whose values
// include these fields.
export function AddressFields() {
  const { control } = useFormContext<AddressFieldValues>();

  return (
    <>
      <FormField
        control={control}
        name="recipientName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full name</FormLabel>
            <FormControl>
              <Input autoComplete="shipping name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="line1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street address</FormLabel>
            <FormControl>
              <Input autoComplete="shipping address-line1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="line2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
            <FormControl>
              <Input autoComplete="shipping address-line2" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input autoComplete="shipping address-level2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {usStates.map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP code</FormLabel>
              <FormControl>
                <Input autoComplete="shipping postal-code" inputMode="numeric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
