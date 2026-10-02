import type { Surfaces } from "./brand-colors";

export type StoreTheme = "night_studio" | "atelier";

type ThemeInfo = {
  label: string;
  description: string;
  // The page and card colors in globals.css, which a store's accent is checked against
  surfaces: Surfaces;
};

// The storefront's built-in looks. Each is a set of tokens in globals.css (Night Studio on :root, the others
// under [data-store-theme]); the pages and components are the same.
export const storeThemes: Record<StoreTheme, ThemeInfo> = {
  night_studio: {
    label: "Night Studio",
    description: "Cut-out products in soft colored light, glass panels, Geist throughout",
    surfaces: { light: ["#f6f6f7", "#ffffff"], dark: ["#09090b", "#111114"] },
  },
  atelier: {
    label: "Atelier",
    description: "Warm paper and ink, serif headlines, no glows",
    surfaces: { light: ["#f4f0e8", "#fbf9f5"], dark: ["#15130f", "#1c1a16"] },
  },
};
