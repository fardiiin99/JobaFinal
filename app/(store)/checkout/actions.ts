"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface PlacedOrder {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  shipping: number;
  total: number;
}

export type OrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; error: string };

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CustomerInput {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  postcode?: string;
  note?: string;
  paymentMethod: "cod" | "mobile";
  /** Only honoured for a signed-in admin; place_order coerces otherwise. */
  source?: "web" | "manual";
}

/**
 * Place an order.
 *
 * Deliberately sends only product ids and quantities. Prices, shipping
 * and the total are computed inside place_order() from the products and
 * settings tables — so a crafted request cannot buy a ৳12,400 saree for
 * ৳1, and the figure shown on the confirmation is the figure stored.
 *
 * The legacy checkout rendered "Order placed — #JB123456" and then
 * discarded everything: no write, no send. Nothing reached the owner.
 */
export async function placeOrder(
  items: OrderItemInput[],
  customer: CustomerInput,
): Promise<OrderResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Your bag is empty." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("place_order", {
    items: items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
    })),
    customer: {
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postcode: customer.postcode || null,
      note: customer.note || null,
      payment_method: customer.paymentMethod,
      source: customer.source ?? "web",
    },
  });

  if (error) {
    // Surface the database's own message — it explains the real cause
    // ("Not enough stock", "no longer available") far better than a
    // generic failure would.
    return { ok: false, error: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.order_id) {
    return { ok: false, error: "The order could not be created." };
  }

  // Stock changed, so cached catalogue pages are now out of date.
  revalidatePath("/", "layout");

  return {
    ok: true,
    order: {
      orderId: row.order_id as string,
      orderNumber: row.order_number as string,
      subtotal: Number(row.subtotal),
      shipping: Number(row.shipping),
      total: Number(row.total),
    },
  };
}
