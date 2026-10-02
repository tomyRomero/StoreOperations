"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Checkout, CheckoutSkeleton } from "./Checkout";
import { useGuestDetails } from "@/lib/guest-checkout";

// The payment step for a guest. Their details from the first step are in this tab; without them, it's
// back to that step.
export function GuestCheckout() {
  const router = useRouter();
  const details = useGuestDetails();

  useEffect(() => {
    if (details === null) router.replace("/address");
  }, [details, router]);

  return details ? <Checkout guest={details} /> : <CheckoutSkeleton />;
}
