import { describe, expect, it } from "vitest";
import { change, labelIndexes, niceTicks, parseRange } from "@/lib/dashboard";
import { formatMoneyShort } from "@/lib/money";

describe("dashboard range", () => {
  it("accepts only the offered periods, defaulting to 30 days", () => {
    expect(parseRange("7")).toBe(7);
    expect(parseRange("90")).toBe(90);
    expect(parseRange(undefined)).toBe(30);
    expect(parseRange("12")).toBe(30);
    expect(parseRange(["7", "90"])).toBe(7);
  });
});

describe("change against the previous period", () => {
  it("is a whole percentage up or down", () => {
    expect(change({ value: 150, previous: 100 })).toEqual({ direction: "up", percent: 50 });
    expect(change({ value: 2, previous: 3 })).toEqual({ direction: "down", percent: 33 });
  });

  it("says when nothing changed", () => {
    expect(change({ value: 10, previous: 10 })).toEqual({ direction: "same", percent: 0 });
    expect(change({ value: 1000, previous: 1001 })).toEqual({ direction: "same", percent: 0 });
  });

  it("has no percentage when the period before had nothing", () => {
    expect(change({ value: 5, previous: 0 })).toBeNull();
  });
});

describe("axis ticks", () => {
  it("start at zero and step in round numbers past the largest value", () => {
    expect(niceTicks(7300)).toEqual([0, 2000, 4000, 6000, 8000]);
    expect(niceTicks(10_000)).toEqual([0, 2500, 5000, 7500, 10_000]);
    expect(niceTicks(95)).toEqual([0, 25, 50, 75, 100]);
  });

  it("are just zero when there is nothing to show", () => {
    expect(niceTicks(0)).toEqual([0]);
  });
});

describe("date labels", () => {
  it("label every point when they all fit", () => {
    expect(labelIndexes(7, 8)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("spread the labels evenly, keeping the first and last", () => {
    expect(labelIndexes(30, 5)).toEqual([0, 7, 15, 22, 29]);
    expect(labelIndexes(90, 2)).toEqual([0, 89]);
  });
});

describe("short money", () => {
  it("keeps axis labels short", () => {
    expect(formatMoneyShort(25_000)).toBe("$250");
    expect(formatMoneyShort(250_000)).toBe("$2.5K");
    expect(formatMoneyShort(0)).toBe("$0");
  });
});
