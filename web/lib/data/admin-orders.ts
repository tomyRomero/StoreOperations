import "server-only";

import { serverApi } from "../api/server";
import type { AdminOrder, OrderStatus } from "../api/types";

// Admin reads for Server Components. The API refuses them to anyone who isn't an admin.

export type AdminOrderFilter = { search?: string; status?: OrderStatus; customerId?: number; page?: number };

// One page of orders, newest first, or null when the API can't answer
export async function getAdminOrders({ search, status, customerId, page = 1 }: AdminOrderFilter) {
  const { data } = await serverApi().GET("/api/admin/orders", {
    params: { query: { search: search || undefined, status, customerId, page, pageSize: 20 } },
  });
  return data ?? null;
}

export async function getAdminOrder(orderNumber: string): Promise<AdminOrder | null> {
  const { data } = await serverApi().GET("/api/admin/orders/{orderNumber}", { params: { path: { orderNumber } } });
  return data ?? null;
}
