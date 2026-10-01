import "server-only";

import { serverApi } from "../api/server";
import type { Address, Order } from "../api/types";

// The signed-in customer's own data, for Server Components. The API limits every call to the session's
// account, so another customer's order simply isn't found.

export async function getAddresses(): Promise<Address[] | null> {
  const { data } = await serverApi().GET("/api/account/addresses");
  return data ?? null;
}

// One page of orders, newest first, or null when the API can't answer
export async function getOrders(page: number, pageSize = 10) {
  const { data } = await serverApi().GET("/api/account/orders", { params: { query: { page, pageSize } } });
  return data ?? null;
}

export async function getOrder(orderNumber: string): Promise<Order | null> {
  const { data } = await serverApi().GET("/api/account/orders/{orderNumber}", { params: { path: { orderNumber } } });
  return data ?? null;
}
