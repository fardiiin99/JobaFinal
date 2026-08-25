import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

/* Bento mosaic: 'lg' spans 2x2, 'full' spans the row. */
const SPAN: Record<Category["size"], string> = {
  "": "",
  lg: "sm:col-span-2 sm:row-span-2",
  full: "col-span-full",
};

const HEADING: Record<Category["size"], string> = {
  "": "text-[20px]",
  lg: "text-[30px]",
  full: "text-[26px]",
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid auto-rows-[168px] grid-cols-2 gap-4 pb-5 sm:auto-rows-[400px] sm:grid-cols-4">
      {categories.map((category, i) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className={`group relative isolate block overflow-hidden rounded-joba-lg ${SPAN[category.size]}`}
        >
          {category.imageUrl && (
            <Image
              src={category.imageUrl}
              alt={`${category.name} saree`}
              fill
              sizes={
                category.size === "" ? "(max-width: 640px) 50vw, 25vw" : "100vw"
              }
              priority={i < 2}
              style={{ objectPosition: category.imagePosition }}
              className="object-cover transition-transform duration-700 ease-joba group-hover:scale-[1.07]"
            />
          )}

          {/* These photos are busy and vary in tone, so the scrim has to
              carry the label contrast on its own. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-[rgba(16,8,10,0.88)] from-0% via-[rgba(16,8,10,0.55)] via-32% to-transparent to-85%"
          />

          {/* Real row count. The legacy tiles showed hardcoded figures
              like 184 and 212 against a 7-product catalogue. */}
          <span className="absolute right-3.5 top-3.5 z-2 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-[6px]">
            {category.productCount ?? 0}
          </span>

          <span className="absolute inset-x-5 bottom-[18px] z-2 text-white">
            <h3
              className={`font-serif font-semibold -tracking-[0.01em] ${HEADING[category.size]}`}
            >
              {category.name}
            </h3>
            <span className="mt-1 block text-[12.5px] opacity-80">
              {category.description}
            </span>
            <span className="mt-2.5 inline-flex -translate-x-1.5 items-center gap-1.5 text-[12.5px] font-semibold opacity-0 transition-[opacity,transform] duration-300 ease-joba group-hover:translate-x-0 group-hover:opacity-100">
              Shop {category.name}
              <svg viewBox="0 0 24 24" className="icon size-[15px]">
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
