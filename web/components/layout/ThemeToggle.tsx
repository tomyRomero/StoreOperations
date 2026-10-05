"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/use-theme";

type Props = {
  className?: string;
  // The phone menu shows the words; the header shows only the icon
  withLabel?: boolean;
};

// Switches between the light and the dark page. The icon is picked by CSS, so it is right from the first
// paint even when the page follows the device and the server couldn't know which mode that is.
export function ThemeToggle({ className, withLabel = false }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-pressed={theme === null ? undefined : theme === "dark"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn("inline-flex items-center gap-3 transition-colors", className)}
    >
      <Moon aria-hidden className="size-5 dark:hidden" />
      <Sun aria-hidden className="hidden size-5 dark:block" />
      <span className={cn(!withLabel && "sr-only")}>Dark mode</span>
      {withLabel && (
        <span aria-hidden className="ml-auto text-sm font-normal text-muted-foreground">
          <span className="dark:hidden">Off</span>
          <span className="hidden dark:inline">On</span>
        </span>
      )}
    </button>
  );
}
