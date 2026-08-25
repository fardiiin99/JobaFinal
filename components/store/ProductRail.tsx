"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/**
 * Horizontally scrolling product strip with snap points.
 *
 * The legacy version measured `.product` offsetWidth to compute a
 * scroll step and threw when the rail rendered empty. Scrolling by a
 * fraction of the viewport needs no measurement at all.
 */
interface Props {
  products: Product[];
  /** Rendered beside the arrows, as the legacy .rail-controls row did. */
  action?: { href: string; label: string };
}

export function ProductRail({ products, action }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div className="absolute -top-14 right-0 hidden items-center gap-2.5 sm:flex">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="grid size-[38px] place-items-center rounded-full border border-line bg-white text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="icon">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="grid size-[38px] place-items-center rounded-full border border-line bg-white text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="icon">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {action && (
          <Link
            href={action.href}
            className="ml-1 whitespace-nowrap rounded-full border border-line bg-white px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-200 hover:bg-ink hover:text-white"
          >
            {action.label}
          </Link>
        )}
      </div>

      <div
        ref={ref}
        className="-mx-2.5 flex snap-x snap-mandatory gap-[18px] overflow-x-auto px-2.5 pb-7 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, i) => (
          <div key={product.id} className="w-[258px] flex-none snap-start">
            <ProductCard product={product} priority={i < 2} />
          </div>
        ))}
      </div>
    </div>
  );
}
