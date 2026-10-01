"use client"

import { useState } from "react";
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "next/navigation";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
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
import { fieldErrors, problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { AdminSettings } from "@/lib/api/types";
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
  storeName: z.string().trim().min(1, 'Enter the store name').max(100, 'Use at most 100 characters'),
  supportEmail: z.union([z.literal(""), z.string().trim().email('Enter an email address').max(256)]),
  shippingFlatRate: dollars(100_000, 'Enter an amount up to $1,000, like 10.00'),
  freeShippingThreshold: z.union([z.literal(""), dollars(10_000_000, 'Enter an amount up to $100,000, or leave it empty')])
    .refine((text) => text === "" || parseDollars(text)! >= 1, 'Enter an amount, or leave it empty'),
  returnPolicy: z.enum(["no_returns", "exchanges", "refunds"]),
  returnWindowDays: z.string(),
  returnPolicyNote: z.string().trim().max(500, 'Use at most 500 characters'),
  lowStockThreshold: z.string().regex(/^\d{1,4}$/, 'Enter a whole number').refine((t) => Number(t) <= 1000, 'Use at most 1000'),
  emailCustomerOnStatusUpdateByDefault: z.boolean(),
  timeZoneId: z.string().min(1, 'Choose a time zone'),
}).refine(
  (v) => v.returnPolicy === "no_returns" || (/^\d{1,3}$/.test(v.returnWindowDays) && Number(v.returnWindowDays) >= 1 && Number(v.returnWindowDays) <= 365),
  { path: ["returnWindowDays"], message: 'Enter a number of days from 1 to 365' },
);

type Values = z.infer<typeof FormSchema>;

// The fields the API names in cents, as the form's dollar fields
const formFieldFor: Record<string, keyof Values> = {
  shippingFlatRateCents: "shippingFlatRate",
  freeShippingThresholdCents: "freeShippingThreshold",
};

// The store's policies, saved together. Saved with the version it was opened at, so two admins
// can't overwrite each other's changes.
export default function StoreSettingsForm({ settings }: { settings: AdminSettings }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      storeName: settings.storeName,
      supportEmail: settings.supportEmail ?? "",
      shippingFlatRate: dollarsText(settings.shippingFlatRateCents),
      freeShippingThreshold: settings.freeShippingThresholdCents === null ? "" : dollarsText(settings.freeShippingThresholdCents),
      returnPolicy: settings.returnPolicy,
      returnWindowDays: settings.returnWindowDays === null ? "" : String(settings.returnWindowDays),
      returnPolicyNote: settings.returnPolicyNote ?? "",
      lowStockThreshold: String(settings.lowStockThreshold),
      emailCustomerOnStatusUpdateByDefault: settings.emailCustomerOnStatusUpdateByDefault,
      timeZoneId: settings.timeZoneId,
    },
  });

  const returnsAllowed = useWatch({ control: form.control, name: "returnPolicy" }) !== "no_returns";
  const zones = timeZones.some(([id]) => id === settings.timeZoneId) ? timeZones : [...timeZones, [settings.timeZoneId, settings.timeZoneId] as [string, string]];

  const onSubmit = async (values: Values) => {
    setSaving(true);
    const { data, error } = await api.PUT("/api/admin/settings", {
      body: {
        storeName: values.storeName,
        supportEmail: values.supportEmail || null,
        shippingFlatRateCents: parseDollars(values.shippingFlatRate)!,
        freeShippingThresholdCents: values.freeShippingThreshold ? parseDollars(values.freeShippingThreshold) : null,
        returnPolicy: values.returnPolicy,
        returnWindowDays: values.returnPolicy === "no_returns" ? null : Number(values.returnWindowDays),
        returnPolicyNote: values.returnPolicyNote || null,
        lowStockThreshold: Number(values.lowStockThreshold),
        emailCustomerOnStatusUpdateByDefault: values.emailCustomerOnStatusUpdateByDefault,
        timeZoneId: values.timeZoneId,
        rowVersion: settings.rowVersion,
      },
    });
    setSaving(false);

    if (data) {
      toast({ title: "Settings saved" });
      router.refresh();
      return;
    }

    if ((error as ApiProblem | undefined)?.code === "EDIT_CONFLICT") {
      toast({ title: "The settings changed since you opened them", description: "The latest version is loaded. Check it and save again.", variant: "destructive" });
      router.refresh();
      return;
    }

    for (const [field, message] of Object.entries(fieldErrors(error))) {
      const name = formFieldFor[field] ?? field;
      if (name in values) form.setError(name as keyof Values, { message });
    }
    toast({ title: "Couldn't save the settings", description: problemMessage(error), variant: "destructive" });
  };

  return (
    <Form {...form}>
      <form className="grid gap-6 max-w-2xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Store</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField control={form.control} name="storeName" render={({ field }) => (
              <FormItem>
                <FormLabel>Store name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="supportEmail" render={({ field }) => (
              <FormItem>
                <FormLabel>Support email (optional)</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormDescription>Shown to customers. The contact form and new-order notes go here.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timeZoneId" render={({ field }) => (
              <FormItem>
                <FormLabel>Time zone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {zones.map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormDescription>When the store&apos;s days start and end, on the dashboard and on order dates.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
            <CardDescription>Added to every order at checkout.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="shippingFlatRate" render={({ field }) => (
              <FormItem>
                <FormLabel>Flat rate ($)</FormLabel>
                <FormControl><Input inputMode="decimal" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="freeShippingThreshold" render={({ field }) => (
              <FormItem>
                <FormLabel>Free shipping from ($, optional)</FormLabel>
                <FormControl><Input inputMode="decimal" {...field} /></FormControl>
                <FormDescription>Leave it empty for no free shipping.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Returns</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="returnPolicy" render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {returnPolicies.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {returnsAllowed && (
                <FormField control={form.control} name="returnWindowDays" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days to return</FormLabel>
                    <FormControl><Input inputMode="numeric" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
            <FormField control={form.control} name="returnPolicyNote" render={({ field }) => (
              <FormItem>
                <FormLabel>Note for customers (optional)</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders and stock</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Low stock at</FormLabel>
                <FormControl><Input inputMode="numeric" {...field} /></FormControl>
                <FormDescription>Products with this many or fewer left are flagged on the products page.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="emailCustomerOnStatusUpdateByDefault" render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <FormLabel>Email customers when their order&apos;s status changes, unless I say otherwise</FormLabel>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="sm:w-fit">
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </Form>
  );
}
