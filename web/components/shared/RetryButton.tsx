"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// "Try again" for a page whose data didn't load: renders it again on the server without a full reload
export function RetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button loading={pending} onClick={() => startTransition(() => router.refresh())}>
      <RefreshCw aria-hidden />
      Try again
    </Button>
  );
}
