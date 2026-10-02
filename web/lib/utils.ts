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

export const calculateTimeAgo = (currentDate: Date, eventTimestamp: string): string => {
  const eventDate = new Date(eventTimestamp);
  const timeDifference = currentDate.getTime() - eventDate.getTime();
  const minutes = Math.floor(timeDifference / 60000); // 1 minute = 60,000 milliseconds
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};
