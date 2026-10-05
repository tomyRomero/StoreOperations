import type { Order } from "./api/types";

// The steps an order goes through, for the tracking timeline: Placed, Shipped, Delivered. An order that
// was cancelled or refunded ends there instead, after the steps it did reach.

export type ProgressStep = {
  label: string;
  state: "done" | "current" | "upcoming" | "ended";
  // When the order reached this step (UTC), from its history
  at: string | null;
};

const flow = [
  { status: "pending", label: "Placed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
] as const;

export function orderProgress(order: Pick<Order, "status" | "timeline">): ProgressStep[] {
  // The latest time the order entered each status
  const reached = new Map<string, string>();
  for (const step of order.timeline) reached.set(step.status, step.changedAtUtc);

  if (order.status === "cancelled" || order.status === "refunded") {
    const before = flow
      .filter((step) => reached.has(step.status))
      .map((step) => ({ label: step.label, state: "done" as const, at: reached.get(step.status) ?? null }));
    return [...before, { label: order.status === "cancelled" ? "Cancelled" : "Refunded", state: "ended", at: reached.get(order.status) ?? null }];
  }

  const current = flow.findIndex((step) => step.status === order.status);
  return flow.map((step, index) => ({
    label: step.label,
    state: index < current ? "done" : index === current ? (index === flow.length - 1 ? "done" : "current") : "upcoming",
    at: index <= current ? (reached.get(step.status) ?? null) : null,
  }));
}
