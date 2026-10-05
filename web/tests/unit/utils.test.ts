import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps a type-scale size and a text color together", () => {
    expect(cn("text-h2", "text-sale")).toBe("text-h2 text-sale");
  });

  it("lets a later size replace a type-scale size", () => {
    expect(cn("text-h2", "text-h4")).toBe("text-h4");
  });

  it("lets a field's corners be replaced", () => {
    expect(cn("rounded-field px-3.5", "rounded-full")).toBe("px-3.5 rounded-full");
  });
});
