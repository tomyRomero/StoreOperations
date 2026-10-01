"use client"

import { useState } from "react";
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "../ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import type { AdminProduct } from "@/lib/api/types";
import { dollarsText, formatMoney, parseDollars } from "@/lib/money";

// Starts a deal, changes a running deal's price, or ends it. The regular price is kept and shown
// struck through in the store; ending the deal puts it back.
const MakeDealForm = ({ product }: { product: AdminProduct }) => {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const running = product.compareAtPriceCents !== null;
  const regularCents = product.compareAtPriceCents ?? product.priceCents;

  const FormSchema = z.object({
    dealPrice: z.string().refine((text) => {
      const cents = parseDollars(text);
      return cents !== null && cents >= 1 && cents < regularCents;
    }, `Enter a price below the regular ${formatMoney(regularCents)}`),
    description: z.string().trim().max(200, 'Use at most 200 characters'),
  });
  type Values = z.infer<typeof FormSchema>;

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dealPrice: running ? dollarsText(product.priceCents) : "",
      description: product.dealDescription ?? "",
    },
  });

  const done = (title: string) => {
    toast({ title });
    router.push("/admin/products");
    router.refresh();
  };

  const onSubmit = async (values: Values) => {
    setSaving(true);
    const { error, response } = await api.PUT("/api/admin/products/{id}/deal", {
      params: { path: { id: product.id } },
      body: { dealPriceCents: parseDollars(values.dealPrice)!, description: values.description || null },
    });
    setSaving(false);

    if (response.ok) return done(running ? "Deal updated" : "Deal started");

    const errors = fieldErrors(error);
    if (errors.dealPriceCents) form.setError("dealPrice", { message: errors.dealPriceCents });
    if (errors.description) form.setError("description", { message: errors.description });
    toast({ title: "Couldn't save the deal", description: problemMessage(error), variant: "destructive" });
  };

  const endDeal = async () => {
    if (!window.confirm(`End the deal on ${product.name}? Its price goes back to ${formatMoney(regularCents)}.`)) return;

    setSaving(true);
    const { error, response } = await api.DELETE("/api/admin/products/{id}/deal", { params: { path: { id: product.id } } });
    setSaving(false);

    if (response.ok) return done("Deal ended");
    toast({ title: "Couldn't end the deal", description: problemMessage(error), variant: "destructive" });
  };

  return (
      <div className="flex flex-col max-w-lg mx-auto">
      <Button asChild className="flex w-fit px-6 border border-black" variant="ghost">
        <Link href={'/admin/products'}>
          <Image src="/assets/back.png" alt="" width={32} height={32} className="px-1" />
          <span className="ml-2">Go Back</span>
        </Link>
      </Button>
      <h1 className="text-heading4-bold font-bold text-center my-6">{running ? "Product Deal" : "Make a Deal"}</h1>
      <div className="flex items-center gap-4 mb-6">
        <Image src={product.imageUrl} alt="" width={96} height={96} className="aspect-square rounded-lg object-cover" />
        <div>
          <p className="font-bold">{product.name}</p>
          <p>Regular price: {formatMoney(regularCents)}</p>
          {running && <p className="text-green-600 font-bold">Deal price: {formatMoney(product.priceCents)}</p>}
          <p>Stock: {product.stock}</p>
        </div>
      </div>
      <Form {...form} >
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
           control={form.control}
           name='dealPrice'
           render={({ field }) => (
          <FormItem>
            <FormLabel>Deal Price ($)</FormLabel>
            <FormControl>
            <Input inputMode="decimal" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
           )}
        />
        <FormField
           control={form.control}
           name='description'
           render={({ field }) => (
        <FormItem>
          <FormLabel>Deal Description (optional)</FormLabel>
          <FormControl>
             <Textarea rows={3} {...field} />
          </FormControl>
          <FormDescription>Shown with the product in the store&apos;s deals, for example &quot;Back to school: 20% off&quot;.</FormDescription>
          <FormMessage />
        </FormItem>
           )}
         />
        <Button className="w-full" type="submit" disabled={saving}>
          {saving ? "Saving..." : running ? "Update Deal" : "Start Deal"}
        </Button>
        {running && (
          <Button className="w-full" type="button" variant="outline" onClick={endDeal} disabled={saving}>
            End Deal
          </Button>
        )}
      </form>
      </Form>
    </div>
  )
}

export default MakeDealForm;
