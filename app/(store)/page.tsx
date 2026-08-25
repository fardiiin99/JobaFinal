import Link from "next/link";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { CommunityWall } from "@/components/store/CommunityWall";
import { HeroSlider } from "@/components/store/HeroSlider";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductRail } from "@/components/store/ProductRail";
import { Reviews } from "@/components/store/Reviews";
import {
  getBestSellers,
  getCategories,
  getCommunityPosts,
  getHeroSlides,
  getNewArrivals,
  getReviews,
} from "@/lib/queries";

function SectionHead({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center gap-5">
      <h2 className="font-serif text-[clamp(28px,3.4vw,38px)] font-semibold -tracking-[0.02em]">
        {title}
      </h2>
      {note && <p className="text-[13.5px] text-ink-soft">{note}</p>}
      {action && (
        <Link
          href={action.href}
          className="ml-auto whitespace-nowrap rounded-full border border-line bg-white px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-200 hover:bg-ink hover:text-white"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [hero, categories, newArrivals, bestSellers, reviews, community] =
    await Promise.all([
      getHeroSlides(),
      getCategories(),
      getNewArrivals(),
      getBestSellers(),
      getReviews(),
      getCommunityPosts(),
    ]);

  return (
    <main>
      <HeroSlider slides={hero} />

      {/* The legacy homepage had no <h1> at all — it opened at <h2>. */}
      <h1 className="sr-only">
        House of Joba — handwoven sarees from Narayanganj
      </h1>

      <section
        id="collections"
        className="mx-auto max-w-(--container-wrap) px-6 pt-[70px]"
      >
        <SectionHead
          title="Shop by Weave"
          action={{ href: "/shop", label: "All categories" }}
        />
        <CategoryGrid categories={categories} />
      </section>

      <section
        id="new"
        className="mx-auto max-w-(--container-wrap) px-6 pt-[70px]"
      >
        {/* The view-all link belongs with the arrows, not in the head —
            both were absolutely positioned top-right and collided. */}
        <SectionHead title="New Arrivals" />
        <ProductRail
          products={newArrivals}
          action={{ href: "/new-arrivals", label: "View all" }}
        />
      </section>

      <section
        id="bestsellers"
        className="mx-auto max-w-(--container-wrap) px-6 pt-[70px]"
      >
        <SectionHead
          title="Best Sellers"
          note="Ranked by units sold"
          action={{ href: "/best-sellers", label: "View all" }}
        />
        <div className="grid grid-cols-2 gap-[18px] pb-5 lg:grid-cols-4">
          {bestSellers.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              mode="best"
              rank={i + 1}
            />
          ))}
        </div>
      </section>

      <section
        id="reviews"
        className="mx-auto max-w-(--container-wrap) px-6 pt-[70px]"
      >
        <Reviews reviews={reviews} />
      </section>

      <section
        id="community"
        className="mx-auto max-w-(--container-wrap) px-6 pt-[70px]"
      >
        <SectionHead
          title="As Styled by You"
          action={{
            href: "https://www.instagram.com/explore/tags/joba/",
            label: "Tag @joba to be featured →",
          }}
        />
        <CommunityWall posts={community} />
      </section>
    </main>
  );
}
