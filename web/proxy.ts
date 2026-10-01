import { NextResponse, type NextRequest } from "next/server";
import { sessionCookie } from "./lib/api/config";

// A smoother experience only: signed-out visitors go straight to sign-in instead of a page that
// would fail. It only looks for the cookie. The API decides who is really signed in, and the admin
// layout checks the role.
export function proxy(request: NextRequest) {
  if (request.cookies.has(sessionCookie)) return NextResponse.next();

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/account/:path*",
    "/address",
    "/checkout",
    "/ordersuccess",
    "/adminactivity",
    "/adminusers/:path*",
    "/admincategories",
    "/adminaddcategory/:path*",
    "/adminproducts",
    "/adminaddproduct/:path*",
    "/adminorders/:path*",
    "/adminnewsletter",
    "/adminsettings",
  ],
};
