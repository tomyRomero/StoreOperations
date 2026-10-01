"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import type { Cart } from "@/lib/api/types";
import { shippingFor } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { signInPath } from "@/lib/sign-in-path";

export type ShippingSettings = { shippingFlatRateCents: number; freeShippingThresholdCents: number | null } | null;

// Subtotal, shipping and the way to checkout. Tax depends on the address, so checkout adds it.
// Guests sign in first and come back to the cart, which then holds what they picked as a guest.
export function CartSummary({ cart, shipping, onNavigate }: { cart: Cart; shipping: ShippingSettings; onNavigate?: () => void }) {
  const user = useCurrentUser();
  const shippingCents = shippingFor(cart.subtotalCents, shipping);
  const toFreeShipping =
    shipping?.freeShippingThresholdCents != null && shippingCents !== 0 ? shipping.freeShippingThresholdCents - cart.subtotalCents : null;

  return (
    <div className="grid gap-4">
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd className="font-semibold tabular-nums">{formatMoney(cart.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Shipping</dt>
          <dd className="font-semibold tabular-nums">
            {shippingCents === null ? "At checkout" : shippingCents === 0 ? "Free" : formatMoney(shippingCents)}
          </dd>
        </div>
        <p className="text-xs text-muted-foreground">
          {toFreeShipping !== null && toFreeShipping > 0 ? `Add ${formatMoney(toFreeShipping)} more for free shipping. ` : ""}
          Tax is added at checkout, once we know where it&apos;s going.
        </p>
      </dl>

      {!cart.canCheckout && <p className="text-sm font-semibold text-warning">Fix the items marked above to check out.</p>}

      {user ? (
        cart.canCheckout ? (
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout" onClick={onNavigate}>
              Check out
            </Link>
          </Button>
        ) : (
          <Button size="lg" className="w-full" disabled>
            Check out
          </Button>
        )
      ) : (
        <Button asChild size="lg" className="w-full">
          <Link href={signInPath("/cart")} onClick={onNavigate}>
            Sign in to check out
          </Link>
        </Button>
      )}
    </div>
  );
}
