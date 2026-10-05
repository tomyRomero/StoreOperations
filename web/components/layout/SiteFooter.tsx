import { Fragment } from "react";
import Link from "next/link";
import { StoreLogo } from "@/components/brand/StoreLogo";
import type { Category, StoreSettings } from "@/lib/api/types";
import { nounsOf, socialLinksOf, storeNameOf } from "@/lib/storefront";
import { FooterNewsletter } from "./FooterNewsletter";

type Props = {
  categories: Category[];
  // The support email, phone, address and social links each show only when the store has set them
  settings: StoreSettings | null;
  // Offered only while something is on a deal
  hasDeals: boolean;
};

const linkClasses = "text-[15px] text-ink-2 transition-colors duration-[120ms] hover:text-foreground";
const headingClasses = "mb-1 font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint";

export function SiteFooter({ categories, settings, hasDeals }: Props) {
  const storeName = storeNameOf(settings);
  const supportEmail = settings?.supportEmail ?? null;
  const { contactPhone, contactAddress } = settings?.storefront ?? {};
  const social = socialLinksOf(settings);
  return (
    <footer className="mt-auto overflow-hidden border-t pt-14 lg:pt-16">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-8">
        <div className="col-span-2 grid content-start gap-5 sm:col-span-3 lg:col-span-1 lg:max-w-sm">
          <StoreLogo />
          <FooterNewsletter homeHasBand={settings?.storefront.homeSections.includes("newsletter") ?? true} />
        </div>

        <nav aria-label="Shop" className="grid content-start gap-3">
          <h2 className={headingClasses}>Shop</h2>
          <Link href="/products" className={linkClasses}>
            All {nounsOf(settings).many}
          </Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`} className={linkClasses}>
              {category.name}
            </Link>
          ))}
          {hasDeals && (
            <Link href="/products?sale=1" className={linkClasses}>
              Sale
            </Link>
          )}
        </nav>

        <nav aria-label="Help" className="grid content-start gap-3">
          <h2 className={headingClasses}>Help</h2>
          <Link href="/shipping-returns" className={linkClasses}>
            Shipping and returns
          </Link>
          <Link href="/contact" className={linkClasses}>
            Contact us
          </Link>
          <Link href="/orders/find" className={linkClasses}>
            Track an order
          </Link>
          {contactPhone && (
            <a href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`} className={linkClasses}>
              {contactPhone}
            </a>
          )}
          {supportEmail && (
            // A narrow column wraps the address after the @, never inside a word
            <a href={`mailto:${supportEmail}`} className={`${linkClasses} break-words`}>
              {supportEmail.split("@").map((part, i) => (
                <Fragment key={i}>
                  {i > 0 && (
                    <>
                      @<wbr />
                    </>
                  )}
                  {part}
                </Fragment>
              ))}
            </a>
          )}
        </nav>

        <nav aria-label={storeName} className="grid content-start gap-3">
          <h2 className={headingClasses}>{storeName}</h2>
          <Link href="/about" className={linkClasses}>
            About us
          </Link>
          <Link href="/privacy" className={linkClasses}>
            Privacy
          </Link>
          {contactAddress && <address className="whitespace-pre-line text-[15px] not-italic text-ink-2">{contactAddress}</address>}
        </nav>
      </div>

      <div className="container mt-14">
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t py-5 font-mono text-[13px] text-faint">
          <p>
            © {new Date().getFullYear()} {storeName}
          </p>
          {social.length > 0 && (
            <ul aria-label={`${storeName} elsewhere`} className="flex flex-wrap gap-x-5 gap-y-2">
              {social.map((link) => (
                <li key={link.name}>
                  <a href={link.href} rel="me noopener" target="_blank" className="transition-colors hover:text-foreground">
                    {link.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p>Runs on StoreOps</p>
        </div>
      </div>

      {/* The name again, large and fading into the page. The words are already above, so it's hidden from screen readers. */}
      <p
        aria-hidden
        className="h-[0.74em] select-none overflow-hidden whitespace-nowrap bg-linear-to-b from-foreground/14 to-foreground/0 bg-clip-text text-center text-[clamp(3rem,18vw,14.5rem)] font-bold leading-[0.95] tracking-[-0.07em] text-transparent"
      >
        {storeName}
      </p>
    </footer>
  );
}
