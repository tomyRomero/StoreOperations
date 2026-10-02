import { expect } from "@playwright/test";

// Every email the store sends locally lands in Mailpit, which has an API for reading them
export const mailpitUrl = process.env.E2E_MAILPIT_URL ?? "http://localhost:8025";

type Message = { ID: string; Subject: string };

// The newest email to this address whose subject matches. The store sends from an outbox, so it can take
// a few seconds to arrive.
export async function emailTo(address: string, subject: RegExp): Promise<{ subject: string; text: string }> {
  let found: Message | undefined;
  await expect
    .poll(
      async () => {
        const response = await fetch(`${mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:"${address}"`)}`);
        const { messages } = (await response.json()) as { messages: Message[] };
        found = messages.find((message) => subject.test(message.Subject));
        return found !== undefined;
      },
      { message: `an email to ${address} matching ${subject}`, timeout: 45_000, intervals: [1_000] },
    )
    .toBe(true);

  const message = (await (await fetch(`${mailpitUrl}/api/v1/message/${found!.ID}`)).json()) as { Subject: string; Text: string };
  return { subject: message.Subject, text: message.Text };
}

// The first link in an email whose path matches, as a path on this site
export function linkIn(text: string, path: RegExp): string {
  const url = text.match(/https?:\/\/\S+/g)?.map((link) => new URL(link)).find((link) => path.test(link.pathname));
  expect(url, `a link to ${path} in:\n${text}`).toBeDefined();
  return `${url!.pathname}${url!.search}`;
}
