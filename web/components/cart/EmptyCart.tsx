"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Category } from "@/lib/api/types";

export function EmptyCart({ categories, onNavigate }: { categories: Category[]; onNavigate?: () => void }) {
  return (
    <div className="relative isolate flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span aria-hidden className="absolute top-6 -z-10 size-40 rounded-full bg-glow-violet opacity-[calc(0.25*var(--glow-strength))] blur-[60px]" />
      <span className="grid size-16 place-items-center rounded-full border border-foreground/10 bg-foreground/5">
        <ShoppingBag className="size-7" aria-hidden />
      </span>
      <h2 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.03em]">Your bag is empty</h2>
      <p className="max-w-xs text-[15px] text-muted-foreground">Add something you like and it will wait for you here.</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            onClick={onNavigate}
            className="inline-flex h-11 items-center rounded-full border border-foreground/14 px-4.5 text-sm font-semibold transition-colors hover:bg-foreground/5"
          >
            Shop {category.name.toLowerCase()}
          </Link>
        ))}
        <Link href="/products" onClick={onNavigate} className="inline-flex h-11 items-center rounded-button bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85">
          Shop all
        </Link>
      </div>
    </div>
  );
}
