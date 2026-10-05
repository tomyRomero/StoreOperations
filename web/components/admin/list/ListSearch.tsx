"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Searches 0.3s after typing stops. It starts from the search in the address, so a shared or reloaded
// link keeps its results, and a new search keeps the list's other filters but goes back to page 1.
export function ListSearch({ label, className }: { label: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(current);

  useEffect(() => {
    if (search.trim() === current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) params.set("q", search.trim());
      else params.delete("q");
      params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, current, pathname, router, searchParams]);

  return (
    <div role="search" className={cn("relative w-full sm:max-w-sm", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input type="search" aria-label={label} placeholder={label} value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
    </div>
  );
}
