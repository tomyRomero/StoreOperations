import { describe, expect, it } from "vitest";
import { dollarsText, formatMoney, parseDollars } from "@/lib/money";

describe("formatMoney", () => {
  it.each([
    [1850, "$18.50"],
    [5, "$0.05"],
    [0, "$0.00"],
    [123456, "$1,234.56"],
  ])("shows %i cents as %s", (cents, text) => {
    expect(formatMoney(cents)).toBe(text);
  });
});

describe("parseDollars", () => {
  it.each([
    ["18", 1800],
    ["18.5", 1850],
    ["18.50", 1850],
    [" 7.05 ", 705],
    ["0", 0],
    // Floating point would make this 28 cents
    ["0.29", 29],
    ["1.15", 115],
  ])("reads %j as %i cents", (text, cents) => {
    expect(parseDollars(text)).toBe(cents);
  });

  it.each(["", "abc", "18.505", "-1", "1e3", "$18", "18,50", "12345678"])("refuses %j", (text) => {
    expect(parseDollars(text)).toBeNull();
  });
});

describe("dollarsText", () => {
  it("starts a price field from cents", () => {
    expect(dollarsText(1850)).toBe("18.50");
    expect(dollarsText(5)).toBe("0.05");
  });

  it("reads back to the same cents", () => {
    for (const cents of [1, 29, 115, 1850, 9999999]) expect(parseDollars(dollarsText(cents))).toBe(cents);
  });
});
