import "server-only";

import { serverApi } from "../api/server";
import type { AccountRole, AdminCustomer, AdminCustomerSort } from "../api/types";

// Accounts as admins see them. The API refuses these to anyone who isn't an admin.

export type AdminCustomerFilter = { search?: string; role?: AccountRole; sort?: AdminCustomerSort; page?: number };

export const adminCustomersPageSize = 20;

// One page of accounts (newest first unless sorted otherwise), or null when the API can't answer
export async function getAdminCustomers({ search, role, sort, page = 1 }: AdminCustomerFilter) {
  const { data } = await serverApi().GET("/api/admin/customers", {
    params: { query: { search: search || undefined, role, sort, page, pageSize: adminCustomersPageSize } },
  });
  return data ?? null;
}

// An account with its addresses, latest orders and how much it has spent
export async function getAdminCustomer(id: number): Promise<AdminCustomer | null> {
  const { data } = await serverApi().GET("/api/admin/customers/{id}", { params: { path: { id } } });
  return data ?? null;
}
