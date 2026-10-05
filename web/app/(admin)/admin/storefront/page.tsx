import type { Metadata } from "next";
import { StorefrontEditor } from "@/components/admin/storefront/StorefrontEditor";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAdminStorefront } from "@/lib/data/admin-store";

export const metadata: Metadata = { title: "Theme and brand" };

export default async function StorefrontPage() {
  const storefront = await getAdminStorefront();

  if (!storefront) {
    return (
      <>
        <AdminPageHeader title="Theme and brand" />
        <ErrorState title="We couldn't load the storefront's settings" action={<RetryButton />} />
      </>
    );
  }

  // A new version (after publishing or a conflict) starts the form again from it
  return <StorefrontEditor key={storefront.rowVersion} storefront={storefront} />;
}
