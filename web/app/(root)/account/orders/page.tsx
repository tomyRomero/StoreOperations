import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { OrderCard } from "@/components/account/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getOrders } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";
import type { SearchParams } from "@/lib/paging";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const pageNumber = Math.max(1, Number.parseInt(String(searchParams.page ?? "1"), 10) || 1);
  const [orders, settings] = await Promise.all([getOrders(pageNumber), getStoreSettings()]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[56px]">Your orders</h1>
        {orders && orders.totalCount > 0 && (
          <p className="font-mono text-sm text-muted-foreground">{orders.totalCount === 1 ? "1 order" : `${orders.totalCount} orders`}</p>
        )}
      </div>

      {!orders || !settings ? (
        <ErrorState
          title="We couldn't load your orders"
          action={<RetryButton />}
        />
      ) : orders.totalCount === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          action={
            <Button asChild>
              <Link href="/products">Start shopping</Link>
            </Button>
          }
        >
          When you place an order, you can follow it here.
        </EmptyState>
      ) : (
        <>
          <ul className="grid gap-3">
            {orders.items.map((order) => (
              <li key={order.orderNumber}>
                <OrderCard order={order} timeZone={settings.timeZoneId} heading="h2" />
              </li>
            ))}
          </ul>
          <Pagination
            pathname="/account/orders"
            searchParams={searchParams}
            page={orders.page}
            totalPages={orders.totalPages}
            totalCount={orders.totalCount}
            pageSize={orders.pageSize}
          />
          <p className="text-sm text-faint">
            Something wrong with an order?{" "}
            <Link href="/contact" className="text-ink-2 underline underline-offset-3 hover:text-foreground">
              Ask us
            </Link>{" "}
            and we&apos;ll sort it out.
          </p>
        </>
      )}
    </div>
  );
}
