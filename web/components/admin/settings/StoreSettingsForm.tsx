"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormActions } from "@/components/admin/FormActions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { AdminSettings } from "@/lib/api/types";
import { returnsSummary, shippingSummary } from "@/lib/format";
import { dollarsText, parseDollars } from "@/lib/money";

// Where the store's days start and end: the dashboard's days and the dates on order pages
const timeZones: [string, string][] = [
  ["America/New_York", "Eastern (New York)"],
  ["America/Chicago", "Central (Chicago)"],
  ["America/Denver", "Mountain (Denver)"],
  ["America/Phoenix", "Arizona (Phoenix)"],
  ["America/Los_Angeles", "Pacific (Los Angeles)"],
  ["America/Anchorage", "Alaska (Anchorage)"],
  ["Pacific/Honolulu", "Hawaii (Honolulu)"],
  ["America/Puerto_Rico", "Atlantic (Puerto Rico, Virgin Islands)"],
];

const returnPolicies = [
  ["no_returns", "No returns"],
  ["exchanges", "Exchanges only"],
  ["refunds", "Refunds"],
] as const;

const dollars = (max: number, message: string) =>
  z.string().refine((text) => {
    const cents = parseDollars(text);
    return cents !== null && cents <= max;
  }, message);

const FormSchema = z.object({
  supportEmail: z.union([z.literal(""), z.string().trim().email("Enter an email address").max(256)]),
  shippingFlatRate: dollars(100_000, "Enter an amount up to $1,000, like 10.00"),
  freeShippingThreshold: z.union([z.literal(""), dollars(10_000_000, "Enter an amount up to $100,000, or leave it empty")])
    .refine((text) => text === "" || parseDollars(text)! >= 1, "Enter an amount, or leave it empty"),
  returnPolicy: z.enum(["no_returns", "exchanges", "refunds"]),
  returnWindowDays: z.string(),
  returnPolicyNote: z.string().trim().max(500, "Use at most 500 characters"),
  lowStockThreshold: z.string().regex(/^\d{1,4}$/, "Enter a whole number").refine((t) => Number(t) <= 1000, "Use at most 1000"),
  emailCustomerOnStatusUpdateByDefault: z.boolean(),
  guestCheckout: z.boolean(),
  timeZoneId: z.string().min(1, "Choose a time zone"),
}).refine(
  (v) => v.returnPolicy === "no_returns" || (/^\d{1,3}$/.test(v.returnWindowDays) && Number(v.returnWindowDays) >= 1 && Number(v.returnWindowDays) <= 365),
  { path: ["returnWindowDays"], message: "Enter a number of days from 1 to 365" },
);

type Values = z.infer<typeof FormSchema>;

// The fields the API names in cents, as the form's dollar fields
const formFieldFor: Record<string, keyof Values> = {
  shippingFlatRateCents: "shippingFlatRate",
  freeShippingThresholdCents: "freeShippingThreshold",
};

