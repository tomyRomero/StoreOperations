import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import Orders from "@/lib/models/orders.model";
import Cart from "@/lib/models/cart.model";
import { AuthError } from "@/lib/guards";
import * as account from "@/lib/data/account";
import * as admin from "@/lib/data/admin";
import { clearTestDb, connectTestDb, disconnectTestDb } from "../helpers/db";
import { signInAs } from "../helpers/session";
import { createUser } from "../helpers/factories";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(disconnectTestDb);

const address = { name: "Test", address: { line1: "1 Test St", line2: null, city: "Test", country: "US", postal_code: "12345", state: "IL" } };
const pricing = { subtotal: "10.00", shipping: "10.00", taxAmount: "0.00", total: "20.00", taxtId: "tax_test" };

async function createOrderFor(userId: string, orderId: string) {
  await Orders.create({ orderId, user: userId, items: [], address, pricing });
}

describe("customer data is scoped to the signed-in user", () => {
  it("returns the customer's own order", async () => {
    const customer = await createUser();
    await createOrderFor(customer.id, "order-own");
    signInAs(customer);
    const order = await account.findOrderForCurrentUser("order-own");
    expect(order?.orderId).toBe("order-own");
  });

  it("does not return another customer's order, even with its id", async () => {
    const [alice, bob] = [await createUser(), await createUser()];
    await createOrderFor(bob.id, "order-bob");
    signInAs(alice);
    await expect(account.findOrderForCurrentUser("order-bob")).resolves.toBeNull();
  });

  it("lists only the customer's own orders", async () => {
    const [alice, bob] = [await createUser(), await createUser()];
    await createOrderFor(alice.id, "order-a1");
    await createOrderFor(bob.id, "order-b1");
    signInAs(alice);
    const { orders } = await account.findOrdersForCurrentUser();
    expect(orders.map((o: any) => o.orderId)).toEqual(["order-a1"]);
  });

  it("refuses anonymous visitors", async () => {
    signInAs(null);
    await expect(account.findOrdersForCurrentUser()).rejects.toBeInstanceOf(AuthError);
    await expect(account.getCurrentUserProfile()).rejects.toBeInstanceOf(AuthError);
  });

  it("reports cart membership for the signed-in user and false for guests", async () => {
    const customer = await createUser();
    await Cart.create({ user: customer.id, products: [{ product: "prod_in_cart", quantity: 1 }] });
    signInAs(customer);
    await expect(account.isInCurrentUserCart("prod_in_cart")).resolves.toBe(true);
    await expect(account.isInCurrentUserCart("prod_other")).resolves.toBe(false);
    signInAs(null);
    await expect(account.isInCurrentUserCart("prod_in_cart")).resolves.toBe(false);
  });

  it("never exposes the password hash in the profile", async () => {
    const customer = await createUser();
    signInAs(customer);
    const profile = await account.getCurrentUserProfile();
    expect(profile).toEqual({ id: customer.id, username: expect.any(String), email: customer.email, date: expect.any(String) });
  });
});

// Every admin read, called the way a page calls it. Adding a new admin read without
// a guard makes this table fail.
const adminReads: [string, () => Promise<unknown>][] = [
  ["fetchUsers", () => admin.fetchUsers({})],
  ["getUserForAdmin", () => admin.getUserForAdmin("64b000000000000000000000")],
  ["getAddressesForUser", () => admin.getAddressesForUser("64b000000000000000000000")],
  ["findAllOrdersForAdmin", () => admin.findAllOrdersForAdmin({})],
  ["findOrderForAdmin", () => admin.findOrderForAdmin("any")],
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
