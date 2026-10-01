"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// The header holds this many categories; the rest are a click away in Shop
const shownCategories = 4;

type Props = {
  categories: Category[];
  // Offered only while something is on a deal
  hasDeals: boolean;
};

// Shop, the store's first categories and Sale, as one pill. The link for the list being looked at is
// marked current, whatever its search, price or sort.
export function HeaderNav({ categories, hasDeals }: Props) {
  const onList = usePathname() === "/products";
  const searchParams = useSearchParams();
  const chosen = onList ? searchParams.getAll("category") : [];
  const sale = onList && searchParams.get("sale") === "1";

  const links = [
    { href: "/products", label: "Shop", current: onList && chosen.length === 0 && !sale },
    ...categories.slice(0, shownCategories).map((category) => ({
      href: `/products?category=${category.id}`,
      label: category.name,
      current: !sale && chosen.length === 1 && chosen[0] === String(category.id),
    })),
    ...(hasDeals ? [{ href: "/products?sale=1", label: "Sale", current: sale && chosen.length === 0, sale: true }] : []),
  ];

  return (
    <nav aria-label="Main">
      <ul className="flex items-center gap-1 rounded-full border bg-foreground/4 p-1 text-sm font-medium">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              className={cn(
                "block rounded-full px-4 py-2 transition-colors duration-[120ms] hover:text-foreground",
                link.current ? "bg-foreground/10 text-foreground" : "sale" in link ? "text-sale" : "text-ink-3",
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
