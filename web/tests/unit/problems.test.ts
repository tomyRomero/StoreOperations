import { describe, expect, it } from "vitest";
import { fieldErrors, problemMessage } from "@/lib/api/problems";

describe("problemMessage", () => {
  it("says the store couldn't be reached when there's no answer", () => {
    expect(problemMessage(undefined)).toMatch(/couldn't reach the store/);
  });

  it("rewords the few codes the site words differently", () => {
    expect(problemMessage({ status: 429, code: "RATE_LIMITED", detail: "Too many requests." })).toMatch(/wait a moment/);
  });

  it("points at the form when fields are wrong", () => {
    expect(problemMessage({ status: 400, errors: { email: ["Enter an email."] } })).toBe("Please check the highlighted fields.");
  });

  it("otherwise uses the API's own sentence", () => {
    expect(problemMessage({ status: 503, code: "PAYMENTS_NOT_CONFIGURED", detail: "Payments aren't set up on this store yet." }))
      .toBe("Payments aren't set up on this store yet.");
  });
});

describe("fieldErrors", () => {
  it("keeps the first message for each field, by its JSON name", () => {
    expect(fieldErrors({ errors: { email: ["Enter an email.", "Too long."], password: [] } })).toEqual({ email: "Enter an email." });
  });

  it("is empty for anything that isn't a problem", () => {
    expect(fieldErrors(undefined)).toEqual({});
    expect(fieldErrors("oops")).toEqual({});
  });
});
