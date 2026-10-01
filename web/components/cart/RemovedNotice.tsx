"use client";

import { useCart } from "./CartProvider";

// "Removed Fine Brush. Undo", in the cart itself rather than a toast: a toast sits outside the cart
// drawer, where nothing can be reached while the drawer is open
export function RemovedNotice() {
  const { lastRemoved, undoRemove } = useCart();

  return (
    <div role="status" aria-live="polite">
      {lastRemoved && (
        <p className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2 text-sm">
          <span className="min-w-0 truncate">
            Removed <span className="font-semibold">{lastRemoved.name}</span>
          </span>
          <button type="button" onClick={() => void undoRemove()} className="shrink-0 font-semibold text-accent underline-offset-4 hover:underline">
            Undo
          </button>
        </p>
      )}
    </div>
  );
}
