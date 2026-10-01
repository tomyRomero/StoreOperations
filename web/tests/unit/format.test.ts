import { describe, expect, it } from "vitest";
import { addressLines, addressOneLine, formatDate, formatDay, orderStatusLabel, stockLabel } from "@/lib/format";
import type { PostalAddress } from "@/lib/api/types";

describe("formatDate", () => {
  // 11:30 pm in New York on Sep 30 is already Oct 1 in UTC
  const lateEvening = "2026-10-01T03:30:00Z";

  it("uses the store's calendar, not the server's", () => {
    expect(formatDate(lateEvening, "America/New_York")).toBe("Sep 30, 2026");
    expect(formatDate(lateEvening, "UTC")).toBe("Oct 1, 2026");
  });
});

describe("formatDay", () => {
  it("shows a date without a time as written, whatever the time zone", () => {
    expect(formatDay("2026-10-06")).toBe("Oct 6, 2026");
    expect(formatDay("2026-01-01")).toBe("Jan 1, 2026");
  });
});

describe("addresses", () => {
  const full: PostalAddress = {
    recipientName: "Ada Lovelace",
    line1: "1 Main St",
    line2: "Apt 4",
    city: "Springfield",
    state: "IL",
    postalCode: "62701",
    countryCode: "US",
  };

  it("lists the lines a label needs, skipping empty ones", () => {
    expect(addressLines(full)).toEqual(["1 Main St", "Apt 4", "Springfield, IL 62701", "US"]);
    expect(addressLines({ ...full, line2: null, state: null })).toEqual(["1 Main St", "Springfield, 62701", "US"]);
  });

  it("fits on one line for a dropdown", () => {
    expect(addressOneLine(full)).toBe("Ada Lovelace, 1 Main St, Apt 4, Springfield, IL 62701");
  });
});

describe("orderStatusLabel", () => {
  it("says what a pending order is waiting for", () => {
    expect(orderStatusLabel("pending")).toBe("Preparing to ship");
    expect(orderStatusLabel("refunded")).toBe("Refunded");
  });
});

describe("stockLabel", () => {
  it("says how many are left at or under the low-stock threshold", () => {
    expect(stockLabel(3, 5)).toBe("Only 3 left");
    expect(stockLabel(5, 5)).toBe("Only 5 left");
  });

  it("says in stock above it, and sold out at zero", () => {
    expect(stockLabel(6, 5)).toBe("In stock");
    expect(stockLabel(0, 5)).toBe("Sold out");
  });
});
