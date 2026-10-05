import type { Product } from "@/lib/api/types";
import { percentOff } from "@/lib/money";

// The biggest saving first
export function bySaving(a: Product, b: Product) {
  const saving = (p: Product) => (p.compareAtPriceCents ? percentOff(p.priceCents, p.compareAtPriceCents) : 0);
  return saving(b) - saving(a);
}

// The products that stand on a stage (the home page's hero, the art beside sign-in): the deals with the
// biggest savings first, then the newest, each once, three at most
export function stageProducts(deals: Product[], newest: Product[]): Product[] {
  return [...[...deals].sort(bySaving), ...newest].filter((product, i, all) => all.findIndex((p) => p.id === product.id) === i).slice(0, 3);
}
