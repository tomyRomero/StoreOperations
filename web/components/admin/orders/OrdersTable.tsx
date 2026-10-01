"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { BulkBar, SelectBox, useSelection } from "@/components/admin/list/selection";
import { SortableHead } from "@/components/admin/list/SortableHead";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
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
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import type { AdminOrderSummary, OrderStatus } from "@/lib/api/types";
import { formatDate, orderStatusLabel } from "@/lib/format";
import { formatMoney } from "@/lib/money";

type Props = {
  orders: AdminOrderSummary[];
  timeZone: string;
  sort: string;
  // Where each sortable header leads
  sortHrefs: { placed: string; total: string };
  // Store settings: whether customers hear about status changes unless the admin says otherwise
  emailByDefault: boolean;
};

const bulkStatuses: OrderStatus[] = ["shipped", "delivered", "cancelled", "refunded"];
const refunds = (status: OrderStatus) => status === "cancelled" || status === "refunded";
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// The orders table, with ticks for changing many orders' status at once. Each change goes only to the
// ticked orders that can make it (an order that's delivered can't be shipped again), and the API checks
// every one again. Cancelling or refunding gives the money back, so the dialog says exactly how much.
export function OrdersTable({ orders, timeZone, sort, sortHrefs, emailByDefault }: Props) {
  const router = useRouter();
  const selection = useSelection(orders.map((o) => o.orderNumber));
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const [emailCustomers, setEmailCustomers] = useState(emailByDefault);
  const [working, setWorking] = useState(false);

  const chosen = orders.filter((o) => selection.isSelected(o.orderNumber));
  const eligibleFor = (status: OrderStatus) => chosen.filter((o) => o.nextStatuses.includes(status));
  const eligible = target ? eligibleFor(target) : [];
  const refundTotal = eligible.reduce((sum, o) => sum + o.totalCents, 0);

  const apply = async () => {
    if (!target || eligible.length === 0) return;
    setWorking(true);
    const { data, error } = await api.POST("/api/admin/orders/bulk-status", {
      body: {
        orderNumbers: eligible.map((o) => o.orderNumber),
        status: target,
        emailCustomer: emailCustomers,
        // Only ever true after the admin confirmed the refund amount in the dialog
        confirmRefund: refunds(target),
      },
    });
    setWorking(false);
    setTarget(null);

    if (!data) {
      toast({ variant: "destructive", title: "Couldn't change the orders", description: problemMessage(error) });
      return;
    }

    const label = orderStatusLabel(target).toLowerCase();
    if (data.succeeded.length > 0) {
      toast({
        variant: "success",
        title: `${plural(data.succeeded.length, "order", "orders")} marked ${label}`,
        description: refunds(target) ? "Each one was refunded in full through Stripe." : undefined,
      });
    }
    if (data.failed.length > 0) {
      toast({
        variant: "destructive",
        title: `${plural(data.failed.length, "order wasn't", "orders weren't")} changed`,
        description: data.failed.map((f) => `#${f.id}: ${f.message}`).join(" "),
      });
    }
    selection.clear();
    router.refresh();
  };

  return (
    <div className="grid gap-3">
      <BulkBar count={selection.selected.length} noun={["order", "orders"]} onClear={selection.clear}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              Change status
              <ChevronDown aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Mark the selected orders</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {bulkStatuses.map((status) => {
              const n = eligibleFor(status).length;
              return (
                <DropdownMenuItem
                  key={status}
                  disabled={n === 0}
                  variant={refunds(status) ? "destructive" : undefined}
                  onSelect={() => {
                    setEmailCustomers(emailByDefault);
                    setTarget(status);
                  }}
                >
                  <span className="flex-1">{status === "cancelled" ? "Cancelled, with a refund" : orderStatusLabel(status)}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {n} of {chosen.length}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </BulkBar>

      <div className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <SelectBox label="Select all orders on this page" checked={selection.all} indeterminate={selection.some} onChange={selection.toggleAll} />
              </TableHead>
              <TableHead>Order</TableHead>
              <SortableHead label="Placed" column="placed" sort={sort} href={sortHrefs.placed} />
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead>Status</TableHead>
              <SortableHead label="Total" column="total" sort={sort} href={sortHrefs.total} className="text-right [&>a]:flex-row-reverse" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const selected = selection.isSelected(order.orderNumber);
              return (
                <TableRow key={order.orderNumber} data-state={selected ? "selected" : undefined}>
                  <TableCell>
                    <SelectBox label={`Select order ${order.orderNumber}`} checked={selected} onChange={() => selection.toggle(order.orderNumber)} />
                  </TableCell>
                  <TableCell className="font-semibold whitespace-nowrap">
                    <Link href={`/admin/orders/${order.orderNumber}`} className="hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(order.placedAtUtc, timeZone)}</TableCell>
                  <TableCell className="max-w-56">
                    <p className="truncate font-semibold">{order.customerName}</p>
                    <p className="truncate text-muted-foreground">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{order.itemCount}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatMoney(order.totalCents)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={target !== null} onOpenChange={(open) => !open && !working && setTarget(null)}>
        <AlertDialogContent>
          {target && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {refunds(target)
                    ? `Refund ${formatMoney(refundTotal)} on ${plural(eligible.length, "order", "orders")}?`
                    : `Mark ${plural(eligible.length, "order", "orders")} ${orderStatusLabel(target).toLowerCase()}?`}
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="grid gap-2">
                    {refunds(target) && (
                      <p>
                        Each order is refunded in full to the card it was paid with, through Stripe, and marked {orderStatusLabel(target).toLowerCase()}.
                        Orders that hadn&apos;t shipped go back into stock. This can&apos;t be undone.
                      </p>
                    )}
                    <p>{eligible.map((o) => `#${o.orderNumber}`).join(", ")}</p>
                    {eligible.length < chosen.length && (
                      <p>
                        {plural(chosen.length - eligible.length, "selected order", "selected orders")} can&apos;t become{" "}
                        {orderStatusLabel(target).toLowerCase()} and {chosen.length - eligible.length === 1 ? "is" : "are"} left as{" "}
                        {chosen.length - eligible.length === 1 ? "it is" : "they are"}.
                      </p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <label className="flex items-center gap-3 text-sm font-semibold">
                <Switch checked={emailCustomers} onCheckedChange={setEmailCustomers} />
                Email the customers about this change
              </label>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={working}>{refunds(target) ? "Keep the orders" : "Cancel"}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => {
                    // Stays open while it works, so the result is clear before it closes
                    event.preventDefault();
                    void apply();
                  }}
                  disabled={working}
                  className={refunds(target) ? "bg-sale text-white hover:bg-sale/90" : undefined}
                >
                  {working
                    ? "Working…"
                    : refunds(target)
                      ? `Refund ${formatMoney(refundTotal)}`
                      : `Mark ${orderStatusLabel(target).toLowerCase()}`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
