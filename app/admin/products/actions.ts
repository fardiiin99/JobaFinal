"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

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
 * Push an uploaded photo into Storage and return its public URL.
 *
 * The legacy admin base64-encoded images into localStorage, a ~5 MB
 * quota shared with everything else. save() had no try/catch, so a
 * real photo threw QuotaExceededError straight out of the click
 * handler — no error, no toast, the button simply appeared dead.
 */
async function uploadImage(
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: `Unsupported image type: ${file.type}` };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Image is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 8 MB.`,
    };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { ok: false, error: `Upload failed: ${error.message}` };

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
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

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file);
    if (!uploaded.ok) return uploaded;
    row.image_url = uploaded.url;
  }

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

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  /* Archive rather than delete. order_items keeps a name and price
     snapshot, but removing the row would still strip the link from
     historical orders — and stock/sales history with it. */
  const { error } = await supabase
    .from("products")
    .update({ active: false })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true };
}
