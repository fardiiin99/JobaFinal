import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;

  /* Only same-site paths are honoured, so ?next=https://evil.example
     cannot turn the login into an open redirect. */
  const target =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  return (
    <main className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <Image
            src="/images/jobalogo.webp"
            alt="House of Joba"
            width={150}
            height={50}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <h1 className="mt-8 text-center font-serif text-2xl font-semibold">
          Admin sign in
        </h1>
        <p className="mt-2 text-center text-[14px] text-ink-soft">
          Staff only. Accounts are created by the store owner.
        </p>

        <LoginForm next={target} />

        <Link
          href="/"
          className="mt-6 block text-center text-[13.5px] text-ink-soft underline underline-offset-4 hover:text-hibiscus"
        >
          Back to the store
        </Link>
      </div>
    </main>
  );
}
