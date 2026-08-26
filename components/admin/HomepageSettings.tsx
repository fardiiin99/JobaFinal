"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveContent, uploadContentImage } from "@/app/admin/settings/actions";
import type { CommunityPost, HeroSlide, Review } from "@/lib/types";

const field =
  "w-full rounded-joba border border-line bg-white px-3 py-2 text-[13.5px] outline-none focus:border-hibiscus";

/** Move an item within an array, returning a new one. */
function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function RowControls({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number;
  length: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <button
        type="button"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        className="grid size-7 place-items-center rounded-lg border border-line bg-white text-[12px] disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={index === length - 1}
        onClick={() => onMove(index + 1)}
        className="grid size-7 place-items-center rounded-lg border border-line bg-white text-[12px] disabled:opacity-30"
      >
        ↓
      </button>
      <button
        type="button"
        aria-label="Remove"
        onClick={onRemove}
        className="grid size-7 place-items-center rounded-lg border border-line bg-white text-[12px] text-maroon"
      >
        ×
      </button>
    </div>
  );
}

function ImagePicker({
  url,
  onUploaded,
  onError,
  className = "aspect-3/4 w-20",
}: {
  url: string;
  onUploaded: (url: string) => void;
  onError: (message: string) => void;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="shrink-0">
      <div
        className={`relative overflow-hidden rounded-joba border border-line bg-beige ${className}`}
      >
        {url && (
          <Image src={url} alt="" fill sizes="80px" className="object-cover" />
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-[11px]">
            …
          </span>
        )}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          const data = new FormData();
          data.set("image", file);
          const result = await uploadContentImage(data);
          setBusy(false);
          e.target.value = "";
          if (result.ok) onUploaded(result.url);
          else onError(result.error);
        }}
        className="mt-1.5 w-20 text-[10.5px] file:mr-1 file:rounded-full file:border-0 file:bg-ink file:px-2 file:py-0.5 file:text-[10px] file:font-semibold file:text-white"
      />
    </div>
  );
}

function Section({
  title,
  hint,
  children,
  onSave,
  onAdd,
  addLabel,
  pending,
  saved,
  error,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
  onSave: () => void;
  onAdd: () => void;
  addLabel: string;
  pending: boolean;
  saved: boolean;
  error: string | null;
}) {
  return (
    <section className="rounded-joba-lg border border-line bg-white p-6">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-[13.5px] text-ink-soft">{hint}</p>

      <div className="mt-5 space-y-3">{children}</div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-joba border border-hibiscus bg-blush px-3.5 py-2.5 text-[13px] text-maroon"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-full bg-hibiscus px-5 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-maroon disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="text-[13px] font-semibold text-ink-soft underline underline-offset-4 hover:text-hibiscus"
        >
          {addLabel}
        </button>
        {saved && (
          <span className="text-[13px] text-olive" role="status">
            Saved — live on the homepage
          </span>
        )}
      </div>
    </section>
  );
}

