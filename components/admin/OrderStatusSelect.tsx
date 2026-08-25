"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/lib/types";

const OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const TONE: Record<OrderStatus, string> = {
  pending: "bg-beige text-ink-soft",
  processing: "bg-[#f9f0dc] text-[#9a6c10]",
  shipped: "bg-[#e7eff7] text-[#2f6ba8]",
  delivered: "bg-[#e6f2ec] text-[#2f7d5b]",
  cancelled: "bg-blush text-maroon",
};

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [value, setValue] = useState<OrderStatus>(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col gap-1">
      <select
        value={value}
        disabled={pending}
        aria-label="Delivery status"
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          const previous = value;
          setValue(next);
          setError(null);

          startTransition(async () => {
            const result = await updateOrderStatus(orderId, next);
            // Roll the control back if the write failed, rather than
            // showing a status the database does not actually hold.
            if (!result.ok) {
              setValue(previous);
              setError(result.error);
            }
          });
        }}
        className={`cursor-pointer appearance-none rounded-full py-1.5 pl-3 pr-7 text-[12px] font-semibold capitalize disabled:opacity-60 ${TONE[value]}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3e%3c/svg%3e\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 7px center",
          backgroundSize: "12px",
        }}
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option} className="capitalize">
            {option}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" className="text-[11px] text-maroon">
          {error}
        </span>
      )}
    </span>
  );
}
