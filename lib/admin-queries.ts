import { createClient } from "./supabase/server";
import { num } from "./money";
import type { OrderStatus, PaymentMethod, Product } from "./types";

/* Reads here go through the signed-in session, so RLS returns rows the
   public cannot see: inactive products, and orders. */

export interface AdminOrderItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string;
  city: string;
  postcode: string | null;
  note: string | null;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  source: "web" | "manual";
  createdAt: string;
  items: AdminOrderItem[];
}

const ADMIN_PRODUCT_COLUMNS = `
  id, slug, name, category_id, price, compare_at_price, image_url,
  image_position, gallery_positions, blurb, specs, rating, review_count,
  sold_count, stock, tag, active, sort_order,
  categories ( name, slug )
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

/** Every product, including drafts — unlike the storefront query. */
export async function getAdminProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_COLUMNS)
    .order("sort_order");

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data as unknown as RawProduct[]).map(toProduct);
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return data ? toProduct(data as unknown as RawProduct) : null;
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, customer_name, customer_email, customer_phone,
       address, city, postcode, note, payment_method, status,
       subtotal, shipping, total, source, created_at,
       order_items ( product_name, unit_price, quantity, line_total )`,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load orders: ${error.message}`);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    orderNumber: row.order_number as string,
    customerName: row.customer_name as string,
    customerEmail: (row.customer_email as string) ?? null,
    customerPhone: row.customer_phone as string,
    address: row.address as string,
    city: row.city as string,
    postcode: (row.postcode as string) ?? null,
    note: (row.note as string) ?? null,
    paymentMethod: row.payment_method as PaymentMethod,
    status: row.status as OrderStatus,
    subtotal: num(row.subtotal),
    shipping: num(row.shipping),
    total: num(row.total),
    source: row.source as "web" | "manual",
    createdAt: row.created_at as string,
    items: ((row.order_items as Record<string, unknown>[] | null) ?? []).map(
      (i) => ({
        productName: i.product_name as string,
        unitPrice: num(i.unit_price),
        quantity: num(i.quantity),
        lineTotal: num(i.line_total),
      }),
    ),
  }));
}

export interface CapiLog {
  id: string;
  eventName: string;
  eventId: string | null;
  status: "success" | "error";
  httpStatus: number | null;
  requestPayload: unknown;
  responseBody: unknown;
  errorMessage: string | null;
  createdAt: string;
}

export async function getCapiLogs(limit = 100): Promise<CapiLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("capi_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load logs: ${error.message}`);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    eventName: row.event_name as string,
    eventId: (row.event_id as string) ?? null,
    status: row.status as "success" | "error",
    httpStatus: row.http_status == null ? null : num(row.http_status),
    requestPayload: row.request_payload,
    responseBody: row.response_body,
    errorMessage: (row.error_message as string) ?? null,
    createdAt: row.created_at as string,
  }));
}
