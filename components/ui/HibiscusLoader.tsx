import type { CSSProperties } from "react";

const PETAL_ANGLES = [0, 72, 144, 216, 288];

export function HibiscusLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-5"
    >
      <div className="relative h-16 w-16 animate-[spin_2.6s_linear_infinite]">
        {PETAL_ANGLES.map((angle, i) => (
          <span
            key={angle}
            className="absolute left-1/2 top-1/2 h-7 w-5 origin-bottom animate-[petal_1.3s_ease-in-out_infinite]"
            style={
              {
                "--petal-angle": `${angle}deg`,
                animationDelay: `${i * 0.13}s`,
              } as CSSProperties
            }
          >
            <span
              className="block h-full w-full bg-hibiscus"
              style={{ borderRadius: "100% 0 100% 0" }}
            />
          </span>
        ))}
        <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-maroon" />
      </div>
      <p className="font-serif text-sm tracking-wide text-ink-soft">{label}</p>
      <span className="sr-only">{label}…</span>
    </div>
  );
}
