"use client";

import { useRouter } from "next/navigation";
import { api } from "./api/browser";

// Signs out with the API (it clears the cookie), then re-renders the page as a signed-out visitor
export function useSignOut() {
  const router = useRouter();
  return async (goTo = "/") => {
    await api.POST("/api/auth/logout");
    router.push(goTo);
    router.refresh();
  };
}
