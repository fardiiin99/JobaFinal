import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/queries";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobafinal.vercel.app";

/* The legacy site shipped no sitemap at all, so every product and
   category page relied on being crawled by luck. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/new-arrivals`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/best-sellers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/sale`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/our-story`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/shipping`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/returns`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/size-guide`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: `${SITE}/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${SITE}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
