import Link from "next/link";
import { LockKeyhole, MessageCircle, RotateCcw, Truck } from "lucide-react";
import type { StoreSettings } from "@/lib/api/types";
import { returnsSummary, shippingSummary } from "@/lib/format";

// What to do about a return, when the store hasn't written its own note
const returnsHint: Record<StoreSettings["returnPolicy"], string> = {
  no_returns: "Please check sizes and colors before you order.",
  exchanges: "Write to us and we'll swap it for something else.",
  refunds: "Write to us and we'll refund it to your card.",
};

// Why shop here, in the store's own terms: the shipping and returns lines come from Store settings, so
// they always match what checkout charges and what the returns desk accepts
export function TrustStrip({ settings }: { settings: StoreSettings }) {
  const items = [
    { icon: Truck, title: shippingSummary(settings), text: "Every order ships within the United States." },
    { icon: RotateCcw, title: returnsSummary(settings), text: settings.returnPolicyNote ?? returnsHint[settings.returnPolicy] },
    { icon: LockKeyhole, title: "Secure checkout", text: "Card details go straight to Stripe and never touch our servers." },
    { icon: MessageCircle, title: "Help from real people", text: "Questions about a supply?", link: { href: "/contact", label: "Ask us" } },
  ];

  return (
    <section aria-label="Why shop with us" className="border-y bg-muted/60">
      <ul className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:py-12">
        {items.map(({ icon: Icon, title, text, link }) => (
          <li key={title} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="grid gap-1">
              <h3 className="font-sans text-base font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {text}
                {link && (
                  <>
                    {" "}
                    <Link href={link.href} className="font-semibold text-accent underline-offset-4 hover:underline">
                      {link.label}
                    </Link>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
