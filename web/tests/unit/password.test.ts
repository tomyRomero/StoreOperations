import { describe, expect, it } from "vitest";
import { newPassword, passwordChecks } from "@/lib/validation/password";

describe("passwordChecks", () => {
  it("ticks each rule as it's met", () => {
    expect(passwordChecks("demo").map((c) => c.met)).toEqual([false, false, false, false]);
    expect(passwordChecks("Demo-Pass-123!").map((c) => c.met)).toEqual([true, true, true, true]);
    expect(passwordChecks("lowercase123").map((c) => c.met)).toEqual([true, false, true, false]);
  });

  it("agrees with the form's validation", () => {
    for (const value of ["demo", "Demo-Pass-123!", "lowercase123", "NoSymbol123", "Sh0rt!"]) {
      expect(passwordChecks(value).every((c) => c.met)).toBe(newPassword.safeParse(value).success);
    }
  });
});
