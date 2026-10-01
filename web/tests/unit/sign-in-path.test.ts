import { describe, expect, it } from "vitest";
import { safeReturnPath, signInPath } from "@/lib/sign-in-path";

describe("signInPath", () => {
  it("comes back to the page, query string included", () => {
    expect(signInPath("/ordersuccess?payment_intent=pi_1")).toBe("/sign-in?callbackUrl=%2Fordersuccess%3Fpayment_intent%3Dpi_1");
  });
});

describe("safeReturnPath", () => {
  it.each(["/cart", "/account/orders/SEED0001", "/products?categories=1,2"])("keeps the site's own path %s", (path) => {
    expect(safeReturnPath(path)).toBe(path);
  });

  // A crafted sign-in link must not send someone to another site after they sign in
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "", null, undefined])(
    "sends %j home instead",
    (value) => {
      expect(safeReturnPath(value)).toBe("/");
    },
  );
});
