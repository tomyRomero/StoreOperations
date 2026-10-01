import StoreSettingsForm from "@/components/forms/StoreSettingsForm";
import ErrorMessage from "@/components/shared/Error";
import { getAdminSettings } from "@/lib/data/admin-store";

// The store's policies, which the storefront, checkout and emails all read from the API
const page = async () => {
  const settings = await getAdminSettings();

  return (
    <section className="">
      <h1 className="text-heading3-bold max-w-2xl mx-auto mb-6">Store Settings</h1>
      {/* A new version (after a save or a conflict) starts the form again from it */}
      {settings ? <StoreSettingsForm key={settings.rowVersion} settings={settings} /> : <ErrorMessage />}
    </section>
  );
};

export default page;
