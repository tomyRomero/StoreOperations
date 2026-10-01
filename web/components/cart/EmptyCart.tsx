"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Category } from "@/lib/api/types";

// An empty cart with a shortcut into each category
export function EmptyCart({ categories, onNavigate }: { categories: Category[]; onNavigate?: () => void }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Your cart is empty"
      className="border-0"
      action={
        categories.length > 0 ? (
          categories.map((category) => (
            <Button key={category.id} asChild variant="outline">
              <Link href={`/products?category=${category.id}`} onClick={onNavigate}>
                Shop {category.name.toLowerCase()}
              </Link>
            </Button>
          ))
        ) : (
          <Button asChild>
            <Link href="/products" onClick={onNavigate}>
              Start shopping
            </Link>
          </Button>
        )
      }
    >
      Add something you like and it will wait for you here.
    </EmptyState>
  );
}
