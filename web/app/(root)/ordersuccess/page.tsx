import type { Metadata } from "next";
import OrderResult from "@/components/checkout/OrderResult";
import { getStoreSettings } from "@/lib/data/catalog";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Order confirmation" };

// Where Stripe sends the customer after paying, with the PaymentIntent's id in the address
const page = async (props: { searchParams: Promise<{ payment_intent?: string }> }) => {
  const searchParams = await props.searchParams;
  const paymentIntentId = searchParams.payment_intent ?? "";
  await requireUser(`/ordersuccess?payment_intent=${encodeURIComponent(paymentIntentId)}`);
  const settings = await getStoreSettings();

  return (
    <div className="container py-12 lg:py-20">
      <OrderResult paymentIntentId={paymentIntentId} supportEmail={settings?.supportEmail ?? null} />
    </div>
  );
};

export default page;
