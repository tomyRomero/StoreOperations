import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetails } from "@/components/account/OrderDetails";
import { SaveOrderCard } from "@/components/account/SaveOrderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getStoreSettings } from "@/lib/data/catalog";
import { getGuestOrder } from "@/lib/data/guest-orders";

// The link is private, so search engines are asked to leave it out
export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

// A guest's order, opened from the private link in its emails. Anyone with the link can see it, so the
// link only ever goes to the email address the order was placed with.
export default async function GuestOrderPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const [guestOrder, settings] = await Promise.all([getGuestOrder(token), getStoreSettings()]);
  if (!settings) {
    return <ErrorState title="We couldn't load this order" action={<RetryButton />} />;
  }
  if (!guestOrder) notFound();

  return (
    <div className="container grid max-w-[1120px] gap-5 py-10 lg:py-14">
      <OrderDetails
        order={guestOrder.order}
        timeZone={settings.timeZoneId}
        aside={<SaveOrderCard accessToken={token} email={guestOrder.email} inAccount={guestOrder.inAccount} orderNumber={guestOrder.order.orderNumber} />}
      />
    </div>
  );
}
