import { mailpitUrl } from "./mail";

// Fails at once, with what to start, instead of letting every test time out
export default async function globalSetup() {
  const store = process.env.E2E_BASE_URL ?? "http://localhost:3200";
  const checks: [string, string][] = [
    [`${store}/api/store`, `the store and its API (${store}, which forwards /api to the API)`],
    [`${mailpitUrl}/api/v1/info`, `Mailpit (${mailpitUrl})`],
  ];

  for (const [url, what] of checks) {
    const response = await fetch(url).catch(() => undefined);
    if (!response?.ok) throw new Error(`Couldn't reach ${what}. Start it before running the end-to-end tests.`);
  }
}
