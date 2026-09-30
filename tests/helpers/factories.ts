import User from "@/lib/models/user.model";

let counter = 0;

// Creates a user directly in the test database. The password hash is a placeholder:
// these tests exercise authorization, not login.
export async function createUser(overrides: { admin?: boolean } = {}) {
  counter += 1;
  const user = await User.create({
    email: `user${counter}@example.test`,
    username: `user${counter}`,
    password: "not-a-real-hash",
    admin: overrides.admin ?? false,
    stripeId: `cus_test_${counter}`,
  });
  return { id: user._id.toString(), email: user.email as string };
}
