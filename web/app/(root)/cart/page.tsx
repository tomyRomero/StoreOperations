import type { Metadata } from "next";
import { CartPageContents } from "@/components/cart/CartPageContents";
import { getCategories, getStoreSettings } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  // Shipping comes from Store settings, so the cart shows what checkout will charge
  const [settings, categories] = await Promise.all([getStoreSettings(), getCategories()]);

  return (
    <div className="container py-8 lg:py-12">
      <h1 className="mb-8 text-h1">Your cart</h1>
      <CartPageContents shipping={settings} categories={categories} />
    </div>
  );
}
