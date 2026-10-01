import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CustomerOrderDetailsCards from "@/components/cards/CustomerOrderDetailsCards";
import { getOrder } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";

const page = async (props: { params: Promise<{ id: string }> }) =>  {
  const params = await props.params;

  const [order, settings] = await Promise.all([getOrder(params.id), getStoreSettings()]);

  const back = (
    <Button asChild className="flex w-fit px-6 border border-black" variant="ghost">
      <Link href={'/account/orders'}>
        <Image src="/assets/back.png" alt="" width={32} height={32} className="px-1" />
        <span className="ml-2">Go Back</span>
      </Link>
    </Button>
  );

  if (!order || !settings)
  {
    return(
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
      {back}
      <div className="flex justify-center py-6">
      <Card className="max-w-2xl p-6">
        <h1 className="text-red-500 text-heading4-bold">Order Was Not Found</h1>
        <Image src="/assets/error.png" alt="" width={100} height={100} className="mx-auto my-6" />
        <p className="text-center">Check the order number, or go back to your orders.</p>
      </Card>
      </div>
    </section>
    )
  }

  return (
    <section className="md:pt-28 max-md:pt-24 lg:pt-0 overflow-auto">
      {back}
      <div className="pt-6">
        <CustomerOrderDetailsCards order={order} timeZone={settings.timeZoneId} />
      </div>
    </section>
  )
}

export default page;
