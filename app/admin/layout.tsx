import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { createClient } from "@/lib/supabase/server";

/* Admin data is per-request and must never be cached or prerendered. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* Middleware already redirects unauthenticated requests. Repeating
     the check here means a routing mistake cannot silently expose the
     panel, and RLS still stands behind both. */
  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh bg-cream">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-(--container-wrap) items-center gap-4 px-6">
          <Link href="/admin" className="flex items-center">
            <Image
              src="/images/jobalogo.webp"
              alt="House of Joba"
              width={108}
              height={36}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <span className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Admin
          </span>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-[13px] text-ink-soft transition-colors hover:text-hibiscus"
            >
              View store ↗
            </Link>
            {/* Real signed-in identity. The legacy sidebar hardcoded
                "Azmayeen A. / Store owner" for every visitor. */}
            <span className="hidden text-[13px] text-ink-soft sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-(--container-wrap) flex-col gap-8 px-6 py-8 lg:flex-row">
        <AdminNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
