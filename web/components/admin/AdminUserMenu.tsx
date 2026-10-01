"use client";

import Link from "next/link";
import { Ellipsis, LogOut, Store } from "lucide-react";
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

// Who is signed in, at the foot of the sidebar, with the way back to the store and the way out
export function AdminUserMenu() {
  const user = useCurrentUser();
  const signOut = useSignOut();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-foreground/5">
        <span aria-hidden className="grid size-[30px] shrink-0 place-items-center rounded-full bg-linear-135 from-glow-amber to-glow-orange text-xs font-bold uppercase text-white">
          {user.username.slice(0, 1)}
        </span>
        <span className="grid min-w-0 flex-1">
          <span className="truncate text-[13px] font-semibold">{user.username}</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </span>
        <Ellipsis className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">, account menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60">
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
