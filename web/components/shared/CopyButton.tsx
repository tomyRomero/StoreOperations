"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Copies a value (a tracking number) and says so, to the eye and to screen readers
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The browser refused (no permission, or not a secure page); the value is still on screen to select
    }
  };

  return (
    <>
      <Button type="button" variant="ghost" size="icon-sm" onClick={copy} aria-label={label}>
        {copied ? <Check className="text-success" aria-hidden /> : <Copy aria-hidden />}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}
