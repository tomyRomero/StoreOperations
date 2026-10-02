import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Package, Phone, RotateCcw } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { getStoreSettings } from "@/lib/data/catalog";
import { nounsOf } from "@/lib/storefront";

export async function generateMetadata(): Promise<Metadata> {
  const { one } = nounsOf(await getStoreSettings());
  return { title: "Contact us", description: `Questions about a ${one} or an order? Send us a message.` };
}

// Messages go to the support email in Store settings, so the admin can change it without a release
export default async function ContactPage() {
  const settings = await getStoreSettings();
  const { one } = nounsOf(settings);
  const phone = settings?.storefront.contactPhone;
  const address = settings?.storefront.contactAddress;

  const shortcuts = [
    ...(settings?.supportEmail ? [{ icon: Mail, small: "Email us", big: settings.supportEmail, href: `mailto:${settings.supportEmail}` }] : []),
    ...(phone ? [{ icon: Phone, small: "Call us", big: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` }] : []),
    { icon: Package, small: "Where's my order?", big: "See your orders", href: "/account/orders" },
    { icon: RotateCcw, small: "Returns", big: "Shipping and returns", href: "/shipping-returns" },
  ];

  return (
    <div className="relative isolate overflow-x-clip">
      <div aria-hidden className="absolute -left-40 -top-40 -z-10 h-[560px] w-[900px] max-w-full bg-[radial-gradient(50%_50%_at_40%_45%,color-mix(in_oklab,var(--glow-violet)_20%,transparent),transparent_70%)] opacity-(--glow-strength)" />
      <div className="container grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-20">
        <div className="grid content-start gap-9">
          <div className="grid gap-5">
            <p className="font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-accent">Contact</p>
            <h1 className="text-[52px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[72px] lg:text-[88px]">
              Talk to
              <br />a person.
            </h1>
            <p className="max-w-[460px] text-lg leading-normal text-muted-foreground">
              Questions about a {one}, an order or a delivery? Send a message and we&apos;ll reply by email.
            </p>
          </div>
          <ul className="grid gap-3">
            {shortcuts.map(({ icon: Icon, small, big, href }) => {
              const body = (
                <>
                  <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-foreground/6">
                    <Icon className="size-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="text-[13px] text-faint">{small}</span>
                    <span className="truncate font-semibold">{big}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-faint" aria-hidden />
                </>
              );
              const look = "flex items-center gap-4 rounded-[20px] border bg-card px-5 py-4 transition-colors hover:border-foreground/22";
              return (
                <li key={href}>
                  {href.startsWith("mailto:") || href.startsWith("tel:") ? (
                    <a href={href} className={look}>
                      {body}
                    </a>
                  ) : (
                    <Link href={href} className={look}>
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {address && (
            <div className="flex items-start gap-4 px-5">
              <MapPin className="mt-0.5 size-5 shrink-0 text-faint" strokeWidth={1.8} aria-hidden />
              <address className="whitespace-pre-line not-italic text-ink-2">{address}</address>
            </div>
          )}
        </div>

        <section aria-labelledby="contact-form-heading" className="grid content-start gap-6 rounded-[28px] border bg-card p-6 sm:p-8">
          <h2 id="contact-form-heading" className="font-sans text-[22px] font-semibold tracking-[-0.02em]">
            Send a message
          </h2>
          {/* Messages go to the support email, so without one the form would only fail */}
          {settings?.supportEmail ? (
            <ContactForm />
          ) : (
            <p className="text-muted-foreground">
              Our inbox isn&apos;t open yet, so we can&apos;t take messages here for now. Your orders and our shipping and returns rules are
              linked on this page.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
