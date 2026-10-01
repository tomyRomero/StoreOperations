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

// − [n] +, kept between min and max. The number is announced as it changes.
export function QuantityStepper({ value, onChange, min = 1, max = 99, disabled, label = "Quantity", size = "md", className }: Props) {
  const button = cn(
    "inline-flex items-center justify-center text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
    size === "sm" ? "size-8" : "size-10"
  );

  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center rounded-md border border-input", className)}>
      <button type="button" className={cn(button, "rounded-l-md")} onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label="One less">
        <Minus className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" className={cn("min-w-8 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-base")}>
        {value}
      </output>
      <button type="button" className={cn(button, "rounded-r-md")} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="One more">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
