"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import type { Cart } from "@/lib/api/types";
import { cartSavings, shippingFor, type ShippingSettings } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { signInPath } from "@/lib/sign-in-path";
import { cn } from "@/lib/utils";

type Props = {
  cart: Cart;
  shipping: ShippingSettings;
  // The drawer's footer, or the bag page's summary card
  variant?: "drawer" | "page";
  onNavigate?: () => void;
};

const checkoutButton =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/85";

// The totals and the way to checkout. Tax depends on the address, so checkout adds it. Guests sign in
// first and come back to the bag, which then holds what they picked as a guest.
export function CartSummary({ cart, shipping, variant = "drawer", onNavigate }: Props) {
  const user = useCurrentUser();
  const page = variant === "page";
  const shippingCents = shippingFor(cart.subtotalCents, shipping);
  const savings = cartSavings(cart);

  const button = cn(checkoutButton, page ? "h-[58px] text-base shadow-[0_0_0_6px_color-mix(in_oklab,var(--foreground)_5%,transparent),0_20px_50px_color-mix(in_oklab,var(--glow-violet)_30%,transparent)]" : "h-[54px] text-[15px] shadow-[0_16px_40px_color-mix(in_oklab,var(--glow-violet)_30%,transparent)]");
  const checkout = !user ? (
    <Link href={signInPath("/cart")} onClick={onNavigate} className={button}>
      Sign in to check out
    </Link>
  ) : cart.canCheckout ? (
    <Link href="/checkout" onClick={onNavigate} className={button}>
      <LockKeyhole className="size-4" aria-hidden />
      Check out
    </Link>
  ) : (
    <button type="button" disabled className={cn(button, "cursor-not-allowed opacity-50")}>
      <LockKeyhole className="size-4" aria-hidden />
      Check out
    </button>
  );
  const blocked = !cart.canCheckout && <p className="text-sm font-semibold text-warning">Fix the items marked above to check out.</p>;

  if (!page) {
    return (
      <div className="grid gap-3.5">
        <p className="flex items-baseline justify-between gap-4">
          <span className="text-[15px] text-ink-2">Subtotal</span>
          <span className="font-mono text-xl font-semibold tabular-nums">{formatMoney(cart.subtotalCents)}</span>
        </p>
        <p className="-mt-1.5 text-[13px] text-muted-foreground">Shipping and tax are added at checkout.</p>
        {blocked}
        <div className="grid grid-cols-[1fr_1.6fr] gap-2.5">
          <Link href="/cart" onClick={onNavigate} className="inline-flex h-[54px] items-center justify-center rounded-full border border-foreground/16 text-[15px] font-semibold transition-colors hover:bg-foreground/5">
            View bag
          </Link>
          {checkout}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4.5">
      <dl className="grid gap-3 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-mono tabular-nums">{formatMoney(cart.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-mono tabular-nums">{shippingCents === null ? "At checkout" : shippingCents === 0 ? "Free" : formatMoney(shippingCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="text-muted-foreground">At checkout</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-foreground/8 pt-4">
          <dt className="font-semibold">Estimated total</dt>
          <dd className="font-mono text-2xl font-semibold tabular-nums">{formatMoney(cart.subtotalCents + (shippingCents ?? 0))}</dd>
        </div>
      </dl>
      {blocked}
      {checkout}
      {savings > 0 && (
        <p className="rounded-xl bg-success-subtle px-3 py-2.5 text-center text-[13px] text-success">You&apos;re saving {formatMoney(savings)} on sale prices</p>
      )}
      <p className="text-center text-[13px] text-muted-foreground">Payments are handled securely by Stripe</p>
    </div>
  );
}