export function HomepageSettings({
  hero: initialHero,
  reviews: initialReviews,
  community: initialCommunity,
}: {
  hero: HeroSlide[];
  reviews: Review[];
  community: CommunityPost[];
}) {
  const router = useRouter();

  const [hero, setHero] = useState(initialHero);
  const [reviews, setReviews] = useState(initialReviews);
  const [community, setCommunity] = useState(initialCommunity);

  const [pending, startTransition] = useTransition();
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setError = (key: string, message: string | null) =>
    setErrors((prev) => ({ ...prev, [key]: message }));

  const persist = (key: "hero" | "reviews" | "community", data: unknown[]) => {
    setError(key, null);
    setSavedKey(null);
    startTransition(async () => {
      const result = await saveContent(key, data);
      if (result.ok) {
        setSavedKey(key);
        router.refresh();
      } else {
        setError(key, result.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Hero ─────────────────────────────────────────── */}
      <Section
        title="Hero slider"
        hint="Full-width photos at the top of the homepage. The first slide loads eagerly; the rest are lazy."
        pending={pending}
        saved={savedKey === "hero"}
        error={errors.hero ?? null}
        onSave={() => persist("hero", hero)}
        addLabel="+ Add slide"
        onAdd={() =>
          setHero([...hero, { image_url: "", alt: "", position: "50% 50%" }])
        }
      >
        {hero.map((slide, i) => (
          <div
            key={`hero-${i}`}
            className="flex items-start gap-3 rounded-joba border border-line p-3"
          >
            <ImagePicker
              url={slide.image_url}
              onError={(m) => setError("hero", m)}
              onUploaded={(url) =>
                setHero(
                  hero.map((s, j) => (j === i ? { ...s, image_url: url } : s)),
                )
              }
            />
            <div className="flex-1 space-y-2">
              <input
                value={slide.alt}
                placeholder="Alt text — describes the photo"
                onChange={(e) =>
                  setHero(
                    hero.map((s, j) =>
                      j === i ? { ...s, alt: e.target.value } : s,
                    ),
                  )
                }
                className={field}
              />
              <input
                value={slide.position}
                placeholder="Crop, e.g. 50% 30%"
                onChange={(e) =>
                  setHero(
                    hero.map((s, j) =>
                      j === i ? { ...s, position: e.target.value } : s,
                    ),
                  )
                }
                className={field}
              />
            </div>
            <RowControls
              index={i}
              length={hero.length}
              onMove={(to) => setHero(move(hero, i, to))}
              onRemove={() => setHero(hero.filter((_, j) => j !== i))}
            />
          </div>
        ))}
      </Section>

      {/* ── Reviews ──────────────────────────────────────── */}
      <Section
        title="Reviews"
        hint="Customer quotes. The average shown on the homepage is calculated from these ratings."
        pending={pending}
        saved={savedKey === "reviews"}
        error={errors.reviews ?? null}
        onSave={() => persist("reviews", reviews)}
        addLabel="+ Add review"
        onAdd={() =>
          setReviews([
            ...reviews,
            { name: "", city: "", rating: 5, product: "", text: "" },
          ])
        }
      >
        {reviews.map((review, i) => (
          <div
            key={`review-${i}`}
            className="flex items-start gap-3 rounded-joba border border-line p-3"
          >
            <div className="flex-1 space-y-2">
              <div className="grid gap-2 sm:grid-cols-4">
                <input
                  value={review.name}
                  placeholder="Name"
                  onChange={(e) =>
                    setReviews(
                      reviews.map((r, j) =>
                        j === i ? { ...r, name: e.target.value } : r,
                      ),
                    )
                  }
                  className={field}
                />
                <input
                  value={review.city}
                  placeholder="City"
                  onChange={(e) =>
                    setReviews(
                      reviews.map((r, j) =>
                        j === i ? { ...r, city: e.target.value } : r,
                      ),
                    )
                  }
                  className={field}
                />
                <input
                  value={review.product}
                  placeholder="Product bought"
                  onChange={(e) =>
                    setReviews(
                      reviews.map((r, j) =>
                        j === i ? { ...r, product: e.target.value } : r,
                      ),
                    )
                  }
                  className={field}
                />
                <select
                  value={review.rating}
                  onChange={(e) =>
                    setReviews(
                      reviews.map((r, j) =>
                        j === i ? { ...r, rating: Number(e.target.value) } : r,
                      ),
                    )
                  }
                  className={field}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={review.text}
                rows={2}
                placeholder="What they said"
                onChange={(e) =>
                  setReviews(
                    reviews.map((r, j) =>
                      j === i ? { ...r, text: e.target.value } : r,
                    ),
                  )
                }
                className={`${field} resize-y`}
              />
            </div>
            <RowControls
              index={i}
              length={reviews.length}
              onMove={(to) => setReviews(move(reviews, i, to))}
              onRemove={() => setReviews(reviews.filter((_, j) => j !== i))}
            />
          </div>
        ))}
      </Section>

      {/* ── Community ────────────────────────────────────── */}
      <Section
        title="Community wall"
        hint="“As Styled by You”. Tall posts span both rows of the mosaic — order changes how it packs."
        pending={pending}
        saved={savedKey === "community"}
        error={errors.community ?? null}
        onSave={() => persist("community", community)}
        addLabel="+ Add post"
        onAdd={() =>
          setCommunity([
            ...community,
            { image_url: "", ratio: "sq", handle: "", caption: "" },
          ])
        }
      >
        {community.map((post, i) => (
          <div
            key={`post-${i}`}
            className="flex items-start gap-3 rounded-joba border border-line p-3"
          >
            <ImagePicker
              url={post.image_url}
              className="aspect-square w-20"
              onError={(m) => setError("community", m)}
              onUploaded={(url) =>
                setCommunity(
                  community.map((p, j) =>
                    j === i ? { ...p, image_url: url } : p,
                  ),
                )
              }
            />
            <div className="flex-1 space-y-2">
              <input
                value={post.handle}
                placeholder="Instagram handle (without @)"
                onChange={(e) =>
                  setCommunity(
                    community.map((p, j) =>
                      j === i
                        ? { ...p, handle: e.target.value.replace(/^@/, "") }
                        : p,
                    ),
                  )
                }
                className={field}
              />
              <input
                value={post.caption}
                placeholder="Caption"
                onChange={(e) =>
                  setCommunity(
                    community.map((p, j) =>
                      j === i ? { ...p, caption: e.target.value } : p,
                    ),
                  )
                }
                className={field}
              />
              <select
                value={post.ratio}
                onChange={(e) =>
                  setCommunity(
                    community.map((p, j) =>
                      j === i
                        ? { ...p, ratio: e.target.value as "sq" | "tall" }
                        : p,
                    ),
                  )
                }
                className={field}
              >
                <option value="sq">Square</option>
                <option value="tall">Tall (spans two rows)</option>
              </select>
            </div>
            <RowControls
              index={i}
              length={community.length}
              onMove={(to) => setCommunity(move(community, i, to))}
              onRemove={() => setCommunity(community.filter((_, j) => j !== i))}
            />
          </div>
        ))}
      </Section>
    </div>
  );
}
