import "server-only";

import { serverApi } from "../api/server";
import type { AdminOrder, AdminOrderSort, OrderStatus } from "../api/types";

// Admin reads for Server Components. The API refuses them to anyone who isn't an admin.

export type AdminOrderFilter = { search?: string; status?: OrderStatus; customerId?: number; sort?: AdminOrderSort; page?: number };

export const adminOrdersPageSize = 20;

// One page of orders (newest first unless sorted otherwise), or null when the API can't answer
export async function getAdminOrders({ search, status, customerId, sort, page = 1 }: AdminOrderFilter) {
  const { data } = await serverApi().GET("/api/admin/orders", {
    params: { query: { search: search || undefined, status, customerId, sort, page, pageSize: adminOrdersPageSize } },
  });
  return data ?? null;
}

export async function getAdminOrder(orderNumber: string): Promise<AdminOrder | null> {
  const { data } = await serverApi().GET("/api/admin/orders/{orderNumber}", { params: { path: { orderNumber } } });
  return data ?? null;
}

// How many orders have a status, such as the paid orders still waiting to ship. Null when the API can't answer.
export async function countOrders(status: OrderStatus): Promise<number | null> {
  const { data } = await serverApi().GET("/api/admin/orders", { params: { query: { status, pageSize: 1 } } });
  return data?.totalCount ?? null;
}
