import "server-only";
import createClient from "openapi-fetch";
import { cookies, headers } from "next/headers";
import { apiUrl } from "./config";
import type { paths } from "./schema";

// Calls the API from Server Components as the visitor: their session cookie goes along, and so does
// their address, so the API's checks, rate limits and logs see the visitor rather than this server.
export function serverApi() {
  return createClient<paths>({
    baseUrl: apiUrl,
    // Next's request APIs are async, so the visitor's cookie and address are read as each call goes out
    fetch: async (request) => {
      const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
      const cookie = cookieStore.toString();
      const forwardedFor = requestHeaders.get("x-forwarded-for");
      if (cookie) request.headers.set("cookie", cookie);
      if (forwardedFor) request.headers.set("x-forwarded-for", forwardedFor);

      // Answers depend on who is asking and on live stock and prices, so none are cached
      return fetch(request, { cache: "no-store" });
    },
  });
}
