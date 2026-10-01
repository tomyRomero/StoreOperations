import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { signInPath } from "./sign-in-path";
import { sessionCookie } from "./api/config";
import { serverApi } from "./api/server";
import type { CurrentUser } from "./api/types";

// Who is signed in, asked once per request: React's cache shares the answer between the layout and the page.
// The API checks the cookie, so an expired or signed-out session is simply null.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!(await cookies()).has(sessionCookie)) return null;
  const { data } = await serverApi().GET("/api/auth/me");
  return data ?? null;
});

// For pages that need an account: sends signed-out visitors to sign in, then back here
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(signInPath(returnTo));
  return user;
}

// The admin pages don't exist for anyone else. The API refuses their requests either way.
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();
  return user;
}
