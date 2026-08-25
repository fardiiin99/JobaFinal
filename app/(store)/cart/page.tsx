import type { Metadata } from "next";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { CartView } from "@/components/store/CartView";
import { getProducts, getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Your Bag",
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSettings(),
  ]);

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <Breadcrumb
        trail={[{ href: "/", label: "Home" }, { label: "Your Bag" }]}
      />
      <h1 className="mb-8 font-serif text-[clamp(28px,3.6vw,38px)] font-semibold -tracking-[0.02em]">
        Your Bag
      </h1>
      <CartView products={products} settings={settings} />
    </main>
  );
}
