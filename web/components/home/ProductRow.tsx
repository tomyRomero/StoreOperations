import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/lib/api/types";
import { ProductCarousel } from "./ProductCarousel";

type Props = {
  id: string;
  title: string;
  href: string;
  products: Product[];
  lowStockThreshold: number;
};

// A titled row of products that scrolls sideways. Nothing to show, no section.
export function ProductRow({ id, title, href, products, lowStockThreshold }: Props) {
  if (products.length === 0) return null;

  return (
    <ProductCarousel id={id} title={title} href={href}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} lowStockThreshold={lowStockThreshold} />
        </li>
      ))}
    </ProductCarousel>
  );
}
