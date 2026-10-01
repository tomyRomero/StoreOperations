import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/content/ContentPage";
import { getCategories, getStoreSettings } from "@/lib/data/catalog";
import { returnsSummary, shippingSummary } from "@/lib/format";

export const metadata: Metadata = {
  title: "About us",
  description: "Artist-grade paint, brushes and canvas, shipped across the US.",
};

// What the store sells and how ordering works, from the live catalog and Store settings
export default async function AboutPage() {
  const [categories, settings] = await Promise.all([getCategories(), getStoreSettings()]);
  const storeName = settings?.storeName ?? "Palettehub";

  return (
    <ContentPage
      title={`About ${storeName}`}
      lead="Paint, brushes and canvas for people who make things, from a first sketch to a finished piece."
    >
      <ContentSection title="What we stock">
        <p>A focused range of artist-grade supplies, in a few categories:</p>
        {categories.length > 0 && (
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/products?category=${category.id}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </ContentSection>

      <ContentSection title="How ordering works">
        <ul>
          {settings && (
            <>
              <li>{shippingSummary(settings)}, anywhere in the United States.</li>
              <li>
                {returnsSummary(settings)}. <Link href="/shipping-returns">Shipping and returns</Link> has the details.
              </li>
            </>
          )}
          <li>You pay securely through Stripe. Your card details never reach our servers.</li>
          <li>
            Every order can be followed from placed to delivered in <Link href="/account/orders">your account</Link>.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Talk to us">
        <p>
          Questions about a supply or an order? <Link href="/contact">Send us a message</Link>
          {settings?.supportEmail && (
            <>
              {" "}
              or email <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
            </>
          )}
          , and a real person will reply.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
