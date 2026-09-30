import { vi } from "vitest";
import { getServerSession } from "next-auth";

// Tests call vi.mock("next-auth") and then choose who is signed in with these helpers
export function signInAs(user: { id: string; admin?: boolean } | null) {
  vi.mocked(getServerSession).mockResolvedValue(
    user ? { user: { id: user.id, admin: user.admin ?? false, username: "test", email: "test@example.test" }, expires: "2999-01-01" } : null
  );
}
