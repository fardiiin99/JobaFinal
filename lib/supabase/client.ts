import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components.
 *
 * The anon key is compiled into the browser bundle. That is safe by
 * design — Row Level Security decides what this key can actually see,
 * not the fact that it is hidden. Nothing here is a secret.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
