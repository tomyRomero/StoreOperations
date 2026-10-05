import type { Metadata } from "next";
import { OrderResult } from "@/components/checkout/OrderResult";
import { getStoreSettings } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "Order confirmation" };

// Where Stripe sends the customer or guest after paying, with the PaymentIntent's id in the address. The
// API only answers for the browser that paid: the customer's session, or the guest's checkout cookie.
const page = async (props: { searchParams: Promise<{ payment_intent?: string }> }) => {
  const searchParams = await props.searchParams;
  const paymentIntentId = searchParams.payment_intent ?? "";
  const settings = await getStoreSettings();

  return (
    <div className="container relative isolate py-12 lg:py-20">
      <OrderResult paymentIntentId={paymentIntentId} supportEmail={settings?.supportEmail ?? null} />
    </div>
  );
};

export default page;
