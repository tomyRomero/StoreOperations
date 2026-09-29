import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // One in-memory MongoDB for the whole run; each worker gets its own database
    globalSetup: ["tests/setup/global-db.ts"],
    setupFiles: ["tests/setup/env.ts"],
    // The first run downloads the MongoDB binary, and the first write builds indexes
    hookTimeout: 120_000,
    testTimeout: 20_000,
  },
});
