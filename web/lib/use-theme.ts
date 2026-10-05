"use client";

import { useSyncExternalStore } from "react";
import { themeCookie, type Theme } from "./theme";

const darkDevice = "(prefers-color-scheme: dark)";

// The mode the page is in: the visitor's choice, set on <html> by the root layout, or else their device's
function readTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return matchMedia(darkDevice).matches ? "dark" : "light";
}

// Changes when the device switches mode, or when any theme switch on the page sets the attribute
function subscribe(onChange: () => void) {
  const device = matchMedia(darkDevice);
  device.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    device.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

// The server can't see the device, so the mode is unknown until the page hydrates
const unknownOnServer = () => null;

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, unknownOnServer);

  // Applies at once (every color follows color-scheme), and is remembered for a year
  const setTheme = (next: Theme) => {
    document.documentElement.dataset.theme = next;
    document.cookie = `${themeCookie}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return { theme, setTheme };
}
