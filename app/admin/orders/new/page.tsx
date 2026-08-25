import { ManualOrderForm } from "@/components/admin/ManualOrderForm";
import { getAdminProducts } from "@/lib/admin-queries";

export const metadata = { title: "Add new order" };

export default async function NewOrderPage() {
  const products = await getAdminProducts();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        Add new order
      </h1>
      <p className="mb-8 mt-1.5 text-ink-soft">
        For orders taken by phone or over Instagram. Stock is decremented just
        as it is for a web order.
      </p>
      <ManualOrderForm products={products} />
    </>
  );
}
