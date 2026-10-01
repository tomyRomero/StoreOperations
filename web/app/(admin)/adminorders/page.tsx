import Link from "next/link"
import { TableHead, TableRow, TableHeader, TableBody, Table } from "@/components/ui/table"
import { OrderRow } from "@/components/tables/OrderRow"
import SearchBar from "@/components/forms/SearchBar"
import Pagination from "@/components/shared/Pagination"
import type { OrderStatus } from "@/lib/api/types"
import { getAdminOrders } from "@/lib/data/admin-orders"
import { getStoreSettings } from "@/lib/data/catalog"
import { orderStatusLabel } from "@/lib/format"

const statuses: OrderStatus[] = ["pending", "shipped", "delivered", "cancelled", "refunded"]

const page = async (
  props: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
  }
) => {
  const searchParams = await props.searchParams;

  const search = searchParams.q ?? ""
  const status = statuses.find((s) => s === searchParams.status)
  // From a customer's page: only their orders
  const customerId = Number.parseInt(searchParams.customer ?? "", 10) || undefined
  const pageNumber = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1)

  const [orders, settings] = await Promise.all([
    getAdminOrders({ search, status, customerId, page: pageNumber }),
    getStoreSettings(),
  ])

  // Keeps the search and the status filter while paging or switching tabs
  const pathWith = (next: { status?: OrderStatus }) => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (customerId) params.set("customer", String(customerId))
    if (next.status) params.set("status", next.status)
    return `/adminorders?${params.toString()}`
  }

  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 ">
    <div className="grid w-full overflow-hidden grid-cols-1">
      <div className="flex flex-col">

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="text-heading3-bold">Orders</h1>
          </div>
          <SearchBar routeType="adminorders" placeholder={"Search by order number, customer name or email"}/>
          {customerId && (
            <p className="text-sm">
              Showing one customer&apos;s orders. <Link className="underline" href="/adminorders">Show everyone&apos;s</Link>
            </p>
          )}
          <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
            {[undefined, ...statuses].map((s) => (
              <Link
                key={s ?? "all"}
                href={pathWith({ status: s })}
                aria-current={s === status ? "page" : undefined}
                className={`rounded-full border px-3 py-1 text-sm ${s === status ? "bg-black text-white border-black" : "hover:bg-gray-100"}`}
              >
                {s ? orderStatusLabel(s) : "All"}
              </Link>
            ))}
          </nav>
          {!orders || !settings ? (
            <p className="text-red-500">Couldn&apos;t load orders. Please try again.</p>
          ) : orders.totalCount === 0 ? (
            <p>No orders match.</p>
          ) : (
          <div className="border shadow-xs rounded-lg p-2">
            <Table >
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-black"><span className="sr-only">Details</span></TableHead>
                  <TableHead className="font-bold text-black">Order</TableHead>
                  <TableHead className="font-bold text-black">Status</TableHead>
                  <TableHead className="font-bold text-black">Total</TableHead>
                  <TableHead className="font-bold text-black text-center">Items</TableHead>
                  <TableHead className="font-bold text-black">Customer</TableHead>
                  <TableHead className="font-bold text-black w-[150px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.items.map((order) => (
                  <OrderRow key={order.orderNumber} order={order} timeZone={settings.timeZoneId} />
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </main>
      </div>
    </div>
    {orders && (
      <Pagination
        path={`${pathWith({ status })}&`}
        pageNumber={orders.page}
        isNext={orders.page < orders.totalPages}
      />
    )}
    </section>
  )
}

export default page;
