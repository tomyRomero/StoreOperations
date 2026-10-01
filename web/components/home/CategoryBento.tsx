import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Category, Product, StoreSettings } from "@/lib/api/types";
import { formatMoney, percentOff } from "@/lib/money";
import { cn } from "@/lib/utils";
import { ShippingTile } from "./ShippingTile";

export type CategoryTile = { category: Category; count: number; fromCents: number | null };

type Props = {
  // The store's first three categories, with how many products each has and its lowest price
  tiles: CategoryTile[];
  settings: StoreSettings | null;
  deals: Product[];
};

// The three category tiles: large, tall and small, each with its own glow and the picture tilted
const looks = [
  {
    tile: "col-span-2 h-[230px] md:h-[320px] lg:row-span-2 lg:h-auto",
    name: "text-[28px] lg:text-[44px]",
    glow: "bg-glow-pink left-[40%] top-[30%] w-[64%]",
    picture: "left-[42%] right-[6%] top-[14%] bottom-[8%] -rotate-12 md:left-[12%] md:right-[9%] md:top-[23%]",
  },
  {
    tile: "h-[200px] md:h-[320px] lg:row-span-2 lg:h-auto",
    name: "text-xl lg:text-[36px]",
    glow: "bg-glow-violet left-[10%] top-[35%] w-[90%]",
    picture: "left-[14%] right-[14%] top-[26%] bottom-[8%] rotate-8 lg:top-[23%]",
  },
  {
    tile: "h-[200px] md:h-[320px] lg:h-auto",
    name: "text-xl lg:text-[30px]",
    glow: "bg-glow-blue -right-10 -bottom-10 w-[80%]",
    picture: "right-[6%] bottom-[7%] h-[52%] w-[62%]",
  },
];

const label = "font-mono text-[13px] font-medium uppercase tracking-[0.06em]";

// Shop by category, as a bento: the three categories, the shipping promise with the bag's progress
// toward free shipping, how tracking works, and what's on sale. Phones keep the categories and shipping.
export function CategoryBento({ tiles, settings, deals }: Props) {
  const best = deals.reduce((most, deal) => Math.max(most, deal.compareAtPriceCents ? percentOff(deal.priceCents, deal.compareAtPriceCents) : 0), 0);
  const dealNames = deals.length > 2 ? `${deals[0].name}, ${deals[1].name} and more` : deals.map((deal) => deal.name).join(" and ");

  return (
    <section aria-labelledby="categories-heading" className="container pt-18 lg:pt-40">
      <div className="mb-5 grid gap-4 lg:mb-14 lg:justify-items-center lg:text-center">
        <p className={cn(label, "text-accent max-lg:hidden")}>Shop by category</p>
        <h2 id="categories-heading" className="text-[32px] font-semibold leading-none tracking-[-0.045em] lg:text-[64px]">
          <span className="lg:hidden">Shop by category</span>
          <span className="max-lg:hidden">Everything for the next piece.</span>
        </h2>
      </div>

      <div className="grid grid-flow-dense grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-4 lg:grid-rows-[repeat(3,320px)]">
        {tiles.map(({ category, count, fromCents }, i) => {
          const look = looks[i];
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className={cn(
                "group relative isolate overflow-hidden rounded-[24px] border bg-card transition-[border-color,translate] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:border-foreground/22 lg:rounded-[28px]",
                look.tile,
              )}
            >
              <span aria-hidden className={cn("absolute -z-10 aspect-square rounded-full opacity-[calc(0.3*var(--glow-strength))] blur-[70px]", look.glow)} />
              <span className="absolute left-5 top-4 grid gap-1 lg:left-8 lg:top-8 lg:gap-2">
                <span className={cn("font-semibold tracking-[-0.04em]", look.name)}>{category.name}</span>
                <span className={cn("text-sm text-muted-foreground lg:text-[15px]", i > 0 && "max-md:hidden")}>
                  {count === 1 ? "1 supply" : `${count} supplies`}
                  {fromCents !== null && ` · from ${formatMoney(fromCents)}`}
                </span>
              </span>
              <span className={cn("absolute transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.06]", look.picture)}>
                <Image src={category.imageUrl} alt="" fill sizes="(min-width: 1024px) 560px, 50vw" className="object-contain [filter:drop-shadow(0_34px_40px_var(--shadow))]" />
              </span>
              {i === 0 && (
                <span aria-hidden className="absolute bottom-7 right-7 grid size-12 place-items-center rounded-full border border-foreground/14 bg-foreground/8 max-lg:hidden">
                  <ArrowUpRight className="size-5" />
                </span>
              )}
            </Link>
          );
        })}

        {settings && <ShippingTile flatCents={settings.shippingFlatRateCents} freeOverCents={settings.freeShippingThresholdCents} />}

        <div className={cn("flex flex-col justify-between gap-8 rounded-[28px] border bg-card px-9 py-8 max-md:hidden md:col-span-2", deals.length === 0 && "lg:col-span-4")}>
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <p className={cn(label, "text-info")}>Tracking</p>
              <h3 className="font-sans text-[32px] font-semibold tracking-[-0.04em]">Know where it is. Always.</h3>
            </div>
            <Link href="/account/orders" className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[13px] font-medium text-muted-foreground hover:text-foreground">
              Your orders
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <ol className="grid grid-cols-3 gap-2">
            {[
              ["Placed", "A receipt by email", "bg-linear-to-r from-glow-green to-glow-blue"],
              ["Shipped", "With its tracking number", "bg-linear-to-r from-glow-blue to-glow-violet"],
              ["Delivered", "At your door", "bg-foreground/10"],
            ].map(([step, note, bar]) => (
              <li key={step} className="grid gap-3">
                <span aria-hidden className={cn("h-1.5 rounded-full", bar)} />
                <span className="grid gap-0.5">
                  <span className="text-[15px] font-semibold">{step}</span>
                  <span className="font-mono text-xs text-faint">{note}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {deals.length > 0 && (
          <Link
            href="/products?sale=1"
            className="group flex justify-between gap-6 overflow-hidden rounded-[28px] border bg-[linear-gradient(135deg,rgb(255_79_163/0.16),rgb(139_108_255/0.1)_60%,var(--card))] px-9 py-8 transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-foreground/22 max-md:hidden md:col-span-2"
          >
            <span className="flex flex-col justify-between">
              <span className={cn(label, "text-sale")}>On sale now</span>
              <span className="text-[44px] font-semibold leading-none tracking-[-0.045em]">
                Up to
                <br />
                {best}% off.
              </span>
              <span className="text-[15px] text-ink-2">
                {dealNames}
                <span aria-hidden>{"\u00a0"}→</span>
              </span>
            </span>
            <span aria-hidden className="flex items-end gap-3 max-xl:hidden">
              {deals.slice(0, 2).map((deal, i) => (
                <span key={deal.id} className={cn("relative w-[150px] rounded-[20px] border border-foreground/10 bg-foreground/5", i === 0 ? "h-[230px]" : "h-[256px]")}>
                  <Image src={deal.imageUrl} alt="" fill sizes="150px" className={cn("object-contain p-5", i === 0 && "-rotate-14")} />
                </span>
              ))}
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
