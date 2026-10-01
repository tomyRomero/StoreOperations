import type { Metadata } from "next";
import { Suspense } from "react";
import SignUpForm from "@/components/forms/SignUpForm";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-h1">Create an account</h1>
        <p className="text-muted-foreground">Save your addresses, check out faster and follow every order.</p>
      </div>
      {/* The form reads where to go back to from the address */}
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
