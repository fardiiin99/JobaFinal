import { taka } from "@/lib/money";
import type { Bucket } from "@/lib/analytics";

/**
 * Revenue per day, drawn in CSS.
 *
 * Each bar carries its own figures in a title, so the numbers are not
 * locked inside bar heights.
 */
export function BarChart({ data }: { data: Bucket[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const hasSales = data.some((d) => d.revenue > 0);

  return (
    <figure>
      <div
        className="flex h-56 items-end gap-1.5"
        role="img"
        aria-label={`Revenue for the last ${data.length} days`}
      >
        {data.map((bucket) => (
          <div
            key={bucket.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            title={`${bucket.label}: ${taka(bucket.revenue)} from ${bucket.orders} order${bucket.orders === 1 ? "" : "s"}`}
          >
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-sm bg-hibiscus transition-[height]"
                style={{
                  height: `${Math.max((bucket.revenue / max) * 100, bucket.revenue > 0 ? 2 : 0)}%`,
                }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] text-ink-soft">
              {bucket.label}
            </span>
          </div>
        ))}
      </div>

      {!hasSales && (
        <figcaption className="mt-3 text-center text-[13px] text-ink-soft">
          No sales in this window yet.
        </figcaption>
      )}
    </figure>
  );
}
