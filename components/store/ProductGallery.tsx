"use client";

import Image from "@/components/AppImage";
import { useRef, useState, useSyncExternalStore } from "react";
import type { Product } from "@/lib/types";

type Slide = { src: string; position: string };

/**
 * Real extra photos when the product has them; otherwise the seeded
 * single photo shown at several crops.
 */
function slidesFor(product: Product): Slide[] {
  if (!product.imageUrl) return [];
  if (product.galleryUrls.length > 0) {
    return [
      { src: product.imageUrl, position: product.imagePosition },
      ...product.galleryUrls.map((src) => ({ src, position: "50% 50%" })),
    ];
  }
  const crops =
    product.galleryPositions.length > 0
      ? product.galleryPositions
      : [product.imagePosition];
  return crops.map((position) => ({ src: product.imageUrl!, position }));
}

/* Cursor zoom only makes sense with a real pointer. On touch screens the
   browser fires mouseenter on tap, which left the photo stuck at 1.6×. */
const FINE_HOVER = "(hover: hover) and (pointer: fine)";
const subscribeHover = (onChange: () => void) => {
  const mq = window.matchMedia(FINE_HOVER);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

export function ProductGallery({ product }: { product: Product }) {
  const slides = slidesFor(product);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  const canHover = useSyncExternalStore(
    subscribeHover,
    () => window.matchMedia(FINE_HOVER).matches,
    () => false,
  );

  if (slides.length === 0) return null;

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    // Full-bleed on phones (the page has 24px gutters), framed from sm up.
    <div className="-mx-6 sm:mx-0">
      <div className="relative">
        {/* Native scroll-snap: momentum swipe on touch, no JS transforms
            that can leave the photo off-screen. */}
        <div
          ref={track}
          tabIndex={0}
          aria-label={`${product.name} photos`}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-beige outline-none [scrollbar-width:none] sm:rounded-joba-lg [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => (
            <div
              key={`${slide.src}-${slide.position}-${i}`}
              className="relative aspect-3/4 w-full flex-none snap-center snap-always overflow-hidden"
              onMouseMove={
                canHover
                  ? (e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - r.left) / r.width) * 100;
                      const y = ((e.clientY - r.top) / r.height) * 100;
                      setZoom(`${x}% ${y}%`);
                    }
                  : undefined
              }
              onMouseLeave={canHover ? () => setZoom(null) : undefined}
            >
              <Image
                src={slide.src}
                alt={
                  i === 0
                    ? `${product.name} — ${product.categoryName} saree`
                    : `${product.name}, photo ${i + 1}`
                }
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={i === 0}
                style={{
                  objectPosition: slide.position,
                  transformOrigin: zoom ?? "center",
                  transform: zoom && i === active ? "scale(1.6)" : "scale(1)",
                }}
                className="object-cover transition-transform duration-500 ease-joba"
              />
            </div>
          ))}
        </div>

        {product.tag && (
          <span
            className={`pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] ${
              product.tag === "SALE"
                ? "bg-hibiscus text-white"
                : "bg-white text-ink"
            }`}
          >
            {product.tag}
          </span>
        )}

        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:hidden">
            {slides.map((slide, i) => (
              <button
                key={`dot-${slide.src}-${i}`}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.25)] transition-[width,background] duration-300 ease-joba ${
                  i === active ? "w-5 bg-hibiscus" : "w-1.5 bg-white/85"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 hidden flex-wrap gap-3 sm:flex">
          {slides.map((slide, i) => (
            <button
              key={`thumb-${slide.src}-${slide.position}-${i}`}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={`relative aspect-square w-20 overflow-hidden rounded-joba border-2 transition-colors ${
                i === active ? "border-hibiscus" : "border-transparent"
              }`}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="80px"
                style={{ objectPosition: slide.position }}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
