import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/lib/api/types";
import { SectionHeading } from "./SectionHeading";

type Props = {
  id: string;
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
  products: Product[];
  lowStockThreshold: number;
};

// A titled row of up to four products. On phones it scrolls sideways instead of stacking.
export function ProductRow({ id, title, description, href, linkLabel, products, lowStockThreshold }: Props) {
  if (products.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="container scroll-mt-24 py-12 lg:py-16">
      <SectionHeading id={`${id}-heading`} title={title} description={description} href={href} linkLabel={linkLabel} />
      <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <li key={product.id} className="w-[70%] shrink-0 snap-start sm:w-auto">
            <ProductCard product={product} lowStockThreshold={lowStockThreshold} />
          </li>
        ))}
      </ul>
    </section>
  );
}
