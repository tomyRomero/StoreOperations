"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Which rows of the current page are ticked. Only ids still on the page count, so turning the page or
// filtering never leaves invisible rows selected.
export function useSelection<Id extends string | number>(ids: Id[]) {
  const [ticked, setTicked] = useState<Id[]>([]);
  const selected = ticked.filter((id) => ids.includes(id));

  return {
    selected,
    isSelected: (id: Id) => selected.includes(id),
    toggle: (id: Id) => setTicked(selected.includes(id) ? selected.filter((other) => other !== id) : [...selected, id]),
    toggleAll: () => setTicked(selected.length === ids.length ? [] : [...ids]),
    clear: () => setTicked([]),
    all: ids.length > 0 && selected.length === ids.length,
    some: selected.length > 0 && selected.length < ids.length,
  };
}

type CheckboxProps = { label: string; checked: boolean; indeterminate?: boolean; onChange: () => void };

// A native checkbox, so it works with the keyboard and screen readers without extra code
export function SelectBox({ label, checked, indeterminate = false, onChange }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={onChange}
      ref={(element) => {
        if (element) element.indeterminate = indeterminate;
      }}
      className="size-4 cursor-pointer accent-[var(--accent)] align-middle"
    />
  );
}

// Shown while rows are ticked: how many, what can be done to them, and a way to untick them all
export function BulkBar({ count, noun, onClear, children }: { count: number; noun: [string, string]; onClear: () => void; children: React.ReactNode }) {
  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-label="Selected rows"
      className="sticky top-18 z-20 flex flex-wrap items-center gap-2 rounded-md border border-primary bg-primary px-3 py-2 text-sm text-primary-foreground shadow-md"
    >
      <p className="mr-2 font-semibold" aria-live="polite">
        {count} {count === 1 ? noun[0] : noun[1]} selected
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
      <Button size="sm" variant="ghost" onClick={onClear} className="ml-auto text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
        <X aria-hidden />
        Clear
      </Button>
    </div>
  );
}
