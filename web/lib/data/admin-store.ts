import "server-only";

import { serverApi } from "../api/server";
import type { ActivityEntity, AdminSettings } from "../api/types";

// The store as a whole, for the admin pages: settings, the activity log and the newsletter. The API refuses
// these to anyone who isn't an admin.

export async function getAdminSettings(): Promise<AdminSettings | null> {
  const { data } = await serverApi().GET("/api/admin/settings");
  return data ?? null;
}

// The activity log, newest first: everything customers and admins did, optionally about one kind of thing
export async function getActivity({ entityType, page = 1 }: { entityType?: ActivityEntity; page?: number }) {
  const { data } = await serverApi().GET("/api/admin/activity", { params: { query: { entityType, page, pageSize: 20 } } });
  return data ?? null;
}

// Newsletter subscribers, newest first
export async function getSubscribers({ search, page = 1 }: { search?: string; page?: number }) {
  const { data } = await serverApi().GET("/api/admin/newsletter/subscribers", {
    params: { query: { search: search || undefined, page, pageSize: 20 } },
  });
  return data ?? null;
}
