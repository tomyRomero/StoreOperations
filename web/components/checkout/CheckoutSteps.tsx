"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "shipping", label: "Shipping", path: "/address" },
  { id: "payment", label: "Payment", path: "/checkout" },
] as const;

// A finished step links back to it, keeping the chosen address. Phones show only the current step's name.
export function CheckoutSteps() {
  const pathname = usePathname();
  const address = useSearchParams().get("address");
  const currentIndex = steps.findIndex((step) => step.path === pathname);

  return (
    <ol aria-label="Checkout steps" className="flex items-center gap-3.5 text-sm">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const content = (
          <>
            <span
              aria-hidden
              className={cn(
                "grid size-[26px] place-items-center rounded-full font-mono text-xs font-semibold",
                done && "bg-glow-green text-[#052e1f]",
                active && "bg-primary text-primary-foreground shadow-[0_0_0_4px_color-mix(in_oklab,var(--glow-violet)_35%,transparent)]",
                !done && !active && "border border-input text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span className={cn(!active && "max-sm:sr-only", active ? "font-semibold" : done ? "text-ink-2" : "text-muted-foreground")}>
              {step.label}
              {done && <span className="sr-only"> (done)</span>}
            </span>
          </>
        );
        return (
          <li key={step.id} aria-current={active ? "step" : undefined} className="flex items-center gap-3.5">
            {index > 0 && <span aria-hidden className={cn("h-px w-8 sm:w-14", done || active ? "bg-linear-to-r from-glow-green to-foreground/30" : "bg-border")} />}
            {done ? (
              <Link href={address ? `${step.path}?address=${address}` : step.path} className="flex items-center gap-2.5 rounded-full hover:text-foreground">
                {content}
              </Link>
            ) : (
              <span className="flex items-center gap-2.5">{content}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
