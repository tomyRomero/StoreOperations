import "server-only";

import { serverApi } from "../api/server";
import type { GuestOrder } from "../api/types";

// A guest's order, from the private link in its emails, or null when the link matches no order
export async function getGuestOrder(accessToken: string): Promise<GuestOrder | null> {
  const { data } = await serverApi().GET("/api/orders/{accessToken}", { params: { path: { accessToken } } });
  return data ?? null;
}
