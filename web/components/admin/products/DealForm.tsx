"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormAlert } from "@/components/forms/FormAlert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage } from "@/lib/api/problems";
import type { AdminProduct } from "@/lib/api/types";
import { dollarsText, formatMoney, parseDollars, percentOff } from "@/lib/money";

// Starts a deal, changes a running deal's price, or ends it. The regular price is kept and shown
// struck through in the store; ending the deal puts it back.
export function DealForm({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [refusal, setRefusal] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const running = product.compareAtPriceCents !== null;
  const regularCents = product.compareAtPriceCents ?? product.priceCents;

  const FormSchema = z.object({
    dealPrice: z.string().refine((text) => {
      const cents = parseDollars(text);
      return cents !== null && cents >= 1 && cents < regularCents;
    }, `Enter a price below the regular ${formatMoney(regularCents)}`),
    description: z.string().trim().max(200, "Use at most 200 characters"),
  });
  type Values = z.infer<typeof FormSchema>;

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dealPrice: running ? dollarsText(product.priceCents) : "",
      description: product.dealDescription ?? "",
    },
  });

  const onSubmit = async (values: Values) => {
    setRefusal(null);
    const { error, response } = await api.PUT("/api/admin/products/{id}/deal", {
      params: { path: { id: product.id } },
      body: { dealPriceCents: parseDollars(values.dealPrice)!, description: values.description || null },
    });

    if (response.ok) {
      toast({ variant: "success", title: running ? "Deal updated" : "Deal started" });
      router.refresh();
      return;
    }

    const errors = fieldErrors(error);
    if (errors.dealPriceCents) form.setError("dealPrice", { message: errors.dealPriceCents }, { shouldFocus: true });
    if (errors.description) form.setError("description", { message: errors.description });
    if (!errors.dealPriceCents && !errors.description) setRefusal(problemMessage(error));
  };

  const endDeal = async () => {
    setEnding(true);
    const { error, response } = await api.DELETE("/api/admin/products/{id}/deal", { params: { path: { id: product.id } } });
    setEnding(false);

    if (response.ok) {
      toast({ variant: "success", title: "Deal ended", description: `${product.name} is back to ${formatMoney(regularCents)}.` });
      router.refresh();
      return;
    }
    setRefusal(problemMessage(error));
  };

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <p className="text-sm text-muted-foreground">
          {running ? (
            <>
              On sale at <span className="font-semibold text-foreground">{formatMoney(product.priceCents)}</span>, {percentOff(product.priceCents, regularCents)}%
              off the regular {formatMoney(regularCents)}.
            </>
          ) : (
            <>Put it on sale below its regular {formatMoney(regularCents)}. The store shows both prices.</>
          )}
        </p>
        {refusal && <FormAlert>{refusal}</FormAlert>}
        <FormField
          control={form.control}
          name="dealPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal price</FormLabel>
              <div className="relative">
                <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <FormControl>
                  <Input inputMode="decimal" className="pl-7" {...field} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormDescription>Shown with the product, for example &quot;Back to school: 20% off&quot;.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {running ? "Update deal" : "Start deal"}
          </Button>
          {running && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" loading={ending}>
                  End deal
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End the deal on {product.name}?</AlertDialogTitle>
                  <AlertDialogDescription>Its price goes back to {formatMoney(regularCents)}.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep the deal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void endDeal()}>End deal</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>
    </Form>
  );
}
