"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, LogOut, MapPin, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Signed out: a way in that comes back to this page. Signed in: the account pages and a way out.
export function AccountMenu() {
  const user = useCurrentUser();
  const here = currentPath(usePathname(), useSearchParams());
  const signOut = useSignOut();

  if (!user) {
    return (
      <Button asChild variant="ghost" className="px-2 sm:px-3">
        <Link href={signInPath(here)}>
          <User aria-hidden />
          <span className="max-sm:sr-only">Sign in</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2 sm:px-3">
          <User aria-hidden />
          <span className="max-sm:sr-only">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">Signed in as {user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/adminactivity">
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
