"use client";

import { useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { ProductThumb } from "@/components/products/ProductThumb";
import { QuantityStepper } from "@/components/shared/QuantityStepper";
import type { CartLine } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { issueMessage, useCart } from "./CartProvider";

type Props = {
  line: CartLine;
  // The drawer's compact row, or the bag page's card
  variant?: "drawer" | "page";
  // A line just added glows for a moment
  highlighted?: boolean;
  // Following the product link from the drawer closes it
  onNavigate?: () => void;
};

// A line the store can't sell as it is says why, with a one-tap fix
export function CartLineItem({ line, variant = "drawer", highlighted = false, onNavigate }: Props) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  const page = variant === "page";
  const regular = line.compareAtPriceCents !== null && line.compareAtPriceCents > line.priceCents ? line.compareAtPriceCents : null;

  const change = async (quantity: number) => {
    setBusy(true);
    await cart.setQuantity(line.productId, quantity);
    setBusy(false);
  };

  // The bag then offers Undo where the line was (RemovedNotice)
  const remove = async () => {
    setBusy(true);
    await cart.remove(line.productId);
    setBusy(false);
  };

  const fix =
    line.issue === "not_enough_stock"
      ? { label: `Set to ${line.stock}`, run: () => change(line.stock) }
      : line.issue
        ? { label: "Remove it", run: remove }
        : null;

  return (
    <li
      className={cn(
        "grid items-start gap-3.5",
        page
          ? "grid-cols-[96px_minmax(0,1fr)_auto] rounded-[24px] border bg-card p-3.5 sm:grid-cols-[148px_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:p-4"
          : "grid-cols-[84px_minmax(0,1fr)_auto] border-t border-foreground/7 py-4 first:border-t-0",
        highlighted && "animate-highlight rounded-2xl",
      )}
    >
      <Link href={`/products/${line.productId}`} onClick={onNavigate} tabIndex={-1} aria-hidden>
        <ProductThumb
          productId={line.productId}
          imageUrl={line.imageUrl}
          sizes={page ? "148px" : "84px"}
          className={page ? "size-24 rounded-[18px] sm:size-37" : "size-21 rounded-[18px]"}
        />
      </Link>

      <div className={cn("grid min-w-0 content-start", page ? "gap-1.5" : "gap-1")}>
        <Link
          href={`/products/${line.productId}`}
          onClick={onNavigate}
          className={cn("truncate font-semibold hover:underline", page ? "text-lg tracking-[-0.02em] sm:text-xl" : "text-[15px]")}
        >
          {line.name}
        </Link>
        <span className={cn("tabular-nums text-muted-foreground", page ? "text-sm" : "text-[13px]")}>
          {formatMoney(line.priceCents)} each{regular !== null && <span className="text-sale"> · sale price</span>}
        </span>

        {line.issue && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-warning">
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            {issueMessage(line)}
            {fix && (
              <button type="button" onClick={fix.run} disabled={busy} className="text-accent underline-offset-4 hover:underline">
                {fix.label}
              </button>
            )}
          </p>
        )}

        <div className={cn("flex items-center gap-3", page ? "mt-2.5 sm:gap-4" : "mt-1.5")}>
          {line.issue !== "unavailable" && line.issue !== "out_of_stock" && (
            <QuantityStepper
              value={line.quantity}
              onChange={change}
              max={Math.min(Math.max(line.stock, 1), 99)}
              disabled={busy}
              size="sm"
              label={`Quantity of ${line.name}`}
            />
          )}
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className={cn("text-muted-foreground underline underline-offset-3 hover:text-foreground", page ? "text-sm" : "text-[13px]")}
          >
            Remove<span className="sr-only"> {line.name}</span>
          </button>
        </div>
      </div>

      <div className="grid justify-items-end gap-0.5 font-mono tabular-nums">
        {regular !== null && <span className="sr-only">Was {formatMoney(regular * line.quantity)}, now </span>}
        <span className={cn("font-medium", page ? "text-base sm:text-lg" : "text-[15px]")}>{formatMoney(line.lineTotalCents)}</span>
        {regular !== null && (
          <s aria-hidden className={cn("text-faint", page ? "text-[13px]" : "text-xs")}>
            {formatMoney(regular * line.quantity)}
          </s>
        )}
      </div>
    </li>
  );
}
