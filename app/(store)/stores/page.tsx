import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/store/LegalPage";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Stores",
  description:
    "House of Joba weaves in Narayanganj and sells direct — where to find us.",
  alternates: { canonical: "/stores" },
};

export default async function StoresPage() {
  const settings = await getSettings();

  return (
    <LegalPage
      title="Stores"
      intro="We sell direct rather than through a retail floor, which is how the weaver keeps more of the price."
    >
      <section>
        <h2>Workshop</h2>
        <p>
          Narayanganj, Bangladesh. This is where pieces are finished, checked
          and packed — not a shop, but visitors are welcome by arrangement.
          Email{" "}
          <a
            href={`mailto:${settings.contactEmail}`}
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            {settings.contactEmail}
          </a>{" "}
          a day or two ahead.
        </p>
      </section>

      <section>
        <h2>Looms</h2>
        <p>
          The weavers we buy from work across Narayanganj, Dhaka and Tangail.
          Every saree carries a loom ID tying it to the person who made it.
        </p>
      </section>

      <section>
        <h2>Stockists</h2>
        <p>
          A small number of boutiques carry our weaves. If you run one and want
          to, the details are under{" "}
          <Link
            href="/contact"
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            contact
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
