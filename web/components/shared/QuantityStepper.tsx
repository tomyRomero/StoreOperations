"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  // What's being counted, for screen readers: "Quantity of Fine Brush"
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

// − [n] +, kept between min and max, in a pill. The number is announced as it changes.
export function QuantityStepper({ value, onChange, min = 1, max = 99, disabled, label = "Quantity", size = "md", className }: Props) {
  const button = cn(
    "inline-flex items-center justify-center rounded-full bg-foreground/6 text-foreground transition-colors hover:bg-foreground/12 disabled:pointer-events-none disabled:opacity-40",
    size === "sm" ? "size-8" : "size-11",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-full border border-input", size === "sm" ? "h-10 px-1" : "h-[58px] px-1.5", className)}
    >
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label="One less">
        <Minus className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" className={cn("text-center font-semibold tabular-nums", size === "sm" ? "min-w-7 text-sm" : "min-w-9 text-base")}>
        {value}
      </output>
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="One more">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
