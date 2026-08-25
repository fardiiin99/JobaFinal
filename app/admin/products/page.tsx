import Image from "next/image";
import Link from "next/link";
import { getAdminProducts } from "@/lib/admin-queries";
import { taka } from "@/lib/money";

export const metadata = { title: "Products" };

type SearchParams = Promise<{ q?: string; filter?: string }>;

const LOW_STOCK = 8;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, filter } = await searchParams;
  const all = await getAdminProducts();

  const query = (q ?? "").trim().toLowerCase();
  let products = query
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query),
      )
    : all;

  if (filter === "low") products = products.filter((p) => p.stock <= LOW_STOCK);
  if (filter === "draft") products = products.filter((p) => !p.active);

  const lowCount = all.filter((p) => p.stock <= LOW_STOCK).length;

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
      active
        ? "border-ink bg-ink text-white"
        : "border-line bg-white hover:bg-ivory"
    }`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
            Existing Products List
          </h1>
          <p className="mt-1.5 text-ink-soft">
            {all.length} products · {all.filter((p) => p.active).length} live ·{" "}
            {lowCount} low on stock
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-hibiscus px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-maroon"
        >
          Add product
        </Link>
      </div>

      {/* The legacy header advertised "N low on stock" with no way to
          actually see them. */}
      <form className="mt-6 flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="w-56 rounded-full border border-line bg-white px-4 py-2 text-[14px] outline-none focus:border-hibiscus"
        />
        <Link href="/admin/products" className={chip(!filter)}>
          All
        </Link>
        <Link
          href="/admin/products?filter=low"
          className={chip(filter === "low")}
        >
          Low stock ({lowCount})
        </Link>
        <Link
          href="/admin/products?filter=draft"
          className={chip(filter === "draft")}
        >
          Drafts
        </Link>
      </form>

      <div className="mt-6 overflow-x-auto rounded-joba-lg border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead className="border-b border-line text-[12px] uppercase tracking-[0.08em] text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Sold</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const low = p.stock <= LOW_STOCK;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative aspect-3/4 w-11 shrink-0 overflow-hidden rounded-lg bg-beige">
                        {p.imageUrl && (
                          <Image
                            src={p.imageUrl}
                            alt=""
                            fill
                            sizes="44px"
                            style={{ objectPosition: p.imagePosition }}
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span>
                        <strong className="block">{p.name}</strong>
                        <span className="text-[12.5px] text-ink-soft">
                          {p.categoryName}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right tabular-nums">
                    {taka(p.price)}
                    {p.compareAtPrice && (
                      <span className="block text-[12px] text-ink-soft line-through">
                        {taka(p.compareAtPrice)}
                      </span>
                    )}
                  </td>

                  <td
                    className={`px-4 py-3 tabular-nums ${low ? "font-semibold text-hibiscus" : ""}`}
                  >
                    {p.stock}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                        p.active
                          ? "bg-[#e6f2ec] text-[#2f7d5b]"
                          : "bg-beige text-ink-soft"
                      }`}
                    >
                      {p.active ? "Live" : "Draft"}
                    </span>
                  </td>

                  <td className="px-4 py-3 tabular-nums text-ink-soft">
                    {p.soldCount.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[13px] font-semibold text-hibiscus underline underline-offset-4"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="px-4 py-12 text-center text-ink-soft">
            No products match that filter.
          </p>
        )}
      </div>
    </>
  );
}
