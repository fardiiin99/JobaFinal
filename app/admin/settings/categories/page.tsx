import { CategorySettings } from "@/components/admin/CategorySettings";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Product Category Settings" };

export default async function CategorySettingsPage() {
  const categories = await getCategories();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        Product Category Settings
      </h1>
      <p className="mb-8 mt-1.5 max-w-2xl text-ink-soft">
        Weaves shown on the homepage and used to group products. The slug is
        the category&apos;s URL, so changing it changes the address of that
        page.
      </p>
      <CategorySettings categories={categories} />
    </>
  );
}
