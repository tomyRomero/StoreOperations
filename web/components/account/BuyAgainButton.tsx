"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import type { OrderLine } from "@/lib/api/types";

// Adds an order's items to the bag again, in the same quantities. Lines that can't be bought now (sold
// out, fewer left, no longer sold) each get their own message, and the rest are still added.
export function BuyAgainButton({ lines }: { lines: OrderLine[] }) {
  const cart = useCart();
  const [adding, setAdding] = useState(false);

  const buyAgain = async (button: HTMLButtonElement) => {
    setAdding(true);
    let added = 0;
    for (const line of lines) {
      if (await cart.add(line.productId, line.quantity)) added++;
    }
    setAdding(false);
    if (added > 0) cart.openCart(undefined, button);
  };

  return (
    <Button size="lg" variant="secondary" loading={adding} onClick={(event) => void buyAgain(event.currentTarget)}>
      <RotateCcw aria-hidden />
      Buy again
    </Button>
  );
}
