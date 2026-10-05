import { Fragment } from "react";
import { CategoryBento } from "@/components/home/CategoryBento";
import { Hero } from "@/components/home/Hero";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { ProductRow } from "@/components/home/ProductRow";
import type { HomeSection } from "@/lib/api/types";
import { countInStock, getCategories, getCategorySummary, getDeals, getProducts, getStoreSettings } from "@/lib/data/catalog";
import { shippingSentence } from "@/lib/format";
import { bySaving, stageProducts } from "@/lib/stage";
import { defaultHomeSections, heroCopy, nounsOf } from "@/lib/storefront";

// The rows under the hero are the ones the store turned on in Theme and brand, in its order
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
  const lowStockThreshold = settings?.lowStockThreshold ?? 5;
  const { many } = nounsOf(settings);

  const sections: Record<HomeSection, React.ReactNode> = {
    categories: <CategoryBento tiles={featured.map((category, i) => ({ category, ...summaries[i] }))} settings={settings} deals={sortedDeals} />,
    deals: <ProductRow id="sale" title="On sale" href="/products?sale=1" products={sortedDeals} lowStockThreshold={lowStockThreshold} />,
    new_in: <ProductRow id="new" title="New in" href="/products" products={newItems} lowStockThreshold={lowStockThreshold} />,
    newsletter: <NewsletterBand many={many} />,
  };

  return (
    <>
      <Hero
        products={stageProducts(deals, newItems)}
        topDeal={sortedDeals[0] ?? null}
        inStockCount={inStockCount}
        shippingLine={settings ? shippingSentence(settings) : null}
        copy={heroCopy(settings)}
        many={many}
      />
      {(settings?.storefront.homeSections ?? defaultHomeSections).map((section) => (
        <Fragment key={section}>{sections[section]}</Fragment>
      ))}
    </>
  );
}
