import type { Metadata } from "next";
import Link from "next/link";
import { FindOrderForm } from "@/components/forms/FindOrderForm";
import { getCurrentUser } from "@/lib/session";
import { signInPath } from "@/lib/sign-in-path";

export const metadata: Metadata = { title: "Find your order" };

// For a guest without their confirmation email to hand, and for anyone tracking an order. A customer's
// orders are also in their account.
export default async function FindOrderPage() {
  const user = await getCurrentUser();

  return (
    <div className="container grid max-w-xl gap-8 py-12 lg:py-20">
      <div className="grid gap-2.5">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-5xl">Find your order</h1>
        <p className="text-muted-foreground">
          Enter the email you checked out with and the order number from your confirmation. We&apos;ll email you a link to the order.
        </p>
      </div>
      <FindOrderForm />
      <p className="text-center text-sm text-muted-foreground">
        {user ? "Your orders are also in " : "Have an account? "}
        <Link href={user ? "/account/orders" : signInPath("/account/orders")} className="font-semibold text-foreground underline-offset-4 hover:underline">
          {user ? "your account" : "Sign in to see your orders"}
        </Link>
        {user ? "." : ""}
      </p>
    </div>
  );
}
