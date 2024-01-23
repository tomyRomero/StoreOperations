import { authMiddleware} from "@clerk/nextjs";

export default authMiddleware({
  // An array of public routes that don't require authentication.
  publicRoutes: ["/", "/sign-up", "/sign-in"],

  // An array of routes to be ignored by the authentication middleware.
  ignoredRoutes: [],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
