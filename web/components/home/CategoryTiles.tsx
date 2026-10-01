import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/api/types";
import { SectionHeading } from "./SectionHeading";

// Each tile carries a small marker in one of the brand glows, in order
const markers = ["bg-glow-pink", "bg-glow-blue", "bg-glow-amber", "bg-glow-green"];

export function CategoryTiles({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-heading" className="container py-12 lg:py-16">
      <SectionHeading id="categories-heading" title="Shop by category" href="/products" linkLabel="All supplies" />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <li key={category.id}>
            <Link
              href={`/products?category=${category.id}`}
              className="group relative isolate flex aspect-[4/3] items-end overflow-hidden rounded-md bg-muted p-5"
            >
              <Image
                src={category.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                className="-z-10 object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span aria-hidden className={`absolute left-4 top-4 size-4 rounded-[3px] ${markers[index % markers.length]}`} />
              <span className="flex w-full items-end justify-between gap-4 text-white">
                <span className="font-display text-h2">{category.name}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  Shop
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
