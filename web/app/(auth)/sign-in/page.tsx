import type { Metadata } from "next";
import { Suspense } from "react";
import SignInForm from "@/components/forms/SignInForm";
import { getStoreSettings } from "@/lib/data/catalog";
import { storeNameOf } from "@/lib/storefront";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  const settings = await getStoreSettings();

  return (
    <div className="grid gap-8">
      <div className="grid gap-2.5">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-5xl">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to check out faster and track your orders.</p>
      </div>
      {/* The form reads where to go back to from the address */}
      <Suspense>
        <SignInForm storeName={storeNameOf(settings)} />
      </Suspense>
    </div>
  );
}
