import type { Metadata } from "next";
import { Suspense } from "react";
import SignInForm from "@/components/forms/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-h1">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to check out and follow your orders.</p>
      </div>
      {/* The form reads where to go back to from the address */}
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
