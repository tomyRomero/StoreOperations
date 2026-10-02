import { permanentRedirect } from "next/navigation";
import { firstValue, type SearchParams } from "@/lib/paging";

// Search lives in the product list, which also filters and sorts. This keeps /search?q= links working.
export default async function SearchPage(props: { searchParams: Promise<SearchParams> }) {
  const text = firstValue((await props.searchParams).q)?.trim();
  permanentRedirect(text ? `/products?q=${encodeURIComponent(text)}` : "/products");
}
