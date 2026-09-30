// The sign-in page, with where to go back to afterwards
export function signInPath(returnTo: string): string {
  return `/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`;
}

// Only paths on this site, so a crafted link can't send someone elsewhere after they sign in
export function safeReturnPath(value: string | null | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/";
}
