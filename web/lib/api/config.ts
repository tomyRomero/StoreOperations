// Where the .NET API listens. The browser never uses it: it calls this site's /api/*, which Next
// passes on to this address (next.config.mjs). Server code calls it directly.
export const apiUrl = process.env.API_URL ?? "http://localhost:5200";
