import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// A mistyped or old link: offer a search and the ways back into the shop
export default function NotFound() {
  return (
    <div className="container grid justify-items-center gap-6 py-20 text-center lg:py-28">
      <p className="font-display text-display text-accent" aria-hidden>
        404
      </p>
      <div className="grid gap-3">
        <h1 className="text-h1">We couldn&apos;t find that page</h1>
        <p className="mx-auto max-w-md text-muted-foreground">The link may be old or mistyped. Search for what you were after, or head into the shop.</p>
      </div>
      <form action="/products" role="search" className="flex w-full max-w-md gap-2">
        <label htmlFor="not-found-search" className="sr-only">
          Search supplies
        </label>
        <Input id="not-found-search" type="search" name="q" placeholder="Search supplies" />
        <Button type="submit" variant="outline">
          <Search aria-hidden />
          Search
        </Button>
      </form>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/products">Shop all supplies</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
