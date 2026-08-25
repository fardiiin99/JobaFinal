"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder } from "@/app/(store)/checkout/actions";
import { taka } from "@/lib/money";
import type { Product } from "@/lib/types";

/**
 * Record an order taken by phone or over Instagram.
 *
 * Goes through the same place_order() call the storefront uses, so the
 * totals are computed by the database here too. A second, hand-rolled
 * write path would be the obvious place for the two to drift apart.
 */
export function ManualOrderForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Record<string, number>>({});

  const sellable = products.filter((p) => p.active && p.stock > 0);

  const chosen = Object.entries(lines)
    .map(([id, quantity]) => {
      const product = products.find((p) => p.id === id);
      return product && quantity > 0 ? { product, quantity } : null;
    })
    .filter((l): l is { product: Product; quantity: number } => l !== null);

  const subtotal = chosen.reduce(
    (sum, l) => sum + l.product.price * l.quantity,
    0,
  );

  const field =
    "mt-1.5 w-full rounded-joba border border-line bg-white px-4 py-2.5 text-[15px] outline-none focus:border-hibiscus";
  const label = "block text-[13px] font-semibold text-ink-soft";

  function onSubmit(formData: FormData) {
    setError(null);

    if (chosen.length === 0) {
      setError("Add at least one product to the order.");
      return;
    }

    startTransition(async () => {
      const result = await placeOrder(
        chosen.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
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
          source: "manual",
        },
      );

      if (result.ok) {
        router.push("/admin/orders");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-7">
        <section>
          <h2 className="font-serif text-xl font-semibold">Items</h2>
          <div className="mt-4 divide-y divide-line rounded-joba-lg border border-line bg-white">
            {sellable.map((p) => {
              const qty = lines[p.id] ?? 0;
              const cap = Math.min(99, p.stock);
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[14px]">{p.name}</strong>
                    <span className="text-[12.5px] text-ink-soft">
                      {taka(p.price)} · {p.stock} in stock
                    </span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={cap}
                    value={qty}
                    aria-label={`Quantity of ${p.name}`}
                    onChange={(e) => {
                      const next = Math.max(
                        0,
                        Math.min(cap, Math.floor(Number(e.target.value) || 0)),
                      );
                      setLines((prev) => ({ ...prev, [p.id]: next }));
                    }}
                    className="w-20 rounded-joba border border-line px-3 py-2 text-center text-[14px] outline-none focus:border-hibiscus"
                  />
                </div>
              );
            })}
            {sellable.length === 0 && (
              <p className="px-4 py-10 text-center text-ink-soft">
                Nothing is in stock to sell.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold">Customer</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={label}>Full name</span>
              <input name="fullName" required className={field} />
            </label>
            <label>
              <span className={label}>Phone number</span>
              <input name="phone" required className={field} />
            </label>
          </div>
          <label className="mt-4 block">
            <span className={label}>
              Email <span className="font-normal">(optional)</span>
            </span>
            <input name="email" type="email" className={field} />
          </label>
          <label className="mt-4 block">
            <span className={label}>Street address</span>
            <input name="address" required className={field} />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={label}>City</span>
              <input name="city" required className={field} />
            </label>
            <label>
              <span className={label}>Postcode</span>
              <input name="postcode" className={field} />
            </label>
          </div>
          <label className="mt-4 block">
            <span className={label}>
              Note <span className="font-normal">(optional)</span>
            </span>
            <input name="note" className={field} />
          </label>
          <label className="mt-4 block">
            <span className={label}>Payment</span>
            <select name="payment" className={field} defaultValue="cod">
              <option value="cod">Cash on Delivery</option>
              <option value="mobile">bKash / Nagad</option>
            </select>
          </label>
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
        <h2 className="font-serif text-lg font-semibold">Order</h2>

        {chosen.length === 0 ? (
          <p className="mt-4 text-[14px] text-ink-soft">
            Set a quantity to add items.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-[14px]">
            {chosen.map((l) => (
              <li key={l.product.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {l.product.name}{" "}
                  <span className="text-ink-soft">× {l.quantity}</span>
                </span>
                <span className="tabular-nums">
                  {taka(l.product.price * l.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
          <span>Subtotal</span>
          <span className="tabular-nums">{taka(subtotal)}</span>
        </div>
        <p className="mt-2 text-[12px] text-ink-soft">
          Delivery and the final total are calculated by the server when the
          order is saved.
        </p>

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-full bg-hibiscus px-6 py-3 font-semibold text-white transition-colors hover:bg-maroon disabled:opacity-60"
        >
          {pending ? "Saving…" : "Create order"}
        </button>
      </aside>
    </form>
  );
}
