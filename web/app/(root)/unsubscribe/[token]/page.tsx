import type { Metadata } from "next";
import { MailX } from "lucide-react";
import UnsubscribeButton from "@/components/forms/UnsubscribeButton";
import { getStoreSettings } from "@/lib/data/catalog";

// Kept out of search results: every address here is one subscriber's private link
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

// Every newsletter links here with the subscriber's own token. The token alone is enough to leave,
// so nobody has to sign in, and nothing on this page says whether the address is still subscribed.
export default async function UnsubscribePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const settings = await getStoreSettings();

  return (
    <div className="container py-16 lg:py-24">
      <div className="mx-auto grid max-w-md justify-items-center gap-4 rounded-md border p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <MailX className="size-6 text-muted-foreground" aria-hidden />
        </span>
        <h1 className="text-h2">Leave the {settings?.storeName ?? "Palettehub"} newsletter?</h1>
        <p className="text-muted-foreground">You&apos;ll stop getting our newsletter. Emails about your orders still arrive as usual.</p>
        <div className="mt-2">
          <UnsubscribeButton token={token} />
        </div>
      </div>
    </div>
  );
}
