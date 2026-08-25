"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

async function uploadImage(
  file: File,
  folder: string,
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
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { ok: false, error: `Upload failed: ${error.message}` };

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/categories");
}

/* ── Categories ──────────────────────────────────────────── */

export async function saveCategory(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const size = String(formData.get("size") ?? "");

  if (!name) return { ok: false, error: "Category name is required." };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      ok: false,
      error: "Slug may contain only lowercase letters, numbers and hyphens.",
    };
  }
  if (!["", "lg", "full"].includes(size)) {
    return { ok: false, error: "Unknown tile size." };
  }

  const row: Record<string, unknown> = {
    name,
    slug,
    description: String(formData.get("description") ?? "").trim(),
    size,
    // Crop position — unreachable from the legacy admin entirely.
    image_position: String(formData.get("imagePosition") ?? "50% 50%").trim(),
    sort_order: Number(formData.get("sortOrder")) || 0,
  };

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "categories");
    if (!uploaded.ok) return uploaded;
    row.image_url = uploaded.url;
  }

  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: `The slug "${slug}" is already in use.` };
    }
    return { ok: false, error: error.message };
  }

  refresh();
  return { ok: true };
}

/**
 * Remove a category.
 *
 * products.category_id is ON DELETE RESTRICT, so Postgres would refuse
 * anyway — but a foreign-key error is not a useful thing to show
 * someone, so check first and say what to do about it.
 */
export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) return { ok: false, error: countError.message };

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `${count} product${count === 1 ? "" : "s"} still use this weave. Move them to another category first.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true };
}

/* ── Homepage content ────────────────────────────────────── */

/**
 * Replace a content document (hero / reviews / community).
 *
 * Every editor writes the whole ordered array, so reordering and
 * removal come for free — neither was possible in the legacy admin,
 * which also required a separate "Save" press and silently discarded
 * edits if you navigated away first.
 */
export async function saveContent(
  key: "hero" | "reviews" | "community",
  data: unknown[],
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("content")
    .upsert({ key, data }, { onConflict: "key" });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/homepage");
  return { ok: true };
}

/** Upload a photo for homepage content and hand back its URL. */
export async function uploadContentImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file selected." };
  }
  return uploadImage(file, "content");
}

/* ── Store settings ──────────────────────────────────────── */

export async function saveStoreSettings(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const threshold = Number(formData.get("freeShippingThreshold"));
  const fee = Number(formData.get("shippingFee"));

  if (!Number.isFinite(threshold) || threshold < 0) {
    return {
      ok: false,
      error: "Free-shipping threshold must be zero or more.",
    };
  }
  if (!Number.isFinite(fee) || fee < 0) {
    return { ok: false, error: "Shipping fee must be zero or more." };
  }

  const { error } = await supabase
    .from("settings")
    .update({
      store_name: String(formData.get("storeName") ?? "").trim(),
      contact_email: String(formData.get("contactEmail") ?? "").trim(),
      free_shipping_threshold: threshold,
      shipping_fee: fee,
    })
    .eq("id", true);

  if (error) return { ok: false, error: error.message };

  // Cart and checkout read these, so every cached page is now stale.
  revalidatePath("/", "layout");
  return { ok: true };
}
