"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import type { OrderLine } from "@/lib/api/types";

// Puts an order's items back in the bag, in the same quantities, then opens the bag. A line that can't be
// bought now (sold out, fewer left, no longer sold) is said in its own message and the rest still go in.
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
