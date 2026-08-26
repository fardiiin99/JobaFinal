import type { Metadata } from "next";
import { LegalPage } from "@/components/store/LegalPage";
import { getSettings } from "@/lib/queries";
import { taka } from "@/lib/money";

export const metadata: Metadata = {
  title: "Terms of Sale",
  description:
    "Ordering, pricing, delivery and returns when buying from House of Joba.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <LegalPage
      title="Terms of Sale"
      intro="The terms you agree to when you place an order with us."
      updated="August 2026"
    >
      <section>
        <h2>Placing an order</h2>
        <p>
          An order is a request to buy, not a completed sale. We confirm it by
          phone before dispatch. If a piece has sold out between your order and
          our call, we will say so and nothing is charged.
        </p>
      </section>

      <section>
        <h2>Prices</h2>
        <p>
          All prices are in Bangladeshi Taka and include VAT where it applies.
          The total is calculated on our server at the moment you order, from
          the prices then listed — that figure is what you pay, and it is what
          appears on your confirmation.
        </p>
      </section>

      <section>
        <h2>Delivery</h2>
        <ul>
          <li>
            Delivery is free on orders over{" "}
            {taka(settings.freeShippingThreshold)}; below that a flat{" "}
            {taka(settings.shippingFee)} applies.
          </li>
          <li>Orders usually ship within 2–4 working days.</li>
          <li>
            Delivery times given by the courier are estimates, not guarantees.
          </li>
        </ul>
      </section>

      <section>
        <h2>Payment</h2>
        <p>
          Cash on delivery is paid to the courier. bKash and Nagad payments are
          arranged with you directly after we confirm the order.
        </p>
      </section>

      <section>
        <h2>Returns and exchanges</h2>
        <p>
          Seven days from delivery, unworn and with tags intact. Handwoven
          pieces vary slightly in colour and weave between metres — that is how
          a loom works, not a defect. If something arrives damaged, tell us
          within 48 hours and we will replace or refund it.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          {settings.storeName} ·{" "}
          <a
            href={`mailto:${settings.contactEmail}`}
            className="underline underline-offset-4 hover:text-hibiscus"
          >
            {settings.contactEmail}
          </a>
        </p>
      </section>
    </LegalPage>
  );
}
