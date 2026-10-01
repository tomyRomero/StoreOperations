import type { Metadata } from "next";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-h1">Security</h1>
        <p className="text-muted-foreground">Changing your password signs you out on every other device.</p>
      </div>
      <section aria-labelledby="password-heading" className="grid gap-5 rounded-md border p-5 sm:p-6">
        <h2 id="password-heading" className="text-h3">
          Change your password
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
