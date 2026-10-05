"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { toast } from "../ui/use-toast";
import { AddressFields, addressFieldsSchema } from "./AddressFields";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import type { Address } from "@/lib/api/types";

const FormSchema = addressFieldsSchema.extend({ isDefault: z.boolean() });

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
export function AddressForm({ address, onSaved, onCancel, submitLabel = "Save address", autoFocus = false }: Props) {
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
        <AddressFields />
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
}
