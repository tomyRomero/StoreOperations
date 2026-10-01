"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { api } from "@/lib/api/browser";
import { problemMessage } from "@/lib/api/problems";
import type { Cart, CartLine } from "@/lib/api/types";
import { withQuantity } from "@/lib/cart";
import { useCurrentUser } from "../CurrentUserProvider";
import { toast } from "../ui/use-toast";

// A guest's cart is only product ids and quantities, kept in this browser. The API prices it, so it
// never shows a stale price or promises stock that's gone.
type GuestLine = { productId: number; quantity: number };

const guestCartKey = "palettehub-cart";
const emptyCart: Cart = { lines: [], itemCount: 0, subtotalCents: 0, canCheckout: false };

type CartContextValue = {
  // Null until the first answer from the API
  cart: Cart | null;
  itemCount: number;
  isInCart: (productId: number) => boolean;
  add: (productId: number, quantity?: number) => Promise<boolean>;
  setQuantity: (productId: number, quantity: number) => Promise<boolean>;
  remove: (productId: number) => Promise<boolean>;
  // The line removed last, until it's put back or the cart closes, so the cart can offer Undo in place
  lastRemoved: CartLine | null;
  undoRemove: () => Promise<boolean>;
  refresh: () => Promise<void>;
  // The cart drawer, opened by the cart button and after adding something (which it highlights)
  isOpen: boolean;
  justAdded: number | null;
  // `opener` is the button to give focus back to on close. An add button passes itself, because it's
  // disabled while adding and the drawer can't tell what had focus.
  openCart: (justAdded?: number, opener?: HTMLElement | null) => void;
  openedFrom: RefObject<HTMLElement | null>;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

// The cart for the whole site. A signed-in customer's cart lives in the API. When a guest signs in (or
// signs up), the cart they built in this browser is merged into their account's cart, then cleared here.
export function CartProvider({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const signedIn = user !== null;
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [lastRemoved, setLastRemoved] = useState<CartLine | null>(null);

  // The cart as last confirmed by the API, to fall back to when a change it was shown early is refused
  const confirmed = useRef<Cart | null>(null);
  const show = useCallback((next: Cart) => {
    confirmed.current = next;
    setCart(next);
  }, []);

  // The cart as it is now, or null when the API can't answer (the cart shown stays as it was)
  const load = useCallback(async (): Promise<Cart | null> => {
    const guestLines = readGuestCart();

    if (signedIn) {
      const { data } = guestLines.length > 0
        ? await api.POST("/api/cart/merge", { body: { items: guestLines } })
        : await api.GET("/api/cart");
      if (data && guestLines.length > 0) writeGuestCart([]);
      return data ?? null;
    }

    return guestLines.length > 0 ? (await priceGuestCart(guestLines)) ?? emptyCart : emptyCart;
  }, [signedIn]);

  const refresh = useCallback(async () => {
    const loaded = await load();
    if (loaded) show(loaded);
  }, [load, show]);

  // On first load, and again when the visitor signs in or out. An answer that arrives after that
  // changed again is dropped, so it can't overwrite the newer cart.
  useEffect(() => {
    let current = true;
    void load().then((loaded) => {
      if (current && loaded) show(loaded);
    });
    return () => {
      current = false;
    };
  }, [load, show]);

  // A refused change puts back the cart the API last confirmed and says why
  const refused = useCallback((description: string) => {
    if (confirmed.current) setCart(confirmed.current);
    toast({ title: "Couldn't update your bag", description, variant: "destructive" });
    return false;
  }, []);

  // Every signed-in change answers with the whole cart, so the page shows exactly what the API saved
  const applied = useCallback((data: Cart | undefined, error: unknown): boolean => {
    if (!data) return refused(problemMessage(error));
    show(data);
    return true;
  }, [refused, show]);

  // A guest's change is checked with the API before it's saved in this browser, with the same stock
  // rules as a signed-in customer's
  const changeGuestCart = useCallback(async (lines: GuestLine[], productId: number): Promise<boolean> => {
    const priced = await priceGuestCart(lines);
    if (!priced) return refused(problemMessage(undefined));

    const line = priced.lines.find((l) => l.productId === productId);
    if (line?.issue) return refused(issueMessage(line));

    writeGuestCart(lines);
    show(priced);
    return true;
  }, [refused, show]);

  const add = useCallback(async (productId: number, quantity = 1) => {
    if (!signedIn) {
      const lines = readGuestCart();
      const existing = lines.find((l) => l.productId === productId);
      const next = existing
        ? lines.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l))
        : [...lines, { productId, quantity }];
      return changeGuestCart(next, productId);
    }

    const { data, error } = await api.POST("/api/cart/items", { body: { productId, quantity } });
    return applied(data, error);
  }, [signedIn, changeGuestCart, applied]);

  // Quantities change on screen straight away; the API's answer then replaces the guess
  const setQuantity = useCallback(async (productId: number, quantity: number) => {
    setCart((current) => (current ? withQuantity(current, productId, quantity) : current));

    if (!signedIn) {
      const next = readGuestCart().map((l) => (l.productId === productId ? { ...l, quantity } : l));
      return changeGuestCart(next, productId);
    }

    const { data, error } = await api.PUT("/api/cart/items/{productId}", {
      params: { path: { productId } },
      body: { quantity },
    });
    return applied(data, error);
  }, [signedIn, changeGuestCart, applied]);

  const remove = useCallback(async (productId: number) => {
    const removed = confirmed.current?.lines.find((l) => l.productId === productId) ?? null;
    setCart((current) => (current ? withQuantity(current, productId, 0) : current));

    let done: boolean;
    if (!signedIn) {
      const next = readGuestCart().filter((l) => l.productId !== productId);
      writeGuestCart(next);
      show(next.length > 0 ? (await priceGuestCart(next)) ?? emptyCart : emptyCart);
      done = true;
    } else {
      const { data, error } = await api.DELETE("/api/cart/items/{productId}", { params: { path: { productId } } });
      done = applied(data, error);
    }

    if (done) setLastRemoved(removed);
    return done;
  }, [signedIn, applied, show]);

  const undoRemove = useCallback(async () => {
    if (!lastRemoved) return false;
    setLastRemoved(null);
    return add(lastRemoved.productId, lastRemoved.quantity);
  }, [lastRemoved, add]);

  const openedFrom = useRef<HTMLElement | null>(null);
  const openCart = useCallback((added?: number, opener?: HTMLElement | null) => {
    openedFrom.current = opener ?? null;
    setJustAdded(added ?? null);
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
    setLastRemoved(null);
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    itemCount: cart?.itemCount ?? 0,
    isInCart: (productId) => cart?.lines.some((l) => l.productId === productId) ?? false,
    add,
    setQuantity,
    remove,
    lastRemoved,
    undoRemove,
    refresh,
    isOpen,
    justAdded,
    openCart,
    openedFrom,
    closeCart,
  }), [cart, add, setQuantity, remove, lastRemoved, undoRemove, refresh, isOpen, justAdded, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

// Why a line can't be bought as it is, for the cart and toasts
export function issueMessage(line: CartLine): string {
  switch (line.issue) {
    case "unavailable":
      return "This item is no longer sold.";
    case "out_of_stock":
      return "Sold out.";
    case "not_enough_stock":
      return `Only ${line.stock} left.`;
    default:
      return "";
  }
}

async function priceGuestCart(lines: GuestLine[]): Promise<Cart | undefined> {
  const { data } = await api.POST("/api/cart/preview", { body: { items: lines } });
  return data;
}

// localStorage can be missing or full (private windows); the cart then simply starts empty
function readGuestCart(): GuestLine[] {
  try {
    const stored = JSON.parse(localStorage.getItem(guestCartKey) ?? "[]");
    return Array.isArray(stored)
      ? stored.filter((l): l is GuestLine => Number.isInteger(l?.productId) && Number.isInteger(l?.quantity))
      : [];
  } catch {
    return [];
  }
}

function writeGuestCart(lines: GuestLine[]) {
  try {
    if (lines.length === 0) localStorage.removeItem(guestCartKey);
    else localStorage.setItem(guestCartKey, JSON.stringify(lines));
  } catch {
    // Nothing to do: the cart just won't survive a reload in this browser
  }
}
