import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

interface Props {
  products: Product[];
  mode?: "new" | "best";
  /** Shown when the list is empty. */
  emptyTitle?: string;
  emptyBody?: string;
}

export function ProductGrid({
  products,
  mode = "new",
  emptyTitle = "Nothing here yet",
  emptyBody = "New pieces are on the way — check back soon.",
}: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-joba-lg border border-line bg-white px-6 py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold">{emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">{emptyBody}</p>
        <Link
          href="/shop"
          className="mt-7 inline-block rounded-full bg-hibiscus px-8 py-3.5 font-semibold text-white transition-colors duration-300 ease-joba hover:bg-maroon"
        >
          Shop all sarees
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[18px] pb-5 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          mode={mode}
          rank={mode === "best" ? i + 1 : undefined}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
