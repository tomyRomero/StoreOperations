"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { QuantityStepper } from "@/components/shared/QuantityStepper";
import type { CartLine } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { issueMessage, useCart } from "./CartProvider";

type Props = {
  line: CartLine;
  // A line just added glows for a moment
  highlighted?: boolean;
  // Following the product link from the drawer closes it
  onNavigate?: () => void;
};

// One line of the cart. A line the store can't sell as it is says why, with a one-tap fix.
export function CartLineItem({ line, highlighted = false, onNavigate }: Props) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);

  const change = async (quantity: number) => {
    setBusy(true);
    await cart.setQuantity(line.productId, quantity);
    setBusy(false);
  };

  // The cart then offers Undo where the line was (RemovedNotice)
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
    <li className={cn("flex gap-4 rounded-md p-2", highlighted && "animate-highlight")}>
      <Link href={`/products/${line.productId}`} onClick={onNavigate} className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-sm bg-muted" tabIndex={-1} aria-hidden>
        <Image src={line.imageUrl} alt="" fill sizes="80px" className="object-cover" />
      </Link>
      <div className="grid min-w-0 flex-1 content-start gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="grid min-w-0 gap-0.5">
            <Link href={`/products/${line.productId}`} onClick={onNavigate} className="truncate font-semibold hover:underline">
              {line.name}
            </Link>
            <span className="text-sm tabular-nums text-muted-foreground">{formatMoney(line.priceCents)} each</span>
          </div>
          <span className="font-semibold tabular-nums">{formatMoney(line.lineTotalCents)}</span>
        </div>

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

        <div className="flex items-center justify-between gap-3">
          {line.issue === "unavailable" || line.issue === "out_of_stock" ? (
            <span />
          ) : (
            <QuantityStepper
              value={line.quantity}
              onChange={change}
              max={Math.min(Math.max(line.stock, 1), 99)}
              disabled={busy}
              size="sm"
              label={`Quantity of ${line.name}`}
            />
          )}
          <button type="button" onClick={remove} disabled={busy} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Remove<span className="sr-only"> {line.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
