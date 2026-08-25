import type { Metadata } from "next";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { ProductGrid } from "@/components/store/ProductGrid";
import { getSaleProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Sale",
  description:
    "Handwoven sarees currently reduced — same looms, same weavers, lower price.",
  alternates: { canonical: "/sale" },
};

export default async function SalePage() {
  /* Derived from compare_at_price rather than a manual flag, so a
     product can never sit on the Sale page without a real markdown. */
  const products = await getSaleProducts();

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { label: "Sale" }]} />
      <h1 className="font-serif text-[clamp(30px,4vw,42px)] font-semibold -tracking-[0.02em]">
        Sale
      </h1>
      <p className="mb-8 mt-2 text-ink-soft">
        {products.length} {products.length === 1 ? "piece" : "pieces"} reduced
      </p>
      <ProductGrid
        products={products}
        emptyTitle="No sale on right now"
        emptyBody="Nothing is reduced at the moment — but new pieces land often."
      />
    </main>
  );
}
