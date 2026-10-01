"use client";

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { passwordChecks } from "@/lib/validation/password";

// A password field with a show/hide toggle inside it. The toggle keeps one name and says whether it's on.
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-14", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label="Show password"
        aria-pressed={visible}
        className="absolute right-2 top-1/2 grid h-9 w-10 -translate-y-1/2 place-items-center rounded-[10px] bg-foreground/6 text-ink-2 transition-colors hover:bg-foreground/10 hover:text-foreground aria-pressed:bg-accent-subtle aria-pressed:text-accent-ink"
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

// The rules for a new password, ticked off as it's typed. The bar above fills with each rule met; it
// only repeats the list, so screen readers skip it.
export function PasswordChecklist({ value, id }: { value: string; id?: string }) {
  const checks = passwordChecks(value);
  const met = checks.filter((check) => check.met).length;

  return (
    <div className="grid gap-2.5">
      <div aria-hidden className="grid grid-cols-4 gap-1.5">
        {checks.map((check, i) => (
          <span key={check.label} className={cn("h-[5px] rounded-full transition-colors", i >= met ? "bg-foreground/10" : met === checks.length ? "bg-glow-green" : "bg-glow-amber")} />
        ))}
      </div>
      <ul id={id} className="grid gap-2 text-[13px] sm:grid-cols-2" aria-label="Password requirements">
        {checks.map((check) => (
          <li key={check.label} className={cn("flex items-center gap-2", check.met ? "text-ink-2" : "text-faint")}>
            <span aria-hidden className={cn("grid size-4 shrink-0 place-items-center rounded-full", check.met ? "bg-success-subtle text-success" : "border-[1.5px] border-input")}>
              {check.met && <Check className="size-2.5" strokeWidth={3.5} />}
            </span>
            {check.label}
            <span className="sr-only">{check.met ? " (done)" : " (not yet)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
