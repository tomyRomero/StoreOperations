import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Package, RotateCcw } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getStoreSettings } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about a supply or an order? Send us a message.",
};

// The form beside the quicker answers to the usual questions. Messages go to the support email in
// Store settings, so the admin can change it without a release.
export default async function ContactPage() {
  const settings = await getStoreSettings();

  const shortcuts = [
    { icon: Package, title: "Where's my order?", text: "Each order's progress is in your account.", href: "/account/orders", label: "See your orders" },
    { icon: RotateCcw, title: "Returns", text: "What we accept back, and how to start.", href: "/shipping-returns", label: "Shipping and returns" },
  ];

  return (
    <div className="container py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact us" }]} />
      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <div className="grid content-start gap-8">
          <div className="grid gap-3">
            <h1 className="text-h1">Contact us</h1>
            <p className="text-body-lg text-muted-foreground">Questions about a supply or an order? Write to us and a real person will reply by email.</p>
          </div>
          <ul className="grid gap-5">
            {settings?.supportEmail && (
              <li className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div className="grid gap-0.5">
                  <h2 className="font-sans text-base font-semibold">Email</h2>
                  <a href={`mailto:${settings.supportEmail}`} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
                    {settings.supportEmail}
                  </a>
                </div>
              </li>
            )}
            {shortcuts.map(({ icon: Icon, title, text, href, label }) => (
              <li key={href} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="grid gap-0.5">
                  <h2 className="font-sans text-base font-semibold">{title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {text}{" "}
                    <Link href={href} className="font-semibold text-accent underline-offset-4 hover:underline">
                      {label}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <section aria-labelledby="contact-form-heading" className="rounded-md border p-6 sm:p-8">
          <h2 id="contact-form-heading" className="mb-6 text-h3">
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
