"use client";

import { getImageProps } from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { imageLoader } from "@/lib/image-loader";
import type { HeroSlide } from "@/lib/types";

/* Autoplay is driven by the indicator's fill animation (hero-progress in
   globals.css, 7s): when it ends, the next slide shows. Hover pauses the
   animation, so the timer and the bar can never drift apart, and
   reduced-motion users get no autoplay at all. */

/**
 * Art-directed picture: a wide spread on desktop, a portrait crop on
 * phones. next/image can't swap sources by breakpoint on its own, so the
 * two srcsets come from getImageProps and go into a <picture>.
 */
function SlidePicture({ slide, eager }: { slide: HeroSlide; eager: boolean }) {
  const common = {
    alt: slide.alt,
    sizes: "100vw",
    loader: imageLoader,
    priority: eager,
  };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: slide.image_url, width: 2560, height: 1080 });
  const {
    props: { srcSet: mobile, ...img },
  } = getImageProps({
    ...common,
    src: slide.mobile_url || slide.image_url,
    width: 1080,
    height: 1350,
  });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <source srcSet={mobile} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img
        {...img}
        style={{ objectPosition: slide.position }}
        className="absolute inset-0 size-full object-cover"
      />
    </picture>
  );
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  // The legacy slider dereferenced its DOM nodes unguarded and would
  // throw on an empty slide list, taking the rest of the page script
  // down with it.
  if (count === 0) return null;

  return (
    <section
      aria-label="Featured collections"
      aria-roledescription="carousel"
      className="relative aspect-4/5 max-h-[86svh] w-full overflow-hidden bg-ink md:aspect-64/27 md:max-h-[calc(100svh-120px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      {slides.map((slide, i) => {
        const active = i === index;
        const body = (
          <>
            {/* Slow push-in while the slide is showing. */}
            <div
              className={`absolute inset-0 transition-transform duration-[8000ms] ease-out motion-reduce:transition-none ${
                active ? "scale-100" : "scale-[1.06]"
              }`}
            >
              <SlidePicture slide={slide} eager={i === 0} />
            </div>

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-[rgba(12,6,8,0.7)] via-[rgba(12,6,8,0.18)] via-45% to-transparent md:bg-linear-to-tr md:via-[rgba(12,6,8,0.28)] md:via-40%"
            />

            {(slide.eyebrow || slide.title || slide.subtitle) && (
              <div
                className={`absolute inset-x-5 bottom-[72px] z-2 text-white [text-shadow:0_1px_20px_rgba(0,0,0,0.35)] transition-[opacity,translate] delay-300 duration-1000 ease-joba md:inset-x-auto md:bottom-[clamp(56px,9vh,96px)] md:left-[clamp(28px,6vw,96px)] md:max-w-[640px] ${
                  active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                {slide.eyebrow && (
                  <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-white/85 md:text-[12px]">
                    {slide.eyebrow}
                  </p>
                )}
                {slide.title && (
                  <h2 className="mt-3 font-serif text-[clamp(46px,8.4vw,112px)] font-light leading-[0.92] -tracking-[0.03em]">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="mt-4 text-[15px] font-light text-white/90 md:text-[17px]">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            )}
          </>
        );

        return (
          <div
            key={`${slide.image_url}-${i}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-joba ${
              active ? "z-1 opacity-100" : "z-0 opacity-0"
            }`}
          >
            {slide.href ? (
              <Link
                href={slide.href}
                tabIndex={active ? 0 : -1}
                aria-label={slide.title ? `Shop ${slide.title}` : slide.alt}
                className="block size-full"
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </div>
        );
      })}

      {count > 1 && (
        <div className="absolute inset-x-5 bottom-7 z-3 flex items-center gap-4 text-white md:inset-x-auto md:right-[clamp(28px,6vw,96px)] md:bottom-[clamp(56px,9vh,96px)]">
          <span className="font-serif text-[13px] tabular-nums tracking-[0.08em]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={`bar-${slide.image_url}-${i}`}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className="relative h-6 w-12 md:w-16"
              >
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/35" />
                {i === index && (
                  <span
                    key={`fill-${index}`}
                    className="absolute left-0 top-1/2 h-px w-full origin-left animate-hero-progress bg-white motion-reduce:animate-none"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                    onAnimationEnd={() => go(index + 1)}
                  />
                )}
              </button>
            ))}
          </div>
          <span className="font-serif text-[13px] tabular-nums tracking-[0.08em] text-white/60">
            {String(count).padStart(2, "0")}
          </span>
        </div>
      )}
    </section>
  );
}
