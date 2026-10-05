"use client";

import "./globals.css";
import { RefreshCw } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { fontVariables } from "./fonts";

// Shown in place of the whole site when even the root layout fails, which in practice means the API
// can't be reached. It brings its own document, styles and fonts because the root layout didn't render.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <title>We&apos;ll be right back</title>
        <header className="px-6 py-5 sm:px-10">
          <LogoMark />
        </header>
        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="grid max-w-md justify-items-center gap-4 text-center">
            <h1 className="text-h1">We&apos;ll be right back</h1>
            <p className="text-muted-foreground">The store isn&apos;t answering right now. It&apos;s usually brief, so please try again in a minute.</p>
            <Button size="lg" onClick={() => retry()}>
              <RefreshCw aria-hidden />
              Try again
            </Button>
            {error.digest && <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>}
          </div>
        </main>
      </body>
    </html>
  );
}
