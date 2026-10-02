import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { AdminBar } from "@/components/layout/AdminBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { getCategories, getStoreSettings, hasDeals } from "@/lib/data/catalog";
import { getPreviewDraft } from "@/lib/data/preview";
import { getCurrentUser } from "@/lib/session";

// The storefront's frame. Admins can browse it too, with a bar that leads back to the dashboard (but not in
// Theme and brand's preview, which shows the store as shoppers will see it).
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [user, categories, settings, deals, draft] = await Promise.all([getCurrentUser(), getCategories(), getStoreSettings(), hasDeals(), getPreviewDraft()]);

  return (
    <CartProvider>
      <SkipLink />
      {user?.isAdmin && !draft && <AdminBar />}
      <SiteHeader categories={categories} hasDeals={deals} lowStockThreshold={settings?.lowStockThreshold ?? 5} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter categories={categories} settings={settings} hasDeals={deals} />
      <CartDrawer shipping={settings} categories={categories} />
    </CartProvider>
  );
}
