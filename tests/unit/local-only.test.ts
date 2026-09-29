import { describe, expect, it } from "vitest";
import { assertLocal } from "@/scripts/local-only";

describe("assertLocal", () => {
  it.each([
    "mongodb://localhost:27017/palettehub",
    "mongodb://127.0.0.1:27017/palettehub",
    "mongodb://mongo:27017/palettehub",
    "http://localhost:9090",
    "http://s3:9090",
  ])("allows local service %s", (url) => {
    expect(() => assertLocal("URL", url)).not.toThrow();
  });

  it.each([
    "mongodb+srv://user:pass@cluster0.example.mongodb.net/palettehub",
    "mongodb://db.example.com:27017/palettehub",
    "https://s3.us-east-2.amazonaws.com",
  ])("refuses remote service %s", (url) => {
    expect(() => assertLocal("URL", url)).toThrow(/Refusing to run/);
  });

  it("refuses when the URL is missing", () => {
    expect(() => assertLocal("S3_ENDPOINT", undefined)).toThrow(/not set/);
  });
});
