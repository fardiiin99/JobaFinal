import Image from "next/image";
import type { CommunityPost } from "@/lib/types";

/**
 * "As Styled by You" — a two-row horizontally scrolling mosaic.
 * 'tall' posts span both rows; the sq,sq,tall pattern packs it flush.
 *
 * These are sample posts with placeholder handles, not real accounts.
 */
export function CommunityWall({ posts }: { posts: CommunityPost[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="-mx-2.5 grid grid-flow-col grid-rows-2 gap-3 overflow-x-auto px-2.5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {posts.map((post, i) => (
        <a
          key={`${post.handle}-${i}`}
          href={`https://www.instagram.com/${post.handle}/`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`@${post.handle} on Instagram`}
          className={`group relative block overflow-hidden rounded-joba bg-beige ${
            post.ratio === "tall"
              ? "row-span-2 aspect-9/16 w-[220px]"
              : "aspect-square w-[220px]"
          }`}
        >
          <Image
            src={post.image_url}
            alt={post.caption}
            fill
            sizes="220px"
            loading="lazy"
            className="object-cover transition-transform duration-700 ease-joba group-hover:scale-[1.06]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/55 to-transparent to-55% opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span className="absolute inset-x-3 bottom-3 text-[12.5px] font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            @{post.handle}
          </span>
        </a>
      ))}
    </div>
  );
}
