import "server-only";

import { serverApi } from "../api/server";
import type { AdminSettings } from "../api/types";

// The store as a whole, for the admin pages: its settings. The API refuses these to anyone who isn't an admin.

export async function getAdminSettings(): Promise<AdminSettings | null> {
  const { data } = await serverApi().GET("/api/admin/settings");
  return data ?? null;
}
