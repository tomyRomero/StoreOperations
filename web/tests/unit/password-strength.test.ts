import { describe, expect, it } from "vitest";
import { passwordStrength } from "@/lib/validation/password-strength";

const label = (password: string, personal?: string[]) => passwordStrength(password, personal).label;

describe("passwordStrength", () => {
  it("says nothing before anything is typed", () => {
    expect(passwordStrength("")).toEqual({ score: 0, label: "", hint: null });
  });

  it("calls passwords that meet every rule but are guessed first weak", () => {
    expect(label("Password1!")).toBe("Weak");
    expect(label("P@ssw0rd123!")).toBe("Weak");
    expect(label("Qwerty123!")).toBe("Weak");
    expect(label("Aaaaaaaaaa1!")).toBe("Weak");
    expect(label("Summer2024!")).toBe("Weak");
  });

  it("calls the person's own name weak", () => {
    expect(label("Tomasz!1987", ["tomasz", "t.romero@example.test"])).toBe("Weak");
    expect(passwordStrength("Tomasz!1987", ["tomasz"]).hint).toMatch(/name and email/);
  });

  it("rewards length and randomness", () => {
    expect(label("Demo-Pass-123!")).toBe("Good");
    expect(label("xK9#mW2$vL")).toBe("Strong");
    expect(label("correct-horse-battery-staple")).toBe("Strong");
  });

  it("explains what makes a weak password weak", () => {
    expect(passwordStrength("Qwerty123!").hint).toMatch(/qwerty|Common words/);
  });
});