// The store's policies, saved together with the version they were opened at, so two admins can't
// overwrite each other's changes. The name, look and words are edited in Theme and brand.
export function StoreSettingsForm({ settings }: { settings: AdminSettings }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      supportEmail: settings.supportEmail ?? "",
      shippingFlatRate: dollarsText(settings.shippingFlatRateCents),
      freeShippingThreshold: settings.freeShippingThresholdCents === null ? "" : dollarsText(settings.freeShippingThresholdCents),
      returnPolicy: settings.returnPolicy,
      returnWindowDays: settings.returnWindowDays === null ? "" : String(settings.returnWindowDays),
      returnPolicyNote: settings.returnPolicyNote ?? "",
      lowStockThreshold: String(settings.lowStockThreshold),
      emailCustomerOnStatusUpdateByDefault: settings.emailCustomerOnStatusUpdateByDefault,
      guestCheckout: settings.guestCheckout,
      timeZoneId: settings.timeZoneId,
    },
  });

  const returnsAllowed = useWatch({ control: form.control, name: "returnPolicy" }) !== "no_returns";
  // What customers will read, worked out from the fields as they're typed
  const [flatRate, freeFrom, policy, windowDays] = useWatch({ control: form.control, name: ["shippingFlatRate", "freeShippingThreshold", "returnPolicy", "returnWindowDays"] });
  const flatCents = parseDollars(flatRate);
  const freeCents = freeFrom ? parseDollars(freeFrom) : null;
  const shippingPreview = flatCents !== null && (freeFrom === "" || freeCents !== null)
    ? shippingSummary({ shippingFlatRateCents: flatCents, freeShippingThresholdCents: freeCents })
    : null;
  const returnsPreview = returnsSummary({ returnPolicy: policy, returnWindowDays: Number(windowDays) || null });
  const zones = timeZones.some(([id]) => id === settings.timeZoneId) ? timeZones : [...timeZones, [settings.timeZoneId, settings.timeZoneId] as [string, string]];

  const onSubmit = async (values: Values) => {
    setSaving(true);
    const { data, error } = await api.PUT("/api/admin/settings", {
      body: {
        supportEmail: values.supportEmail || null,
        shippingFlatRateCents: parseDollars(values.shippingFlatRate)!,
        freeShippingThresholdCents: values.freeShippingThreshold ? parseDollars(values.freeShippingThreshold) : null,
        returnPolicy: values.returnPolicy,
        returnWindowDays: values.returnPolicy === "no_returns" ? null : Number(values.returnWindowDays),
        returnPolicyNote: values.returnPolicyNote || null,
        lowStockThreshold: Number(values.lowStockThreshold),
        emailCustomerOnStatusUpdateByDefault: values.emailCustomerOnStatusUpdateByDefault,
        guestCheckout: values.guestCheckout,
        timeZoneId: values.timeZoneId,
        rowVersion: settings.rowVersion,
      },
    });
    setSaving(false);

    if (data) {
      toast({ variant: "success", title: "Settings saved", description: "The store, checkout and emails use them straight away." });
      router.refresh();
      return;
    }

    if ((error as ApiProblem | undefined)?.code === "EDIT_CONFLICT") {
      toast({ variant: "destructive", title: "The settings changed since you opened them", description: "The latest version is loaded. Check it and save again." });
      router.refresh();
      return;
    }

    for (const [field, message] of Object.entries(fieldErrors(error))) {
      const name = formFieldFor[field] ?? field;
      if (name in values) form.setError(name as keyof Values, { message });
    }
    toast({ variant: "destructive", title: "Couldn't save the settings", description: problemMessage(error) });
  };

  const section = "grid gap-5 rounded-xl border bg-card p-5 sm:p-6";
  const heading = "text-h4";
  const preview = (text: string | null) =>
    text && (
      <p className="rounded-sm bg-muted px-3 py-2 text-sm">
        <span className="text-muted-foreground">Customers see: </span>
        <span className="font-semibold">{text}</span>
      </p>
    );

  return (
    <Form {...form}>
      <form className="grid max-w-3xl gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <section aria-labelledby="store-heading" className={section}>
          <h2 id="store-heading" className={heading}>
            Store
          </h2>
          <FormField
            control={form.control}
            name="supportEmail"
            render={({ field }) => (
              <FormItem className="sm:max-w-md">
                <FormLabel>Support email (optional)</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormDescription>Contact form messages come here. Without it, the form is closed.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeZoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time zone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-80">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {zones.map(([id, label]) => (
                      <SelectItem key={id} value={id}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Where the store&apos;s days start and end, for the dashboard and the dates on orders.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section aria-labelledby="shipping-heading" className={section}>
          <h2 id="shipping-heading" className={heading}>
            Shipping
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="shippingFlatRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flat rate per order</FormLabel>
                  <div className="relative">
                    <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <FormControl>
                      <Input inputMode="decimal" className="pl-7" {...field} />
                    </FormControl>
                  </div>
                  <FormDescription>0 makes shipping free on every order.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="freeShippingThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Free shipping from (optional)</FormLabel>
                  <div className="relative">
                    <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <FormControl>
                      <Input inputMode="decimal" className="pl-7" {...field} />
                    </FormControl>
                  </div>
                  <FormDescription>Orders at or over this amount ship free. Leave it empty to always charge.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {preview(shippingPreview)}
        </section>

        <section aria-labelledby="returns-heading" className={section}>
          <h2 id="returns-heading" className={heading}>
            Returns
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="returnPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {returnPolicies.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {returnsAllowed && (
              <FormField
                control={form.control}
                name="returnWindowDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days to return</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" {...field} />
                    </FormControl>
                    <FormDescription>Counted from delivery.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <FormField
            control={form.control}
            name="returnPolicyNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note for customers (optional)</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormDescription>Shown with the policy on product pages and on Shipping and returns.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {preview(returnsPreview)}
        </section>

        <section aria-labelledby="operations-heading" className={section}>
          <h2 id="operations-heading" className={heading}>
            Orders and stock
          </h2>
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem className="sm:max-w-60">
                <FormLabel>Low stock at</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" {...field} />
                </FormControl>
                <FormDescription>Products with this many or fewer left show as low, in the store and on the dashboard.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="guestCheckout"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                </FormControl>
                <div className="grid gap-1">
                  <FormLabel>Let shoppers check out without an account</FormLabel>
                  <FormDescription>
                    Guests give their email and address at checkout and get a private link to their order. When it&apos;s off, they sign in or create an account first.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emailCustomerOnStatusUpdateByDefault"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                </FormControl>
                <div className="grid gap-1">
                  <FormLabel>Email customers when their order&apos;s status changes</FormLabel>
                  <FormDescription>The starting choice on each order. You can still change it for one update.</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </section>

        <FormActions>
          <Button type="submit" size="lg" loading={saving}>
            Save settings
          </Button>
        </FormActions>
      </form>
    </Form>
  );
}
