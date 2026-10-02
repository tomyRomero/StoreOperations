"use client";

import { Check } from "lucide-react";
import type { StoreThemeName } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function SwatchButton({ label, hex, selected, onSelect }: { label: string; hex?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      className={cn("grid size-8 place-items-center rounded-full border transition-shadow", selected && "ring-2 ring-ring ring-offset-2 ring-offset-card", !hex && "bg-brand-sweep")}
      style={hex ? { background: hex } : undefined}
    >
      {selected && <Check className="size-4 text-white drop-shadow" aria-hidden />}
    </button>
  );
}

// A small picture of each theme: its page, ink and accent
export function ThemeSwatch({ theme }: { theme: StoreThemeName }) {
  if (theme === "atelier") {
    return (
      <span aria-hidden className="grid h-16 grid-cols-[1.2fr_1fr] overflow-hidden rounded-md bg-[#f4f0e8]">
        <span className="bg-linear-160 from-[#cfc3ae] to-[#9c8c72]" />
        <span className="grid content-center gap-1 px-2">
          <span className="font-[family-name:var(--font-serif)] text-xl leading-none text-[#1c1a16] italic">Aa</span>
          <span className="h-0.5 rounded bg-[#a1452b]" />
        </span>
      </span>
    );
  }
  return (
    <span aria-hidden className="relative block h-16 overflow-hidden rounded-md bg-[#0b0b0f]">
      <span className="absolute left-[18%] top-[30%] size-10 rounded-full bg-[#ff4fa3] opacity-60 blur-[12px]" />
      <span className="absolute right-[16%] top-[22%] size-10 rounded-full bg-[#3d8bff] opacity-60 blur-[12px]" />
      <span className="absolute inset-x-2 top-2 h-1 rounded bg-white/85" />
      <span className="absolute left-2 top-4 h-1 w-2/5 rounded bg-linear-to-r from-[#ff4fa3] to-[#3d8bff]" />
    </span>
  );
}

type ToggleProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: [T, string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>][];
};

export function Toggle<T extends string>({ label, value, onChange, options }: ToggleProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex rounded-md bg-muted p-0.5">
      {options.map(([key, text, Icon]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={cn("flex h-8 items-center gap-1.5 rounded-[5px] px-2.5 text-sm font-medium", value === key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          <Icon className="size-4" aria-hidden />
          {text}
        </button>
      ))}
    </div>
  );
}
