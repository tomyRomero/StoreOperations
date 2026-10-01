"use client";

import { useState } from "react";
import Link from "next/link";
import { LoaderCircle, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// The "+" on a product card: adds one to the cart without leaving the list. The cart checks stock
// with the API and says why when it can't add.
export function QuickAddButton({ productId, name, className }: { productId: number; name: string; className?: string }) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setBusy(true);
    const added = await cart.add(productId);
    setBusy(false);
    if (added) {
      toast({
        variant: "success",
        title: "Added to cart",
        description: name,
        action: (
          <ToastAction altText="View your cart" asChild>
            <Link href="/cart">View cart</Link>
          </ToastAction>
        ),
      });
    }
  };

  return (
    <button
      type="button"
      onClick={add}
      disabled={busy}
      aria-busy={busy || undefined}
      aria-label={`Add ${name} to cart`}
      className={cn(
        "relative z-10 inline-flex size-10 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition-colors duration-[120ms] hover:bg-primary hover:text-primary-foreground disabled:opacity-70",
        className
      )}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Plus className="size-5" aria-hidden />}
    </button>
  );
}
