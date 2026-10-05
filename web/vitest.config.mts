import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the web app's own logic. Everything the API decides is tested in the API's own suite.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Behind UTC, so a date shown in the wrong time zone is a day off and fails on any machine, CI's
    // (which runs in UTC) included
    env: { TZ: "America/Los_Angeles" },
  },
});
