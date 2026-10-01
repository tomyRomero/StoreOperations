// Where the .NET API listens (the same default as lib/api/config.ts). Read when building: the rewrite's
// destination is fixed in the build, so API_URL must be set for `next build` as well as `next start`.
const apiUrl = process.env.API_URL ?? "http://localhost:5200";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      // Every /api/* request goes to the .NET API, before Next looks at its own routes. The browser only
      // ever talks to this site, so the API's sign-in cookie just works and no cross-site setup is needed.
      // Next passes the browser's X-Forwarded-For on unchanged: in production the proxy in front of Next
      // must set it, or the API's per-visitor rate limits see every visitor as this server.
      beforeFiles: [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }],
    };
  },
};

export default nextConfig;
