"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "joba-cart";
const MAX_QTY = 99;

/** productId → quantity. Ids are UUIDs from the products table. */
export type CartState = Record<string, number>;

interface CartContextValue {
  cart: CartState;
  /** Total units, for the header badge. */
  count: number;
  /** False until localStorage has been read, so SSR and first paint agree. */
  ready: boolean;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Drop ids that are no longer in the catalogue. */
  reconcile: (knownIds: string[]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Coerce anything that came out of storage into a usable quantity.
 *
 * The legacy cart trusted whatever JSON was in localStorage, so a
 * corrupted or hand-edited value produced price * NaN and rendered a
 * "Place Order · ৳NaN" button. Nothing downstream should have to think
 * about that, so it is fixed here at the boundary.
 */
function cleanQuantity(value: unknown): number | null {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(n, MAX_QTY);
}

function readStorage(): CartState {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

    const clean: CartState = {};
    for (const [id, qty] of Object.entries(raw)) {
      const q = cleanQuantity(qty);
      if (q !== null && id) clean[id] = q;
    }
    return clean;
  } catch {
    return {};
  }
}

function writeStorage(state: CartState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded, or storage disabled in private browsing. The
    // legacy writeCart had no guard, so this threw straight out of
    // every "Add to bag" click. Losing persistence is survivable;
    // breaking the button is not.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({});
  const [ready, setReady] = useState(false);

  // Read after mount so server and client render the same empty cart
  // and hydration does not mismatch.
  useEffect(() => {
    setCart(readStorage());
    setReady(true);
  }, []);

  // Keep other tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCart(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((next: CartState) => {
    setCart(next);
    writeStorage(next);
  }, []);

  const add = useCallback((productId: string, quantity = 1) => {
    const q = cleanQuantity(quantity) ?? 1;
    setCart((prev) => {
      const next = {
        ...prev,
        [productId]: Math.min((prev[productId] ?? 0) + q, MAX_QTY),
      };
      writeStorage(next);
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const q = cleanQuantity(quantity);
      if (q === null) delete next[productId];
      else next[productId] = q;
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => commit({}), [commit]);

  /**
   * Drop ids the catalogue no longer contains.
   *
   * The legacy badge summed raw storage while the cart list joined
   * against the catalogue and silently dropped unknown ids — and never
   * purged them. A discontinued product therefore left the badge stuck
   * on "3" forever while the bag rendered empty and checkout refused,
   * with no way out short of devtools.
   */
  const reconcile = useCallback((knownIds: string[]) => {
    const known = new Set(knownIds);
    setCart((prev) => {
      const next: CartState = {};
      let changed = false;
      for (const [id, qty] of Object.entries(prev)) {
        if (known.has(id)) next[id] = qty;
        else changed = true;
      }
      if (!changed) return prev;
      writeStorage(next);
      return next;
    });
  }, []);

  const count = useMemo(
    () => Object.values(cart).reduce((sum, q) => sum + q, 0),
    [cart],
  );

  const value = useMemo(
    () => ({ cart, count, ready, add, setQuantity, remove, clear, reconcile }),
    [cart, count, ready, add, setQuantity, remove, clear, reconcile],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
