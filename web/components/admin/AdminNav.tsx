"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Folder, House, Mail, Package, Palette, Settings, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon };

// The console's sections, in groups as the StoreOps design draws them
const groups: { label: string | null; items: Item[] }[] = [
  {
    label: null,
    items: [
      { href: "/admin", label: "Home", icon: House },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Folder },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  { label: "Marketing", items: [{ href: "/admin/newsletter", label: "Newsletter", icon: Mail }] },
  {
    label: "Store",
    items: [
      { href: "/admin/storefront", label: "Theme and brand", icon: Palette },
      { href: "/admin/activity", label: "Activity", icon: Activity },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Home is current only on /admin itself; every other section also covers its sub-pages
function isCurrent(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

// The name of the section a console page belongs to, for the top bar
export function sectionLabel(pathname: string): string {
  return groups.flatMap((group) => group.items).find((item) => isCurrent(pathname, item.href))?.label ?? "Console";
}

type Props = {
  // Paid orders not shipped yet, shown beside Orders
  toShip: number;
  // The phone menu closes when a link is followed
  onNavigate?: () => void;
};

export function AdminNav({ toShip, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Console" className="grid gap-4">
      {groups.map((group) => (
        <div key={group.label ?? "main"} className="grid gap-1.5">
          {group.label && (
            <p id={`console-${group.label.toLowerCase()}`} className="px-2.5 text-xs font-medium text-faint">
              {group.label}
            </p>
          )}
          <ul className="grid gap-px" aria-labelledby={group.label ? `console-${group.label.toLowerCase()}` : undefined}>
            {group.items.map(({ href, label, icon: Icon }) => {
              const current = isCurrent(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "group flex h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                      current
                        ? "bg-card font-semibold text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(16_16_20/0.05)]"
                        : "font-medium text-ink-2 hover:bg-foreground/5 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-[17px] shrink-0", current ? "text-accent" : "text-faint group-hover:text-ink-2")} strokeWidth={1.8} aria-hidden />
                    {label}
                    {href === "/admin/orders" && toShip > 0 && (
                      <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-md bg-accent-subtle px-1.5 font-mono text-[11px] font-semibold text-accent-ink tabular-nums">
                        {toShip}
                        <span className="sr-only"> to ship</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
