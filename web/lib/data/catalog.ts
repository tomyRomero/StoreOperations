import "server-only";

import { serverApi } from "../api/server";
import type { Category, Product, ProductSort, StoreSettings } from "../api/types";

// The public catalog for Server Components, from the API

export async function getCategories(): Promise<Category[]> {
  const { data } = await serverApi().GET("/api/categories");
  return data ?? [];
}

export async function getDeals(): Promise<Product[]> {
  const { data } = await serverApi().GET("/api/products", { params: { query: { onDeal: true, pageSize: 12 } } });
  return data?.items ?? [];
}

export type ProductQuery = {
  categoryIds?: number[];
  search?: string;
  onDeal?: boolean;
  inStock?: boolean;
  minPriceCents?: number | null;
  maxPriceCents?: number | null;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

// One page of products, or null when the API can't answer, so the page can say so
export async function getProducts({ categoryIds, search, onDeal, inStock, minPriceCents, maxPriceCents, sort, page = 1, pageSize = 20 }: ProductQuery) {
  const { data } = await serverApi().GET("/api/products", {
    params: {
      query: {
        categoryId: categoryIds,
        search: search || undefined,
        onDeal: onDeal || undefined,
        inStock: inStock || undefined,
        minPriceCents: minPriceCents ?? undefined,
        maxPriceCents: maxPriceCents ?? undefined,
        sort,
        page,
        pageSize,
      },
    },
  });
  return data ?? null;
}

// Null when there's no such product (or it's no longer sold)
export async function getProduct(id: number): Promise<Product | null> {
  const { data } = await serverApi().GET("/api/products/{id}", { params: { path: { id } } });
  return data ?? null;
}

export async function getRelatedProducts(id: number): Promise<Product[]> {
  const { data } = await serverApi().GET("/api/products/{id}/related", { params: { path: { id } } });
  return data ?? [];
}

// The store's policies as customers see them: shipping, returns, the support email
export async function getStoreSettings(): Promise<StoreSettings | null> {
  const { data } = await serverApi().GET("/api/store");
  return data ?? null;
}
