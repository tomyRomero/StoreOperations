import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "./auth";
import { connectToDB } from "./mongoose";
import User from "./models/user.model";

// Authorization checks shared by server actions, data functions and API routes.
// Every check fails closed: anything other than a confirmed user (or admin) is refused.

export class AuthError extends Error {
  constructor(readonly status: 401 | 403) {
    super(status === 401 ? "You need to sign in." : "You don't have access to this.");
    this.name = "AuthError";
  }
}

export type SessionUser = { id: string; admin: boolean };

// The signed-in user, or null. The admin flag is re-read from the database on
// every call, so demoting an admin takes effect immediately rather than when
// their 30-day session token expires.
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (typeof id !== "string" || !Types.ObjectId.isValid(id)) return null;

  await connectToDB();
  const user = await User.findById(id).select("admin").lean<{ admin?: boolean }>();
  if (!user) return null;

  return { id, admin: user.admin === true };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError(401);
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.admin) throw new AuthError(403);
  return user;
}

// Turns an AuthError into a JSON response for API routes; returns null for anything else
export function authErrorResponse(error: unknown): Response | null {
  if (error instanceof AuthError) {
    return Response.json({ message: error.message }, { status: error.status });
  }
  return null;
}
