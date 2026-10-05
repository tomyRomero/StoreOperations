import "server-only";

import { serverApi } from "../api/server";
import type { AdminCategory, AdminProduct, AdminProductSort, ProductStatus, StockLevel } from "../api/types";

// The catalog as admins manage it, archived products included. The API refuses these to anyone who
// isn't an admin.

export type AdminProductFilter = {
  search?: string;
  status?: ProductStatus;
  categoryId?: number;
  stock?: StockLevel;
  onDeal?: boolean;
  sort?: AdminProductSort;
  page?: number;
};

export const adminProductsPageSize = 20;

// One page of products (newest first unless sorted otherwise), or null when the API can't answer
export async function getAdminProducts({ search, status, categoryId, stock, onDeal, sort, page = 1 }: AdminProductFilter) {
  const { data } = await serverApi().GET("/api/admin/products", {
    params: {
      query: { search: search || undefined, status, categoryId, stock, onDeal: onDeal || undefined, sort, page, pageSize: adminProductsPageSize },
    },
  });
  return data ?? null;
}

export async function getAdminProduct(id: number): Promise<AdminProduct | null> {
  const { data } = await serverApi().GET("/api/admin/products/{id}", { params: { path: { id } } });
  return data ?? null;
}

// Every category, with how many products each has and whether it can be deleted
export async function getAdminCategories(): Promise<AdminCategory[] | null> {
  const { data } = await serverApi().GET("/api/admin/categories");
  return data ?? null;
}

export async function getAdminCategory(id: number): Promise<AdminCategory | null> {
  const { data } = await serverApi().GET("/api/admin/categories/{id}", { params: { path: { id } } });
  return data ?? null;
}
