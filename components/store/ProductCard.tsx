import Image from "next/image";
import Link from "next/link";
import { taka } from "@/lib/money";
import type { Product } from "@/lib/types";
import { AddToBagButton } from "./AddToBagButton";

interface Props {
  product: Product;
  /** 'best' swaps the badge for a rank pill and shows rating + units. */
  mode?: "new" | "best";
  /** 1-based position, for the rank pill. */
  rank?: number;
  /** Set on the first few cards above the fold. */
  priority?: boolean;
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span
      className="text-[12px] tracking-[1px] text-olive"
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(filled)}
      {"☆".repeat(5 - filled)}
    </span>
  );
}

export function ProductCard({ product, mode = "new", rank, priority }: Props) {
  const href = `/product/${product.slug}`;
  const onSale = product.compareAtPrice != null;
  const soldOut = product.stock <= 0;

  return (
    <article className="group relative overflow-hidden rounded-joba bg-white outline outline-[1.5px] outline-offset-[5px] outline-hibiscus transition-[transform,box-shadow] duration-300 ease-joba hover:-translate-y-1.5 hover:shadow-joba">
      <div className="relative aspect-3/4 overflow-hidden bg-beige">
        <Link href={href} aria-label={product.name}>
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={`${product.name} — ${product.categoryName} saree`}
              fill
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 258px"
              priority={priority}
              style={{ objectPosition: product.imagePosition }}
              className="object-cover transition-transform duration-700 ease-joba group-hover:scale-[1.06]"
            />
          )}
        </Link>

        {mode === "best" && rank ? (
          <span className="absolute left-3 top-3 z-2 flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1.5 text-[10.5px] font-semibold tracking-[0.06em] text-white">
            <em className="not-italic text-olive">#{rank}</em>
            <span>BEST SELLER</span>
          </span>
        ) : (
          /* Rendered only when a tag exists. The legacy card printed the
             literal string "null" for untagged products. */
          product.tag && (
            <span
              className={`absolute left-3 top-3 z-2 rounded-full px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.1em] ${
                product.tag === "SALE"
                  ? "bg-hibiscus text-white"
                  : "bg-white text-ink"
              }`}
            >
              {product.tag}
            </span>
          )
        )}

        <AddToBagButton
          productId={product.id}
          inStock={!soldOut}
          className="absolute inset-x-3 bottom-3 z-2 translate-y-3 rounded-full bg-ink p-2.5 text-[13px] font-semibold text-white opacity-0 transition-[opacity,transform] duration-300 ease-joba focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
        />
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          {product.categoryName}
        </p>
        <Link href={href} className="block">
          <h3 className="mb-2 mt-1.5 font-serif text-[16.5px] font-semibold transition-colors group-hover:text-hibiscus">
            {product.name}
          </h3>
        </Link>

        <p className="flex items-baseline gap-2 text-[14.5px] font-semibold">
          {taka(product.price)}
          {onSale && (
            <span className="text-[13px] font-normal text-ink-soft line-through">
              {taka(product.compareAtPrice!)}
            </span>
          )}
        </p>

        {mode === "best" && (
          <>
            {product.rating != null && (
              <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-soft">
                <Stars rating={product.rating} />
                {product.rating}
                <span>({product.reviewCount})</span>
              </p>
            )}
            <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-ink-soft">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-[#2f8a5f]"
              />
              {product.soldCount.toLocaleString("en-IN")} sold
            </p>
          </>
        )}
      </div>
    </article>
  );
}
