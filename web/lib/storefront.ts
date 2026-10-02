import type { HomeSection, StoreSettings } from "./api/types";

// The storefront's words, from Theme and brand in the console. Anything a store hasn't filled in falls back to
// wording built from its name, so a new store reads well before it's set up.

// Only when the API can't be reached
const fallbackStoreName = "Our store";

export function storeNameOf(settings: StoreSettings | null): string {
  return settings?.storeName ?? fallbackStoreName;
}

// What the store calls what it sells: "supply" and "supplies", or "product" and "products"
export function nounsOf(settings: StoreSettings | null): { one: string; many: string } {
  return { one: settings?.storefront.productNoun ?? "product", many: settings?.storefront.productNounPlural ?? "products" };
}

// "1 supply", "1,204 supplies"
export function countOf(n: number, settings: StoreSettings | null): string {
  const { one, many } = nounsOf(settings);
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

export type HeroCopy = { headline: string; highlight: string | null; text: string | null; button: string };

export function heroCopy(settings: StoreSettings | null): HeroCopy {
  const storefront = settings?.storefront;
  return {
    headline: storefront?.heroHeadline ?? storeNameOf(settings),
    highlight: storefront?.heroHighlight ?? null,
    text: storefront?.heroText ?? storefront?.tagline ?? null,
    button: storefront?.heroButtonLabel ?? `Shop all ${nounsOf(settings).many}`,
  };
}

export const defaultHomeSections: HomeSection[] = ["categories", "new_in", "newsletter"];

export const homeSectionLabels: Record<HomeSection, string> = {
  categories: "Categories",
  deals: "On sale",
  new_in: "New in",
  newsletter: "Newsletter sign-up",
};

// Paragraphs separated by blank lines
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// The text's last words, to set apart in a headline: "Supplies for people who " and "make things."
export function splitLastWords(text: string, count = 2): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length <= count) return ["", words.join(" ")];
  return [`${words.slice(0, -count).join(" ")} `, words.slice(-count).join(" ")];
}

export type SocialLink = { name: string; href: string };

export function socialLinksOf(settings: StoreSettings | null): SocialLink[] {
  const social = settings?.storefront.social;
  if (!social) return [];
  const links: [string, string | null][] = [
    ["Instagram", social.instagram],
    ["TikTok", social.tikTok],
    ["Pinterest", social.pinterest],
    ["YouTube", social.youTube],
    ["Facebook", social.facebook],
  ];
  return links.filter((link): link is [string, string] => !!link[1]).map(([name, href]) => ({ name, href }));
}
