import * as z from "zod";
import type { StoreSettings } from "./api/types";

// The Theme and brand editor's live preview is the real storefront in a frame, given the form's unsaved
// values. They travel in the frame's address as ?draft=..., proxy.ts hands them to the server as this
// header, and the pages use them only for an admin (lib/data/catalog.ts). Nothing is saved until the
// admin publishes.
export const draftHeader = "x-storefront-draft";

const text = (max: number) => z.string().max(max).nullable();
const httpsLink = z.string().max(300).regex(/^https:\/\/\S+$/).nullable();

const DraftSchema = z.object({
  storeName: z.string().trim().min(1).max(100),
  theme: z.enum(["night_studio", "atelier"]),
  // The light or dark page to preview in, instead of the admin's own choice
  mode: z.enum(["light", "dark"]),
  tagline: text(120),
  description: text(300),
  // Only an image this API serves
  logoUrl: z.string().regex(/^\/api\/images\/[a-z0-9/_-]+\.(jpg|png|webp)$/).nullable(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  productNoun: z.string().trim().min(1).max(40),
  productNounPlural: z.string().trim().min(1).max(40),
  heroHeadline: text(80),
  heroHighlight: text(80),
  heroText: text(300),
  heroButtonLabel: text(40),
  homeSections: z.array(z.enum(["categories", "deals", "new_in", "newsletter"])).max(4),
  aboutText: text(4000),
  contactPhone: text(40),
  contactAddress: text(300),
  social: z.object({ instagram: httpsLink, tikTok: httpsLink, pinterest: httpsLink, youTube: httpsLink, facebook: httpsLink }),
});

export type StorefrontDraft = z.infer<typeof DraftSchema>;

function toBase64Url(value: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function encodeDraft(draft: StorefrontDraft): string {
  return toBase64Url(JSON.stringify(draft));
}

// Null for anything that isn't a whole, valid draft
export function decodeDraft(value: string | null | undefined): StorefrontDraft | null {
  if (!value || value.length > 12_000) return null;
  try {
    const parsed = DraftSchema.safeParse(JSON.parse(fromBase64Url(value)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// The store's settings as they would be once the draft is published
export function applyDraft(settings: StoreSettings, draft: StorefrontDraft): StoreSettings {
  const { storeName, mode: _mode, ...storefront } = draft;
  return { ...settings, storeName, storefront: { ...settings.storefront, ...storefront } };
}
