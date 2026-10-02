"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, LayoutGrid, LogOut, MapPin, Package } from "lucide-react";
import { useSignOut } from "@/lib/use-sign-out";
import { cn } from "@/lib/utils";

type Props = {
  username: string;
  email: string;
  // How many orders and saved addresses, or null when the API couldn't say
  orderCount: number | null;
  addressCount: number | null;
};

export function AccountNav({ username, email, orderCount, addressCount }: Props) {
  const pathname = usePathname();
  const signOut = useSignOut();

  const items = [
    { label: "Overview", href: "/account", icon: LayoutGrid, count: null },
    { label: "Orders", href: "/account/orders", icon: Package, count: orderCount },
    { label: "Addresses", href: "/account/addresses", icon: MapPin, count: addressCount },
    { label: "Password", href: "/account/password", icon: KeyRound, count: null },
  ];
  const isActive = (href: string) => (href === "/account" ? pathname === href : pathname.startsWith(href));

  return (
    <nav aria-label="Your account" className="lg:grid lg:gap-3.5 lg:rounded-[24px] lg:border lg:bg-card lg:p-4">
      <div className="flex items-center gap-3 border-b border-foreground/8 px-1 pb-3.5 pt-1 max-lg:hidden">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-135 from-glow-pink to-glow-violet text-[15px] font-bold uppercase text-white">
          {username.slice(0, 1)}
        </span>
        <span className="grid min-w-0 gap-0.5">
          <span className="truncate text-[15px] font-semibold">{username}</span>
          <span className="truncate text-[13px] text-faint">{email}</span>
        </span>
      </div>

      <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:gap-0.5 lg:overflow-visible lg:p-0">
        {items.map(({ label, href, icon: Icon, count }) => {
          const active = isActive(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10.5 items-center gap-3 rounded-full px-4 text-[15px] transition-colors lg:rounded-xl lg:px-3",
                  active ? "bg-foreground/8 font-semibold text-foreground" : "font-medium text-ink-2 hover:bg-foreground/5 hover:text-foreground max-lg:border"
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
                <span className="lg:flex-1">{label}</span>
                {count !== null && count > 0 && (
                  <span className="font-mono text-xs font-normal text-faint max-lg:hidden">
                    <span className="sr-only">, </span>
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => void signOut()}
        className="flex h-10.5 items-center gap-3 border-t border-foreground/8 px-3 pt-1 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground max-lg:hidden"
      >
        <LogOut className="size-[18px]" strokeWidth={1.8} aria-hidden />
        Sign out
      </button>
    </nav>
  );
}
