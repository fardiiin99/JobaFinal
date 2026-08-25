import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProduct } from "@/lib/admin-queries";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Edit Product" };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        {product.name}
      </h1>
      <p className="mb-8 mt-1.5 text-ink-soft">
        Changes reach the shop as soon as you save ·{" "}
        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          className="underline underline-offset-4 hover:text-hibiscus"
        >
          view on the storefront ↗
        </Link>
      </p>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
