import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SearchPalette } from "@/components/search/SearchPalette";
import type { Category } from "@/lib/api/types";
import { AccountMenu } from "./AccountMenu";
import { CartButton } from "./CartButton";
import { HeaderNav } from "./HeaderNav";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  categories: Category[];
  storeName: string;
  hasDeals: boolean;
  // From Store settings, for "only 3 left" in search results
  lowStockThreshold: number;
};

// The storefront header, frosted over the page as it scrolls. Large screens: the logo, the shop pill in
// the middle, then search (the ⌘K palette), light and dark, the account and the bag. Phones: the menu
// (which holds the account and the theme switch), the logo in the middle, search and the bag.
export function SiteHeader({ categories, storeName, hasDeals, lowStockThreshold }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
      <div className="container relative grid h-15 grid-cols-[1fr_auto_1fr] items-center gap-3 lg:h-19">
        <div className="flex items-center justify-self-start">
          {/* The parts that read the address (to come back after signing in, to mark the current list) */}
          <Suspense>
            <MobileNav categories={categories} storeName={storeName} hasDeals={hasDeals} />
          </Suspense>
          <Link href="/" className="rounded-lg max-lg:hidden">
            <Logo name={storeName} />
            <span className="sr-only">, home</span>
          </Link>
        </div>

        <div className="justify-self-center">
          <Link href="/" className="rounded-lg lg:hidden">
            <Logo name={storeName} compact />
            <span className="sr-only">, home</span>
          </Link>
          <Suspense>
            <div className="max-lg:hidden">
              <HeaderNav categories={categories} hasDeals={hasDeals} />
            </div>
          </Suspense>
        </div>

        <div className="flex items-center gap-1 justify-self-end lg:gap-2">
          <Suspense>
            <SearchPalette categories={categories} lowStockThreshold={lowStockThreshold} />
          </Suspense>
          <ThemeToggle className="size-10 justify-center rounded-full border text-ink-2 hover:bg-foreground/5 hover:text-foreground max-lg:hidden" />
          <Suspense>
            <div className="max-lg:hidden">
              <AccountMenu />
            </div>
          </Suspense>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
