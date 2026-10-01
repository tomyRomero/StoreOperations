import { Fragment } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import SubscribeForm from "@/components/forms/SubscribeForm";
import type { Category } from "@/lib/api/types";

type Props = {
  categories: Category[];
  storeName: string;
  // From Store settings; shown when the store has set one
  supportEmail: string | null;
  // Offered only while something is on a deal
  hasDeals: boolean;
};

const linkClasses = "text-[15px] text-ink-2 transition-colors duration-[120ms] hover:text-foreground";
const headingClasses = "mb-1 font-mono text-xs font-medium uppercase tracking-[0.08em] text-faint";

// The store's name and newsletter, then shop, help and the store's own pages, and the name again in large
// fading type to close the page
export function SiteFooter({ categories, storeName, supportEmail, hasDeals }: Props) {
  return (
    <footer className="mt-auto overflow-hidden border-t pt-14 lg:pt-16">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-8">
        <div className="col-span-2 grid content-start gap-5 sm:col-span-3 lg:col-span-1 lg:max-w-sm">
          <Logo name={storeName} />
          <SubscribeForm />
        </div>

        <nav aria-label="Shop" className="grid content-start gap-3">
          <h2 className={headingClasses}>Shop</h2>
          <Link href="/products" className={linkClasses}>
            All supplies
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
          <Link href="/account/orders" className={linkClasses}>
            Track an order
          </Link>
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
        </nav>
      </div>

      <div className="container mt-14">
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t py-5 font-mono text-[13px] text-faint">
          <p>
            © {new Date().getFullYear()} {storeName}
          </p>
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
