import type { Comparison } from "./api/types";

// The dashboard's periods, in days. 30 is the default and stays out of the address.
export const dashboardRanges = [7, 30, 90] as const;
export type DashboardRange = (typeof dashboardRanges)[number];

export function parseRange(value: string | string[] | undefined): DashboardRange {
  const days = Number(Array.isArray(value) ? value[0] : value);
  return dashboardRanges.find((range) => range === days) ?? 30;
}

export type Change = { direction: "up" | "down" | "same"; percent: number };

// This period against the one before, as a whole percentage. Null when there's nothing to compare
// with, because growth from zero isn't a percentage.
export function change({ value, previous }: Comparison): Change | null {
  if (previous === 0) return null;
  const percent = Math.round((Math.abs(value - previous) / previous) * 100);
  if (percent === 0) return { direction: "same", percent: 0 };
  return { direction: value > previous ? "up" : "down", percent };
}

// Axis ticks from zero in round steps (1, 2, 2.5 or 5 times a power of ten), the last one at or
// above the largest value
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((candidate) => candidate >= rough) ?? 10 * power;
  const steps = Math.ceil(max / step);
  return Array.from({ length: steps + 1 }, (_, i) => i * step);
}

// Which of n points get a date label when only `fit` labels fit: evenly spread, always the first and last
export function labelIndexes(n: number, fit: number): number[] {
  if (n <= 0) return [];
  if (n <= fit) return Array.from({ length: n }, (_, i) => i);
  const slots = Math.max(2, fit);
  const picked = Array.from({ length: slots }, (_, i) => Math.round((i * (n - 1)) / (slots - 1)));
  return [...new Set(picked)];
}
