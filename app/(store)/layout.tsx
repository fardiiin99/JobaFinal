import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CartProvider } from "@/lib/cart-context";
import { getCategories, getSettings } from "@/lib/queries";

/**
 * Product and category pages prerender at build time, which is fast but
 * would leave an admin edit invisible until the next deploy — exactly
 * the "changes never reach customers" failure this rebuild exists to
 * fix. Revalidating caps how stale anything can get; admin mutations
 * additionally call revalidatePath() for an immediate refresh.
 */
export const revalidate = 300;

/**
 * Storefront chrome. The admin lives outside this route group, so it
 * gets none of this.
 *
 * Settings and categories are fetched once here rather than in each
 * page — the announcement bar needs the real shipping threshold and the
 * footer needs the live weave list.
 */
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategories(),
  ]);

  return (
    <CartProvider>
      <AnnouncementBar threshold={settings.freeShippingThreshold} />
      <Header />
      {children}
      <Footer categories={categories} />
    </CartProvider>
  );
}
