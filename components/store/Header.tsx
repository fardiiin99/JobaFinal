"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

const SHOP_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/new-arrivals", label: "New In" },
  { href: "/best-sellers", label: "Best Sellers" },
  { href: "/#collections", label: "Shop by Weave" },
];

export function Header() {
  const { count, ready } = useCart();
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-[rgba(251,247,241,0.86)] backdrop-blur-[14px] transition-[border-color,box-shadow] duration-300 ${
        stuck
          ? "border-line shadow-[0_6px_24px_rgba(26,19,21,0.05)]"
          : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-(--container-wrap) items-center gap-7 px-6">
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-full text-ink md:hidden"
        >
          <svg viewBox="0 0 24 24" className="icon">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <Link href="/" aria-label="Joba home" className="flex items-center">
          <Image
            src="/images/jobalogo.webp"
            alt="House of Joba"
            width={120}
            height={40}
            priority
            className="block h-10 w-auto"
          />
        </Link>

        <nav className="ml-2 hidden items-center gap-7 text-[14.5px] font-medium md:flex">
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1.5 py-6"
              aria-haspopup="true"
            >
              Shop
              <svg viewBox="0 0 24 24" className="icon size-4" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="invisible absolute left-0 top-full min-w-44 rounded-joba border border-line bg-white p-2 opacity-0 shadow-joba transition-[opacity,visibility] duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {SHOP_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-lg px-3 py-2 hover:bg-ivory"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/our-story">Our Story</Link>
          <Link href="/sale" className="font-semibold text-hibiscus">
            Sale
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/shop"
            aria-label="Search"
            className="grid size-10 place-items-center rounded-full text-ink hover:bg-ivory"
          >
            <svg viewBox="0 0 24 24" className="icon">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart, ${ready ? count : 0} items`}
            className="relative grid size-10 place-items-center rounded-full text-ink hover:bg-ivory"
          >
            <svg viewBox="0 0 24 24" className="icon">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            {/* Hidden until the cart has been read from storage, so the
                server and client agree on first paint. */}
            <span
              className={`absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-hibiscus px-1.5 text-[11px] font-semibold text-white transition-opacity ${
                ready && count > 0 ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!ready || count === 0}
            >
              {ready ? count : 0}
            </span>
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-line bg-cream px-6 py-4 md:hidden">
          {[
            ...SHOP_LINKS,
            { href: "/our-story", label: "Our Story" },
            { href: "/sale", label: "Sale" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-[15px]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
