/* Domain types, mirroring supabase/migrations/0001_schema.sql.
   Kept hand-written rather than generated so the shape the app works
   with stays readable — queries.ts narrows the raw rows to these. */

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "mobile";
export type OrderSource = "web" | "manual";

/** '' = one cell, 'lg' = wide, 'full' = full row in the homepage mosaic. */
export type CategorySize = "" | "lg" | "full";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  imagePosition: string;
  size: CategorySize;
  sortOrder: number;
  /** Derived from live product rows — never stored. The legacy site
      hardcoded these and told shoppers "Showing 1 of 96 pieces". */
  productCount?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  imagePosition: string;
  /** object-position values used to fake a gallery from one photo. */
  galleryPositions: string[];
  blurb: string;
  specs: [string, string][];
  rating: number | null;
  reviewCount: number;
  soldCount: number;
  stock: number;
  /** Nullable. The legacy card printed the literal string "null". */
  tag: "NEW" | "SALE" | null;
  active: boolean;
  sortOrder: number;
}

export interface HeroSlide {
  image_url: string;
  alt: string;
  position: string;
}

export interface Review {
  name: string;
  city: string;
  rating: number;
  product: string;
  text: string;
}

export interface CommunityPost {
  image_url: string;
  ratio: "sq" | "tall";
  handle: string;
  caption: string;
}

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  currency: string;
  freeShippingThreshold: number;
  shippingFee: number;
  metaPixelId: string | null;
  metaEvents: Record<string, boolean>;
}

/** A cart line once joined against live product rows. */
export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
  /** How much more to spend to earn free delivery, 0 once qualified. */
  remainingForFreeShipping: number;
}
