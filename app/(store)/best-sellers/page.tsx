import type { Metadata } from "next";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { ProductGrid } from "@/components/store/ProductGrid";
import { getBestSellers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Best Sellers",
  description:
    "The handwoven sarees our customers reach for most, ranked by units sold.",
  alternates: { canonical: "/best-sellers" },
};

export default async function BestSellersPage() {
  /* Ranked from real sold counts rather than a hand-maintained list,
     so the order stays honest as orders come in. */
  const products = await getBestSellers(24);

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <Breadcrumb
        trail={[{ href: "/", label: "Home" }, { label: "Best Sellers" }]}
      />
      <h1 className="font-serif text-[clamp(30px,4vw,42px)] font-semibold -tracking-[0.02em]">
        Best Sellers
      </h1>
      <p className="mb-8 mt-2 text-ink-soft">Ranked by units sold</p>
      <ProductGrid products={products} mode="best" />
    </main>
  );
}
