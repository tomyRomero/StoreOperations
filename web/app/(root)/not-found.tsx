import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ProductRow } from "@/components/home/ProductRow";
import { getProducts, getStoreSettings } from "@/lib/data/catalog";
import { nounsOf } from "@/lib/storefront";

export default async function NotFound() {
  const [newest, settings] = await Promise.all([getProducts({ sort: "newest", pageSize: 8 }), getStoreSettings()]);
  const products = newest?.items ?? [];
  const drifting = products[0];
  const { many } = nounsOf(settings);

  return (
    <div className="relative isolate overflow-x-clip pb-8">
      <div aria-hidden className="absolute -top-24 left-1/2 -z-10 h-[620px] w-[1100px] max-w-full -translate-x-1/2 bg-[radial-gradient(40%_50%_at_35%_40%,color-mix(in_oklab,var(--glow-pink)_20%,transparent),transparent_70%),radial-gradient(40%_50%_at_65%_35%,color-mix(in_oklab,var(--glow-blue)_22%,transparent),transparent_70%)] opacity-(--glow-strength)" />

      <section aria-labelledby="not-found-heading" className="container grid justify-items-center pt-10 text-center lg:pt-14">
        <div aria-hidden className="relative grid h-[200px] w-full place-items-center sm:h-[300px]">
          <span className="text-brand-gradient select-none text-[150px] font-semibold leading-none tracking-[-0.08em] opacity-90 sm:text-[260px]">404</span>
          {drifting && (
            <span className="absolute left-1/2 top-[42%] h-[60%] w-[32%] -translate-x-1/2 -translate-y-1/2 rotate-[32deg] animate-float sm:w-[20%]">
              <Image src={drifting.imageUrl} alt="" fill loading="eager" fetchPriority="high" sizes="(min-width: 640px) 30vw, 46vw" className="object-contain [filter:drop-shadow(0_40px_50px_var(--shadow-strong))]" />
            </span>
          )}
        </div>
        <h1 id="not-found-heading" className="mt-10 text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-[64px]">
          This page wandered off.
        </h1>
        <p className="mt-4.5 max-w-[520px] text-lg leading-normal text-muted-foreground">The link may be old or mistyped. Search for what you were after, or head into the shop.</p>

        <form action="/products" method="get" role="search" aria-label="Search the store" className="mt-8 flex w-full max-w-[520px] gap-2 rounded-full border border-input bg-card p-1.5">
          <label htmlFor="not-found-search" className="sr-only">
            Search {many}
          </label>
          <input
            id="not-found-search"
            type="search"
            name="q"
            placeholder={`Search ${many}`}
            className="h-12 min-w-0 flex-1 rounded-full bg-transparent px-4.5 text-base text-foreground placeholder:text-muted-foreground"
          />
          <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-button bg-primary px-5.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/85">
            <Search className="size-4" aria-hidden />
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px] font-medium">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-accent hover:underline">
            Shop all {many}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/" className="text-ink-2 hover:text-foreground">
            Back to home
          </Link>
        </div>
      </section>

      <div className="mt-20 lg:mt-28">
        <ProductRow id="new-in" title="New in" href="/products" products={products} lowStockThreshold={settings?.lowStockThreshold ?? 5} />
      </div>
    </div>
  );
}
