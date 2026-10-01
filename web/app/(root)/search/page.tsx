import { permanentRedirect } from "next/navigation";
import type { SearchParams } from "@/lib/paging";

// Search moved into the product list, which also filters and sorts the results. Old links still work.
export default async function SearchPage(props: { searchParams: Promise<SearchParams> }) {
  const q = (await props.searchParams).q;
  const text = (Array.isArray(q) ? q[0] : q)?.trim();
  permanentRedirect(text ? `/products?q=${encodeURIComponent(text)}` : "/products");
}
