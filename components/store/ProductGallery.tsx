"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";

/**
 * Single photo shown at several crops to imply a gallery, plus a
 * cursor-tracking zoom — the same trick the legacy PDP used.
 */
export function ProductGallery({ product }: { product: Product }) {
  const crops =
    product.galleryPositions.length > 0
      ? product.galleryPositions
      : [product.imagePosition];

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("center");

  if (!product.imageUrl) return null;
  const src = product.imageUrl;

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
          src={src}
          alt={`${product.name} — ${product.categoryName} saree`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          style={{
            objectPosition: crops[active],
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

      {crops.length > 1 && (
        <div className="mt-3 flex gap-3">
          {crops.map((crop, i) => (
            <button
              key={crop}
              type="button"
              aria-label={`View ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-20 overflow-hidden rounded-joba border-2 transition-colors ${
                i === active ? "border-hibiscus" : "border-transparent"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                style={{ objectPosition: crop }}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
