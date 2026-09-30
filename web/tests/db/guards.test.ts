import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";
import User from "@/lib/models/user.model";
import { AuthError, getSessionUser, requireAdmin, requireUser } from "@/lib/guards";
import { clearTestDb, connectTestDb, disconnectTestDb } from "../helpers/db";
import { signInAs } from "../helpers/session";
import { createUser } from "../helpers/factories";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(disconnectTestDb);

const expectAuthError = async (promise: Promise<unknown>, status: 401 | 403) => {
  const error: any = await promise.catch((e) => e);
  expect(error).toBeInstanceOf(AuthError);
  expect(error.status).toBe(status);
};

describe("requireUser", () => {
  it("refuses anonymous visitors", async () => {
    signInAs(null);
    await expectAuthError(requireUser(), 401);
  });

  it("refuses a session whose account no longer exists", async () => {
    signInAs({ id: new Types.ObjectId().toString() });
    await expectAuthError(requireUser(), 401);
  });

  it("refuses a session with a malformed id", async () => {
    signInAs({ id: "not-an-object-id" });
    await expect(getSessionUser()).resolves.toBeNull();
  });

  it("returns the signed-in customer", async () => {
    const customer = await createUser();
    signInAs(customer);
    await expect(requireUser()).resolves.toEqual({ id: customer.id, admin: false });
  });
});

describe("requireAdmin", () => {
  it("refuses customers", async () => {
    const customer = await createUser();
    signInAs(customer);
    await expectAuthError(requireAdmin(), 403);
  });

  it("allows admins", async () => {
    const admin = await createUser({ admin: true });
    signInAs(admin);
    await expect(requireAdmin()).resolves.toEqual({ id: admin.id, admin: true });
  });

  it("refuses a demoted admin whose session still claims admin", async () => {
    const admin = await createUser({ admin: true });
    signInAs({ id: admin.id, admin: true });
    await User.updateOne({ _id: admin.id }, { admin: false });
    await expectAuthError(requireAdmin(), 403);
  });
});
