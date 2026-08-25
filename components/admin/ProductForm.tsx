"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct } from "@/app/admin/products/actions";
import type { Category, Product } from "@/lib/types";

const MAX_MB = 8;

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    product?.imageUrl ?? null,
  );

  const field =
    "mt-1.5 w-full rounded-joba border border-line bg-white px-4 py-2.5 text-[15px] outline-none focus:border-hibiscus";
  const label = "block text-[13px] font-semibold text-ink-soft";

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveProduct(formData);
      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="max-w-2xl space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <span className={label}>Photo</span>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative aspect-3/4 w-24 shrink-0 overflow-hidden rounded-joba border border-line bg-beige">
            {preview && (
              <Image
                src={preview}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                unoptimized={preview.startsWith("blob:")}
              />
            )}
          </div>
          <div>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Fail here rather than after a slow upload round-trip.
                if (file.size > MAX_MB * 1024 * 1024) {
                  setError(
                    `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_MB} MB.`,
                  );
                  e.target.value = "";
                  return;
                }
                setError(null);
                setPreview(URL.createObjectURL(file));
              }}
              className="text-[13.5px] file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white"
            />
            <p className="mt-2 text-[12.5px] text-ink-soft">
              JPEG, PNG, WebP or AVIF · up to {MAX_MB} MB. Stored in Supabase,
              not the browser.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={label}>Product name</span>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className={field}
          />
        </label>
        <label>
          <span className={label}>Category</span>
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ""}
            className={field}
          >
            <option value="" disabled>
              Choose a weave…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          <span className={label}>Price (৳)</span>
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.price}
            className={field}
          />
        </label>
        <label>
          <span className={label}>
            Compare at <span className="font-normal">(optional)</span>
          </span>
          <input
            name="compareAtPrice"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.compareAtPrice ?? ""}
            className={field}
          />
        </label>
        <label>
          <span className={label}>Stock</span>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.stock ?? 0}
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className={label}>Description</span>
        <textarea
          name="blurb"
          rows={4}
          defaultValue={product?.blurb}
          className={`${field} resize-y`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={label}>Badge</span>
          <select name="tag" defaultValue={product?.tag ?? ""} className={field}>
            <option value="">None</option>
            <option value="NEW">NEW</option>
            <option value="SALE">SALE</option>
          </select>
        </label>
        <label className="flex items-end gap-2.5 pb-2.5">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
            className="size-4"
          />
          <span className="text-[14px]">
            Visible in the shop
            <span className="block text-[12.5px] text-ink-soft">
              Unticked keeps it as a draft
            </span>
          </span>
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-joba border border-hibiscus bg-blush px-4 py-3 text-[14px] text-maroon"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-hibiscus px-7 py-3 font-semibold text-white transition-colors hover:bg-maroon disabled:opacity-60"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-[14px] text-ink-soft underline underline-offset-4 hover:text-hibiscus"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
