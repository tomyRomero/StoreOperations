import "server-only";
import createClient from "openapi-fetch";
import { cookies, headers } from "next/headers";
import { apiUrl } from "./config";
import type { paths } from "./schema";

// Calls the API from Server Components as the visitor: their session cookie goes along, and so does
// their address, so the API's checks, rate limits and logs see the visitor rather than this server.
export function serverApi() {
  const cookie = cookies().toString();
  const forwardedFor = headers().get("x-forwarded-for");

  return createClient<paths>({
    baseUrl: apiUrl,
    headers: {
      ...(cookie && { cookie }),
      ...(forwardedFor && { "x-forwarded-for": forwardedFor }),
    },
    // Answers depend on who is asking and on live stock and prices, so none are cached
    fetch: (request) => fetch(request, { cache: "no-store" }),
  });
}
