"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { placeOrder, type PlacedOrder } from "@/app/(store)/checkout/actions";
import { useCart } from "@/lib/cart-context";
import { trackMetaEvent } from "@/lib/meta-events";
import { orderTotals, taka } from "@/lib/money";
import type { Product, StoreSettings } from "@/lib/types";

interface Props {
  products: Product[];
  settings: StoreSettings;
}

export function CheckoutForm({ products, settings }: Props) {
  const { cart, ready, clear, reconcile } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [placedLines, setPlacedLines] = useState<
    { name: string; quantity: number; price: number }[]
  >([]);

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  useEffect(() => {
    if (ready && !placed) reconcile(products.map((p) => p.id));
  }, [ready, products, reconcile, placed]);

  /* InitiateCheckout, once, as soon as there is a real basket. */
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (!ready || placed || checkoutTracked.current) return;
    const items = Object.entries(cart);
    if (items.length === 0) return;

    checkoutTracked.current = true;
    trackMetaEvent("InitiateCheckout", {
      customData: {
        content_ids: items.map(([id]) => id),
        content_type: "product",
        num_items: items.reduce((sum, [, q]) => sum + q, 0),
        currency: "BDT",
      },
    });
  }, [ready, placed, cart]);

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

  /* ── Confirmation ──────────────────────────────────────── */
  if (placed) {
    return (
      <div className="mx-auto max-w-xl rounded-joba-lg border border-line bg-white px-8 py-14 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-olive/10 text-olive">
          <svg viewBox="0 0 24 24" className="icon size-7">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12.5l2.5 2.5L16 9.5" />
          </svg>
        </div>

        <h1 className="mt-5 font-serif text-2xl font-semibold">
          Order placed — #{placed.orderNumber}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thank you. We have your order and will call to confirm delivery.
        </p>

        <ul className="mt-7 space-y-2 border-t border-line pt-6 text-left text-[14.5px]">
          {placedLines.map((l) => (
            <li key={l.name} className="flex justify-between gap-4">
              <span>
                {l.name} <span className="text-ink-soft">× {l.quantity}</span>
              </span>
              <span className="font-medium">{taka(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>

        {/* Server-computed, not the figure this browser calculated. */}
        <div className="mt-4 space-y-2 border-t border-line pt-4 text-[14.5px]">
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>
              {placed.shipping === 0 ? "Free" : taka(placed.shipping)}
            </span>
          </div>
          <div className="flex justify-between text-[17px] font-semibold">
            <span>Total</span>
            <span>{taka(placed.total)}</span>
          </div>
        </div>

        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-hibiscus px-8 py-3.5 font-semibold text-white transition-colors duration-300 ease-joba hover:bg-maroon"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!ready) return <div className="min-h-80" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="rounded-joba-lg border border-line bg-white px-6 py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold">Your bag is empty</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Add something to your bag before checking out.
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

  /* ── Form ──────────────────────────────────────────────── */
  const field =
    "mt-1.5 w-full rounded-joba border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-hibiscus";
  const label = "block text-[13px] font-semibold text-ink-soft";

  function onSubmit(formData: FormData) {
    setError(null);

    const snapshot = lines.map((l) => ({
      name: l.product.name,
      quantity: l.quantity,
      price: l.product.price,
    }));

    startTransition(async () => {
      const result = await placeOrder(
        lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        {
          name: String(formData.get("fullName") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          phone: String(formData.get("phone") ?? "").trim(),
          address: String(formData.get("address") ?? "").trim(),
          city: String(formData.get("city") ?? "").trim(),
          postcode: String(formData.get("postcode") ?? "").trim(),
          note: String(formData.get("note") ?? "").trim(),
          paymentMethod:
            formData.get("payment") === "mobile" ? "mobile" : "cod",
        },
      );

      // Only clear the bag and show success once the row actually
      // exists. The legacy flow emptied the cart unconditionally.
      if (result.ok) {
        setPlacedLines(snapshot);
        setPlaced(result.order);
        clear();

        /* Purchase reports the server-computed total, and passes the
           customer's email and phone so Meta can attribute the sale.
           Both are SHA-256 hashed inside the API route — they are
           never handed to the browser pixel. */
        trackMetaEvent("Purchase", {
          email: String(formData.get("email") ?? "").trim() || undefined,
          phone: String(formData.get("phone") ?? "").trim() || undefined,
          customData: {
            content_ids: snapshot.map((l) => l.name),
            content_type: "product",
            num_items: snapshot.reduce((sum, l) => sum + l.quantity, 0),
            value: result.order.total,
            currency: "BDT",
            order_id: result.order.orderNumber,
          },
        });
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-7">
        <section>
          <h2 className="font-serif text-xl font-semibold">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={label}>Full name</span>
              <input
                name="fullName"
                required
                autoComplete="name"
                placeholder="Your name"
                className={field}
              />
            </label>
            <label>
              <span className={label}>Phone number</span>
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="numeric"
                pattern="0[0-9]{10}"
                placeholder="01XXXXXXXXX"
                className={field}
              />
            </label>
          </div>
          {/* The legacy checkout collected no email at all, so an order
              confirmation was impossible even in principle. */}
          <label className="mt-4 block">
            <span className={label}>
              Email <span className="font-normal">(for your receipt)</span>
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={field}
            />
          </label>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">Delivery address</h2>
          <label className="mt-4 block">
            <span className={label}>Street address</span>
            <input
              name="address"
              required
              autoComplete="street-address"
              placeholder="House, road, area"
              className={field}
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={label}>City</span>
              <input
                name="city"
                required
                autoComplete="address-level2"
                placeholder="e.g. Dhaka"
                className={field}
              />
            </label>
            <label>
              <span className={label}>Postcode</span>
              <input
                name="postcode"
                autoComplete="postal-code"
                className={field}
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className={label}>
              Delivery note <span className="font-normal">(optional)</span>
            </span>
            <input
              name="note"
              placeholder="Gate code, landmark, preferred time…"
              className={field}
            />
          </label>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">Payment</h2>
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer gap-3 rounded-joba border border-line bg-white p-4 has-checked:border-hibiscus">
              <input
                type="radio"
                name="payment"
                value="cod"
                defaultChecked
                className="mt-1"
              />
              <span>
                <strong className="block text-[15px]">Cash on Delivery</strong>
                <small className="text-ink-soft">
                  Pay in cash when your order arrives.
                </small>
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-joba border border-line bg-white p-4 has-checked:border-hibiscus">
              <input
                type="radio"
                name="payment"
                value="mobile"
                className="mt-1"
              />
              <span>
                <strong className="block text-[15px]">bKash / Nagad</strong>
                <small className="text-ink-soft">
                  We’ll send a payment request once the order is confirmed.
                </small>
              </span>
            </label>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="rounded-joba border border-hibiscus bg-blush px-4 py-3 text-[14px] text-maroon"
          >
            {error}
          </p>
        )}
      </div>

      <aside className="h-max rounded-joba-lg border border-line bg-white p-6">
        <h2 className="font-serif text-xl font-semibold">Order Summary</h2>

        <ul className="mt-5 space-y-3">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-3">
              <span className="relative aspect-3/4 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="48px"
                    style={{ objectPosition: product.imagePosition }}
                    className="object-cover"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">
                  {product.name}
                </span>
                <span className="text-[12.5px] text-ink-soft">
                  Qty {quantity}
                </span>
              </span>
              <span className="text-[14px] font-medium">
                {taka(product.price * quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[14.5px]">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{taka(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{totals.shipping === 0 ? "Free" : taka(totals.shipping)}</dd>
          </div>
        </dl>

        {totals.remainingForFreeShipping > 0 && (
          <p className="mt-3 rounded-joba bg-ivory px-3.5 py-2.5 text-[13px] text-ink-soft">
            Add {taka(totals.remainingForFreeShipping)} more for free delivery.
          </p>
        )}

        <div className="mt-4 flex justify-between border-t border-line pt-4 text-[17px] font-semibold">
          <span>Total</span>
          <span>{taka(totals.total)}</span>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-hibiscus px-8 py-3.5 font-semibold text-white transition-colors duration-300 ease-joba hover:bg-maroon disabled:opacity-60"
        >
          {pending ? "Placing order…" : `Place Order · ${taka(totals.total)}`}
        </button>

        <p className="mt-3 text-center text-[12px] text-ink-soft">
          The final total is confirmed by our server before your order is saved.
        </p>
      </aside>
    </form>
  );
}
