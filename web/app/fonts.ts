import { Bricolage_Grotesque, Figtree } from "next/font/google";

// Bricolage Grotesque for display and headings (its optical-size axis keeps small headings readable),
// Figtree for text, UI and numbers. Both are variable fonts served from this site, not from Google.
// Shared by the root layout and the page shown when the root layout itself fails.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
});

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const fontVariables = `${display.variable} ${sans.variable}`;
