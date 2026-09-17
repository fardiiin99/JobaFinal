"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

const MAX_PHOTOS = 12;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/**
 * Photos are uploaded from the browser straight to Storage, so only
 * URLs arrive here. Accept this project's media bucket and the bundled
 * seed images — nothing else ends up rendered on the storefront.
 */
function parsePhotos(raw: FormDataEntryValue | null): string[] | null {
  let list: unknown;
  try {
    list = JSON.parse(String(raw ?? "[]"));
  } catch {
    return null;
  }
  if (!Array.isArray(list) || list.length > MAX_PHOTOS) return null;

  const bucket = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;
  const valid = list.every(
    (u) =>
      typeof u === "string" &&
      (u.startsWith(bucket) || /^\/images\/[\w.-]+$/.test(u)),
  );
  return valid ? [...new Set(list as string[])] : null;
}

/** Refresh every surface a product edit can affect. */
function revalidateStorefront() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
}

export async function saveProduct(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const price = Number(formData.get("price"));
  const compareRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const stock = Number(formData.get("stock"));
  const tagRaw = String(formData.get("tag") ?? "").trim();

  if (!name) return { ok: false, error: "Product name is required." };
  if (!categoryId) return { ok: false, error: "Pick a category." };
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "Price must be a positive number." };
  }
  if (!Number.isFinite(stock) || stock < 0) {
    return { ok: false, error: "Stock must be zero or more." };
  }

  const compareAtPrice = compareRaw === "" ? null : Number(compareRaw);
  if (compareAtPrice !== null && compareAtPrice <= price) {
    return {
      ok: false,
      error: "The compare-at price must be higher than the price.",
    };
  }

  const row: Record<string, unknown> = {
    name,
    category_id: categoryId,
    price,
    compare_at_price: compareAtPrice,
    stock: Math.floor(stock),
    blurb: String(formData.get("blurb") ?? "").trim(),
    // Nullable on purpose — the legacy card printed the string "null".
    tag: tagRaw === "" ? null : tagRaw,
    active: formData.get("active") === "on",
  };

  const photos = parsePhotos(formData.get("photos"));
  if (!photos) {
    return { ok: false, error: `Photos are invalid — up to ${MAX_PHOTOS} allowed.` };
  }
  row.image_url = photos[0] ?? null;
  row.gallery_urls = photos.slice(1);

  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidateStorefront();
    return { ok: true, id };
  }

  // Slug is derived once on create, then left alone — changing it later
  // would break every link and share of the existing product page.
  row.slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase
    .from("products")
    .insert(row)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true, id: data.id as string };
}

/**
 * Permanently remove a product and its uploaded photos.
 *
 * Past orders survive: order_items keeps its own name/price snapshot and
 * product_id is ON DELETE SET NULL. To hide a product temporarily, untick
 * "Visible in the shop" instead.
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: product, error: readError } = await supabase
    .from("products")
    .select("image_url, gallery_urls")
    .eq("id", id)
    .maybeSingle();

  if (readError) return { ok: false, error: readError.message };
  if (!product) return { ok: false, error: "That product no longer exists." };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Only files in our bucket; bundled /images/ seed photos are left alone.
  const bucket = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;
  const paths = [product.image_url, ...(product.gallery_urls ?? [])]
    .filter((u): u is string => typeof u === "string" && u.startsWith(bucket))
    .map((u) => u.slice(bucket.length));

  if (paths.length > 0) {
    // Best effort: the product is already gone, an orphaned file is harmless.
    await supabase.storage.from("media").remove(paths);
  }

  revalidateStorefront();
  return { ok: true };
}
