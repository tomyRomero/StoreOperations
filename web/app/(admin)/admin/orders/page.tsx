import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, ShoppingBag, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterTabs } from "@/components/admin/list/FilterTabs";
import { ListSearch } from "@/components/admin/list/ListSearch";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import type { AdminOrderSort, OrderStatus } from "@/lib/api/types";
import { listHref, nextSort, oneOf, pageNumber, withParams } from "@/lib/admin-lists";
import { adminOrdersPageSize, getAdminOrders } from "@/lib/data/admin-orders";
import { getAdminCustomer } from "@/lib/data/admin-customers";
import { getAdminSettings } from "@/lib/data/admin-store";
import { orderStatusLabel } from "@/lib/format";
import { firstValue, type SearchParams } from "@/lib/paging";

export const metadata: Metadata = { title: "Orders" };

const statuses: OrderStatus[] = ["pending", "shipped", "delivered", "cancelled", "refunded"];
const sorts: AdminOrderSort[] = ["placed", "placed_desc", "total", "total_desc"];
const path = "/admin/orders";

export default async function OrdersPage(props: { searchParams: Promise<SearchParams> }) {
  const params = await props.searchParams;
  const search = firstValue(params.q)?.trim() ?? "";
  const status = oneOf(params.status, statuses);
  const sort = oneOf(params.sort, sorts);
  const customerId = Number.parseInt(firstValue(params.customer) ?? "", 10) || undefined;
  const page = pageNumber(params.page);

  const [orders, settings, customer] = await Promise.all([
    getAdminOrders({ search, status, customerId, sort, page }),
    getAdminSettings(),
    customerId ? getAdminCustomer(customerId) : null,
  ]);

  const href = (changes: Record<string, string | undefined>) => listHref(path, withParams(params, changes));
  // Newest first is the default, so it has no ?sort of its own
  const sortHref = (column: string) => {
    const next = nextSort(sort ?? "placed_desc", column, true);
    return href({ sort: next === "placed_desc" ? undefined : next });
  };
  const filtered = Boolean(search || status || customerId);

  return (
    <>
      <AdminPageHeader title="Orders" description={orders ? `${orders.totalCount} ${orders.totalCount === 1 ? "order" : "orders"}${filtered ? " match" : ""}` : undefined} />

      <div className="mb-4 grid gap-3">
        <ListSearch label="Search by order number, customer or email" />
        <FilterTabs
          label="Filter by status"
          tabs={[undefined, ...statuses].map((s) => ({
            label: s ? orderStatusLabel(s) : "All",
            href: href({ status: s }),
            current: s === status,
          }))}
        />
        {customerId && (
          <p className="flex w-fit items-center gap-2 rounded-full border bg-card py-1 pr-1 pl-3 text-sm">
            Orders from <span className="font-semibold">{customer?.username ?? `customer ${customerId}`}</span>
            <Link href={href({ customer: undefined })} className="rounded-full p-1 hover:bg-muted" aria-label="Show everyone's orders">
              <X className="size-4" aria-hidden />
            </Link>
          </p>
        )}
      </div>

      {!orders || !settings ? (
        <ErrorState title="We couldn't load the orders" action={<RetryButton />} />
      ) : orders.items.length === 0 ? (
        filtered ? (
          <EmptyState
            icon={SearchX}
            title="No orders match"
            action={
              <Button asChild variant="outline">
                <Link href={path}>Show all orders</Link>
              </Button>
            }
          >
            Try another search or status.
          </EmptyState>
        ) : (
          <EmptyState icon={ShoppingBag} title="No orders yet">
            Orders appear here as soon as customers pay.
          </EmptyState>
        )
      ) : (
        <div className="grid gap-4">
          <OrdersTable
            orders={orders.items}
            timeZone={settings.timeZoneId}
            emailByDefault={settings.emailCustomerOnStatusUpdateByDefault}
            sort={sort ?? "placed_desc"}
            sortHrefs={{ placed: sortHref("placed"), total: sortHref("total") }}
          />
          <Pagination
            pathname={path}
            searchParams={params}
            page={orders.page}
            totalPages={orders.totalPages}
            totalCount={orders.totalCount}
            pageSize={adminOrdersPageSize}
          />
        </div>
      )}
    </>
  );
}
