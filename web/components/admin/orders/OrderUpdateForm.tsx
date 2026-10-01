"use client"

import { useState } from "react";
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
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

// The order page's side panel: move the order on to one of its next steps, and keep its shipping
// details. Saved with the version it was opened at, so another admin's change in between isn't overwritten.
export function OrderUpdateForm({ order, emailByDefault }: { order: AdminOrder; emailByDefault: boolean }) {
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

  const statusChanges = useWatch({ control: form.control, name: "status" }) !== order.status;

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
        variant: "success",
        title: changes && refunds(values.status)
          ? `Order ${orderStatusLabel(values.status).toLowerCase()} and ${formatMoney(order.totalCents)} refunded`
          : "Order updated",
      });
      // The page shows the saved order, and this form starts again from it
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
    <>
      <Form {...form}>
        <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={order.nextStatuses.length === 0}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[order.status, ...order.nextStatuses].map((status) => (
                      <SelectItem key={status} value={status}>
                        {orderStatusLabel(status)}
                        {status === order.status ? " (now)" : ""}
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

          {statusChanges && (
            <>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note for the customer (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormDescription>Shown in the order&apos;s history, for example why it was cancelled.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailCustomer"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Email the customer about this change</FormLabel>
                  </FormItem>
                )}
              />
            </>
          )}

          <fieldset className="grid gap-4 border-t pt-5">
            <legend className="float-left mb-1 text-sm font-semibold">Shipping</legend>
            <FormField
              control={form.control}
              name="carrier"
              render={({ field }) => (
                <FormItem className="clear-left">
                  <FormLabel>Carrier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      {carriers.map((carrier) => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier === "other" ? "Other" : carrierName(carrier)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>UPS, USPS, FedEx and DHL tracking numbers get a tracking link.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking number</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedDeliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated delivery</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          <Button className="w-full" type="submit" loading={saving}>
            Save changes
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
              The order is marked {confirming ? orderStatusLabel(confirming.status).toLowerCase() : ""} and the full amount goes back to the
              customer&apos;s card through Stripe.
              {order.status === "pending" && " Its items go back into stock."} This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep the order</AlertDialogCancel>
            <AlertDialogAction
              className="bg-sale text-white hover:bg-sale/90"
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
    </>
  );
}
