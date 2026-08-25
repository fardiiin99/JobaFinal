"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";

interface Props {
  productId: string;
  quantity?: number;
  inStock?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * The only way anything enters the cart. Keeping it a single client
 * island means product cards and the PDP stay server-rendered.
 */
export function AddToBagButton({
  productId,
  quantity = 1,
  inStock = true,
  className = "",
  children,
}: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Without this, navigating away mid-confirmation leaves a pending
  // setState pointed at an unmounted component.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className={`cursor-not-allowed opacity-60 ${className}`}
      >
        Sold out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        // Cards wrap the media in a link to the PDP.
        e.preventDefault();
        e.stopPropagation();
        add(productId, quantity);
        setAdded(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1400);
      }}
      aria-live="polite"
      className={className}
    >
      {added ? "Added ✓" : (children ?? "Add to bag")}
    </button>
  );
}
