import Link from "next/link";
import { BarChart } from "@/components/admin/BarChart";
import { Stat } from "@/components/admin/Stat";
import { getAdminOrders, getAdminProducts } from "@/lib/admin-queries";
import {
  bestSellingItems,
  change,
  repeatCustomerRate,
  revenueByDay,
  salesByCategory,
  totalsFor,
  within,
} from "@/lib/analytics";
import { taka } from "@/lib/money";

export const metadata = { title: "Detailed Analytics" };

const RANGES = [7, 30, 90, 365];
type SearchParams = Promise<{ days?: string }>;

function RankTable({
  rows,
  unitLabel,
}: {
  rows: { name: string; units: number; revenue: number }[];
  unitLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="mt-4 text-[14px] text-ink-soft">
        Nothing sold in this window.
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.revenue), 1);

  return (
    <ul className="mt-4 space-y-3">
      {rows.map((row) => (
        <li key={row.name}>
          <div className="flex justify-between gap-3 text-[13.5px]">
            <span className="min-w-0 truncate">{row.name}</span>
            <span className="shrink-0 tabular-nums text-ink-soft">
              {row.units} {unitLabel} · {taka(row.revenue)}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-beige">
            <div
              className="h-full rounded-full bg-olive"
              style={{ width: `${(row.revenue / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { days: daysParam } = await searchParams;
  const days = RANGES.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const [orders, products] = await Promise.all([
    getAdminOrders(),
    getAdminProducts(),
  ]);

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  const previousStart = new Date(now);
  previousStart.setDate(previousStart.getDate() - days * 2);

  const inRange = within(orders, start, now);
  const current = totalsFor(inRange);
  const previous = totalsFor(within(orders, previousStart, start));
  const repeat = repeatCustomerRate(orders);

  /* order_items snapshots the product name, so category has to be
     resolved by name — which is also why a deleted product still
     shows correctly in history. */
  const productCategory = new Map(
    products.map((p) => [p.name, p.categoryName]),
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
            Detailed Analytics
          </h1>
          <p className="mt-1.5 text-ink-soft">
            {inRange.length} order{inRange.length === 1 ? "" : "s"} in the last{" "}
            {days} days
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {RANGES.map((range) => (
            <Link
              key={range}
              href={`/admin/analytics?days=${range}`}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                days === range
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white hover:bg-ivory"
              }`}
            >
              {range === 365 ? "1 year" : `${range} days`}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          label="Repeat customers"
          value={`${repeat.rate.toFixed(0)}%`}
          hint={`${repeat.repeatCustomers} of ${repeat.totalCustomers} customers, all time`}
        />
      </div>

      <section className="mt-6 rounded-joba-lg border border-line bg-white p-6">
        <h2 className="font-serif text-xl font-semibold">Revenue over time</h2>
        <div className="mt-5">
          <BarChart data={revenueByDay(orders, Math.min(days, 90), now)} />
        </div>
        {days > 90 && (
          <p className="mt-3 text-[12.5px] text-ink-soft">
            Chart shows the last 90 days; the figures above cover the full{" "}
            {days}.
          </p>
        )}
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-joba-lg border border-line bg-white p-6">
          <h2 className="font-serif text-xl font-semibold">Best sellers</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            By units sold in this window
          </p>
          <RankTable rows={bestSellingItems(inRange)} unitLabel="sold" />
        </section>

        <section className="rounded-joba-lg border border-line bg-white p-6">
          <h2 className="font-serif text-xl font-semibold">Sales by weave</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Which categories earn the most
          </p>
          <RankTable
            rows={salesByCategory(inRange, productCategory)}
            unitLabel="sold"
          />
        </section>
      </div>
    </>
  );
}
