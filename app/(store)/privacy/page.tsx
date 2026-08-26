import type { Metadata } from "next";
import { LegalPage } from "@/components/store/LegalPage";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What House of Joba collects when you place an order, why, and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <LegalPage
      title="Privacy Policy"
      intro="We ask for the least we can and still get a saree to your door."
      updated="August 2026"
    >
      <section>
        <h2>What we collect</h2>
        <p>When you place an order we store:</p>
        <ul>
          <li>Your name, phone number and delivery address</li>
          <li>Your email address, if you give one — used only for receipts</li>
          <li>What you ordered, what it cost, and its delivery status</li>
        </ul>
        <p>
          We do not store card or mobile-banking details. Cash on delivery is
          settled with the courier; bKash and Nagad payments are arranged
          directly with you after the order is confirmed.
        </p>
      </section>

      <section>
        <h2>Why we keep it</h2>
        <p>
          To deliver your order, to answer questions about it afterwards, and
          to meet the record-keeping a business is required to do. We do not
          sell your details or share them with anyone beyond the courier
          carrying your parcel.
        </p>
      </section>

      <section>
        <h2>Advertising</h2>
        <p>
          If Meta advertising is enabled, we send Facebook a record of key
          actions — viewing a product, adding to a bag, completing an order.
          Where your email or phone number is included, it is hashed with
          SHA-256 before it leaves our server, so Meta receives a fingerprint
          rather than the detail itself. You can block this with any standard
          ad or tracking blocker.
        </p>
      </section>

      <section>
        <h2>Your bag</h2>
        <p>
          What sits in your bag is kept in your own browser, not on our
          servers. Clearing your browser data clears it.
        </p>
      </section>

      <section>
        <h2>Asking us to delete your data</h2>
        <p>
          Email{" "}
          <a
            href={`mailto:${settings.contactEmail}`}
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            {settings.contactEmail}
          </a>{" "}
          and we will remove your details, other than what we are legally
          required to keep on completed sales.
        </p>
      </section>
    </LegalPage>
  );
}
