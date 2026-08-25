import { createClient } from "@/lib/supabase/server";

/* Placeholder. Phase 6 replaces this with Dashboard Analytics and the
   five-section navigation. It exists now so Phase 5's gate has
   something real to protect and can be verified. */
export default async function AdminHome() {
  const supabase = await createClient();

  // Proves the session reaches the database: RLS lets an authenticated
  // request read orders, which anon cannot see at all.
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-12">
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        Dashboard
      </h1>
      <p className="mt-2 text-ink-soft">
        You are signed in. The five-section panel lands in the next phase.
      </p>

      <div className="mt-8 max-w-sm rounded-joba-lg border border-line bg-white p-6">
        <p className="text-[13px] uppercase tracking-[0.12em] text-ink-soft">
          Orders in database
        </p>
        <p className="mt-2 font-serif text-4xl font-semibold">
          {error ? "—" : (count ?? 0)}
        </p>
        {error && (
          <p className="mt-2 text-[13px] text-maroon">{error.message}</p>
        )}
      </div>
    </main>
  );
}
