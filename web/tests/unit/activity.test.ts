import { describe, expect, it } from "vitest";
import { describeActivity, groupByDay } from "@/lib/activity";
import type { ActivityEntry } from "@/lib/api/types";

const entry = (fields: Partial<ActivityEntry>): ActivityEntry => ({
  id: 1,
  occurredAtUtc: "2026-09-30T12:00:00Z",
  action: "order_created",
  entityType: null,
  entityId: null,
  actor: null,
  details: null,
  ...fields,
});

describe("activity sentences", () => {
  it("say who did what and link to it", () => {
    expect(describeActivity(entry({
      action: "order_status_changed",
      entityType: "order",
      entityId: 7,
      actor: "demo-admin",
      details: { orderNumber: "SEED0003", from: "pending", to: "cancelled", refundedCents: 6596 },
    }))).toEqual({ text: "demo-admin marked order #SEED0003 cancelled and refunded $65.96", href: "/admin/orders/SEED0003" });
  });

  it("still read when an entry has no details", () => {
    expect(describeActivity(entry({ action: "order_created" }))).toEqual({ text: "New order", href: undefined });
    expect(describeActivity(entry({ action: "user_registered", entityId: 2 }))).toEqual({ text: "Someone created an account", href: "/admin/customers/2" });
  });

  it("name a renamed category's old and new names", () => {
    expect(describeActivity(entry({
      action: "category_updated", entityId: 3, actor: "demo-admin", details: { name: "Paints", previousName: "Paint" },
    })).text).toBe("demo-admin renamed the Paint category to Paints");
  });
});

describe("activity by day", () => {
  const now = new Date("2026-10-01T15:00:00Z");
  const at = (occurredAtUtc: string) => ({ occurredAtUtc });

  it("groups by the store's day, newest first", () => {
    const groups = groupByDay([at("2026-10-01T14:00:00Z"), at("2026-10-01T05:00:00Z"), at("2026-09-30T20:00:00Z"), at("2026-09-28T12:00:00Z")], "America/New_York", now);
    expect(groups.map((g) => [g.label, g.entries.length])).toEqual([
      ["Today", 2],
      ["Yesterday", 1],
      ["Sep 28, 2026", 1],
    ]);
  });

  it("uses the store's time zone, not UTC", () => {
    // 2 am UTC on Oct 1 is still Sep 30 in New York
    const groups = groupByDay([at("2026-10-01T02:00:00Z")], "America/New_York", now);
    expect(groups[0].label).toBe("Yesterday");
  });
});
