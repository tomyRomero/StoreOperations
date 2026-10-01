import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
] as const;

type Step = (typeof steps)[number]["id"];

// ① Shipping ── ② Payment. Done steps get a check; the current one is ink with the accent's ring.
export function CheckoutSteps({ current }: { current: Step }) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <ol aria-label="Checkout steps" className="flex items-center gap-3">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.id} aria-current={active ? "step" : undefined} className="flex items-center gap-3">
            {index > 0 && <span aria-hidden className={cn("h-px w-8 sm:w-16", done || active ? "bg-foreground" : "bg-border")} />}
            <span
              aria-hidden
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                done && "bg-primary text-primary-foreground",
                active && "bg-primary text-primary-foreground ring-2 ring-accent ring-offset-2",
                !done && !active && "border border-input text-muted-foreground"
              )}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={cn("text-sm font-semibold", !done && !active && "text-muted-foreground")}>
              {step.label}
              {done && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
