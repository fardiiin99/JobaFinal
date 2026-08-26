import type { Metadata } from "next";
import { LegalPage } from "@/components/store/LegalPage";

export const metadata: Metadata = {
  title: "Size & Drape Guide",
  description:
    "Saree and blouse measurements, plus how each weave drapes — mul, Chanderi, Kota Doria and hand block cotton.",
  alternates: { canonical: "/size-guide" },
};

const WEAVES = [
  {
    name: "Mul cotton",
    drape:
      "Soft and close. Falls in narrow pleats and creases easily — the creases are part of the look.",
  },
  {
    name: "Chanderi",
    drape:
      "Sheer and structured. Holds a crisp pleat and catches light; needs a full-length petticoat.",
  },
  {
    name: "Kota Doria",
    drape:
      "Light and airy with an open check. Starches well and keeps its shape through an evening.",
  },
  {
    name: "Hand block cotton",
    drape:
      "Everyday weight. Sits heavier than mul, softens with each wash, forgiving to pleat.",
  },
  {
    name: "Indigo dabu",
    drape:
      "Dense cotton with body. Deepens in colour over the first few washes.",
  },
];

export default function SizeGuidePage() {
  return (
    <LegalPage
      title="Size & Drape Guide"
      intro="Every saree we sell is one size. What changes is how the weave behaves."
    >
      <section>
        <h2>Measurements</h2>
        <ul>
          <li>Saree length — 5.5 metres</li>
          <li>Blouse piece — 0.8 metres, included with every saree</li>
          <li>Width — 1.1 to 1.2 metres depending on the loom</li>
        </ul>
        <p>
          Handloom width varies by a few centimetres between pieces. That is
          the loom, not an error.
        </p>
      </section>

      <section>
        <h2>How each weave drapes</h2>
        <ul>
          {WEAVES.map((weave) => (
            <li key={weave.name}>
              <strong className="text-ink">{weave.name}</strong> — {weave.drape}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Fall and pico</h2>
        <p>
          First orders include a free fall and pico finish. Say so when we call
          to confirm, and tell us if you want the fall in a matching or
          contrast shade.
        </p>
      </section>

      <section>
        <h2>Care</h2>
        <ul>
          <li>Hand wash cold and separately for the first three washes</li>
          <li>Dry in shade — direct sun fades natural dyes</li>
          <li>Chanderi and silk-cotton blends are dry clean only</li>
          <li>Do not wring; press while slightly damp</li>
        </ul>
      </section>
    </LegalPage>
  );
}
