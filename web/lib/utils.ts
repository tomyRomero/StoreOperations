import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge has to know the type scale's and the radii's names (globals.css), or it takes text-h2
// for a color and drops text-sale when both are given, and keeps rounded-field beside a rounded-full
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ["display", "h1", "h2", "h3", "h4", "body-lg"], radius: ["field", "button", "card", "stage"] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
