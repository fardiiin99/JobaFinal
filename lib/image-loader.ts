import type { ImageLoader } from "next/image";

/*
 * Catalogue and hero photos are stored with pre-built WebP widths next
 * to the original (products/<slug>/00.jpg → 00-640.webp, …), so the
 * browser can fetch a right-sized file straight from storage. Resizing
 * on request through /_next/image ran sharp on an already overloaded
 * VPS: a fresh page fired ~40 resizes at once and photos took seconds
 * to appear, or timed out.
 *
 * Anything without pre-built widths (new admin uploads, /public files)
 * still goes through the built-in optimizer, which caches after the
 * first hit.
 */
const VARIANT_SOURCE =
  /^(https:\/\/[^/]+\/storage\/v1\/object\/public\/media\/(products\/[a-z0-9-]+\/\d{2}|hero\/[a-z0-9-]+))\.jpg$/;

const PRODUCT_WIDTHS = [160, 400, 640, 960, 1440];
const HERO_WIDTHS = [640, 960, 1440, 1920, 2560];

export function variantUrl(src: string, width: number): string | null {
  const match = VARIANT_SOURCE.exec(src);
  if (!match) return null;
  const widths = match[2].startsWith("hero/") ? HERO_WIDTHS : PRODUCT_WIDTHS;
  const w = widths.find((v) => v >= width) ?? widths[widths.length - 1];
  return `${match[1]}-${w}.webp`;
}

export const imageLoader: ImageLoader = ({ src, width, quality }) =>
  variantUrl(src, width) ??
  (src.endsWith(".svg") ? src : null) ??
  `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
