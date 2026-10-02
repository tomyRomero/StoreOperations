"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { Button } from "../ui/button";
import { useCurrentUser } from "../CurrentUserProvider";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import { signInPath } from "@/lib/sign-in-path";

type Props = { accessToken: string; email: string; inAccount: boolean; orderNumber: string };

const card = "grid gap-3 rounded-[24px] border bg-card p-6";

// Beside a guest's order: an offer to keep it in an account, with the same email, so it joins their
// order history. Creating the account or signing in comes back here to save it.
export function SaveOrderCard({ accessToken, email, inAccount, orderNumber }: Props) {
  const user = useCurrentUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const here = `/orders/${accessToken}`;

  if (inAccount) {
    return (
      <section aria-labelledby="account-heading" className={card}>
        <h2 id="account-heading" className="font-sans text-base font-semibold">
          Saved to an account
        </h2>
        <p className="text-sm leading-normal text-muted-foreground">This order is in the account for {email}, with its other orders.</p>
        <Link href={`/account/orders/${orderNumber}`} className="justify-self-start text-sm font-semibold text-accent hover:underline">
          See it in your account
        </Link>
      </section>
    );
  }

  const save = async () => {
    setSaving(true);
    setProblem(null);
    const { data, error } = await api.POST("/api/orders/{accessToken}/save", { params: { path: { accessToken } } });
    if (data) {
      router.push(`/account/orders/${data.orderNumber}`);
      return;
    }
    setSaving(false);
    setProblem(problemMessage(error));
  };

  const sameEmail = user?.email.toLowerCase() === email.toLowerCase();

  return (
    <section aria-labelledby="account-heading" className={card}>
      <h2 id="account-heading" className="flex items-center gap-2 font-sans text-base font-semibold">
        <UserRound className="size-4" aria-hidden />
        Keep this order in an account
      </h2>
      {!user ? (
        <>
          <p className="text-sm leading-normal text-muted-foreground">
            Create an account with {email} to see all your orders in one place and check out faster next time.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild size="sm">
              <Link href={`/sign-up?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(here)}`}>Create an account</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={signInPath(here)}>Sign in</Link>
            </Button>
          </div>
        </>
      ) : sameEmail ? (
        <>
          <p className="text-sm leading-normal text-muted-foreground">Add it to your account, with your other orders.</p>
          <Button size="sm" className="justify-self-start" loading={saving} onClick={save}>
            Save to my account
          </Button>
        </>
      ) : (
        <p className="text-sm leading-normal text-muted-foreground">
          You&apos;re signed in as {user.email}, but this order was placed with {email}. Only the account for {email} can keep it.
        </p>
      )}
      {problem && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {problem}
        </p>
      )}
    </section>
  );
}
