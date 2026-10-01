import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/content/ContentPage";
import { getStoreSettings } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What we keep about you, why, and what you can do about it.",
};

// Written from what the code actually stores and sends: keep it in step when that changes
export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const storeName = settings?.storeName ?? "Palettehub";
  const supportEmail = settings?.supportEmail;

  return (
    <ContentPage
      title="Privacy"
      lead="We keep only what we need to take, ship and support your orders. We don't sell your details or share them for advertising."
    >
      <ContentSection title="What we keep">
        <ul>
          <li>Your account: a username, your email address and your password, which is stored only as a one-way hash, so nobody here can read it.</li>
          <li>The addresses you save, so you don&apos;t have to type them again.</li>
          <li>Your orders: what you bought, what you paid, where it went and Stripe&apos;s reference for the payment.</li>
          <li>Your email address, if you subscribe to the newsletter.</li>
          <li>Your name, email address and message, if you write to us.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Payments">
        <p>
          You type your card details into Stripe&apos;s own payment fields, and they go straight to Stripe. We never see or store your card number. Stripe
          also uses your shipping address to work out sales tax. Their{" "}
          <a href="https://stripe.com/privacy" rel="noreferrer" target="_blank">
            privacy policy
          </a>{" "}
          covers what they keep.
        </p>
      </ContentSection>

      <ContentSection title="Cookies and your browser">
        <ul>
          <li>One cookie keeps you signed in. It lasts 7 days, renews while you use the site, and is removed when you sign out.</li>
          <li>Before you sign in, your cart is kept in your browser. When you sign in, it moves into your account.</li>
          <li>At checkout, Stripe sets its own cookies to help prevent fraud.</li>
          <li>There are no analytics or advertising trackers.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Emails">
        <p>
          We email you when you create an account and when you place an order, and we may email you about an order&apos;s progress or a refund. The
          newsletter only comes if you subscribe, and every one has a link to leave.
        </p>
      </ContentSection>

      <ContentSection title="Who sees it">
        <ul>
          <li>{storeName}&apos;s staff see orders and their addresses, to pack and ship them.</li>
          <li>Stripe handles payments, and our email provider delivers our emails.</li>
          <li>Nobody else.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Your choices">
        <ul>
          <li>
            Change your password and remove saved addresses at any time in <Link href="/account">your account</Link>.
          </li>
          <li>Leave the newsletter from the link in any newsletter.</li>
          <li>
            To get a copy of what we hold about you, or to have your account deleted,{" "}
            {supportEmail ? (
              <>
                email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </>
            ) : (
              <>
                get in touch through our <Link href="/contact">contact page</Link>
              </>
            )}
            .
          </li>
        </ul>
      </ContentSection>
    </ContentPage>
  );
}
