"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import type { Category } from "@/lib/api/types";
import { currentPath, signInPath } from "@/lib/sign-in-path";
import { useSignOut } from "@/lib/use-sign-out";
import { HeaderSearch } from "./HeaderSearch";

const linkClasses = "flex min-h-11 items-center rounded-md px-3 font-semibold transition-colors hover:bg-muted";

// The phone menu: search, the categories and the account pages, in a drawer from the left. Following
// a link closes it.
export function MobileNav({ categories, storeName }: { categories: Category[]; storeName: string }) {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();
  const here = currentPath(usePathname(), useSearchParams());
  const signOut = useSignOut();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
          <Menu className="size-5!" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle asChild>
            <div>
              <Logo name={storeName} />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Search, shop by category and your account</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 px-3 py-5">
          <HeaderSearch className="px-2" onSearch={close} />

          <nav aria-label="Shop">
            <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">Shop</p>
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
            </ul>
          </nav>

          <nav aria-label="Your account">
            <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">Account</p>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
