import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { ProductGrid } from "@/components/store/ProductGrid";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/queries";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

/* The legacy category page shipped a single static <title>
   ("Shop by Weave — Joba") for all six weaves, no description and no
   OG tags. Each weave now gets its own. */
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not found" };

  const title = `${category.name} Sarees`;
  return {
    title,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title,
      description: category.description,
      images: category.imageUrl ? [category.imageUrl] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <Breadcrumb
        trail={[
          { href: "/", label: "Home" },
          { href: "/#collections", label: "Shop by Weave" },
          { label: category.name },
        ]}
      />

      <div className="relative mb-10 h-[clamp(200px,32vh,340px)] overflow-hidden rounded-joba-lg bg-beige">
        {category.imageUrl && (
          <Image
            src={category.imageUrl}
            alt={`${category.name} saree`}
            fill
            sizes="100vw"
            priority
            style={{ objectPosition: category.imagePosition }}
            className="object-cover"
          />
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-[rgba(16,8,10,0.8)] to-transparent to-70%"
        />
        <div className="absolute inset-x-8 bottom-7 text-white">
          <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-semibold -tracking-[0.02em]">
            {category.name}
          </h1>
          <p className="mt-1.5 max-w-lg text-[14.5px] opacity-85">
            {category.description}
          </p>
        </div>
      </div>

      {/* Honest count. The legacy page rendered "Showing 1 of 96 pieces
          in this weave" from a hardcoded figure. */}
      <p className="mb-6 text-ink-soft">
        {products.length} {products.length === 1 ? "piece" : "pieces"} in this
        weave
      </p>

      <ProductGrid
        products={products}
        emptyTitle="Nothing in this weave yet"
        emptyBody="New pieces are on the loom — check back soon."
      />
    </main>
  );
}
