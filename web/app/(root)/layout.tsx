import { CartProvider } from "@/components/cart/CartProvider";
import { AdminBar } from "@/components/layout/AdminBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { getCategories, getStoreSettings } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/session";

// The storefront's frame. Admins can browse it too, with a bar that leads back to the dashboard.
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [user, categories, settings] = await Promise.all([getCurrentUser(), getCategories(), getStoreSettings()]);
  const storeName = settings?.storeName ?? "Palettehub";

  return (
    <CartProvider>
      <SkipLink />
      {user?.isAdmin && <AdminBar />}
      <SiteHeader categories={categories} storeName={storeName} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter categories={categories} storeName={storeName} supportEmail={settings?.supportEmail ?? null} />
    </CartProvider>
  );
}
