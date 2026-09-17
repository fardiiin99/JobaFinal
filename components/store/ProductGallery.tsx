"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";

type Slide = { src: string; position: string };

/**
 * Real extra photos when the product has them; otherwise the seeded
 * single photo shown at several crops. Cursor-tracking zoom on both.
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

export function ProductGallery({ product }: { product: Product }) {
  const slides = slidesFor(product);

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("center");

  if (slides.length === 0) return null;
  const current = slides[Math.min(active, slides.length - 1)];

  return (
    <div>
      <div
        className="relative aspect-3/4 overflow-hidden rounded-joba-lg bg-beige"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => {
          setZoom(false);
          setOrigin("center");
        }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={`${product.name} — ${product.categoryName} saree`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          style={{
            objectPosition: current.position,
            transformOrigin: origin,
            transform: zoom ? "scale(1.6)" : "scale(1)",
          }}
          className="object-cover transition-transform duration-500 ease-joba"
        />
        {product.tag && (
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] ${
              product.tag === "SALE"
                ? "bg-hibiscus text-white"
                : "bg-white text-ink"
            }`}
          >
            {product.tag}
          </span>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {slides.map((slide, i) => (
            <button
              key={`${slide.src}-${slide.position}`}
              type="button"
              aria-label={`View ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
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
