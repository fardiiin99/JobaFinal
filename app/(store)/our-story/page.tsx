import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/store/Breadcrumb";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Joba started as one loom and a promise: pay the weaver what the piece is worth, the day it is finished. Handwoven in Narayanganj since 1994.",
  alternates: { canonical: "/our-story" },
};

const STATS = [
  {
    value: "1,400+",
    label: "looms supported across Narayanganj, Dhaka & Tangail",
  },
  { value: "32 yrs", label: "weaving for the same families, since 1994" },
  { value: "4.9★", label: "from 6,200 verified buyers" },
  { value: "0", label: "middlemen between loom and doorstep" },
];

const PILLARS = [
  {
    n: "01",
    title: "Fair by default",
    body: "Weavers set their own price for every piece and are paid in full on delivery — not 60 or 90 days later like most wholesale arrangements. No piece leaves the loom until the weaver has already been paid for it.",
  },
  {
    n: "02",
    title: "Real handloom",
    body: "Every saree carries a loom ID tied to the weaver who made it. We don’t carry power-loom copies dressed up as handloom — if a piece can’t be traced to a loom and a name, it doesn’t enter the catalogue.",
  },
  {
    n: "03",
    title: "Made to last",
    body: "Natural dyes are tested for colourfastness before a single saree ships. First orders come with a free re-fall and pico, because a saree that doesn’t hang right doesn’t get worn.",
  },
];

export default function OurStoryPage() {
  return (
    <main className="mx-auto max-w-(--container-wrap) px-6 py-10">
      <Breadcrumb
        trail={[{ href: "/", label: "Home" }, { label: "Our Story" }]}
      />

      <h1 className="max-w-3xl font-serif text-[clamp(30px,4.4vw,46px)] font-semibold -tracking-[0.02em]">
        Handwoven in Narayanganj since 1994
      </h1>
      <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
        Joba started as one loom and a promise: pay the weaver what the piece is
        worth, the day it’s finished. Three decades later, that’s still the
        whole business model.
      </p>

      <dl className="mt-12 grid gap-6 rounded-joba-lg border border-line bg-white p-8 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <dt className="font-serif text-3xl font-semibold text-hibiscus">
              {stat.value}
            </dt>
            <dd className="mt-1.5 text-[13.5px] leading-snug text-ink-soft">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>

      {/* Linked from the footer's "Our weavers" and "Sustainability". */}
      <section id="weavers" className="scroll-mt-24 pt-20">
        <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-semibold -tracking-[0.02em]">
          What Makes Us Different
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.n}
              id={pillar.n === "03" ? "sustainability" : undefined}
              className="scroll-mt-24 rounded-joba-lg border border-line bg-white p-7"
            >
              <p className="font-serif text-2xl font-semibold text-olive">
                {pillar.n}
              </p>
              <h3 className="mt-3 font-serif text-xl font-semibold">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="pt-20">
        <div className="rounded-joba-lg bg-ink px-8 py-14 text-white sm:px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-hibiscus">
            From the founder
          </p>
          <h2 className="mt-3.5 max-w-2xl font-serif text-[clamp(24px,3vw,34px)] font-semibold -tracking-[0.02em]">
            Every label has a name on it.
          </h2>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-white/75">
            My grandfather wove Jamdani on a pit loom two streets from where our
            workshop stands today. When we started Joba, the one rule we didn’t
            compromise on was this: if you buy a saree from us, you can look up
            exactly who made it. That hasn’t changed, and it isn’t going to.
          </p>
          <Link
            href="/new-arrivals"
            className="mt-8 inline-block rounded-full bg-hibiscus px-8 py-3.5 font-semibold text-white transition-colors duration-300 ease-joba hover:bg-maroon"
          >
            Shop the latest weaves
          </Link>
        </div>
      </section>
    </main>
  );
}
