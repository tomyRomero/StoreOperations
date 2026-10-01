import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoreSettingsForm } from "@/components/admin/settings/StoreSettingsForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAdminSettings } from "@/lib/data/admin-store";

export const metadata: Metadata = { title: "Settings" };

// The store's policies, which the storefront, checkout and emails all read from the API
export default async function SettingsPage() {
  const settings = await getAdminSettings();

  return (
    <>
      <AdminPageHeader title="Settings" description="The store, checkout and emails all follow these, as soon as they're saved." />
      {/* A new version (after a save or a conflict) starts the form again from it */}
      {settings ? <StoreSettingsForm key={settings.rowVersion} settings={settings} /> : <ErrorState title="We couldn't load the settings" action={<RetryButton />} />}
    </>
  );
}
