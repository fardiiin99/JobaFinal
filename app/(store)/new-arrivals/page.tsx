import type { Metadata } from "next";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { ProductGrid } from "@/components/store/ProductGrid";
import { getNewArrivals } from "@/lib/queries";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "The latest handwoven sarees off the loom — fresh indigo dabu, Chanderi, mul cotton and Kota Doria.",
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24);

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <Breadcrumb
        trail={[{ href: "/", label: "Home" }, { label: "New Arrivals" }]}
      />
      <h1 className="font-serif text-[clamp(30px,4vw,42px)] font-semibold -tracking-[0.02em]">
        New Arrivals
      </h1>
      <p className="mb-8 mt-2 text-ink-soft">
        {products.length} {products.length === 1 ? "piece" : "pieces"}, newest
        first
      </p>
      <ProductGrid products={products} />
    </main>
  );
}
