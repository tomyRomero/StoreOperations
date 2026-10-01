"use client";

import { useCart } from "./CartProvider";

// "Removed Fine Brush. Undo", in the bag itself rather than a toast: a toast sits outside the bag
// drawer, where nothing can be reached while the drawer is open
export function RemovedNotice() {
  const { lastRemoved, undoRemove } = useCart();

  return (
    <div role="status" aria-live="polite">
      {lastRemoved && (
        <p className="flex items-center justify-between gap-3 rounded-[14px] border border-foreground/8 bg-foreground/5 px-3.5 py-3 text-sm">
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
