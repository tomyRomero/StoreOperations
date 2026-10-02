import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories, getCategorySummary, getStoreSettings } from "@/lib/data/catalog";
import { returnsSummary, shippingSummary } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { countOf, nounsOf, paragraphs, splitLastWords, storeNameOf } from "@/lib/storefront";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return { title: "About us", description: settings?.storefront.description ?? undefined };
}

const glows = ["bg-glow-pink", "bg-glow-violet", "bg-glow-blue", "bg-glow-green"];
const numbers = ["text-sale", "text-accent", "text-info", "text-success"];

// The store, its story, its categories and how ordering works. The headline is the store's tagline, the lead
// its description and the story its About text, all from Theme and brand; the rest comes from the live
// catalog and Store settings.
export default async function AboutPage() {
  const [categories, settings] = await Promise.all([getCategories(), getStoreSettings()]);
  const summaries = await Promise.all(categories.map((category) => getCategorySummary(category.id)));
  const storeName = storeNameOf(settings);
  const { one, many } = nounsOf(settings);
  const total = summaries.reduce((sum, summary) => sum + summary.count, 0);
  const [headline, highlight] = splitLastWords(settings?.storefront.tagline ?? `Welcome to ${storeName}.`);
  const story = paragraphs(settings?.storefront.aboutText);

  const steps = [
    { title: `Pick your ${many}`, text: "Browse by category or search. Every product says how many are left." },
    { title: "Pay securely", text: "Checkout runs on Stripe, so your card details never reach our servers." },
    {
      title: "We ship it",
      text: settings ? `${shippingSummary(settings)}, anywhere in the United States. ${returnsSummary(settings)}.` : "Anywhere in the United States, with tracking.",
    },
    { title: "Follow it home", text: "Every order can be tracked from placed to delivered in your account." },
  ];

  return (
    <div className="relative isolate overflow-x-clip">
      <div aria-hidden className="absolute -top-40 left-1/2 -z-10 h-[640px] w-[1200px] max-w-full -translate-x-1/2 bg-[radial-gradient(40%_50%_at_25%_35%,color-mix(in_oklab,var(--glow-pink)_20%,transparent),transparent_70%),radial-gradient(40%_50%_at_75%_25%,color-mix(in_oklab,var(--glow-blue)_20%,transparent),transparent_70%)] opacity-(--glow-strength)" />
      <div aria-hidden className="bg-studio-grid absolute inset-x-0 -top-20 -z-10 h-[640px]" />

      <section aria-labelledby="about-heading" className="container grid justify-items-center gap-6 pt-16 text-center lg:pt-28">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-accent">About {storeName}</p>
        <h1 id="about-heading" className="max-w-4xl text-[clamp(2.75rem,8vw,6rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
          {headline}
          <span className="text-brand-gradient">{highlight}</span>
        </h1>
        {settings?.storefront.description && (
          <p className="max-w-xl text-lg leading-normal text-muted-foreground sm:text-xl">{settings.storefront.description}</p>
        )}
      </section>

      {story.length > 0 && (
        <section aria-labelledby="story-heading" className="container grid gap-6 pt-24 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:pt-36">
          <h2 id="story-heading" className="text-[40px] font-semibold leading-none tracking-[-0.05em] lg:text-[56px]">
            Our story
          </h2>
          <div className="grid max-w-2xl gap-5 text-lg leading-relaxed text-ink-2">
            {story.map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section aria-labelledby="stock-heading" className="container pt-24 lg:pt-36">
          <div className="mb-8 grid items-end gap-4 lg:mb-10 lg:grid-cols-2">
            <h2 id="stock-heading" className="text-[40px] font-semibold leading-none tracking-[-0.05em] lg:text-[56px]">
              What we stock
            </h2>
            <p className="max-w-[440px] text-[17px] leading-relaxed text-muted-foreground lg:justify-self-end">
              A focused range in {categories.length === 1 ? "one category" : `${categories.length} categories`}: {countOf(total, settings)}, each
              one picked for how it handles.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => {
              const { count, fromCents } = summaries[i];
              return (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.id}`}
                    className="group relative isolate block h-[300px] overflow-hidden rounded-[28px] border bg-[radial-gradient(70%_80%_at_50%_100%,var(--stage-violet),var(--stage-end)_70%)] transition-colors hover:border-foreground/22 lg:h-[360px]"
                  >
                    <span aria-hidden className={`absolute bottom-[-10%] left-1/2 -z-10 aspect-square w-[70%] -translate-x-1/2 rounded-full opacity-[calc(0.3*var(--glow-strength))] blur-[70px] ${glows[i % glows.length]}`} />
                    <span className="absolute left-7 top-6.5 grid gap-1.5">
                      <span className="text-[32px] font-semibold tracking-[-0.04em]">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {countOf(count, settings)}
                        {fromCents !== null && ` · from ${formatMoney(fromCents)}`}
                      </span>
                    </span>
                    <span className="absolute inset-x-[14%] bottom-[6%] top-[34%] transition-transform duration-500 group-hover:-translate-y-1.5 motion-reduce:group-hover:translate-y-0">
                      <Image src={category.imageUrl} alt="" fill sizes="(min-width: 1024px) 380px, 50vw" className="object-contain [filter:drop-shadow(0_30px_34px_var(--shadow))]" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="how-heading" className="container pt-24 lg:pt-36">
        <h2 id="how-heading" className="mb-8 text-[40px] font-semibold leading-none tracking-[-0.05em] lg:mb-10 lg:text-[56px]">
          How ordering works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="grid content-start gap-3 rounded-[24px] border bg-card p-6">
              <span aria-hidden className={`font-mono text-sm font-medium ${numbers[i]}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xl font-semibold tracking-[-0.02em]">{step.title}</span>
              <span className="text-[15px] leading-relaxed text-muted-foreground">{step.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="talk-heading" className="container pt-24 lg:pt-36">
        <div className="relative isolate flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[32px] border bg-card p-8 sm:p-12">
          <span aria-hidden className="absolute -right-20 -top-24 -z-10 h-[340px] w-[520px] bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--glow-violet)_24%,transparent),transparent_70%)] opacity-(--glow-strength)" />
          <div className="grid gap-3">
            <h2 id="talk-heading" className="text-[32px] font-semibold leading-none tracking-[-0.045em] sm:text-[44px]">
              Not sure what you need?
            </h2>
            <p className="text-[17px] text-muted-foreground">Ask about a {one} or an order. A real person reads every message.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-14 items-center gap-2.5 rounded-button bg-primary px-7 text-base font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary/85"
          >
            Send us a message
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
