"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, LogOut, MapPin, Package, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { currentPath, signInPath } from "@/lib/sign-in-path";
import { useSignOut } from "@/lib/use-sign-out";
import { cn } from "@/lib/utils";

const circle = "inline-flex size-10 items-center justify-center rounded-full transition-colors duration-[120ms]";

export function AccountMenu() {
  const user = useCurrentUser();
  const here = currentPath(usePathname(), useSearchParams());
  const signOut = useSignOut();

  if (!user) {
    return (
      <Link href={signInPath(here)} aria-label="Sign in" className={cn(circle, "border text-ink-2 hover:bg-foreground/5 hover:text-foreground")}>
        <User className="size-[18px]" aria-hidden />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Your account"
        className={cn(circle, "bg-linear-to-br from-glow-pink/30 to-glow-violet/35 text-sm font-semibold uppercase ring-1 ring-border hover:ring-foreground/25")}
      >
        {user.username.slice(0, 1)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60 rounded-2xl p-1.5">
        <DropdownMenuLabel className="truncate">Signed in as {user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard aria-hidden />
              Admin dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User aria-hidden />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders">
            <Package aria-hidden />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/myaddresses">
            <MapPin aria-hidden />
            Addresses
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut(here)}>
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
