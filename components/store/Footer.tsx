import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

/* The legacy footer carried eight href="#" links on all ten pages, and
   rendered "Privacy · Terms" as plain text rather than links — for a
   store collecting names, phone numbers and delivery addresses. These
   now point at real routes; the pages themselves land in Phase 9. */
const HELP_LINKS = [
  { href: "/size-guide", label: "Size & drape guide" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/track-order", label: "Track order" },
];

const ABOUT_LINKS = [
  { href: "/our-story#weavers", label: "Our weavers" },
  { href: "/our-story#sustainability", label: "Sustainability" },
  { href: "/stores", label: "Stores" },
  { href: "/contact", label: "Contact" },
];

function Column({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-[14px] text-white/85 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ categories }: { categories: Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-(--container-wrap) gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/images/jobalogo.webp"
            alt="House of Joba"
            width={138}
            height={46}
            className="mb-3.5 h-[46px] w-auto brightness-0 invert"
          />
          <p className="max-w-xs text-[14px] leading-relaxed text-white/70">
            Handwoven sarees from Bangladesh. Narayanganj · Dhaka · Tangail.
          </p>
        </div>

        <Column
          title="Shop"
          links={categories.map((c) => ({
            href: `/category/${c.slug}`,
            label: c.name,
          }))}
        />
        <Column title="Help" links={HELP_LINKS} />
        <Column title="About" links={ABOUT_LINKS} />
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-(--container-wrap) flex-wrap items-center justify-between gap-3 px-6 py-6 text-[13px] text-white/60">
          <span>© {year} Joba Handloom Ltd.</span>
          <span className="flex items-center gap-2">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
