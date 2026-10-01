import OrderResult from "@/components/checkout/OrderResult";
import { getStoreSettings } from "@/lib/data/catalog";
import { requireUser } from "@/lib/session";

// Where Stripe sends the customer after paying, with the PaymentIntent's id in the address
const page = async ({ searchParams }: { searchParams: { payment_intent?: string } }) => {
  const paymentIntentId = searchParams.payment_intent ?? "";
  await requireUser(`/ordersuccess?payment_intent=${encodeURIComponent(paymentIntentId)}`);
  const settings = await getStoreSettings();

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      <OrderResult paymentIntentId={paymentIntentId} supportEmail={settings?.supportEmail ?? null} />
    </section>
  );
};

export default page;
