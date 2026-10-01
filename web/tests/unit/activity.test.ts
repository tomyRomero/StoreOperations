import { describe, expect, it } from "vitest";
import { describeActivity } from "@/lib/activity";
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
    }))).toEqual({ text: "demo-admin marked order #SEED0003 cancelled and refunded $65.96", href: "/adminorders/SEED0003" });
  });

  it("still read when an entry has no details", () => {
    expect(describeActivity(entry({ action: "order_created" }))).toEqual({ text: "New order", href: undefined });
    expect(describeActivity(entry({ action: "user_registered", entityId: 2 }))).toEqual({ text: "Someone created an account", href: "/adminusers/2" });
  });

  it("name a renamed category's old and new names", () => {
    expect(describeActivity(entry({
      action: "category_updated", entityId: 3, actor: "demo-admin", details: { name: "Paints", previousName: "Paint" },
    })).text).toBe("demo-admin renamed the Paint category to Paints");
  });
});
