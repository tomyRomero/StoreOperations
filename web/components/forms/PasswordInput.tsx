"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { passwordChecks } from "@/lib/validation/password";

// A password field with a show/hide toggle. The toggle keeps one name and says whether it's on.
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label="Show password"
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-sm text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

// The rules for a new password, ticked off as it's typed
export function PasswordChecklist({ value, id }: { value: string; id?: string }) {
  return (
    <ul id={id} className="grid gap-1 text-sm" aria-label="Password requirements">
      {passwordChecks(value).map((check) => (
        <li key={check.label} className={cn("flex items-center gap-2", check.met ? "text-success" : "text-muted-foreground")}>
          <span aria-hidden className={cn("flex size-4 items-center justify-center rounded-full text-[10px] font-bold", check.met ? "bg-success text-success-foreground" : "border border-input")}>
            {check.met ? "✓" : ""}
          </span>
          {check.label}
          <span className="sr-only">{check.met ? " (done)" : " (not yet)"}</span>
        </li>
      ))}
    </ul>
  );
}
