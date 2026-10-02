"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormActions } from "@/components/admin/FormActions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FormAlert } from "@/components/forms/FormAlert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import type { AdminCategory } from "@/lib/api/types";

const FormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(50, "Use at most 50 characters"),
  imageKey: z.string().min(1, "Upload an image"),
});

type Values = z.infer<typeof FormSchema>;

// Adds a category, or renames one and changes its picture
export function CategoryForm({ category }: { category: AdminCategory | null }) {
  const router = useRouter();
  const [refusal, setRefusal] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: category?.name ?? "", imageKey: category?.imageKey ?? "" },
  });

  const onSubmit = async (values: Values) => {
    setRefusal(null);
    const { data, error } = category
      ? await api.PUT("/api/admin/categories/{id}", { params: { path: { id: category.id } }, body: values })
      : await api.POST("/api/admin/categories", { body: values });

    if (data) {
      toast({ variant: "success", title: category ? "Category saved" : `${data.name} added` });
      if (category) router.refresh();
      else router.push("/admin/categories");
      return;
    }

    const errors = Object.entries(fieldErrors(error)).filter(([field]) => field in values);
    errors.forEach(([field, message], index) => form.setError(field as keyof Values, { message }, { shouldFocus: index === 0 }));
    if (errors.length === 0) setRefusal(problemMessage(error));
  };

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {refusal && <FormAlert>{refusal}</FormAlert>}
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
          name="imageKey"
          render={({ field }) => (
            <FormItem>
              <ImageUpload
                label="Picture"
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
        <FormActions>
          <Button type="submit" loading={form.formState.isSubmitting}>
            {category ? "Save changes" : "Add category"}
          </Button>
        </FormActions>
      </form>
    </Form>
  );
}
