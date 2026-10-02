import { SubscribeForm } from "@/components/forms/SubscribeForm";

// The home page's newsletter band. The footer leaves its own form out on this page.
export function NewsletterBand({ many }: { many: string }) {
  return (
    <section aria-labelledby="newsletter-band-heading" className="container pt-18 lg:pt-40">
      <div className="rounded-[26px] bg-linear-120 from-glow-pink/70 via-glow-violet/40 to-glow-blue/70 p-px lg:rounded-[32px]">
        <div className="relative isolate grid items-center gap-4 overflow-hidden rounded-[25px] bg-surface-sunk px-5.5 py-6.5 lg:grid-cols-[1.2fr_1fr] lg:gap-12 lg:rounded-[31px] lg:p-16">
          <span aria-hidden className="absolute -right-20 -top-30 -z-10 aspect-square w-[420px] rounded-full bg-glow-violet opacity-[calc(0.22*var(--glow-strength))] blur-[90px]" />
          <div className="grid gap-3.5 lg:gap-4">
            <h2 id="newsletter-band-heading" className="text-[32px] font-semibold leading-none tracking-[-0.045em] lg:text-[56px]">
              Be first to <br className="max-lg:hidden" />
              the restock.
            </h2>
            <p className="text-[15px] leading-normal text-muted-foreground lg:text-[17px]">New {many}, restocks and sales, about once a month. Unsubscribe in one click.</p>
          </div>
          <SubscribeForm variant="band" />
        </div>
      </div>
    </section>
  );
}
