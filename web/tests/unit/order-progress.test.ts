import { describe, expect, it } from "vitest";
import type { OrderStatus } from "@/lib/api/types";
import { orderProgress } from "@/lib/order-progress";

const step = (status: OrderStatus, changedAtUtc: string) => ({ status, changedAtUtc, note: null });

describe("orderProgress", () => {
  it("marks a new order as placed, with shipping and delivery to come", () => {
    const steps = orderProgress({ status: "pending", timeline: [step("pending", "2026-09-29T14:02:00Z")] });

    expect(steps).toEqual([
      { label: "Placed", state: "current", at: "2026-09-29T14:02:00Z" },
      { label: "Shipped", state: "upcoming", at: null },
      { label: "Delivered", state: "upcoming", at: null },
    ]);
  });

  it("follows a shipped order", () => {
    const steps = orderProgress({
      status: "shipped",
      timeline: [step("pending", "2026-09-29T14:02:00Z"), step("shipped", "2026-09-30T09:15:00Z")],
    });

    expect(steps.map((s) => s.state)).toEqual(["done", "current", "upcoming"]);
    expect(steps[1].at).toBe("2026-09-30T09:15:00Z");
  });

  it("is complete once delivered", () => {
    const steps = orderProgress({
      status: "delivered",
      timeline: [step("pending", "2026-09-29T14:02:00Z"), step("shipped", "2026-09-30T09:15:00Z"), step("delivered", "2026-10-02T16:40:00Z")],
    });

    expect(steps.map((s) => s.state)).toEqual(["done", "done", "done"]);
  });

  it("ends at a cancellation, after the steps the order reached", () => {
    const steps = orderProgress({
      status: "cancelled",
      timeline: [step("pending", "2026-09-29T14:02:00Z"), step("cancelled", "2026-09-29T15:00:00Z")],
    });

    expect(steps).toEqual([
      { label: "Placed", state: "done", at: "2026-09-29T14:02:00Z" },
      { label: "Cancelled", state: "ended", at: "2026-09-29T15:00:00Z" },
    ]);
  });

  it("ends at a refund after delivery", () => {
    const steps = orderProgress({
      status: "refunded",
      timeline: [step("pending", "a"), step("shipped", "b"), step("delivered", "c"), step("refunded", "d")],
    });

    expect(steps.map((s) => s.label)).toEqual(["Placed", "Shipped", "Delivered", "Refunded"]);
    expect(steps.at(-1)?.state).toBe("ended");
  });
});
