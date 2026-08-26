import type { MetadataRoute } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobafinal.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* Nothing useful to a crawler, and /admin should not be
         advertised. The real protection is middleware plus RLS —
         robots.txt is a request, not a control. */
      disallow: ["/admin", "/login", "/checkout", "/cart", "/api/"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
