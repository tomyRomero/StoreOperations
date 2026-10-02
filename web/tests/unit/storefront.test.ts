import { describe, expect, it } from "vitest";
import type { StoreSettings } from "@/lib/api/types";
import { countOf, heroCopy, paragraphs, socialLinksOf, splitLastWords } from "@/lib/storefront";
import { applyDraft, decodeDraft, encodeDraft, type StorefrontDraft } from "@/lib/storefront-draft";

const settings = (storefront: Partial<StoreSettings["storefront"]> = {}) =>
  ({
    storeName: "Inkwell",
    storefront: {
      theme: "night_studio",
      tagline: null,
      description: null,
      logoUrl: null,
      accentColor: null,
      productNoun: "product",
      productNounPlural: "products",
      heroHeadline: null,
      heroHighlight: null,
      heroText: null,
      heroButtonLabel: null,
      homeSections: ["categories", "new_in", "newsletter"],
      aboutText: null,
      contactPhone: null,
      contactAddress: null,
      social: { instagram: null, tikTok: null, pinterest: null, youTube: null, facebook: null },
      ...storefront,
    },
  }) as StoreSettings;

const draft: StorefrontDraft = {
  storeName: "Inkwell Ü",
  theme: "atelier",
  mode: "dark",
  tagline: "Ink for every page",
  description: null,
  logoUrl: "/api/images/images/abc123.png",
  accentColor: "#1F3BDB",
  productNoun: "pen",
  productNounPlural: "pens",
  heroHeadline: "Write it down.",
  heroHighlight: null,
  heroText: null,
  heroButtonLabel: null,
  homeSections: ["new_in"],
  aboutText: null,
  contactPhone: null,
  contactAddress: null,
  social: { instagram: "https://www.instagram.com/inkwell", tikTok: null, pinterest: null, youTube: null, facebook: null },
};

describe("the storefront's words", () => {
  it("counts in the store's own noun", () => {
    expect(countOf(1, settings({ productNoun: "supply", productNounPlural: "supplies" }))).toBe("1 supply");
    expect(countOf(1204, settings({ productNoun: "supply", productNounPlural: "supplies" }))).toBe("1,204 supplies");
    expect(countOf(2, null)).toBe("2 products");
  });

  it("builds a new store's hero from its name", () => {
    expect(heroCopy(settings())).toEqual({ headline: "Inkwell", highlight: null, text: null, button: "Shop all products" });
    expect(heroCopy(settings({ tagline: "Ink for every page" })).text).toBe("Ink for every page");
  });

  it("splits text into paragraphs at blank lines", () => {
    expect(paragraphs("One.\n\n  Two\nstill two.\n\n\n")).toEqual(["One.", "Two\nstill two."]);
    expect(paragraphs(null)).toEqual([]);
  });

  it("sets apart a headline's last words", () => {
    expect(splitLastWords("Supplies for people who make things.")).toEqual(["Supplies for people who ", "make things."]);
    expect(splitLastWords("Hello")).toEqual(["", "Hello"]);
  });

  it("lists only the social links a store filled in", () => {
    expect(socialLinksOf(settings({ social: { ...settings().storefront.social, tikTok: "https://www.tiktok.com/@inkwell" } }))).toEqual([
      { name: "TikTok", href: "https://www.tiktok.com/@inkwell" },
    ]);
  });
});

describe("the preview's draft", () => {
  it("survives the trip through an address, accents included", () => {
    expect(decodeDraft(encodeDraft(draft))).toEqual(draft);
  });

  it("refuses anything that isn't a whole, valid draft", () => {
    expect(decodeDraft("not base64 json")).toBeNull();
    expect(decodeDraft(encodeDraft({ ...draft, accentColor: "red;}" }))).toBeNull();
    expect(decodeDraft(encodeDraft({ ...draft, logoUrl: "https://evil.example/x.png" }))).toBeNull();
    expect(decodeDraft(encodeDraft({ ...draft, social: { ...draft.social, instagram: "javascript:alert(1)" } }))).toBeNull();
  });

  it("lays the draft over the saved settings", () => {
    const previewed = applyDraft(settings(), draft);
    expect(previewed.storeName).toBe("Inkwell Ü");
    expect(previewed.storefront.theme).toBe("atelier");
    expect(previewed.storefront.homeSections).toEqual(["new_in"]);
    expect("mode" in previewed.storefront).toBe(false);
  });
});
