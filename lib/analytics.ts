import type { AdminOrder } from "./admin-queries";

/* Every number here is derived from order rows.
   The legacy dashboard hardcoded its figures — '+12.4%', a 3.8%
   conversion rate, expenses as revenue * 0.58, pending payouts of
   exactly 42,800 — so it reported the same "performance" on a store
   with no sales as on a busy one. */

/** Cancelled orders are excluded from every revenue figure. */
const isPaid = (o: AdminOrder) => o.status !== "cancelled";

export interface Totals {
  revenue: number;
  orders: number;
  units: number;
  averageOrderValue: number;
}

export function totalsFor(orders: AdminOrder[]): Totals {
  const paid = orders.filter(isPaid);
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const units = paid.reduce(
    (sum, o) => sum + o.items.reduce((n, i) => n + i.quantity, 0),
    0,
  );

  return {
    revenue,
    orders: paid.length,
    units,
    averageOrderValue: paid.length ? revenue / paid.length : 0,
  };
}

export function within(
  orders: AdminOrder[],
  from: Date,
  to: Date,
): AdminOrder[] {
  return orders.filter((o) => {
    const at = new Date(o.createdAt);
    return at >= from && at < to;
  });
}

/** Percentage change, or null when there is no baseline to compare to. */
export function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export interface Bucket {
  label: string;
  revenue: number;
  orders: number;
}

/** Revenue per day across the window, including days with no sales. */
export function revenueByDay(
  orders: AdminOrder[],
  days: number,
  now = new Date(),
): Bucket[] {
  const buckets: Bucket[] = [];
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  });

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const inDay = within(orders, day, next).filter(isPaid);
    buckets.push({
      label: fmt.format(day),
      revenue: inDay.reduce((sum, o) => sum + o.total, 0),
      orders: inDay.length,
    });
  }

  return buckets;
}

export interface RankedItem {
  name: string;
  units: number;
  revenue: number;
}

export function bestSellingItems(
  orders: AdminOrder[],
  limit = 8,
): RankedItem[] {
  const byName = new Map<string, RankedItem>();

  for (const order of orders.filter(isPaid)) {
    for (const item of order.items) {
      const existing = byName.get(item.productName) ?? {
        name: item.productName,
        units: 0,
        revenue: 0,
      };
      existing.units += item.quantity;
      existing.revenue += item.lineTotal;
      byName.set(item.productName, existing);
    }
  }

  return [...byName.values()].sort((a, b) => b.units - a.units).slice(0, limit);
}

export function statusBreakdown(
  orders: AdminOrder[],
): { status: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Share of orders from customers who had ordered before.
 *
 * Matched on phone number, which is the one field every order carries
 * — email is optional and a guest may use several.
 */
export function repeatCustomerRate(orders: AdminOrder[]): {
  rate: number;
  repeatCustomers: number;
  totalCustomers: number;
} {
  const seen = new Map<string, number>();
  for (const order of orders.filter(isPaid)) {
    const key = order.customerPhone.replace(/\D/g, "");
    if (!key) continue;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  const totalCustomers = seen.size;
  const repeatCustomers = [...seen.values()].filter((n) => n > 1).length;

  return {
    rate: totalCustomers ? (repeatCustomers / totalCustomers) * 100 : 0,
    repeatCustomers,
    totalCustomers,
  };
}

export function salesByCategory(
  orders: AdminOrder[],
  productCategory: Map<string, string>,
): RankedItem[] {
  const byCategory = new Map<string, RankedItem>();

  for (const order of orders.filter(isPaid)) {
    for (const item of order.items) {
      const category = productCategory.get(item.productName) ?? "Uncategorised";
      const existing = byCategory.get(category) ?? {
        name: category,
        units: 0,
        revenue: 0,
      };
      existing.units += item.quantity;
      existing.revenue += item.lineTotal;
      byCategory.set(category, existing);
    }
  }

  return [...byCategory.values()].sort((a, b) => b.revenue - a.revenue);
}
