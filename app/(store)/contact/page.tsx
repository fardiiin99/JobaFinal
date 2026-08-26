import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/store/LegalPage";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach House of Joba about an order, a weave, or wholesale — Narayanganj, Bangladesh.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <LegalPage
      title="Contact"
      intro="A real person answers. Usually within a working day."
    >
      <section>
        <h2>Email</h2>
        <p>
          <a
            href={`mailto:${settings.contactEmail}`}
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            {settings.contactEmail}
          </a>
        </p>
      </section>

      <section>
        <h2>Where we are</h2>
        <p>
          {settings.storeName}
          <br />
          Narayanganj, Bangladesh
          <br />
          Weaving across Narayanganj, Dhaka and Tangail since 1994.
        </p>
      </section>

      <section>
        <h2>About an existing order</h2>
        <p>
          Quote the order number from your confirmation — it looks like{" "}
          <strong className="text-ink">JB1043</strong> — and we can find it
          straight away.
        </p>
      </section>

      <section>
        <h2>Wholesale and stockists</h2>
        <p>
          We supply a small number of boutiques. Email us with the shop, the
          weaves you are interested in and rough monthly volumes.
        </p>
      </section>

      <section>
        <h2>Before you write</h2>
        <p>
          Sizing and care are covered in the{" "}
          <Link
            href="/size-guide"
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            size &amp; drape guide
          </Link>
          , delivery in{" "}
          <Link
            href="/shipping"
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            shipping
          </Link>
          , and exchanges in{" "}
          <Link
            href="/returns"
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            returns
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
