import type { Metadata } from "next";
import { Suspense } from "react";
import SignUpForm from "@/components/forms/SignUpForm";
import { getStoreSettings } from "@/lib/data/catalog";
import { storeNameOf } from "@/lib/storefront";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignUpPage() {
  const settings = await getStoreSettings();

  return (
    <div className="grid gap-8">
      <div className="grid gap-2.5">
        <h1 className="text-[40px] font-semibold leading-none tracking-[-0.05em] sm:text-5xl">Create your account</h1>
        <p className="text-muted-foreground">Takes a minute. You can check out as soon as you&apos;re in.</p>
      </div>
      {/* The form reads where to go back to from the address */}
      <Suspense>
        <SignUpForm storeName={storeNameOf(settings)} />
      </Suspense>
    </div>
  );
}
