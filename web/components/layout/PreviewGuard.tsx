"use client";

import { useEffect } from "react";

// Inside the Theme and brand preview, which shows the store with unsaved changes: links and forms stay put,
// so the frame never wanders off to the published store
export function PreviewGuard() {
  useEffect(() => {
    const stay = (event: Event) => {
      if (event.type === "submit" || (event.target as Element).closest("a[href]")) event.preventDefault();
    };
    document.addEventListener("click", stay, true);
    document.addEventListener("submit", stay, true);
    return () => {
      document.removeEventListener("click", stay, true);
      document.removeEventListener("submit", stay, true);
    };
  }, []);
  return null;
}
