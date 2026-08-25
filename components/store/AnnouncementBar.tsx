import Image from "next/image";
import { taka } from "@/lib/money";

/**
 * Scrolling marquee above the header.
 *
 * The free-delivery line is driven by the real threshold rather than
 * hardcoded. The legacy bar advertised "over ৳5,000" while the cart's
 * threshold was also ৳5,000 — below the cheapest ৳5,600 product, so
 * delivery was always free and the promise was meaningless.
 */
export function AnnouncementBar({ threshold }: { threshold: number }) {
  const messages = [
    `Free delivery across Bangladesh on orders over ${taka(threshold)}`,
    "New Jamdani drop — live now",
    "Handwoven in Narayanganj since 1994",
  ];

  const run = () =>
    messages.map((message) => (
      <span key={message} className="flex items-center gap-7">
        <span>{message}</span>
        <span className="inline-flex items-center" aria-hidden="true">
          <Image
            src="/images/hibiscus.webp"
            alt=""
            width={42}
            height={42}
            className="block h-[42px] w-[42px] object-contain"
          />
        </span>
      </span>
    ));

  return (
    <div className="overflow-hidden border-b border-line bg-beige py-2 text-[15px] tracking-[0.04em] text-ink">
      <div className="flex w-max animate-marquee items-center gap-7 whitespace-nowrap">
        {/* Rendered twice so the -50% translation loops seamlessly.
            Only the first copy is exposed to assistive tech — the
            legacy markup announced all three messages twice. */}
        <div className="flex items-center gap-7">{run()}</div>
        <div className="flex items-center gap-7" aria-hidden="true">
          {run()}
        </div>
      </div>
    </div>
  );
}
