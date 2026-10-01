import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import type { OrderSummary } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";

// One order in the history: picture, number, date, status, total. The whole card opens the order.
export function OrderCard({ order, timeZone }: { order: OrderSummary; timeZone: string }) {
  return (
    <article className="relative flex items-center gap-4 rounded-md border p-4 transition-colors hover:bg-muted/40 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring">
      <span className="relative flex aspect-square w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
        {order.imageUrl ? (
          <Image src={order.imageUrl} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <Package className="size-6 text-muted-foreground" aria-hidden />
        )}
      </span>
      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-sans text-base font-semibold">
            <Link href={`/account/orders/${order.orderNumber}`} className="outline-none after:absolute after:inset-0">
              Order #{order.orderNumber}
            </Link>
          </h3>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(order.placedAtUtc, timeZone)} · {order.itemCount === 1 ? "1 item" : `${order.itemCount} items`}
        </p>
      </div>
      <span className="font-semibold tabular-nums">{formatMoney(order.totalCents)}</span>
      <ChevronRight className="size-5 text-muted-foreground max-sm:hidden" aria-hidden />
    </article>
  );
}
