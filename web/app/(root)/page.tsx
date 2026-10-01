import { CategoryTiles } from "@/components/home/CategoryTiles";
import { Hero } from "@/components/home/Hero";
import { ProductRow } from "@/components/home/ProductRow";
import { TrustStrip } from "@/components/home/TrustStrip";
import { getCategories, getDeals, getProducts, getStoreSettings } from "@/lib/data/catalog";

export default async function Home() {
  const [categories, deals, newest, settings] = await Promise.all([
    getCategories(),
    getDeals(),
    getProducts({ sort: "newest", pageSize: 4 }),
    getStoreSettings(),
  ]);
  const lowStockThreshold = settings?.lowStockThreshold ?? 5;

  return (
    <>
      <Hero />
      <CategoryTiles categories={categories} />
      <ProductRow
        id="deals"
        title="On sale now"
        description="Regular prices, marked down for a while."
        href="/products?sale=1"
        linkLabel="See all deals"
        products={deals}
        lowStockThreshold={lowStockThreshold}
      />
      {settings && <TrustStrip settings={settings} />}
      <ProductRow
        id="new"
        title="New in"
        href="/products"
        linkLabel="See everything new"
        products={newest?.items ?? []}
        lowStockThreshold={lowStockThreshold}
      />
    </>
  );
}
