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
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <figure>
      <div
        className="flex h-56 gap-1.5"
        role="img"
        aria-label={`Revenue for the last ${data.length} days`}
      >
        {data.map((bucket, i) => (
          <div
            key={bucket.label}
            className="flex min-w-0 flex-1 flex-col gap-1.5"
            title={`${bucket.label}: ${taka(bucket.revenue)} from ${bucket.orders} order${bucket.orders === 1 ? "" : "s"}`}
          >
            {/* Absolute bar: a % height needs a definite parent height,
                which a flex-grown box doesn't provide. */}
            <div className="relative w-full flex-1 rounded-t-sm bg-ivory">
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-sm bg-hibiscus transition-[height]"
                style={{
                  height: `${Math.max((bucket.revenue / max) * 100, bucket.revenue > 0 ? 2 : 0)}%`,
                }}
              />
            </div>
            <span className="h-3.5 whitespace-nowrap text-center text-[10px] leading-none text-ink-soft">
              {i % labelEvery === 0 ? bucket.label : ""}
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
