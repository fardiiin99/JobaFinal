import type { Metadata } from "next";
import { LegalPage } from "@/components/store/LegalPage";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Track your order",
  description: "How to check where your House of Joba order has reached.",
  alternates: { canonical: "/track-order" },
};

export default async function TrackOrderPage() {
  const settings = await getSettings();

  return (
    <LegalPage
      title="Track your order"
      intro="We send a courier tracking number by SMS once your parcel leaves us."
    >
      <section>
        <h2>What happens after you order</h2>
        <ul>
          <li>We call to confirm the order and your address</li>
          <li>The parcel is dispatched, usually the same or next working day</li>
          <li>You get the courier&apos;s tracking number by SMS</li>
          <li>Delivery takes 1–2 days inside Dhaka, 2–4 days elsewhere</li>
        </ul>
      </section>

      <section>
        <h2>Checking on it</h2>
        {/* Deliberately not a self-service lookup: order status is
            private, and a form that reveals it from an order number
            alone would let anyone enumerate other people's orders. */}
        <p>
          Email{" "}
          <a
            href={`mailto:${settings.contactEmail}`}
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            {settings.contactEmail}
          </a>{" "}
          with your order number — it looks like{" "}
          <strong className="text-ink">JB1043</strong> — and the phone number
          you ordered with. We check against both before sharing any details,
          so nobody else can look up your delivery.
        </p>
      </section>

      <section>
        <h2>If it has not moved</h2>
        <p>
          Give it three working days from dispatch, then get in touch and we
          will chase the courier ourselves.
        </p>
      </section>
    </LegalPage>
  );
}
