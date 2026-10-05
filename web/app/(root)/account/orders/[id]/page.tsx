import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderDetails } from "@/components/account/OrderDetails";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getOrder } from "@/lib/data/account";
import { getStoreSettings } from "@/lib/data/catalog";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: `Order #${(await props.params).id}` };
}

// Another customer's order number simply isn't found
export default async function OrderPage(props: Props) {
  const { id } = await props.params;
  const [order, settings] = await Promise.all([getOrder(id), getStoreSettings()]);
  if (!settings) {
    return <ErrorState title="We couldn't load this order" action={<RetryButton />} />;
  }
  if (!order) notFound();

  return (
    <div className="grid gap-5">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 justify-self-start text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Your orders
      </Link>

      <OrderDetails order={order} timeZone={settings.timeZoneId} />
    </div>
  );
}
