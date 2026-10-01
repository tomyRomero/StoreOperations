import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

type Props = {
  storeName: string;
  // How Stripe is set up: test keys take no real money, and without keys checkout is off
  payments: "live" | "test" | "off";
};

const modes = {
  live: { label: "Live", dot: "bg-success" },
  test: { label: "Test mode", dot: "bg-warning" },
  off: { label: "Payments off", dot: "bg-faint" },
};

// The store this console runs, at the top of the sidebar: its mark and name, whether it takes real
// payments, and the way to it
export function StoreCard({ storeName, payments }: Props) {
  const mode = modes[payments];

  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-xl border bg-card px-2.5 py-2 shadow-[0_1px_2px_rgb(16_16_20/0.04)] transition-colors hover:border-foreground/20">
      <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#0e0e10]">
        <LogoMark className="size-5 rounded-[6px]" />
      </span>
      <span className="grid min-w-0 flex-1 gap-px">
        <span className="truncate text-sm font-semibold">{storeName}</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span aria-hidden className={cn("size-1.5 rounded-full", mode.dot)} />
          {mode.label}
        </span>
      </span>
      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="sr-only">, view the store</span>
    </Link>
  );
}
