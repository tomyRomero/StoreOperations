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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "../ui/use-toast";
import { api } from "@/lib/api/browser";
import { fieldErrors, problemMessage, type ApiProblem } from "@/lib/api/problems";
import type { AdminOrder, Carrier, OrderStatus } from "@/lib/api/types";
import { carrierName, orderStatusLabel } from "@/lib/format";
import { formatMoney } from "@/lib/money";

const carriers: Carrier[] = ["ups", "usps", "fedex", "dhl", "other"];

const FormSchema = z.object({
  status: z.enum(["pending", "shipped", "delivered", "cancelled", "refunded"]),
  // Radix's Select has no empty option, so "none" stands for no carrier
  carrier: z.enum(["none", "ups", "usps", "fedex", "dhl", "other"]),
  trackingNumber: z.string().trim().max(100, "Use at most 100 characters"),
  estimatedDeliveryDate: z.string(),
  note: z.string().trim().max(300, "Use at most 300 characters"),
  emailCustomer: z.boolean(),
});

type Values = z.infer<typeof FormSchema>;

const refunds = (status: OrderStatus) => status === "cancelled" || status === "refunded";

// The order's side panel: move it on to one of its next steps, and keep its shipping details. Saved
// with the version it was opened at, so another admin's change in between isn't overwritten.
export default function OrderForm({ order, emailByDefault }: { order: AdminOrder; emailByDefault: boolean }) {
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState<Values | null>(null);
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: order.status,
      carrier: order.carrier ?? "none",
      trackingNumber: order.trackingNumber ?? "",
      estimatedDeliveryDate: order.estimatedDeliveryDate ?? "",
      note: "",
      emailCustomer: emailByDefault,
    },
  });

  const statusChanges = form.watch("status") !== order.status;

  const save = async (values: Values, confirmRefund: boolean) => {
    setSaving(true);
    const changes = values.status !== order.status;
    const { data, error } = await api.PUT("/api/admin/orders/{orderNumber}", {
      params: { path: { orderNumber: order.orderNumber } },
      body: {
        status: values.status,
        carrier: values.carrier === "none" ? null : values.carrier,
        trackingNumber: values.trackingNumber || null,
        estimatedDeliveryDate: values.estimatedDeliveryDate || null,
        note: changes ? values.note || null : null,
        emailCustomer: values.emailCustomer,
        confirmRefund,
        rowVersion: order.rowVersion,
      },
    });
    setSaving(false);

    if (data) {
      toast({
        title: changes && refunds(values.status)
          ? `Order ${orderStatusLabel(values.status).toLowerCase()} and ${formatMoney(order.totalCents)} refunded`
          : "Order updated",
      });
      router.push(`/adminorders/${order.orderNumber}`);
      router.refresh();
      return;
    }

    // Someone else changed the order: reload it, which resets this form to the latest version
    if ((error as ApiProblem | undefined)?.code === "EDIT_CONFLICT") {
      toast({ title: "This order changed since you opened it", description: "The latest version is loaded. Check it and save again.", variant: "destructive" });
      router.refresh();
      return;
    }

    for (const [field, message] of Object.entries(fieldErrors(error))) {
      if (field in values) form.setError(field as keyof Values, { message });
    }
    toast({ title: "Couldn't update the order", description: problemMessage(error), variant: "destructive" });
  };

  // Cancelling or refunding gives the money back, so it's confirmed in a dialog that shows the amount
  const onSubmit = (values: Values) => {
    if (values.status !== order.status && refunds(values.status)) setConfirming(values);
    else void save(values, false);
  };

  return (
    <div className="flex flex-col max-w-md mx-auto">
      <Button asChild className="flex w-fit px-6 border border-black" variant="ghost">
        <Link href={`/adminorders/${order.orderNumber}`}>
          <Image src="/assets/back.png" alt="" width={32} height={32} className="px-1" />
          <span className="ml-2">Go Back</span>
        </Link>
      </Button>
      <h1 className="text-heading4-bold font-bold text-center my-6">Update Order #{order.orderNumber}</h1>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[order.status, ...order.nextStatuses].map((status) => (
                    <SelectItem key={status} value={status}>
                      {orderStatusLabel(status)}{status === order.status ? " (current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {order.nextStatuses.length === 0
                  ? "This order is final."
                  : "Cancelling or refunding gives the customer back the full amount through Stripe."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="carrier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrier</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>{carrier === "other" ? "Other" : carrierName(carrier)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>With a tracking number, UPS, USPS, FedEx and DHL get a tracking link.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

            <FormField
              control={form.control}
              name='trackingNumber'
              render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Tracking Number</FormLabel>
              <FormControl>
              <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
            />

            <FormField
              control={form.control}
              name='estimatedDeliveryDate'
              render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Estimated Delivery Date</FormLabel>
              <FormControl>
              <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
            />

            {statusChanges && (
              <>
                <FormField
                  control={form.control}
                  name='note'
                  render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Note for the customer (optional)</FormLabel>
                  <FormControl>
                  <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormDescription>Shown on the order&apos;s history, for example why it was cancelled.</FormDescription>
                  <FormMessage />
                </FormItem>
                )}
                />

                <FormField
                  control={form.control}
                  name="emailCustomer"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Email the customer about this change</FormLabel>
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Order"}
            </Button>
          </form>
        </Form>

        <AlertDialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Refund {formatMoney(order.totalCents)} to {order.customerName}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The order is marked {confirming ? orderStatusLabel(confirming.status).toLowerCase() : ""} and the full
                amount goes back to the customer&apos;s card through Stripe.
                {order.status === "pending" && " Its items go back into stock."} This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep the order</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (confirming) void save(confirming, true);
                  setConfirming(null);
                }}
              >
                Refund {formatMoney(order.totalCents)}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
