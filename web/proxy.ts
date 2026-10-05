import { NextResponse, type NextRequest } from "next/server";
import { sessionCookie } from "./lib/api/config";
import { draftHeader } from "./lib/storefront-draft";

// Pages that need an account
const signedInOnly = ["/account", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  // A smoother experience only: signed-out visitors go straight to sign-in instead of a page that would
  // fail. It only looks for the cookie. The API decides who is really signed in, and the admin layout
  // checks the role.
  if (signedInOnly.some((path) => pathname === path || pathname.startsWith(`${path}/`)) && !request.cookies.has(sessionCookie)) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signIn);
  }

  // The Theme and brand preview: its unsaved values arrive as ?draft= and reach the pages as a header,
  // which they honor only for an admin. A header sent from outside is dropped.
  const headers = new Headers(request.headers);
  headers.delete(draftHeader);
  const draft = searchParams.get("draft");
  if (draft) headers.set(draftHeader, draft);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/", "/about", "/account/:path*", "/admin/:path*"],
};
