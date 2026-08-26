import type { Metadata } from "next";
import { LegalPage } from "@/components/store/LegalPage";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Returns",
  description:
    "Seven-day exchanges on unworn sarees, and what to do if a piece arrives damaged.",
  alternates: { canonical: "/returns" },
};

export default async function ReturnsPage() {
  const settings = await getSettings();

  return (
    <LegalPage
      title="Returns"
      intro="Seven days, unworn, tags on. Damaged pieces are our problem, not yours."
    >
      <section>
        <h2>What we accept</h2>
        <ul>
          <li>Unworn, unwashed pieces with tags still attached</li>
          <li>Within seven days of delivery</li>
          <li>
            Exchanges for a different weave, or a refund to the payment method
            you used
          </li>
        </ul>
      </section>

      <section>
        <h2>What we cannot accept</h2>
        <ul>
          <li>Pieces that have been worn, washed, altered or had a fall set</li>
          <li>Blouse pieces that have been cut</li>
          <li>Sale items, unless the piece arrived damaged</li>
        </ul>
      </section>

      <section>
        <h2>Natural variation is not a defect</h2>
        <p>
          Handwoven cloth varies. Block prints drift slightly between repeats,
          natural dyes settle unevenly, and the same weave can differ in tone
          between two metres of the same piece. That is the evidence of a hand
          at the loom rather than a machine, and it is not grounds for return.
          Damage, holes and colour that runs on the first wash are.
        </p>
      </section>

      <section>
        <h2>Damaged on arrival</h2>
        <p>
          Tell us within 48 hours with a photo and we will replace the piece or
          refund it in full, including delivery. Email{" "}
          <a
            href={`mailto:${settings.contactEmail}`}
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            {settings.contactEmail}
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
