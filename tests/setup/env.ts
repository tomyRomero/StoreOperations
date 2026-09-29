import { inject } from "vitest";

// A complete, valid environment for tests. Each worker uses its own database,
// so test files running in parallel never see each other's data.
const worker = process.env.VITEST_POOL_ID ?? "0";

Object.assign(process.env, {
  NODE_ENV: "test",
  MONGODB_URL: `${inject("mongoUri")}palettehub_test_${worker}`,
  NEXTAUTH_URL: "http://localhost:3200",
  NEXTAUTH_SECRET: "test-secret-that-is-at-least-32-characters-long",
  NEXT_PUBLIC_URL: "http://localhost:3200/",
  AXIOS_URL: "http://localhost:3200/",
  AWS_REGION: "us-east-1",
  AWS_ACCESS_KEY_ID: "test",
  AWS_SECRET_ACCESS_KEY: "test",
  BUCKET_NAME: "palettehub-test",
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  EMAIL_FROM: "Palettehub <orders@palettehub.test>",
});
