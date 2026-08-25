import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { PdpBuyBox } from "@/components/store/PdpBuyBox";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductRail } from "@/components/store/ProductRail";
import { discountPercent, taka } from "@/lib/money";
import {
  getProductBySlug,
  getProducts,
  getProductsByCategory,
} from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

/* The legacy PDP shipped <title>Product — Joba</title> for every item,
   with no description and no OG image — so every share looked blank. */
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };

  const title = `${product.name} — ${product.categoryName} Saree`;
  return {
    title,
    description: product.blurb.slice(0, 160),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description: product.blurb.slice(0, 160),
      images: product.imageUrl ? [product.imageUrl] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProductsByCategory(product.categorySlug))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const off = discountPercent(product.price, product.compareAtPrice);

  /* Structured data so the price and availability can show in search
     results. The legacy site emitted none. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.blurb,
    image: product.imageUrl ? [product.imageUrl] : undefined,
    category: product.categoryName,
    ...(product.rating != null && product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "BDT",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        trail={[
          { href: "/", label: "Home" },
          {
            href: `/category/${product.categorySlug}`,
            label: product.categoryName,
          },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">
            <Link
              href={`/category/${product.categorySlug}`}
              className="hover:text-hibiscus"
            >
              {product.categoryName}
            </Link>
          </p>

          <h1 className="mt-2 font-serif text-[clamp(28px,3.6vw,40px)] font-semibold -tracking-[0.02em]">
            {product.name}
          </h1>

          {product.rating != null && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-ink-soft">
              <span className="tracking-[1px] text-olive">
                {"★".repeat(Math.round(product.rating))}
                {"☆".repeat(5 - Math.round(product.rating))}
              </span>
              <strong className="text-ink">{product.rating}</strong>
              <span>({product.reviewCount} reviews)</span>
              <span>· {product.soldCount.toLocaleString("en-IN")} sold</span>
            </p>
          )}

          <p className="mt-5 flex flex-wrap items-baseline gap-3 text-2xl font-semibold">
            {taka(product.price)}
            {product.compareAtPrice && (
              <>
                <span className="text-lg font-normal text-ink-soft line-through">
                  {taka(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-hibiscus px-2.5 py-1 text-[12px] font-semibold text-white">
                  −{off}%
                </span>
              </>
            )}
          </p>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
            {product.blurb}
          </p>

          <PdpBuyBox productId={product.id} stock={product.stock} />

          <ul className="mt-8 space-y-2 border-t border-line pt-6 text-[14px] text-ink-soft">
            <li>Free delivery over the store threshold · ships in 2–4 days</li>
            <li>7-day easy exchange · free first re-fall &amp; pico</li>
            <li>Blouse piece included · loom ID on the label</li>
          </ul>

          {product.specs.length > 0 && (
            <dl className="mt-8 divide-y divide-line border-t border-line">
              {product.specs.map(([key, value]) => (
                <div key={key} className="flex gap-6 py-3 text-[14px]">
                  <dt className="w-32 shrink-0 text-ink-soft">{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-20">
          <h2 className="mb-7 font-serif text-[clamp(24px,3vw,32px)] font-semibold -tracking-[0.02em]">
            More in {product.categoryName}
          </h2>
          <ProductRail products={related} />
        </section>
      )}
    </main>
  );
}
