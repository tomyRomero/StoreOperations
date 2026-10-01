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
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
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
import ImageUpload from "./ImageUpload";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { AdminCategory, AdminProduct } from "@/lib/api/types";
import { dollarsText, formatMoney, parseDollars } from "@/lib/money";

const FormSchema = z.object({
  name: z.string().trim().min(3, 'Use at least 3 characters').max(120, 'Use at most 120 characters'),
  description: z.string().trim().min(3, 'Use at least 3 characters').max(2000, 'Use at most 2000 characters'),
  categoryId: z.string().min(1, 'Choose a category'),
  price: z.string().refine((text) => {
    const cents = parseDollars(text);
    return cents !== null && cents >= 1 && cents <= 10_000_000;
  }, 'Enter a price between $0.01 and $100,000, like 18.50'),
  stock: z.string().regex(/^\d{1,6}$/, 'Enter a whole number').refine((text) => Number(text) <= 100_000, 'Use at most 100,000'),
  imageKey: z.string().min(1, 'Upload an image'),
});

type Values = z.infer<typeof FormSchema>;

// Adds a product, or edits one. An edit is saved with the version it was opened at, so a sale or
// another admin's change in between isn't overwritten.
const AddProductForm = ({ product, categories }: { product: AdminProduct | null; categories: AdminCategory[] }) => {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const onDeal = product?.compareAtPriceCents != null;

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product ? String(product.categoryId) : "",
      price: product ? dollarsText(product.priceCents) : "",
      stock: product ? String(product.stock) : "",
      imageKey: product?.imageKey ?? "",
    },
  });

  const onSubmit = async (values: Values) => {
    setSaving(true);
    const body = {
      name: values.name,
      description: values.description,
      categoryId: Number(values.categoryId),
      priceCents: parseDollars(values.price)!,
      stock: Number(values.stock),
      imageKey: values.imageKey,
    };
    const { error, response } = product
      ? await api.PUT("/api/admin/products/{id}", { params: { path: { id: product.id } }, body: { ...body, rowVersion: product.rowVersion } })
      : await api.POST("/api/admin/products", { body });
    setSaving(false);

    if (response.ok) {
      toast({ title: product ? "Product saved" : "Product added" });
      router.push('/adminproducts');
      router.refresh();
      return;
    }

    if ((error as ApiProblem | undefined)?.code === "EDIT_CONFLICT") {
      toast({ title: "This product changed since you opened it", description: "The latest version is loaded. Check it and save again.", variant: "destructive" });
      router.refresh();
      return;
    }

    // The API names its fields in cents; the form shows dollars
    for (const [field, message] of Object.entries(fieldErrors(error))) {
      const name = field === "priceCents" ? "price" : field;
      if (name in values) form.setError(name as keyof Values, { message });
    }
    toast({ title: "Couldn't save the product", description: problemMessage(error), variant: "destructive" });
  };

  return (
      <div className="flex flex-col max-w-lg mx-auto">
      <Button asChild className="flex w-fit px-6 border border-black" variant="ghost">
        <Link href={'/adminproducts'}>
          <Image src="/assets/back.png" alt="" width={32} height={32} className="px-1" />
          <span className="ml-2">Go Back</span>
        </Link>
      </Button>
      <h1 className="text-heading4-bold font-bold text-center my-6">{product ? "Edit Product" : "Add New Product"}</h1>
      {product?.archivedAtUtc && (
        <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm" role="status">
          This product is archived, so it isn&apos;t in the store. Restore it from the products list to change it.
        </p>
      )}
      <Form {...form} >
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
           control={form.control}
           name='name'
           render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
               <Input type="text" {...field} />
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
          <FormLabel>Product Description</FormLabel>
          <FormControl>
             <Textarea rows={4} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
           )}
         />
         <FormField
           control={form.control}
           name='categoryId'
           render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <FormDescription>
              There are no categories yet. <Link className="underline" href="/adminaddcategory">Add one</Link> first.
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
           )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
        <FormField
           control={form.control}
           name='price'
           render={({ field }) => (
          <FormItem>
            <FormLabel>{onDeal ? "Deal Price ($)" : "Price ($)"}</FormLabel>
            <FormControl>
            <Input inputMode="decimal" {...field} />
            </FormControl>
            {onDeal && (
              <FormDescription>
                On a deal: the regular price is {formatMoney(product!.compareAtPriceCents!)}. End the deal to change it.
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
           )}
        />
          <FormField
           control={form.control}
           name='stock'
           render={({ field }) => (
          <FormItem>
            <FormLabel>Stock</FormLabel>
            <FormControl>
            <Input inputMode="numeric" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
           )}
        />
        </div>
          <FormField
           control={form.control}
           name='imageKey'
           render={({ field }) => (
          <FormItem>
            <ImageUpload
              label="Product photo"
              imageUrl={product?.imageUrl ?? null}
              onUploaded={(key) => {
                field.onChange(key);
                form.clearErrors("imageKey");
              }}
              onError={(message) => form.setError("imageKey", { message })}
            />
            <FormMessage />
          </FormItem>
            )}
        />
        <Button className="w-full" type="submit" disabled={saving || Boolean(product?.archivedAtUtc)}>
          {saving ? "Saving..." : product ? "Save Product" : "Add Product"}
        </Button>
      </form>
      </Form>
    </div>
  )
}

export default AddProductForm;
