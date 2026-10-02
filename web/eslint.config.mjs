import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// Next's recommended rules, including its Core Web Vitals checks
export default defineConfig([
  ...nextCoreWebVitals,
  // Built by Next, or generated from the API's contract
  globalIgnores([".next/**", "next-env.d.ts", "lib/api/schema.d.ts"]),
]);
