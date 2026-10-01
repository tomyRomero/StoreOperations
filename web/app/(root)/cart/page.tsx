import type { Metadata } from "next";
import { CartPageContents } from "@/components/cart/CartPageContents";
import { getCategories, getStoreSettings } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "Your bag" };

export default async function CartPage() {
  // Shipping comes from Store settings, so the bag shows what checkout will charge
  const [settings, categories] = await Promise.all([getStoreSettings(), getCategories()]);

  return (
    // Clipped sideways, so the glow behind the title never widens the page
    <div className="relative isolate overflow-x-clip">
      <div aria-hidden className="absolute -right-24 -top-36 -z-10 h-[460px] w-[700px] max-w-full bg-[radial-gradient(50%_50%_at_50%_50%,rgb(61_139_255/0.18),transparent_70%)] opacity-(--glow-strength)" />
      <div className="container pb-8 pt-8 lg:pt-12">
        <CartPageContents shipping={settings} categories={categories} lowStockThreshold={settings?.lowStockThreshold ?? 5} />
      </div>
    </div>
  );
}
