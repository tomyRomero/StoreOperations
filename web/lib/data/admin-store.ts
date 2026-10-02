import "server-only";

import { serverApi } from "../api/server";
import type { ActivityEntity, AdminSettings, AdminStorefront, Dashboard } from "../api/types";

// The store as a whole, for the admin pages: settings, the activity log and the newsletter. The API refuses
// these to anyone who isn't an admin.

// How the store did over the last `days` days (in its time zone), against the days before
export async function getDashboard(days: number): Promise<Dashboard | null> {
  const { data } = await serverApi().GET("/api/admin/dashboard", { params: { query: { days } } });
  return data ?? null;
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  const { data } = await serverApi().GET("/api/admin/settings");
  return data ?? null;
}

// Theme and brand: the storefront's look and words, with the version it was read at
export async function getAdminStorefront(): Promise<AdminStorefront | null> {
  const { data } = await serverApi().GET("/api/admin/storefront");
  return data ?? null;
}

// The activity log, newest first: everything customers and admins did, optionally about one kind of thing
export const activityPageSize = 30;
export const subscribersPageSize = 20;

export async function getActivity({ entityType, page = 1 }: { entityType?: ActivityEntity; page?: number }) {
  const { data } = await serverApi().GET("/api/admin/activity", { params: { query: { entityType, page, pageSize: activityPageSize } } });
  return data ?? null;
}

// Newsletter subscribers, newest first
export async function getSubscribers({ search, page = 1 }: { search?: string; page?: number }) {
  const { data } = await serverApi().GET("/api/admin/newsletter/subscribers", {
    params: { query: { search: search || undefined, page, pageSize: subscribersPageSize } },
  });
  return data ?? null;
}
