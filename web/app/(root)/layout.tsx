import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { AdminBar } from "@/components/layout/AdminBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { getCategories, getStoreSettings, hasDeals } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/session";

// The storefront's frame. Admins can browse it too, with a bar that leads back to the dashboard.
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [user, categories, settings, deals] = await Promise.all([getCurrentUser(), getCategories(), getStoreSettings(), hasDeals()]);
  const storeName = settings?.storeName ?? "Palettehub";

  return (
    <CartProvider>
      <SkipLink />
      {user?.isAdmin && <AdminBar />}
      <SiteHeader categories={categories} storeName={storeName} hasDeals={deals} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter categories={categories} storeName={storeName} supportEmail={settings?.supportEmail ?? null} hasDeals={deals} />
      <CartDrawer shipping={settings} categories={categories} />
    </CartProvider>
  );
}
