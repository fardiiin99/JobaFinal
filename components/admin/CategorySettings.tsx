"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/settings/actions";
import type { Category } from "@/lib/types";

const SIZES = [
  { value: "", label: "Standard tile" },
  { value: "lg", label: "Large (2×2)" },
  { value: "full", label: "Full width row" },
];

const field =
  "mt-1.5 w-full rounded-joba border border-line bg-white px-3.5 py-2 text-[14px] outline-none focus:border-hibiscus";
const label = "block text-[12.5px] font-semibold text-ink-soft";

function DeleteButton({
  category,
  onDone,
  onError,
}: {
  category: Category;
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[13px] text-ink-soft underline underline-offset-4 hover:text-maroon"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 text-[13px]">
      <span className="text-maroon">Delete “{category.name}”?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteCategory(category.id);
            if (result.ok) onDone();
            else {
              onError(result.error);
              setConfirming(false);
            }
          })
        }
        className="font-semibold text-maroon underline underline-offset-4 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-ink-soft underline underline-offset-4"
      >
        Keep
      </button>
    </span>
  );
}

function CategoryRow({
  category,
  onDone,
}: {
  category?: Category;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    category?.imageUrl ?? null,
  );
  const isNew = !category;

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await saveCategory(formData);
          if (result.ok) onDone();
          else setError(result.error);
        });
      }}
      className="rounded-joba-lg border border-line bg-white p-5"
    >
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="flex flex-wrap gap-5">
        <div className="w-28 shrink-0">
          <div className="relative aspect-3/4 overflow-hidden rounded-joba border border-line bg-beige">
            {preview && (
              <Image
                src={preview}
                alt=""
                fill
                sizes="112px"
                style={{ objectPosition: category?.imagePosition }}
                className="object-cover"
                unoptimized={preview.startsWith("blob:")}
              />
            )}
          </div>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="mt-2 w-full text-[11.5px] file:mr-2 file:rounded-full file:border-0 file:bg-ink file:px-2.5 file:py-1 file:text-[11px] file:font-semibold file:text-white"
          />
        </div>

        <div className="min-w-64 flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className={label}>Name</span>
              <input
                name="name"
                required
                defaultValue={category?.name}
                className={field}
              />
            </label>
            <label>
              <span className={label}>
                Slug <span className="font-normal">(the URL)</span>
              </span>
              <input
                name="slug"
                required
                pattern="[a-z0-9-]+"
                defaultValue={category?.slug}
                placeholder="indigo-dabu"
                className={field}
              />
            </label>
          </div>

          <label className="block">
            <span className={label}>Description</span>
            <input
              name="description"
              defaultValue={category?.description}
              className={field}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label>
              <span className={label}>Homepage tile</span>
              <select
                name="size"
                defaultValue={category?.size ?? ""}
                className={field}
              >
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>
                Crop <span className="font-normal">(x y)</span>
              </span>
              <input
                name="imagePosition"
                defaultValue={category?.imagePosition ?? "50% 50%"}
                placeholder="50% 40%"
                className={field}
              />
            </label>
            <label>
              <span className={label}>Order</span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={category?.sortOrder ?? 99}
                className={field}
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-joba border border-hibiscus bg-blush px-3.5 py-2.5 text-[13px] text-maroon"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-hibiscus px-5 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-maroon disabled:opacity-60"
            >
              {pending ? "Saving…" : isNew ? "Add category" : "Save"}
            </button>

            {category ? (
              <DeleteButton
                category={category}
                onDone={onDone}
                onError={setError}
              />
            ) : (
              <button
                type="button"
                onClick={onDone}
                className="text-[13px] text-ink-soft underline underline-offset-4"
              >
                Cancel
              </button>
            )}

            <span className="ml-auto text-[12.5px] text-ink-soft">
              {category?.productCount ?? 0} product
              {category?.productCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}

export function CategorySettings({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const done = () => {
    setAdding(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} onDone={done} />
      ))}

      {adding ? (
        <CategoryRow onDone={done} />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full rounded-joba-lg border border-dashed border-line bg-white/50 py-5 text-[14px] font-semibold text-ink-soft transition-colors hover:border-hibiscus hover:text-hibiscus"
        >
          + Add a category
        </button>
      )}
    </div>
  );
}
