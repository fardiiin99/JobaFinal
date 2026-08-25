import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { ProductGrid } from "@/components/store/ProductGrid";
import { getCategories, getProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Every handwoven saree we carry — indigo dabu, Chanderi, mul cotton, Kota Doria, Bagru print and hand block cotton.",
  alternates: { canonical: "/shop" },
};

/* Filtering happens in the URL rather than client state, so a filtered
   view is linkable, shareable and indexable. */
type SearchParams = Promise<{ weave?: string; sort?: string }>;

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
} as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { weave, sort } = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  let products = weave ? all.filter((p) => p.categorySlug === weave) : all;

  if (sort === "price-asc") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    products = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  const activeSort = (sort ?? "featured") as keyof typeof SORTS;
  const href = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { weave, sort, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <Breadcrumb
        trail={[{ href: "/", label: "Home" }, { label: "Shop All" }]}
      />

      <h1 className="font-serif text-[clamp(30px,4vw,42px)] font-semibold -tracking-[0.02em]">
        Shop All
      </h1>
      <p className="mt-2 text-ink-soft">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
        {weave ? " in this weave" : " in the collection"}
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Link
          href={href({ weave: undefined })}
          className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
            weave
              ? "border-line bg-white hover:bg-ivory"
              : "border-ink bg-ink text-white"
          }`}
        >
          All weaves
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={href({ weave: c.slug })}
            className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
              weave === c.slug
                ? "border-ink bg-ink text-white"
                : "border-line bg-white hover:bg-ivory"
            }`}
          >
            {c.name}
          </Link>
        ))}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((key) => (
            <Link
              key={key}
              href={href({ sort: key === "featured" ? undefined : key })}
              className={`rounded-full border px-3.5 py-2 text-[12.5px] transition-colors ${
                activeSort === key
                  ? "border-hibiscus text-hibiscus"
                  : "border-line bg-white hover:bg-ivory"
              }`}
            >
              {SORTS[key]}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <ProductGrid
          products={products}
          emptyTitle="No sarees match that filter"
          emptyBody="Try another weave, or browse the full collection."
        />
      </div>
    </main>
  );
}
