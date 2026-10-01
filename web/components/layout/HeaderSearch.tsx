"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Searches the product list (/products?q=). A plain GET form, so it works before JavaScript loads.
// On the product list it starts with the words being searched for.
export function HeaderSearch({ className, autoFocus, onSearch }: { className?: string; autoFocus?: boolean; onSearch?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = pathname === "/products" ? (searchParams.get("q") ?? "") : "";

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    onSearch?.();
  };

  return (
    <form role="search" action="/products" method="get" onSubmit={submit} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        // Starts again from the address after each navigation
        key={current}
        type="search"
        name="q"
        defaultValue={current}
        autoFocus={autoFocus}
        aria-label="Search supplies"
        placeholder="Search supplies…"
        maxLength={100}
        className="h-10 w-full rounded-full border border-input bg-foreground/4 pl-10 pr-4 text-base placeholder:text-muted-foreground md:text-sm"
      />
    </form>
  );
}
