"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { trackMetaEvent } from "@/lib/meta-events";

const MAX = 20;

export function PdpBuyBox({
  productId,
  productName,
  price,
  stock,
}: {
  productId: string;
  productName: string;
  price: number;
  stock: number;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const cap = Math.max(1, Math.min(MAX, stock));
  const soldOut = stock <= 0;

  /* ViewContent fires once per product page. */
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      customData: {
        content_ids: [productId],
        content_name: productName,
        content_type: "product",
        value: price,
        currency: "BDT",
      },
    });
  }, [productId, productName, price]);

  const fireAddToCart = (quantity: number) =>
    trackMetaEvent("AddToCart", {
      customData: {
        content_ids: [productId],
        content_name: productName,
        content_type: "product",
        value: price * quantity,
        currency: "BDT",
        num_items: quantity,
      },
    });

  if (soldOut) {
    return (
      <p className="mt-7 rounded-joba border border-line bg-ivory px-5 py-4 text-[14.5px] text-ink-soft">
        Sold out — this piece is off the loom for now.
      </p>
    );
  }

  return (
    <>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div
          className="flex items-center rounded-full border border-line bg-white"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            aria-label="Decrease"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center rounded-full text-lg hover:bg-ivory"
          >
            −
          </button>
          <span aria-live="polite" className="w-8 text-center font-medium">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase"
            onClick={() => setQty((q) => Math.min(cap, q + 1))}
            className="grid size-11 place-items-center rounded-full text-lg hover:bg-ivory"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            add(productId, qty);
            fireAddToCart(qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
          }}
          className="flex-1 rounded-full bg-hibiscus px-8 py-3.5 font-semibold text-white transition-colors duration-300 ease-joba hover:bg-maroon"
        >
          {added ? "Added ✓" : "Add to bag"}
        </button>
      </div>

      {/* Adds once, then goes to checkout. The legacy button linked to
          the bag and added a second time on click, so pressing "Add to
          bag" then "Buy it now" silently put 2x the quantity in. */}
      <button
        type="button"
        onClick={() => {
          add(productId, qty);
          fireAddToCart(qty);
          router.push("/checkout");
        }}
        className="mt-3 w-full rounded-full border border-ink bg-white px-8 py-3.5 font-semibold transition-colors duration-300 ease-joba hover:bg-ink hover:text-white"
      >
        Buy it now
      </button>

      {stock <= 5 && (
        <p className="mt-3 text-[13px] font-medium text-hibiscus">
          Only {stock} left
        </p>
      )}
    </>
  );
}
