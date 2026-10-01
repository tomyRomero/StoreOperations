"use client"

import { useState } from "react";
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "../ui/use-toast";
import ImageUpload from "./ImageUpload";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import type { AdminCategory } from "@/lib/api/types";

const FormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(50, 'Use at most 50 characters'),
  imageKey: z.string().min(1, 'Upload an image'),
});

type Values = z.infer<typeof FormSchema>;

// Adds a category, or renames one and changes its picture
export default function AddCategoryForm({ category }: { category: AdminCategory | null }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: category?.name ?? "", imageKey: category?.imageKey ?? "" },
  });

  const onSubmit = async (values: Values) => {
    setSaving(true);
    const { error, response } = category
      ? await api.PUT("/api/admin/categories/{id}", { params: { path: { id: category.id } }, body: values })
      : await api.POST("/api/admin/categories", { body: values });
    setSaving(false);

    if (response.ok) {
      toast({ title: category ? "Category saved" : "Category added" });
      router.push('/admincategories');
      router.refresh();
      return;
    }

    for (const [field, message] of Object.entries(fieldErrors(error))) {
      if (field in values) form.setError(field as keyof Values, { message });
    }
    toast({ title: "Couldn't save the category", description: problemMessage(error), variant: "destructive" });
  };

  return (
    <div className="flex flex-col max-w-md mx-auto">
      <Button asChild className="flex w-fit px-6 border border-black" variant="ghost">
        <Link href={'/admincategories'}>
          <Image src="/assets/back.png" alt="" width={32} height={32} className="px-1" />
          <span className="ml-2">Go Back</span>
        </Link>
      </Button>
      <h1 className="text-heading4-bold font-bold text-center my-6">{category ? "Edit Category" : "Add New Category"}</h1>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
              <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
            />
            <FormField
              control={form.control}
              name='imageKey'
              render={({ field }) => (
            <FormItem>
              <ImageUpload
                label="Category picture"
                imageUrl={category?.imageUrl ?? null}
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
            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? "Saving..." : category ? "Save Category" : "Add Category"}
            </Button>
          </form>
        </Form>
    </div>
  );
}
