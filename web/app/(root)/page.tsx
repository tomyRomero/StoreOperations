import { CategoryBento } from "@/components/home/CategoryBento";
import { Hero } from "@/components/home/Hero";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { ProductRow } from "@/components/home/ProductRow";
import { countInStock, getCategories, getCategorySummary, getDeals, getProducts, getStoreSettings } from "@/lib/data/catalog";
import { shippingSentence } from "@/lib/format";
import { bySaving, stageProducts } from "@/lib/stage";


// Everything on the home page comes from the store: its deals, newest products, categories and settings
export default async function Home() {
  const [categories, deals, newest, settings, inStockCount] = await Promise.all([
    getCategories(),
    getDeals(),
    getProducts({ sort: "newest", pageSize: 8 }),
    getStoreSettings(),
    countInStock(),
  ]);
  const featured = categories.slice(0, 3);
  const summaries = await Promise.all(featured.map((category) => getCategorySummary(category.id)));
  const sortedDeals = [...deals].sort(bySaving);
  const newItems = newest?.items ?? [];

  const staged = stageProducts(deals, newItems);

  return (
    <>
      <Hero
        products={staged}
        topDeal={sortedDeals[0] ?? null}
        inStockCount={inStockCount}
        shippingLine={settings ? shippingSentence(settings) : null}
      />
      <CategoryBento tiles={featured.map((category, i) => ({ category, ...summaries[i] }))} settings={settings} deals={sortedDeals} />
      <ProductRow id="new" title="New in" href="/products" products={newItems} lowStockThreshold={settings?.lowStockThreshold ?? 5} />
      <NewsletterBand />
    </>
  );
}
