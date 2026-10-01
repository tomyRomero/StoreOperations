"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FormAlert } from "@/components/forms/FormAlert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { AdminCategory, AdminProduct } from "@/lib/api/types";
import { dollarsText, formatMoney, parseDollars } from "@/lib/money";

const FormSchema = z.object({
  name: z.string().trim().min(3, "Use at least 3 characters").max(120, "Use at most 120 characters"),
  description: z.string().trim().min(3, "Use at least 3 characters").max(2000, "Use at most 2000 characters"),
  categoryId: z.string().min(1, "Choose a category"),
  price: z.string().refine((text) => {
    const cents = parseDollars(text);
    return cents !== null && cents >= 1 && cents <= 10_000_000;
  }, "Enter a price between $0.01 and $100,000, like 18.50"),
  stock: z.string().regex(/^\d{1,6}$/, "Enter a whole number").refine((text) => Number(text) <= 100_000, "Use at most 100,000"),
  imageKey: z.string().min(1, "Upload an image"),
});

type Values = z.infer<typeof FormSchema>;

// Adds a product, or edits one. An edit is saved with the version it was opened at, so a sale or
// another admin's change in between isn't overwritten.
export function ProductForm({ product, categories }: { product: AdminProduct | null; categories: AdminCategory[] }) {
  const router = useRouter();
  const [refusal, setRefusal] = useState<string | null>(null);
  const onDeal = product?.compareAtPriceCents != null;
  const archived = Boolean(product?.archivedAtUtc);

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
    setRefusal(null);
    const body = {
      name: values.name,
      description: values.description,
      categoryId: Number(values.categoryId),
      priceCents: parseDollars(values.price)!,
      stock: Number(values.stock),
      imageKey: values.imageKey,
    };
    const { data, error } = product
      ? await api.PUT("/api/admin/products/{id}", { params: { path: { id: product.id } }, body: { ...body, rowVersion: product.rowVersion } })
      : await api.POST("/api/admin/products", { body });

    if (data) {
      toast({ variant: "success", title: product ? "Product saved" : `${data.name} added to the store` });
      // A new product opens on its own page; an edit stays here, and the form starts again from the saved version
      if (product) router.refresh();
      else router.push(`/admin/products/${data.id}`);
      return;
    }

    if ((error as ApiProblem | undefined)?.code === "EDIT_CONFLICT") {
      toast({ variant: "destructive", title: "This product changed since you opened it", description: "The latest version is loaded. Check it and save again." });
      router.refresh();
      return;
    }

    // The API names its fields in cents; the form shows dollars
    const errors = Object.entries(fieldErrors(error))
      .map(([field, message]) => [field === "priceCents" ? "price" : field, message] as const)
      .filter(([field]) => field in values);
    errors.forEach(([field, message], index) => form.setError(field as keyof Values, { message }, { shouldFocus: index === 0 }));
    if (errors.length === 0) setRefusal(problemMessage(error));
  };

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {archived && <FormAlert>This product is archived, so it isn&apos;t in the store. Restore it to change it.</FormAlert>}
        {refusal && <FormAlert>{refusal}</FormAlert>}
        <fieldset disabled={archived} className="grid gap-5 disabled:opacity-70">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={archived}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <FormDescription>
                    There are no categories yet.{" "}
                    <Link className="font-semibold text-accent underline-offset-4 hover:underline" href="/admin/categories/new">
                      Add one
                    </Link>{" "}
                    first.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{onDeal ? "Deal price" : "Price"}</FormLabel>
                  <div className="relative">
                    <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <FormControl>
                      <Input inputMode="decimal" className="pl-7" {...field} />
                    </FormControl>
                  </div>
                  {onDeal && <FormDescription>The regular price is {formatMoney(product!.compareAtPriceCents!)}. End the deal to change it.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
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
            name="imageKey"
            render={({ field }) => (
              <FormItem>
                <ImageUpload
                  label="Photo"
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
        </fieldset>
        <div>
          <Button type="submit" loading={form.formState.isSubmitting} disabled={archived}>
            {product ? "Save changes" : "Add product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
