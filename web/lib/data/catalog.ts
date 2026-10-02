import "server-only";

import { cache } from "react";
import { serverApi } from "../api/server";
import { applyDraft } from "../storefront-draft";
import { getPreviewDraft } from "./preview";
import type { Category, Product, ProductSort, StoreSettings } from "../api/types";

// The public catalog for Server Components, from the API. What every page's frame needs (the categories,
// whether there's a sale, the store's settings) is asked once per request and shared by the layouts, the
// page and its metadata.

export const getCategories = cache(async (): Promise<Category[]> => {
  const { data } = await serverApi().GET("/api/categories");
  return data ?? [];
});

export async function getDeals(): Promise<Product[]> {
  const { data } = await serverApi().GET("/api/products", { params: { query: { onDeal: true, pageSize: 12 } } });
  return data?.items ?? [];
}

// Whether anything is on a deal right now, so the store only offers a Sale link that leads somewhere
export const hasDeals = cache(async (): Promise<boolean> => {
  const { data } = await serverApi().GET("/api/products", { params: { query: { onDeal: true, pageSize: 1 } } });
  return (data?.items.length ?? 0) > 0;
});

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

// How many products a category has and its lowest price, for the home page's category tiles
export async function getCategorySummary(categoryId: number): Promise<{ count: number; fromCents: number | null }> {
  const page = await getProducts({ categoryIds: [categoryId], sort: "cheapest", pageSize: 1 });
  return { count: page?.totalCount ?? 0, fromCents: page?.items[0]?.priceCents ?? null };
}

// How many products can be bought right now, or null when the API can't say
export async function countInStock(): Promise<number | null> {
  const page = await getProducts({ inStock: true, pageSize: 1 });
  return page?.totalCount ?? null;
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

// The store's policies and storefront as customers see them. In an admin's Theme and brand preview, the
// form's unsaved values are laid over them.
export const getStoreSettings = cache(async (): Promise<StoreSettings | null> => {
  const [{ data }, draft] = await Promise.all([serverApi().GET("/api/store"), getPreviewDraft()]);
  if (!data) return null;
  return draft ? applyDraft(data, draft) : data;
});
