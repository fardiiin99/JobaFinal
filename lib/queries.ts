import { createPublicClient } from "./supabase/public";
import { num } from "./money";
import type {
  Category,
  CommunityPost,
  HeroSlide,
  Product,
  Review,
  StoreSettings,
} from "./types";

/* Every read here goes through RLS as the anon role, so only rows the
   public is allowed to see come back. Nothing is filtered in the UI
   for security reasons — the database does it. */

const PRODUCT_COLUMNS = `
  id, slug, name, category_id, price, compare_at_price, image_url,
  image_position, gallery_positions, blurb, specs, rating, review_count,
  sold_count, stock, tag, active, sort_order,
  categories!inner ( name, slug )
`;

type RawProduct = Record<string, unknown> & {
  categories: { name: string; slug: string } | null;
};

function toProduct(row: RawProduct): Product {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    categoryId: row.category_id as string,
    categoryName: row.categories?.name ?? "",
    categorySlug: row.categories?.slug ?? "",
    price: num(row.price),
    compareAtPrice:
      row.compare_at_price == null ? null : num(row.compare_at_price),
    imageUrl: (row.image_url as string) ?? null,
    imagePosition: (row.image_position as string) ?? "50% 50%",
    galleryPositions: (row.gallery_positions as string[]) ?? [],
    blurb: (row.blurb as string) ?? "",
    specs: (row.specs as [string, string][]) ?? [],
    rating: row.rating == null ? null : num(row.rating),
    reviewCount: num(row.review_count),
    soldCount: num(row.sold_count),
    stock: num(row.stock),
    tag: (row.tag as Product["tag"]) ?? null,
    active: Boolean(row.active),
    sortOrder: num(row.sort_order),
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("sort_order");

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data as unknown as RawProduct[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return data ? toProduct(data as unknown as RawProduct) : null;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.categorySlug === slug);
}

/** Newest first — the homepage "New Arrivals" rail. */
export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return all.slice(0, limit);
}

/**
 * Ranked by units sold. Derived, not a stored flag, so the list stays
 * honest as orders come in.
 */
export async function getBestSellers(limit = 4): Promise<Product[]> {
  const all = await getProducts();
  return [...all].sort((a, b) => b.soldCount - a.soldCount).slice(0, limit);
}

export async function getSaleProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.compareAtPrice != null);
}

/**
 * Categories with a real product count.
 *
 * The legacy site hardcoded 184/96/130/41/74/212 against a 7-product
 * catalogue and printed "Showing 1 of 96 pieces in this weave" to
 * shoppers. Counting live rows is the fix.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("sort_order");

  if (error) throw new Error(`Failed to load categories: ${error.message}`);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    imageUrl: (row.image_url as string) ?? null,
    imagePosition: (row.image_position as string) ?? "50% 50%",
    size: (row.size as Category["size"]) ?? "",
    sortOrder: num(row.sort_order),
    productCount: num(
      (row.products as { count: number }[] | undefined)?.[0]?.count,
    ),
  }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

/* ── Homepage content documents ──────────────────────────── */

async function getContent<T>(key: string): Promise<T[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("content")
    .select("data")
    .eq("key", key)
    .maybeSingle();

  if (error) throw new Error(`Failed to load ${key}: ${error.message}`);
  const value = data?.data;
  return Array.isArray(value) ? (value as T[]) : [];
}

export const getHeroSlides = () => getContent<HeroSlide>("hero");
export const getReviews = () => getContent<Review>("reviews");
export const getCommunityPosts = () => getContent<CommunityPost>("community");

/* ── Store settings ──────────────────────────────────────── */

const SETTINGS_FALLBACK: StoreSettings = {
  storeName: "House of Joba",
  contactEmail: "hello@joba.com",
  currency: "BDT",
  freeShippingThreshold: 8000,
  shippingFee: 150,
  metaPixelId: null,
  metaEvents: {},
};

export async function getSettings(): Promise<StoreSettings> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .maybeSingle();

  // Shipping maths must never crash a checkout, so fall back rather
  // than throw. The values mirror the column defaults.
  if (error || !data) return SETTINGS_FALLBACK;

  return {
    storeName: data.store_name ?? SETTINGS_FALLBACK.storeName,
    contactEmail: data.contact_email ?? SETTINGS_FALLBACK.contactEmail,
    currency: data.currency ?? SETTINGS_FALLBACK.currency,
    freeShippingThreshold: num(
      data.free_shipping_threshold,
      SETTINGS_FALLBACK.freeShippingThreshold,
    ),
    shippingFee: num(data.shipping_fee, SETTINGS_FALLBACK.shippingFee),
    metaPixelId: data.meta_pixel_id ?? null,
    metaEvents: (data.meta_events as Record<string, boolean>) ?? {},
  };
}
