"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AdminMobileNav } from "./AdminMobileNav";
import { sectionLabel } from "./AdminNav";
import type { ConsoleProps } from "./ConsoleSidebar";

export function ConsoleTopbar(props: ConsoleProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <AdminMobileNav {...props} />
      <p className="text-sm font-semibold">{sectionLabel(pathname)}</p>
      <div className="ml-auto flex items-center gap-2">
        {props.payments === "test" && (
          <p className="inline-flex h-7 items-center gap-2 rounded-full border border-warning/30 bg-warning-subtle px-3 text-xs font-medium text-warning">
            <span aria-hidden className="size-1.5 rounded-full bg-warning" />
            <span className="max-sm:hidden">Stripe is in test mode</span>
            <span className="sm:hidden">Test mode</span>
          </p>
        )}
        <ThemeToggle className="size-9 justify-center rounded-lg border text-ink-2 hover:bg-foreground/5 hover:text-foreground [&_svg]:size-4" />
        <Link href="/" className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors hover:bg-foreground/5 max-sm:hidden">
          View store
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
