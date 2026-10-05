import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

// Geist for text, headings and UI; Geist Mono for small labels, order numbers and tracking codes; Instrument
// Serif for Atelier's headlines. All served from this site, not from Google. Shared by the root layout and
// the page shown when the root layout itself fails.
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Atelier's headlines. Not preloaded: a store on another theme never downloads it.
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  preload: false,
});

export const fontVariables = `${sans.variable} ${mono.variable} ${serif.variable}`;
