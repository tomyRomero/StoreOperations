import Link from "next/link";
import Image from "next/image";
import OrderDetailsCards from "@/components/cards/OrderDetailsCards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminOrder } from "@/lib/data/admin-orders";
import { getStoreSettings } from "@/lib/data/catalog";

const page = async (props: { params: Promise<{ orderNumber: string }> }) =>  {
  const params = await props.params;

  const [order, settings] = await Promise.all([getAdminOrder(params.orderNumber), getStoreSettings()])

  const back = (
    <Button asChild className="flex w-fit px-6 border border-black" variant="ghost">
      <Link href={'/admin/orders'}>
        <Image src="/assets/back.png" alt="" width={32} height={32} className="px-1" />
        <span className="ml-2">Go Back</span>
      </Link>
    </Button>
  );

  if (!order || !settings)
  {
    return(
    <section className="">
      {back}
      <div className="flex justify-center py-6">
      <Card className="max-w-2xl p-6">
        <h1 className="text-red-500 text-heading4-bold">Order Was Not Found</h1>
        <Image src="/assets/error.png" alt="" width={100} height={100} className="mx-auto my-6" />
        <p className="text-center">Check the order number, or go back to the orders.</p>
      </Card>
      </div>
    </section>
    )
  }

  return (
    <section className="">
      <div className="flex flex-wrap items-center gap-4 pb-6">
        {back}
        <Button asChild className="flex px-2 border border-black" variant="ghost">
          <Link href={`/admin/orders/${order.orderNumber}/edit`}>
            <Image src="/assets/orders.png" alt="" width={32} height={32} className="px-1" />
            <span className="ml-2">Update Order</span>
          </Link>
        </Button>
      </div>

      <OrderDetailsCards order={order} timeZone={settings.timeZoneId} />
    </section>
  )
}

export default page;
