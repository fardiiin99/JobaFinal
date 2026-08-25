import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        Add Product
      </h1>
      <p className="mb-8 mt-1.5 text-ink-soft">
        Saved products appear in the shop straight away.
      </p>
      <ProductForm categories={categories} />
    </>
  );
}
