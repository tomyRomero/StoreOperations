import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/content/ContentPage";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getStoreSettings } from "@/lib/data/catalog";
import { formatMoney } from "@/lib/money";
import { returnsSummary, shippingSummary } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping and returns",
  description: "What shipping costs, where we ship, and how returns work.",
};

// Every rule on this page comes from Store settings, so it always matches what checkout charges
// and what the store accepts back
export default async function ShippingReturnsPage() {
  const settings = await getStoreSettings();
  if (!settings) {
    return (
      <div className="container py-16">
        <ErrorState title="We couldn't load our shipping rules" action={<RetryButton />} />
      </div>
    );
  }

  const { shippingFlatRateCents: flatRate, freeShippingThresholdCents: freeOver, returnPolicy, returnWindowDays: days, supportEmail } = settings;
  const contact = supportEmail ? (
    <>
      email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
    </>
  ) : (
    <>
      get in touch through our <Link href="/contact">contact page</Link>
    </>
  );

  return (
    <ContentPage title="Shipping and returns" lead={`${shippingSummary(settings)}. ${returnsSummary(settings)}.`}>
      <ContentSection title="Shipping">
        <ul>
          {flatRate === 0 ? (
            <li>Shipping is free on every order.</li>
          ) : (
            <li>
              Shipping is a flat {formatMoney(flatRate)} per order, however much you buy
              {freeOver !== null && <>, and free once your order reaches {formatMoney(freeOver)}</>}.
            </li>
          )}
          <li>We ship to addresses in the United States.</li>
          <li>Your cart shows the shipping cost before you check out.</li>
          <li>
            You can follow each order from placed to delivered under <Link href="/account/orders">Your orders</Link>.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Tax">
        <p>Sales tax depends on where your order is going, so it&apos;s worked out at checkout from your shipping address and shown before you pay.</p>
      </ContentSection>

      <ContentSection title="Returns">
        {returnPolicy === "no_returns" ? (
          <p>
            All sales are final, so please check colors, sizes and quantities before you order. If something arrives damaged or wrong, {contact} and
            we&apos;ll put it right.
          </p>
        ) : (
          <>
            <p>
              {returnPolicy === "refunds" ? "You can return unused items for a refund" : "You can exchange unused items for something else"}
              {days ? ` within ${days} days of delivery` : ""}.
            </p>
            <ul>
              <li>To start, {contact} with your order number. It&apos;s in your confirmation email and under Your orders.</li>
              {returnPolicy === "refunds" && <li>Refunds go back to the card you paid with.</li>}
            </ul>
          </>
        )}
        {settings.returnPolicyNote && <p>{settings.returnPolicyNote}</p>}
      </ContentSection>

      <ContentSection title="Prices">
        <p>All prices are in US dollars. Items on sale show their usual price beside the sale price.</p>
      </ContentSection>
    </ContentPage>
  );
}
