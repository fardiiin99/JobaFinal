import { HomepageSettings } from "@/components/admin/HomepageSettings";
import { getCommunityPosts, getHeroSlides, getReviews } from "@/lib/queries";

export const metadata = { title: "Homepage settings" };

export default async function HomepageSettingsPage() {
  const [hero, reviews, community] = await Promise.all([
    getHeroSlides(),
    getReviews(),
    getCommunityPosts(),
  ]);

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        Homepage settings
      </h1>
      <p className="mb-8 mt-1.5 max-w-2xl text-ink-soft">
        Photos upload to Supabase Storage, so large files are fine. Each
        section saves independently and goes live immediately.
      </p>
      <HomepageSettings hero={hero} reviews={reviews} community={community} />
    </>
  );
}
