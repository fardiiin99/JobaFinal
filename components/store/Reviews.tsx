import type { Review } from "@/lib/types";

/* Deterministic by index, matching the legacy palette. */
const AVATAR_COLORS = [
  "#c1263f",
  "#1f7a68",
  "#b8860b",
  "#6a3a8f",
  "#2f6ba8",
  "#c2661f",
];

export function Reviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const average =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center gap-5">
        <h2 className="font-serif text-[clamp(28px,3.4vw,38px)] font-semibold -tracking-[0.02em]">
          Loved by Our Customers
        </h2>
        <p className="text-[13.5px] text-ink-soft">
          {average.toFixed(1)}★ average · verified buyers only
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => {
          const filled = Math.round(review.rating);
          return (
            <article
              key={`${review.name}-${i}`}
              className="rounded-joba-lg border border-line bg-white p-6"
            >
              <div
                className="text-[13px] tracking-[1px] text-olive"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {"★".repeat(filled)}
                {"☆".repeat(5 - filled)}
              </div>

              <p className="mt-3.5 text-[15px] leading-relaxed">
                “{review.text}”
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full font-semibold text-white"
                  style={{
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  }}
                >
                  {review.name.charAt(0)}
                </span>
                <div>
                  <p className="text-[14px] font-semibold">
                    {review.name}{" "}
                    <span className="ml-1 text-[12px] font-normal text-olive">
                      ✓ Verified
                    </span>
                  </p>
                  <p className="text-[12.5px] text-ink-soft">
                    {review.city} · Bought {review.product}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
