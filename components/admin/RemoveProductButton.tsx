"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProduct } from "@/app/admin/products/actions";

export function RemoveProductButton({
  id,
  name,
  redirectTo,
}: {
  id: string;
  name: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="text-[13px] font-semibold text-maroon underline underline-offset-4 hover:text-hibiscus"
        >
          Remove
        </button>
        {error && (
          <span role="alert" className="text-[12.5px] text-maroon">
            {error}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1.5 text-[13px]">
      <span className="text-maroon">Remove “{name}” for good?</span>
      <span className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await deleteProduct(id);
              if (!result.ok) {
                setError(result.error);
                setConfirming(false);
                return;
              }
              if (redirectTo) router.push(redirectTo);
              router.refresh();
            })
          }
          className="rounded-full bg-maroon px-3 py-1 font-semibold text-white hover:bg-hibiscus disabled:opacity-60"
        >
          {pending ? "Removing…" : "Yes, remove"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="text-ink-soft underline underline-offset-4"
        >
          Cancel
        </button>
      </span>
    </span>
  );
}
