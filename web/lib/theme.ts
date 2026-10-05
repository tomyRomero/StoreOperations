// The visitor's choice between a light and a dark page. Until they choose, the site follows their device.
export type Theme = "light" | "dark";

// Read by the root layout so every page arrives in the chosen mode, written by the theme switch
export const themeCookie = "theme";

export function parseTheme(value: string | undefined): Theme | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}
