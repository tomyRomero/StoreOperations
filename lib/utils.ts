
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { syncLocalStorageWithServerCart } from "./actions/store.actions";

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

export const syncLocalStorageWithServerCartClient = async (userId: string) => {
  // Perform local storage operations to see if it exists
  const localStorageCart = JSON.parse(localStorage.getItem('cart') || '[]');

  if (localStorageCart) {
    // Call the server-side function to handle server operations
    const syncResult = await syncLocalStorageWithServerCart(localStorageCart, userId);

    if (syncResult.success) {
      // Clear the local storage cart
      localStorage.removeItem('cart');
      console.log('Local storage cart cleared after successful synchronization.');
    } else {
      console.error('Failed to sync cart:', syncResult.message);
    }
  }
};


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