import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-less anon client for public catalogue reads.
 *
 * `generateStaticParams` and `generateMetadata` can run at build time,
 * where there is no HTTP request and therefore no cookies — calling
 * `cookies()` there throws. Everything the storefront reads (products,
 * categories, content, settings) is public under RLS anyway, so no
 * session is needed.
 *
 * The admin reads its own data through the cookie-aware client in
 * server.ts, so a signed-in owner still sees inactive products.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
