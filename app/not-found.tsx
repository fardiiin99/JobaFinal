import Link from "next/link";

/**
 * Shown whenever notFound() is called or a URL matches no route.
 * Without this file Next falls back to its unstyled default, which drops
 * the visitor out of the storefront entirely.
 */
export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-(--container-wrap) place-items-center px-6 py-24 text-center">
      <p className="text-[13px] font-semibold tracking-[0.12em] text-hibiscus uppercase">
        404
      </p>
      <h1 className="mt-3 font-serif text-[clamp(28px,4vw,40px)] font-semibold -tracking-[0.02em]">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        The piece may have sold out and been retired, or the link may be
        mistyped.
      </p>
      <Link
        href="/shop"
        className="ease-joba mt-7 inline-block rounded-full bg-hibiscus px-8 py-3.5 font-semibold text-white transition-colors duration-300 hover:bg-maroon"
      >
        Shop all sarees
      </Link>
    </main>
  );
}
