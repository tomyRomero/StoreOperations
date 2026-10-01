"use client";

import { ErrorState } from "@/components/shared/ErrorState";

// A store page failed to render. The header and footer stay, so the customer can carry on elsewhere.
// The reference matches the server's log entry if they contact us about it.
export default function StoreError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container py-16">
      <ErrorState title="This page didn't load" onRetry={() => retry()}>
        It&apos;s usually temporary, so please try again in a moment.
        {error.digest && <span className="mt-2 block text-xs">Reference: {error.digest}</span>}
      </ErrorState>
    </div>
  );
}
