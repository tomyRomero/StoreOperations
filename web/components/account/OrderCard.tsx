import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import type { OrderSummary } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  order: OrderSummary;
  timeZone: string;
  // h2 when the cards sit right under the page's title, h3 under a section heading
  heading?: "h2" | "h3";
};

export function OrderCard({ order, timeZone, heading: Heading = "h3" }: Props) {
  const ended = order.status === "cancelled" || order.status === "refunded";

  return (
    <article className="relative grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-[22px] border bg-card p-4 transition-colors hover:border-foreground/22 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring sm:grid-cols-[58px_minmax(0,1fr)_minmax(0,190px)_110px_20px] sm:gap-5 sm:px-5.5">
      <span className="relative grid size-14.5 place-items-center overflow-hidden rounded-[16px] bg-surface-3 max-sm:row-span-2">
        {order.imageUrl ? (
          <Image src={order.imageUrl} alt="" fill sizes="58px" className={cn("object-contain p-[14%]", ended && "opacity-45")} />
        ) : (
          <Package className="size-5 text-muted-foreground" aria-hidden />
        )}
      </span>
      <div className="grid min-w-0 gap-1">
        <Heading className="font-sans text-base font-normal">
          <Link href={`/account/orders/${order.orderNumber}`} className="font-mono font-medium outline-none after:absolute after:inset-0">
            <span className="sr-only">Order </span>#{order.orderNumber}
          </Link>
        </Heading>
        <p className="text-sm text-muted-foreground">
          {formatDate(order.placedAtUtc, timeZone)} · {order.itemCount === 1 ? "1 item" : `${order.itemCount} items`}
        </p>
      </div>
      <OrderStatusBadge status={order.status} className="justify-self-start max-sm:col-start-2 max-sm:row-start-2" />
      <span className="justify-self-end font-mono font-medium tabular-nums max-sm:col-start-3 max-sm:row-start-1">{formatMoney(order.totalCents)}</span>
      <ArrowRight className="size-4 text-faint max-sm:hidden" aria-hidden />
    </article>
  );
}
