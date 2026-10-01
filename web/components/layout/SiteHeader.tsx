import { Suspense } from "react";
import Link from "next/link";
import { Logo, PaletteStripe } from "@/components/brand/Logo";
import type { Category } from "@/lib/api/types";
import { AccountMenu } from "./AccountMenu";
import { CartButton } from "./CartButton";
import { HeaderSearch } from "./HeaderSearch";
import { MobileNav } from "./MobileNav";
import { MobileSearch } from "./MobileSearch";
import { ThemeToggle } from "./ThemeToggle";

// The storefront header: the palette stripe, the logo, the categories (from the store), search, the
// account menu, the light and dark switch (in the menu on phones) and the cart. It stays at the top while the page scrolls.
export function SiteHeader({ categories, storeName }: { categories: Category[]; storeName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <PaletteStripe />
      <div className="container relative flex h-16 items-center gap-2 lg:h-[72px] lg:gap-6">
        {/* The parts that read the address (to come back after signing in) */}
        <Suspense>
          <MobileNav categories={categories} storeName={storeName} />
        </Suspense>
        <Link href="/" className="shrink-0 rounded-sm">
          <Logo name={storeName} />
          <span className="sr-only">, home</span>
        </Link>

        <nav aria-label="Categories" className="max-lg:hidden">
          <ul className="flex items-center gap-1">
            <li>
              <Link href="/products" className="rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted">
                Shop all
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/products?category=${category.id}`}
                  className="rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Suspense>
            <HeaderSearch className="w-64 max-md:hidden xl:w-80" />
            <MobileSearch />
            <AccountMenu />
          </Suspense>
          <ThemeToggle className="size-10 justify-center rounded-md hover:bg-muted max-lg:hidden" />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
