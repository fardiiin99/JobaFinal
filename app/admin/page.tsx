import Link from "next/link";
import { BarChart } from "@/components/admin/BarChart";
import { Stat } from "@/components/admin/Stat";
import { getAdminOrders, getAdminProducts } from "@/lib/admin-queries";
import {
  change,
  revenueByDay,
  statusBreakdown,
  totalsFor,
  within,
} from "@/lib/analytics";
import { taka } from "@/lib/money";

export const metadata = { title: "Dashboard Analytics" };

const DAYS = 30;

export default async function DashboardPage() {
  const [orders, products] = await Promise.all([
    getAdminOrders(),
    getAdminProducts(),
  ]);

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - DAYS);
  const previousStart = new Date(now);
  previousStart.setDate(previousStart.getDate() - DAYS * 2);

  const current = totalsFor(within(orders, start, now));
  const previous = totalsFor(within(orders, previousStart, start));

  const awaiting = orders.filter(
    (o) => o.status === "pending" || o.status === "processing",
  ).length;
  const lowStock = products.filter((p) => p.active && p.stock <= 8);

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        Dashboard Analytics
      </h1>
      <p className="mb-8 mt-1.5 text-ink-soft">
        Last {DAYS} days, compared with the {DAYS} before it. Every figure comes
        from real orders.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Revenue"
          value={taka(current.revenue)}
          change={change(current.revenue, previous.revenue)}
        />
        <Stat
          label="Orders"
          value={String(current.orders)}
          change={change(current.orders, previous.orders)}
        />
        <Stat
          label="Average order"
          value={taka(current.averageOrderValue)}
          change={change(current.averageOrderValue, previous.averageOrderValue)}
        />
        <Stat
          label="Units sold"
          value={String(current.units)}
          change={change(current.units, previous.units)}
        />
      </div>

      <section className="mt-6 rounded-joba-lg border border-line bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold">Revenue per day</h2>
          <Link
            href="/admin/analytics"
            className="text-[13px] text-ink-soft underline underline-offset-4 hover:text-hibiscus"
          >
            Detailed analytics →
          </Link>
        </div>
        <BarChart data={revenueByDay(orders, DAYS, now)} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-joba-lg border border-line bg-white p-6">
          <h2 className="font-serif text-xl font-semibold">Needs attention</h2>

          <div className="mt-4 space-y-3 text-[14px]">
            <div className="flex items-center justify-between gap-3">
              <span>Orders awaiting dispatch</span>
              <Link
                href="/admin/orders"
                className="font-semibold text-hibiscus underline underline-offset-4"
              >
                {awaiting}
              </Link>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Products low on stock</span>
              <Link
                href="/admin/products?filter=low"
                className="font-semibold text-hibiscus underline underline-offset-4"
              >
                {lowStock.length}
              </Link>
            </div>
          </div>

          {lowStock.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[13px] text-ink-soft">
              {lowStock.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <span className="truncate">{p.name}</span>
                  <span className="tabular-nums">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-joba-lg border border-line bg-white p-6">
          <h2 className="font-serif text-xl font-semibold">Order status</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-[14px] text-ink-soft">
              No orders yet. They appear here the moment someone checks out.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {statusBreakdown(orders).map(({ status, count }) => (
                <li key={status}>
                  <div className="flex justify-between text-[13.5px]">
                    <span className="capitalize">{status}</span>
                    <span className="tabular-nums text-ink-soft">{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-beige">
                    <div
                      className="h-full rounded-full bg-hibiscus"
                      style={{ width: `${(count / orders.length) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
