
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentDate() {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/;
  return base64Regex.test(imageData);
}

export function dollarsToCents(dollarAmount: number) {
  // Convert dollars to cents (multiply by 100 and round to the nearest integer)
  const cents = Math.round(dollarAmount * 100);
  return cents;
}

