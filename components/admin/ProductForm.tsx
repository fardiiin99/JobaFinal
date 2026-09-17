"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct } from "@/app/admin/products/actions";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/types";

const MAX_MB = 8;
const MAX_PHOTOS = 12;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

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
  const [photos, setPhotos] = useState<string[]>(
    product
      ? [product.imageUrl, ...product.galleryUrls].filter(
          (u): u is string => Boolean(u),
        )
      : [],
  );
  const [uploading, setUploading] = useState(0);

  /* Straight from the browser to Storage: a server action caps request
     bodies at 1 MB by default and Vercel at 4.5 MB, which several
     full-size photos blow through. Storage RLS limits writes to the
     signed-in admin. */
  async function addPhotos(files: File[]) {
    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) {
      setError(`Up to ${MAX_PHOTOS} photos per product — ${room} more allowed.`);
      return;
    }
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name}: use JPEG, PNG, WebP or AVIF.`);
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(
          `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_MB} MB.`,
        );
        return;
      }
    }

    setError(null);
    setUploading((n) => n + files.length);
    const supabase = createClient();

    await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          setError(`${file.name}: upload failed — ${uploadError.message}`);
        } else {
          const { data } = supabase.storage.from("media").getPublicUrl(path);
          setPhotos((prev) => [...prev, data.publicUrl]);
        }
        setUploading((n) => n - 1);
      }),
    );
  }

  function movePhoto(from: number, to: number) {
    setPhotos((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

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
        <span className={label}>Photos</span>
        <input type="hidden" name="photos" value={JSON.stringify(photos)} />

        <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((url, i) => (
            <li key={url} className="group">
              <div
                className={`relative aspect-3/4 overflow-hidden rounded-joba border-2 bg-beige ${
                  i === 0 ? "border-hibiscus" : "border-line"
                }`}
              >
                <Image
                  src={url}
                  alt={`Photo ${i + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-hibiscus px-2 py-0.5 text-[10.5px] font-semibold text-white">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() =>
                    setPhotos((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-[14px] leading-none text-maroon shadow hover:bg-white"
                >
                  ×
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[12px]">
                <button
                  type="button"
                  aria-label={`Move photo ${i + 1} left`}
                  disabled={i === 0}
                  onClick={() => movePhoto(i, i - 1)}
                  className="px-1.5 text-ink-soft hover:text-hibiscus disabled:opacity-30"
                >
                  ←
                </button>
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => movePhoto(i, 0)}
                    className="font-medium text-ink-soft hover:text-hibiscus"
                  >
                    Make main
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Move photo ${i + 1} right`}
                  disabled={i === photos.length - 1}
                  onClick={() => movePhoto(i, i + 1)}
                  className="px-1.5 text-ink-soft hover:text-hibiscus disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </li>
          ))}

          {Array.from({ length: uploading }, (_, i) => (
            <li
              key={`uploading-${i}`}
              className="grid aspect-3/4 animate-pulse place-items-center rounded-joba border-2 border-dashed border-line bg-ivory text-[12px] text-ink-soft"
            >
              Uploading…
            </li>
          ))}

          {photos.length + uploading < MAX_PHOTOS && (
            <li>
              <label className="grid aspect-3/4 cursor-pointer place-items-center rounded-joba border-2 border-dashed border-line bg-white text-center text-[13px] font-medium text-ink-soft transition-colors hover:border-hibiscus hover:text-hibiscus">
                <span>
                  <span className="block text-[22px] leading-none">+</span>
                  Add photos
                </span>
                <input
                  type="file"
                  multiple
                  accept={ALLOWED_TYPES.join(",")}
                  className="sr-only"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = "";
                    if (files.length) void addPhotos(files);
                  }}
                />
              </label>
            </li>
          )}
        </ul>

        <p className="mt-2 text-[12.5px] text-ink-soft">
          The first photo is the main one on cards and shares. JPEG, PNG,
          WebP or AVIF · up to {MAX_MB} MB each · {MAX_PHOTOS} max.
        </p>
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
          disabled={pending || uploading > 0}
          className="rounded-full bg-hibiscus px-7 py-3 font-semibold text-white transition-colors hover:bg-maroon disabled:opacity-60"
        >
          {uploading > 0
            ? "Uploading photos…"
            : pending
              ? "Saving…"
              : product
                ? "Save changes"
                : "Add product"}
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
