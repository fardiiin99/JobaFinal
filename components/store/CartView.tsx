"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { orderTotals, taka } from "@/lib/money";
import type { Product, StoreSettings } from "@/lib/types";

export function CartView({
  products,
  settings,
}: {
  products: Product[];
  settings: StoreSettings;
}) {
  const { cart, ready, setQuantity, remove, reconcile } = useCart();

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  /* Purge ids the catalogue no longer has. Without this the header
     badge counts them while the bag cannot render them — the legacy
     cart stranded shoppers in exactly that state, permanently. */
  useEffect(() => {
    if (ready) reconcile(products.map((p) => p.id));
  }, [ready, products, reconcile]);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = byId.get(id);
          return product ? { product, quantity } : null;
        })
        .filter((l): l is { product: Product; quantity: number } => l !== null),
    [cart, byId],
  );

  const subtotal = lines.reduce(
    (sum, l) => sum + l.product.price * l.quantity,
    0,
  );
  const totals = orderTotals(
    subtotal,
    settings.freeShippingThreshold,
    settings.shippingFee,
  );

  // Render nothing rather than a flash of "empty" before storage loads.
  if (!ready) {
    return <div className="min-h-80" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-joba-lg border border-line bg-white px-6 py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold">Your bag is empty</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Nothing here yet — the looms have been busy.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-block rounded-full bg-hibiscus px-8 py-3.5 font-semibold text-white transition-colors duration-300 ease-joba hover:bg-maroon"
        >
          Shop all sarees
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="space-y-4">
        {lines.map(({ product, quantity }) => {
          const cap = Math.max(1, Math.min(20, product.stock));
          return (
            <li
              key={product.id}
              className="flex gap-4 rounded-joba-lg border border-line bg-white p-4"
            >
              <Link
                href={`/product/${product.slug}`}
                className="relative aspect-3/4 w-24 shrink-0 overflow-hidden rounded-joba bg-beige"
              >
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="96px"
                    style={{ objectPosition: product.imagePosition }}
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  {product.categoryName}
                </p>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-serif text-[17px] font-semibold hover:text-hibiscus">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1 font-semibold">{taka(product.price)}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div
                    className="flex items-center rounded-full border border-line"
                    role="group"
                    aria-label={`Quantity for ${product.name}`}
                  >
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      className="grid size-9 place-items-center rounded-full hover:bg-ivory"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-[14px] font-medium">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase"
                      disabled={quantity >= cap}
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      className="grid size-9 place-items-center rounded-full hover:bg-ivory disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="text-[13px] text-ink-soft underline underline-offset-4 hover:text-hibiscus"
                  >
                    Remove
                  </button>

                  {quantity >= cap && (
                    <span className="text-[12.5px] text-hibiscus">
                      Only {product.stock} in stock
                    </span>
                  )}
                </div>
              </div>

              <p className="shrink-0 font-semibold">
                {taka(product.price * quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      <aside className="h-max rounded-joba-lg border border-line bg-white p-6">
        <h2 className="font-serif text-xl font-semibold">Order Summary</h2>

        <dl className="mt-5 space-y-3 text-[14.5px]">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="font-medium">{taka(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd className="font-medium">
              {totals.shipping === 0 ? "Free" : taka(totals.shipping)}
            </dd>
          </div>
        </dl>

        {/* Now reachable. The legacy threshold sat below the cheapest
            product, so this nudge could never render. */}
        {totals.remainingForFreeShipping > 0 && (
          <p className="mt-3 rounded-joba bg-ivory px-3.5 py-2.5 text-[13px] text-ink-soft">
            Add {taka(totals.remainingForFreeShipping)} more for free delivery.
          </p>
        )}

        <div className="mt-4 flex justify-between border-t border-line pt-4 text-[17px] font-semibold">
          <span>Total</span>
          <span>{taka(totals.total)}</span>
        </div>

        <Link
          href="/checkout"
          className="mt-6 block rounded-full bg-hibiscus px-8 py-3.5 text-center font-semibold text-white transition-colors duration-300 ease-joba hover:bg-maroon"
        >
          Checkout · {taka(totals.total)}
        </Link>

        <Link
          href="/shop"
          className="mt-3 block text-center text-[13.5px] text-ink-soft underline underline-offset-4 hover:text-hibiscus"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
