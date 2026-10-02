import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { QuickAddButton } from "@/components/products/QuickAddButton";
import type { Product } from "@/lib/api/types";
import { formatMoney, percentOff } from "@/lib/money";
import type { HeroCopy } from "@/lib/storefront";
import { cn } from "@/lib/utils";

type Props = {
  // Up to three, shown standing on the stage: left, middle (the largest, drifting) and right
  products: Product[];
  // The biggest saving right now, announced above the headline and on a card on the stage
  topDeal: Product | null;
  inStockCount: number | null;
  // From Store settings, so the promise matches checkout
  shippingLine: string | null;
  // The store's headline, line under it and button, from Theme and brand
  copy: HeroCopy;
  // What the store calls what it sells, for "38 supplies in stock"
  many: string;
};

const places = [
  "left-[4%] bottom-[16%] h-[42%] w-[28%] -rotate-16 sm:left-[11%] sm:h-[50%] sm:w-[24%]",
  "inset-x-0 bottom-[8%] mx-auto h-[74%] w-[38%] animate-float sm:h-[80%] sm:w-[28%]",
  "right-[4%] bottom-[14%] h-[48%] w-[28%] rotate-14 sm:right-[12%] sm:h-[60%] sm:w-[24%]",
];

// The opening: a sale announcement, the headline, the shipping promise and the way in, then the store's
// products standing in the light on a wide stage
export function Hero({ products, topDeal, inStockCount, shippingLine, copy, many }: Props) {
  const saving = topDeal?.compareAtPriceCents ? percentOff(topDeal.priceCents, topDeal.compareAtPriceCents) : 0;
  // The middle spot is the largest, so the first product stands there
  const staged = products.length === 3 ? [products[1], products[0], products[2]] : products;

  return (
    <section aria-labelledby="hero-heading" className="relative px-4 pt-12 text-center sm:px-6 lg:px-10 lg:pt-28">
      <div aria-hidden className="absolute inset-x-0 -top-19 -z-10 h-[900px] bg-[radial-gradient(40%_50%_at_22%_10%,color-mix(in_oklab,var(--glow-pink)_28%,transparent),transparent_70%),radial-gradient(40%_50%_at_78%_6%,color-mix(in_oklab,var(--glow-blue)_26%,transparent),transparent_70%),radial-gradient(30%_40%_at_50%_30%,color-mix(in_oklab,var(--glow-violet)_20%,transparent),transparent_70%)] opacity-(--glow-strength)" />
      <div aria-hidden className="bg-studio-grid absolute inset-x-0 -top-19 -z-10 h-[900px]" />

      {topDeal && saving > 0 && (
        <Link
          href={`/products/${topDeal.id}`}
          className="inline-flex h-9 items-center gap-2.5 rounded-full border border-foreground/12 bg-foreground/5 py-0 pl-1.5 pr-3.5 text-sm text-ink-2 transition-colors hover:border-foreground/25 hover:text-foreground"
        >
          <span className="inline-flex h-[26px] items-center rounded-full bg-linear-to-r from-[#d4247a] to-[#6d4df2] px-2.5 text-xs font-semibold text-white">Sale</span>
          {topDeal.name} is {saving}% off
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}

      <h1 id="hero-heading" className="mx-auto mt-7 text-[clamp(3.25rem,9vw,7.25rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
        {copy.headline}
        {copy.highlight && (
          <>
            <br />
            <span className="text-brand-gradient">{copy.highlight}</span>
          </>
        )}
      </h1>
      {(copy.text || shippingLine) && (
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:mt-7 sm:text-xl sm:leading-normal">
          {[copy.text, shippingLine].filter(Boolean).join(" ")}
        </p>
      )}

      <div className="mt-9 flex flex-wrap justify-center gap-3 lg:mt-10">
        <Link
          href="/products"
          className="inline-flex h-14 items-center gap-2.5 rounded-button bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[0_0_0_6px_color-mix(in_oklab,var(--foreground)_6%,transparent),0_20px_50px_color-mix(in_oklab,var(--glow-violet)_35%,transparent)] transition-colors hover:bg-primary/85"
        >
          {copy.button}
          <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden />
        </Link>
        {topDeal && (
          <Link
            href="/products?sale=1"
            className="inline-flex h-14 items-center rounded-button border border-foreground/16 px-6.5 text-base font-medium transition-colors hover:bg-foreground/5"
          >
            See the sale
          </Link>
        )}
      </div>

      {staged.length > 0 && (
        <div className="relative mx-auto mt-14 h-[360px] w-full max-w-7xl overflow-hidden rounded-[28px] border bg-[radial-gradient(70%_90%_at_50%_105%,var(--stage-violet),var(--stage-end)_70%)] sm:h-[480px] lg:mt-18 lg:h-[600px] lg:rounded-[36px]">
          <div aria-hidden className="opacity-(--glow-strength)">
            <span className="absolute left-[14%] top-[34%] aspect-square w-[24%] rounded-full bg-glow-pink opacity-32 blur-[80px]" />
            <span className="absolute left-[40%] top-[18%] aspect-square w-[28%] rounded-full bg-glow-violet opacity-34 blur-[90px]" />
            <span className="absolute right-[12%] top-[34%] aspect-square w-[24%] rounded-full bg-glow-blue opacity-32 blur-[80px]" />
          </div>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[20%] border-t border-foreground/6 bg-linear-to-b from-transparent to-foreground/3" />

          {staged.map((product, i) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              aria-label={product.name}
              className={cn("absolute block rounded-2xl", places[products.length === 3 ? i : i + 1])}
            >
              <Image
                src={product.imageUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 360px, 38vw"
                className={cn("object-contain", i === 1 ? "[filter:drop-shadow(0_40px_50px_var(--shadow-strong))]" : "[filter:drop-shadow(0_30px_40px_var(--shadow))]")}
              />
            </Link>
          ))}

          {topDeal && saving > 0 && (
            <div className="absolute left-10 top-10 flex items-center gap-3.5 rounded-[18px] border border-foreground/12 bg-foreground/6 py-2.5 pl-4 pr-2.5 text-left backdrop-blur-lg max-md:hidden">
              <div className="grid gap-0.5">
                <Link href={`/products/${topDeal.id}`} className="text-sm font-semibold hover:underline">
                  {topDeal.name}
                </Link>
                <p className="text-[13px] tabular-nums text-muted-foreground">
                  <span className="sr-only">Was {formatMoney(topDeal.compareAtPriceCents ?? 0)}, now </span>
                  {formatMoney(topDeal.priceCents)} <s aria-hidden>{formatMoney(topDeal.compareAtPriceCents ?? 0)}</s>
                </p>
              </div>
              <QuickAddButton productId={topDeal.id} name={topDeal.name} className="h-8 w-auto rounded-[10px] px-3 text-[13px] font-semibold">
                Add
              </QuickAddButton>
            </div>
          )}

          {inStockCount !== null && inStockCount > 0 && (
            <p className="absolute left-3.5 top-3.5 inline-flex h-[30px] items-center gap-2.5 rounded-full border border-foreground/12 bg-foreground/6 px-3 font-mono text-xs font-medium text-ink-2 backdrop-blur-lg sm:h-9 sm:px-3.5 sm:text-[13px] md:left-auto md:right-10 md:top-10">
              <span aria-hidden className="size-2 rounded-full bg-glow-green animate-ring" />
              {inStockCount} <span className="max-sm:hidden">{many} </span>in stock
            </p>
          )}
        </div>
      )}
    </section>
  );
}
