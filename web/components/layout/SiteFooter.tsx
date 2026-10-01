import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import SubscribeForm from "@/components/forms/SubscribeForm";
import type { Category } from "@/lib/api/types";

type Props = {
  categories: Category[];
  storeName: string;
  // From Store settings; shown when the store has set one
  supportEmail: string | null;
};

const linkClasses = "text-sm text-white/75 transition-colors hover:text-white hover:underline underline-offset-4";

// Shop, help, the store, and the newsletter
export function SiteFooter({ categories, storeName, supportEmail }: Props) {
  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.5fr] lg:py-16">
        <nav aria-label="Shop">
          <h2 className="mb-4 font-sans text-sm font-semibold">Shop</h2>
          <ul className="grid gap-2.5">
            <li>
              <Link href="/products" className={linkClasses}>
                All supplies
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/products?category=${category.id}`} className={linkClasses}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help">
          <h2 className="mb-4 font-sans text-sm font-semibold">Help</h2>
          <ul className="grid gap-2.5">
            <li>
              <Link href="/contact" className={linkClasses}>
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/shipping-returns" className={linkClasses}>
                Shipping and returns
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className={linkClasses}>
                Track an order
              </Link>
            </li>
            {supportEmail && (
              <li>
                <a href={`mailto:${supportEmail}`} className={linkClasses}>
                  {supportEmail}
                </a>
              </li>
            )}
          </ul>
        </nav>

        <nav aria-label={storeName}>
          <h2 className="mb-4 font-sans text-sm font-semibold">{storeName}</h2>
          <ul className="grid gap-2.5">
            <li>
              <Link href="/about" className={linkClasses}>
                About us
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkClasses}>
                Privacy
              </Link>
            </li>
          </ul>
        </nav>

        <SubscribeForm />
      </div>

      <div className="border-t border-white/15">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-white/75">
          <Logo name={storeName} className="text-white" />
          <p>
            © {new Date().getFullYear()} {storeName}. Art supplies, shipped across the US.
          </p>
        </div>
      </div>
    </footer>
  );
}
