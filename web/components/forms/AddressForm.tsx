"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "../ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import type { Address } from "@/lib/api/types";
import { usStates } from "@/lib/us-states";

// The store ships within the United States, as it always has. The API accepts any country, so this
// form is where that rule lives; Stripe Tax works out the tax for the address at checkout.
const FormSchema = z.object({
  recipientName: z.string().trim().min(1, "Enter the recipient's name").max(100, "Use at most 100 characters"),
  line1: z.string().trim().min(1, "Enter a street address").max(200, "Use at most 200 characters"),
  line2: z.string().trim().max(200, "Use at most 200 characters"),
  city: z.string().trim().min(1, "Enter a city").max(100, "Use at most 100 characters"),
  state: z.string().min(1, "Choose a state"),
  postalCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP code"),
  isDefault: z.boolean(),
});

type Values = z.infer<typeof FormSchema>;

type Props = {
  // The saved address to change; without one the form adds a new address
  address?: Address;
  onSaved: (address: Address) => void;
  // Shows a Cancel button beside Save
  onCancel?: () => void;
  submitLabel?: string;
  // Puts the cursor in the first field, for a form that opened because someone asked for it
  autoFocus?: boolean;
};

// Adds an address to the customer's address book (the first one becomes the default on its own), or
// changes a saved one. Which address is the default is chosen in the address book, so editing leaves it.
const AddressForm = ({ address, onSaved, onCancel, submitLabel = "Save address", autoFocus = false }: Props) => {
  const [saving, setSaving] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      recipientName: address?.recipientName ?? "",
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postalCode: address?.postalCode ?? "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (autoFocus) form.setFocus("recipientName");
  }, [autoFocus, form]);

  const onSubmit = async ({ isDefault, ...values }: Values) => {
    setSaving(true);
    const body = { ...values, line2: values.line2 || null, countryCode: "US" };
    const { data, error } = address
      ? await api.PUT("/api/account/addresses/{id}", { params: { path: { id: address.id } }, body })
      : await api.POST("/api/account/addresses", { body: { ...body, isDefault } });
    setSaving(false);

    if (!data) {
      for (const [field, message] of Object.entries(fieldErrors(error))) {
        if (field in values) form.setError(field as keyof Values, { message });
      }
      toast({ title: "Couldn't save the address", description: problemMessage(error), variant: "destructive" });
      return;
    }

    onSaved(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
        {!address && (
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Make this my default address</FormLabel>
              </FormItem>
            )}
          />
        )}
        <div className="flex flex-wrap gap-2.5 max-sm:grid">
          <Button type="submit" size="lg" loading={saving} className="rounded-full px-7">
            {submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" size="lg" variant="ghost" className="border border-foreground/16 px-6" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default AddressForm;
