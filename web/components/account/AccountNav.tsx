"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, LayoutGrid, MapPin, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Overview", href: "/account", icon: LayoutGrid },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/myaddresses", icon: MapPin },
  { label: "Security", href: "/account/password", icon: KeyRound },
];

// A side menu on large screens, a row of tabs that scrolls sideways on phones
export function AccountNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/account" ? pathname === href : pathname.startsWith(href) || (href === "/account/myaddresses" && pathname === "/account/addaddress"));

  return (
    <nav aria-label="Your account">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:px-0">
        {items.map(({ label, href, icon: Icon }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-2.5 rounded-md px-3 text-sm font-semibold transition-colors",
                isActive(href) ? "bg-accent-subtle text-accent-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
