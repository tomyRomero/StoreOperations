"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/shared/PriceTag";
import { QuantityStepper } from "@/components/shared/QuantityStepper";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/api/types";

// How many, and "Add to cart", which opens the cart drawer with the item highlighted (adding more of
// something already in the cart raises its quantity). On phones the price and button also follow
// along at the bottom of the screen once the main button scrolls away.
export function ProductPurchase({ product }: { product: Product }) {
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const mainButton = useRef<HTMLButtonElement>(null);
  const soldOut = product.stock <= 0;
  const max = Math.min(product.stock, 99);

  useEffect(() => {
    const button = mainButton.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting));
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  const add = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    setAdding(true);
    const added = await cart.add(product.id, quantity);
    setAdding(false);
    if (added) {
      cart.openCart(product.id, button);
      setQuantity(1);
    }
  };

  if (soldOut) {
    return (
      <Button size="lg" className="w-full sm:w-auto" disabled>
        Sold out
      </Button>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} max={max} label={`Quantity of ${product.name}`} />
        <Button ref={mainButton} size="lg" className="flex-1 sm:flex-none sm:px-10" onClick={add} loading={adding}>
          <ShoppingBag aria-hidden />
          Add to cart
        </Button>
      </div>

      {/* Phones only, and only while the main button is off screen; it repeats that button for thumbs */}
      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur transition-transform duration-200 lg:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <PriceTag priceCents={product.priceCents} compareAtPriceCents={product.compareAtPriceCents} />
          <Button size="lg" onClick={add} loading={adding} tabIndex={showBar ? 0 : -1}>
            Add to cart
          </Button>
        </div>
      </div>
    </>
  );
}
