"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/browser";
import type { Product } from "@/lib/api/types";

// Products that would take the bag past free shipping on their own: in stock, priced at or above what's
// missing, cheapest first, and not already in the bag. Empty when there's nothing missing.
export function useShippingNudges(missingCents: number | null, inBag: number[], count: number): Product[] {
  const [found, setFound] = useState<Product[]>([]);

  useEffect(() => {
    if (!missingCents) return;
    let stale = false;
    void api
      .GET("/api/products", { params: { query: { minPriceCents: missingCents, inStock: true, sort: "cheapest", pageSize: count + 6 } } })
      .then(({ data }) => {
        if (!stale) setFound(data?.items ?? []);
      });
    return () => {
      stale = true;
    };
  }, [missingCents, count]);

  // Until a new answer arrives, the last one still holds whatever is priced high enough
  if (!missingCents) return [];
  return found.filter((product) => product.priceCents >= missingCents && !inBag.includes(product.id)).slice(0, count);
}
