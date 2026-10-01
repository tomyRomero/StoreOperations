"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import type { Category } from "@/lib/api/types";
import { currentPath, signInPath } from "@/lib/sign-in-path";
import { useSignOut } from "@/lib/use-sign-out";
import { HeaderSearch } from "./HeaderSearch";
import { ThemeToggle } from "./ThemeToggle";

const linkClasses = "flex min-h-11 items-center rounded-xl px-3 font-medium transition-colors hover:bg-foreground/5";
const groupLabel = "px-3 pb-1 font-mono text-xs uppercase tracking-[0.08em] text-faint";

// The phone menu: search, the categories, the account pages and the light and dark switch, in a drawer
// from the left. Following a link closes it.
export function MobileNav({ categories, storeName, hasDeals }: { categories: Category[]; storeName: string; hasDeals: boolean }) {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();
  const here = currentPath(usePathname(), useSearchParams());
  const signOut = useSignOut();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" aria-label="Menu" className="-ml-2 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 lg:hidden">
          {/* Two strokes, the lower one shorter */}
          <svg aria-hidden viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 8h16M4 16h10" />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle asChild>
            <div>
              <Logo name={storeName} compact />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Search, shop by category and your account</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 px-3 py-5">
          <HeaderSearch className="px-2" onSearch={close} />

          <nav aria-label="Shop">
            <p className={groupLabel}>Shop</p>
            <ul>
              <li>
                <Link href="/products" onClick={close} className={linkClasses}>
                  All supplies
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/products?category=${category.id}`} onClick={close} className={linkClasses}>
                    {category.name}
                  </Link>
                </li>
              ))}
              {hasDeals && (
                <li>
                  <Link href="/products?sale=1" onClick={close} className={`${linkClasses} text-sale`}>
                    Sale
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <nav aria-label="Your account">
            <p className={groupLabel}>Account</p>
            <ul>
              {user ? (
                <>
                  {user.isAdmin && (
                    <li>
                      <Link href="/admin" onClick={close} className={linkClasses}>
                        Admin dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/account" onClick={close} className={linkClasses}>
                      Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/orders" onClick={close} className={linkClasses}>
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/myaddresses" onClick={close} className={linkClasses}>
                      Addresses
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={`${linkClasses} w-full`}
                      onClick={() => {
                        close();
                        void signOut(here);
                      }}
                    >
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link href={signInPath(here)} onClick={close} className={linkClasses}>
                    Sign in
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <nav aria-label="Help">
            <ul className="border-t pt-4">
              <li>
                <Link href="/about" onClick={close} className={linkClasses}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={close} className={linkClasses}>
                  Contact us
                </Link>
              </li>
            </ul>
          </nav>

          <ThemeToggle withLabel className={`${linkClasses} -mt-4 w-full`} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
