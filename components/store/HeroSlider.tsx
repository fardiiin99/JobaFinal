"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/types";

const INTERVAL = 5000;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % count),
      INTERVAL,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, count]);

  // The legacy slider dereferenced its DOM nodes unguarded and would
  // throw on an empty slide list, taking the rest of the page script
  // down with it.
  if (count === 0) return null;

  return (
    <section
      aria-label="Featured sarees"
      aria-roledescription="carousel"
      className="relative h-[clamp(440px,72vh,760px)] overflow-hidden bg-maroon"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-joba"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={`${slide.image_url}-${i}`}
            className="relative h-full flex-[0_0_100%]"
            aria-hidden={i !== index}
          >
            <Image
              src={slide.image_url}
              alt={slide.alt}
              fill
              sizes="100vw"
              /* Only the first slide is eager — the legacy page loaded
                 all five immediately, including an 8 MB hero. */
              priority={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              style={{ objectPosition: slide.position }}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-[22px] top-1/2 z-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-[rgba(251,247,241,0.85)] text-ink backdrop-blur-[4px] transition-[background,transform] duration-200 hover:scale-[1.08] hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="icon size-[22px]">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-[22px] top-1/2 z-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-[rgba(251,247,241,0.85)] text-ink backdrop-blur-[4px] transition-[background,transform] duration-200 hover:scale-[1.08] hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="icon size-[22px]">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <Link
        href="/shop"
        className="absolute inset-x-0 bottom-[clamp(48px,9vh,86px)] z-4 mx-auto w-max rounded-full bg-hibiscus px-10 py-[15px] text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(10,10,10,0.28)] transition-transform duration-300 ease-joba hover:-translate-y-0.5 hover:bg-maroon"
      >
        Shop Now
      </Link>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-[22px] z-3 flex justify-center gap-2.5">
          {slides.map((slide, i) => (
            <button
              key={`dot-${slide.image_url}-${i}`}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`h-[9px] rounded-full transition-[background,width] duration-200 ${
                i === index
                  ? "w-[26px] bg-white"
                  : "w-[9px] bg-[rgba(251,247,241,0.5)]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
