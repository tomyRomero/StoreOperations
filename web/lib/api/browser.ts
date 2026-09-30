import createClient from "openapi-fetch";
import type { paths } from "./schema";

// Calls the API from the browser through this site's own /api/*, which Next passes on to the API.
// The session cookie comes along by itself, and there's no cross-site setup to secure.
export const api = createClient<paths>({ baseUrl: "" });
