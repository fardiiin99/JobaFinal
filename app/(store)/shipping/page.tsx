import type { Metadata } from "next";
import { LegalPage } from "@/components/store/LegalPage";
import { getSettings } from "@/lib/queries";
import { taka } from "@/lib/money";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Delivery charges and timings for handwoven sarees across Bangladesh.",
  alternates: { canonical: "/shipping" },
};

export default async function ShippingPage() {
  const settings = await getSettings();

  return (
    <LegalPage
      title="Shipping"
      intro="Where we deliver, what it costs and how long it takes."
    >
      <section>
        <h2>Charges</h2>
        {/* Read from settings, so this page cannot contradict what the
            cart charges — the legacy site advertised a threshold that
            was impossible to reach. */}
        <ul>
          <li>
            Orders over {taka(settings.freeShippingThreshold)} — free delivery
          </li>
          <li>
            Below that — a flat {taka(settings.shippingFee)} anywhere in
            Bangladesh
          </li>
        </ul>
      </section>

      <section>
        <h2>Timings</h2>
        <ul>
          <li>Inside Dhaka — 1–2 working days after dispatch</li>
          <li>Outside Dhaka — 2–4 working days after dispatch</li>
          <li>
            Orders are dispatched once confirmed by phone, usually the same or
            next working day
          </li>
        </ul>
      </section>

      <section>
        <h2>Tracking</h2>
        <p>
          We call before dispatch and share the courier&apos;s tracking number
          by SMS. If your order has not moved after three working days, get in
          touch and we will chase it.
        </p>
      </section>
    </LegalPage>
  );
}
