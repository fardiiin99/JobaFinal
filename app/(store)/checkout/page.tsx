import type { Metadata } from "next";
import { Breadcrumb } from "@/components/store/Breadcrumb";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { getProducts, getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSettings(),
  ]);

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <Breadcrumb
        trail={[
          { href: "/", label: "Home" },
          { href: "/cart", label: "Bag" },
          { label: "Checkout" },
        ]}
      />
      <h1 className="mb-8 font-serif text-[clamp(28px,3.6vw,38px)] font-semibold -tracking-[0.02em]">
        Checkout
      </h1>
      <CheckoutForm products={products} settings={settings} />
    </main>
  );
}
