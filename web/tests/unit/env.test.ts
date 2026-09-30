import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

const valid = {
  MONGODB_URL: "mongodb://localhost:27017/palettehub",
  NEXTAUTH_URL: "http://localhost:3200",
  NEXTAUTH_SECRET: "x".repeat(32),
  NEXT_PUBLIC_URL: "http://localhost:3200/",
  AXIOS_URL: "http://localhost:3200/",
  AWS_REGION: "us-east-1",
  AWS_ACCESS_KEY_ID: "key",
  AWS_SECRET_ACCESS_KEY: "secret",
  BUCKET_NAME: "bucket",
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  EMAIL_FROM: "Palettehub <orders@palettehub.test>",
};

describe("parseEnv", () => {
  it("accepts a complete local configuration without Stripe", () => {
    const env = parseEnv(valid);
    expect(env.SMTP_PORT).toBe(1025);
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
  });

  it("treats empty optional values as unset", () => {
    const env = parseEnv({ ...valid, S3_ENDPOINT: "", STRIPE_SECRET_KEY: "", SMTP_USER: "" });
    expect(env.S3_ENDPOINT).toBeUndefined();
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
    expect(env.SMTP_USER).toBeUndefined();
  });

  it("accepts Stripe test-mode keys", () => {
    const env = parseEnv({ ...valid, STRIPE_SECRET_KEY: "sk_test_123", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123" });
    expect(env.STRIPE_SECRET_KEY).toBe("sk_test_123");
  });

  it("rejects live Stripe keys", () => {
    expect(() => parseEnv({ ...valid, STRIPE_SECRET_KEY: "sk_live_123" })).toThrow(/STRIPE_SECRET_KEY: must be a Stripe test-mode key/);
    expect(() => parseEnv({ ...valid, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_123" })).toThrow(/test-mode key/);
  });

  it("lists every missing variable in one error", () => {
    const { MONGODB_URL, NEXTAUTH_SECRET, ...rest } = valid;
    expect(() => parseEnv(rest)).toThrow(/MONGODB_URL[\s\S]*NEXTAUTH_SECRET/);
  });

  it("rejects a short auth secret and a non-Mongo database URL", () => {
    expect(() => parseEnv({ ...valid, NEXTAUTH_SECRET: "short" })).toThrow(/at least 32 characters/);
    expect(() => parseEnv({ ...valid, MONGODB_URL: "postgres://localhost/db" })).toThrow(/mongodb/);
  });
});
