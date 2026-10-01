// The site's public address, for what has to be absolute: link previews (Open Graph images) and the
// structured data search engines read. Locally it's the dev server.
export const siteUrl = new URL(process.env.SITE_URL ?? "http://localhost:3200");
