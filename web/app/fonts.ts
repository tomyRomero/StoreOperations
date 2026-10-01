import { Geist, Geist_Mono } from "next/font/google";

// Geist for text, headings and UI; Geist Mono for small labels, order numbers and tracking codes. Both are
// variable fonts served from this site, not from Google. Shared by the root layout and the page shown when
// the root layout itself fails.
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const fontVariables = `${sans.variable} ${mono.variable}`;
