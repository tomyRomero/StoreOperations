// When the API refuses a request it answers with problem details (RFC 9457): a stable `code` to switch
// on, a `detail` already written for the visitor, and `errors` keyed by the JSON field they belong to.
export type ApiProblem = {
  status?: number;
  code?: string;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

// For the few answers whose wording should differ on the site. Everything else uses the API's own detail.
const messages: Record<string, string> = {
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  NOT_SIGNED_IN: "Please sign in to continue.",
  FORBIDDEN: "You don't have access to that.",
};

// One sentence to show in a toast or above a form
export function problemMessage(problem: unknown): string {
  const known = asProblem(problem);
  if (!known) return "We couldn't reach the store. Check your connection and try again.";
  if (known.code && messages[known.code]) return messages[known.code];
  if (known.errors) return "Please check the highlighted fields.";
  return known.detail ?? "Something went wrong. Please try again.";
}

// The first message for each field, for react-hook-form's setError
export function fieldErrors(problem: unknown): Record<string, string> {
  const errors = asProblem(problem)?.errors ?? {};
  return Object.fromEntries(
    Object.entries(errors)
      .filter(([, list]) => list.length > 0)
      .map(([field, list]) => [field, list[0]]),
  );
}

function asProblem(value: unknown): ApiProblem | undefined {
  return typeof value === "object" && value !== null ? (value as ApiProblem) : undefined;
}
