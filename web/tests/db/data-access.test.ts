import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError } from "@/lib/guards";
import * as admin from "@/lib/data/admin";
import { clearTestDb, connectTestDb, disconnectTestDb } from "../helpers/db";
import { signInAs } from "../helpers/session";
import { createUser } from "../helpers/factories";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(disconnectTestDb);

// Every admin read, called the way a page calls it. Adding a new admin read without
// a guard makes this table fail.
const adminReads: [string, () => Promise<unknown>][] = [
  ["fetchUsers", () => admin.fetchUsers({})],
  ["getUserForAdmin", () => admin.getUserForAdmin("64b000000000000000000000")],
  ["getAddressesForUser", () => admin.getAddressesForUser("64b000000000000000000000")],
  ["getAllCategoriesAdmin", () => admin.getAllCategoriesAdmin({})],
  ["findProductsAdmin", () => admin.findProductsAdmin({})],
  ["findProductForDeal", () => admin.findProductForDeal("any")],
  ["getAllActivity", () => admin.getAllActivity()],
  ["getAllSubscribedEmails", () => admin.getAllSubscribedEmails()],
];

describe("admin reads", () => {
  it("cover every function the admin data module exports", () => {
    expect(adminReads.map(([name]) => name).sort()).toEqual(Object.keys(admin).sort());
  });

  it.each(adminReads)("%s refuses customers", async (_name, call) => {
    signInAs(await createUser());
    const error: any = await call().catch((e) => e);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.status).toBe(403);
  });

  it.each(adminReads)("%s refuses anonymous visitors", async (_name, call) => {
    signInAs(null);
    const error: any = await call().catch((e) => e);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.status).toBe(401);
  });

  it.each(adminReads)("%s works for admins", async (_name, call) => {
    signInAs(await createUser({ admin: true }));
    await expect(call()).resolves.toBeDefined();
  });

  it("returns users without password hashes", async () => {
    await createUser();
    signInAs(await createUser({ admin: true }));
    const { users } = await admin.fetchUsers({});
    expect(users.length).toBe(2);
    for (const user of users) expect((user as any).toObject().password).toBeUndefined();
  });
});
