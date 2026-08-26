export function Stat({
  label,
  value,
  change,
  hint,
}: {
  label: string;
  value: string;
  /** Percent change vs the previous period. null = no baseline yet. */
  change?: number | null;
  hint?: string;
}) {
  const up = change != null && change > 0;
  const flat = change != null && Math.abs(change) < 0.05;

  return (
    <div className="rounded-joba-lg border border-line bg-white p-5">
      <p className="text-[12px] uppercase tracking-[0.1em] text-ink-soft">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl font-semibold tabular-nums">
        {value}
      </p>

      {change === undefined ? null : change === null ? (
        /* Honest about having nothing to compare against, rather than
           inventing a percentage as the legacy dashboard did. */
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          no earlier period to compare
        </p>
      ) : (
        <p
          className={`mt-1.5 text-[12.5px] font-medium ${
            flat ? "text-ink-soft" : up ? "text-[#2f7d5b]" : "text-maroon"
          }`}
        >
          {flat ? "–" : up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
          <span className="font-normal text-ink-soft"> vs previous period</span>
        </p>
      )}

      {hint && <p className="mt-1.5 text-[12.5px] text-ink-soft">{hint}</p>}
    </div>
  );
}
