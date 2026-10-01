"use client";

import Link from "next/link";
import { LogOut, Store } from "lucide-react";
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
import { useSignOut } from "@/lib/use-sign-out";

// Who is signed in, the way back to the store, and the way out
export function AdminUserMenu() {
  const user = useCurrentUser();
  const signOut = useSignOut();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground uppercase">
            {user.username.slice(0, 1)}
          </span>
          <span className="max-w-32 truncate max-sm:sr-only">{user.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="grid font-normal">
          <span className="truncate font-semibold">{user.username}</span>
          <span className="truncate text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <Store aria-hidden />
            View the store
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut("/")}>
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
