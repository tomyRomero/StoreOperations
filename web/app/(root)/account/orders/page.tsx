import Link from "next/link";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerOrder from "@/components/cards/CustomerOrder";
import Pagination from "@/components/shared/Pagination";
import { getOrders } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";

const page = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const pageNumber = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const [orders, settings] = await Promise.all([getOrders(pageNumber), getStoreSettings()]);

  const header = (
    <CardHeader className="flex flex-row flex-wrap items-center gap-4 space-y-0">
      <CardTitle className="text-heading3-bold">Order History</CardTitle>
      <Button asChild className="ml-auto bg-black text-white border border-black" size="sm" variant="ghost">
        <Link href="/contact">Contact support</Link>
      </Button>
    </CardHeader>
  );

  if (!orders || !settings) {
    return (
      <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
        <Card>
          {header}
          <CardContent className="text-red-500">Failed to load order history. Please try again later.</CardContent>
        </Card>
      </section>
    );
  }

  if (orders.totalCount === 0) {
    return (
      <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
        <Card>
          {header}
          <CardContent className="flex flex-col items-start gap-4">
            <p>You haven&apos;t placed any orders yet.</p>
            <Button asChild className="bg-black text-white border border-black hover:bg-white hover:text-black">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
      <Card>
        {header}
        {orders.items.map((order) => (
          <CustomerOrder key={order.orderNumber} order={order} timeZone={settings.timeZoneId} />
        ))}
      </Card>

      <Pagination
        path={"/account/orders?"}
        pageNumber={orders.page}
        isNext={orders.page < orders.totalPages}
      />
    </section>
  );
};

export default page;
