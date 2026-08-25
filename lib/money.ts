import type { OrderTotals } from "./types";

/** ৳ with Indian digit grouping — matches the legacy taka() exactly. */
export function taka(amount: number): string {
  return "৳" + Math.round(amount).toLocaleString("en-IN");
}

/**
 * PostgREST serialises `numeric` as a string to avoid float precision
 * loss. Coerce at the boundary so nothing downstream does string maths
 * and renders "৳NaN" — which the legacy cart genuinely did.
 */
export function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Display totals for the cart and checkout.
 *
 * Advisory only — place_order() recomputes all of this server-side from
 * the products and settings tables, and its answer is what gets stored.
 */
export function orderTotals(
  subtotal: number,
  freeShippingThreshold: number,
  shippingFee: number,
): OrderTotals {
  const qualifies = subtotal >= freeShippingThreshold;
  const shipping = qualifies ? 0 : shippingFee;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    remainingForFreeShipping: qualifies
      ? 0
      : Math.max(0, freeShippingThreshold - subtotal),
  };
}

/** Percentage off, for the SALE badge. Null when not discounted. */
export function discountPercent(
  price: number,
  compareAtPrice: number | null,
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round((1 - price / compareAtPrice) * 100);
}
