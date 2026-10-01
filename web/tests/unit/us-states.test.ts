import { describe, expect, it } from "vitest";
import { stateName } from "@/lib/us-states";

describe("stateName", () => {
  it("names a state from its postal code", () => {
    expect(stateName("IL")).toBe("Illinois");
    expect(stateName("DC")).toBe("District of Columbia");
  });

  it("leaves an unknown code as it was", () => {
    expect(stateName("ZZ")).toBe("ZZ");
  });
});
