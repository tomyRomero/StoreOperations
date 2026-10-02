import * as z from "zod";
import type { AdminStorefront, HomeSection, UpdateStorefrontRequest } from "@/lib/api/types";
import { isHexColor } from "@/lib/brand-colors";
import type { StorefrontDraft } from "@/lib/storefront-draft";

// The Theme and brand form's fields, and how they map to the API's request and to the preview's draft

export const allSections: HomeSection[] = ["categories", "deals", "new_in", "newsletter"];
export const socialFields = [
  ["instagramUrl", "Instagram", "instagram"],
  ["tikTokUrl", "TikTok", "tikTok"],
  ["pinterestUrl", "Pinterest", "pinterest"],
  ["youTubeUrl", "YouTube", "youTube"],
  ["facebookUrl", "Facebook", "facebook"],
] as const;

// A few starting points; any color works, and its shade is adjusted for contrast either way
export const swatches = [
  ["Ultramarine", "#1F3BDB"],
  ["Violet", "#6C4BF4"],
  ["Magenta", "#B8168F"],
  ["Vermilion", "#E5482A"],
  ["Amber", "#C77700"],
  ["Viridian", "#0E7C5A"],
] as const;

const optional = (max: number) => z.string().trim().max(max, `Use at most ${max} characters`);
const link = z.union([z.literal(""), z.string().trim().max(300, "Use at most 300 characters").regex(/^https:\/\/\S+$/, "Use the full address, starting with https://")]);

export const FormSchema = z.object({
  storeName: z.string().trim().min(1, "Enter the store's name").max(100, "Use at most 100 characters"),
  theme: z.enum(["night_studio", "atelier"]),
  tagline: optional(120),
  description: optional(300),
  logoImageKey: z.string().nullable(),
  logoUrl: z.string().nullable(),
  accentColor: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a color such as #5B3FD9")]),
  productNoun: z.string().trim().min(1, "Enter a word").max(40, "Use at most 40 characters"),
  productNounPlural: z.string().trim().min(1, "Enter a word").max(40, "Use at most 40 characters"),
  heroHeadline: optional(80),
  heroHighlight: optional(80),
  heroText: optional(300),
  heroButtonLabel: optional(40),
  sections: z.array(z.object({ key: z.enum(["categories", "deals", "new_in", "newsletter"]), on: z.boolean() })),
  aboutText: optional(4000),
  contactPhone: optional(40),
  contactAddress: optional(300),
  instagramUrl: link,
  tikTokUrl: link,
  pinterestUrl: link,
  youTubeUrl: link,
  facebookUrl: link,
});

export type Values = z.infer<typeof FormSchema>;

export function initialValues({ storeName, logoImageKey, storefront: s }: AdminStorefront): Values {
  return {
    storeName,
    theme: s.theme,
    tagline: s.tagline ?? "",
    description: s.description ?? "",
    logoImageKey,
    logoUrl: s.logoUrl,
    accentColor: s.accentColor ?? "",
    productNoun: s.productNoun,
    productNounPlural: s.productNounPlural,
    heroHeadline: s.heroHeadline ?? "",
    heroHighlight: s.heroHighlight ?? "",
    heroText: s.heroText ?? "",
    heroButtonLabel: s.heroButtonLabel ?? "",
    // The rows that are on, in their order, then the ones that are off
    sections: [...s.homeSections.map((key) => ({ key, on: true })), ...allSections.filter((key) => !s.homeSections.includes(key)).map((key) => ({ key, on: false }))],
    aboutText: s.aboutText ?? "",
    contactPhone: s.contactPhone ?? "",
    contactAddress: s.contactAddress ?? "",
    instagramUrl: s.social.instagram ?? "",
    tikTokUrl: s.social.tikTok ?? "",
    pinterestUrl: s.social.pinterest ?? "",
    youTubeUrl: s.social.youTube ?? "",
    facebookUrl: s.social.facebook ?? "",
  };
}

const text = (value: string, max: number) => (value.trim() && value.trim().length <= max ? value.trim() : null);
const safeLink = (value: string) => (/^https:\/\/\S+$/.test(value.trim()) && value.trim().length <= 300 ? value.trim() : null);

// The preview shows what's valid so far; anything half-typed shows as not filled in
export function toDraft(v: Values, mode: "light" | "dark"): StorefrontDraft {
  return {
    storeName: text(v.storeName, 100) ?? "Your store",
    theme: v.theme,
    mode,
    tagline: text(v.tagline, 120),
    description: text(v.description, 300),
    logoUrl: v.logoUrl,
    accentColor: isHexColor(v.accentColor) ? v.accentColor : null,
    productNoun: text(v.productNoun, 40) ?? "product",
    productNounPlural: text(v.productNounPlural, 40) ?? "products",
    heroHeadline: text(v.heroHeadline, 80),
    heroHighlight: text(v.heroHighlight, 80),
    heroText: text(v.heroText, 300),
    heroButtonLabel: text(v.heroButtonLabel, 40),
    homeSections: v.sections.filter((s) => s.on).map((s) => s.key),
    // Only the About page shows it, and it's the longest field, so only that page's preview carries it
    aboutText: text(v.aboutText, 4000),
    contactPhone: text(v.contactPhone, 40),
    contactAddress: text(v.contactAddress, 300),
    social: {
      instagram: safeLink(v.instagramUrl),
      tikTok: safeLink(v.tikTokUrl),
      pinterest: safeLink(v.pinterestUrl),
      youTube: safeLink(v.youTubeUrl),
      facebook: safeLink(v.facebookUrl),
    },
  };
}

// The fields of the form as the API names them, for its errors
export const formFieldFor: Record<string, keyof Values> = { homeSections: "sections" };

export const pages = [
  ["/", "Home"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/products", "Shop"],
] as const;

// The form as the API's update request, with empty fields as null
export function toRequest(v: Values, rowVersion: string): UpdateStorefrontRequest {
  return {
    storeName: v.storeName,
    theme: v.theme,
    tagline: v.tagline || null,
    description: v.description || null,
    logoImageKey: v.logoImageKey,
    accentColor: v.accentColor || null,
    productNoun: v.productNoun,
    productNounPlural: v.productNounPlural,
    heroHeadline: v.heroHeadline || null,
    heroHighlight: v.heroHighlight || null,
    heroText: v.heroText || null,
    heroButtonLabel: v.heroButtonLabel || null,
    homeSections: v.sections.filter((s) => s.on).map((s) => s.key),
    aboutText: v.aboutText || null,
    contactPhone: v.contactPhone || null,
    contactAddress: v.contactAddress || null,
    instagramUrl: v.instagramUrl || null,
    tikTokUrl: v.tikTokUrl || null,
    pinterestUrl: v.pinterestUrl || null,
    youTubeUrl: v.youTubeUrl || null,
    facebookUrl: v.facebookUrl || null,
    rowVersion,
  };
}
