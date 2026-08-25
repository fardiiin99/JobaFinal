"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

const ALLOWED: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/**
 * Change an order's delivery status.
 *
 * Keyed by the row's UUID. The legacy admin keyed its status overrides
 * by a positional id ('JB' + (1042 - index)), so adding or deleting a
 * contact shifted every id by one and, after a reload, silently
 * reattached saved statuses to different orders.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ALLOWED.includes(status)) {
    return { ok: false, error: "Unknown status." };
  }

  const supabase = await createClient();

  // RLS restricts this to authenticated sessions, so an anonymous
  // caller cannot reach it even by invoking the action directly.
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}
