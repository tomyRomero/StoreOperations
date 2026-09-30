import { withAuth } from "next-auth/middleware";

// A first line of defense for page navigation. The real checks run on the server
// in every action, data function and API route (lib/guards.ts), because Next.js
// runs server actions before any layout, and this middleware reads the session
// token, which can be up to 30 days old.

const adminPrefixes = [
  "/adminactivity",
  "/adminusers",
  "/admincategories",
  "/adminaddcategory",
  "/adminproducts",
  "/adminaddproduct",
  "/adminorders",
  "/adminnewsletter",
];

export default withAuth({
  pages: { signIn: "/sign-in" },
  callbacks: {
    authorized: ({ req, token }) => {
      if (!token) return false;
      const isAdminPage = adminPrefixes.some((prefix) => req.nextUrl.pathname.startsWith(prefix));
      return isAdminPage ? token.admin === true : true;
    },
  },
});

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
  ],
};
