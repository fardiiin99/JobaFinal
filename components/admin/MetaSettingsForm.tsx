"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveMetaConfig } from "@/app/admin/settings/meta/actions";
import { META_EVENTS, type MetaConfigView } from "@/lib/meta-config";

const field =
  "mt-1.5 w-full rounded-joba border border-line bg-white px-4 py-2.5 text-[15px] outline-none focus:border-hibiscus";
const label = "block text-[13px] font-semibold text-ink-soft";

export function MetaSettingsForm({ config }: { config: MetaConfigView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={(formData) => {
        setError(null);
        setSaved(false);
        startTransition(async () => {
          const result = await saveMetaConfig(formData);
          if (result.ok) {
            setSaved(true);
            router.refresh();
          } else {
            setError(result.error);
          }
        });
      }}
      className="max-w-2xl space-y-6"
    >
      <section className="rounded-joba-lg border border-line bg-white p-6">
        <h2 className="font-serif text-xl font-semibold">Pixel</h2>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          Runs in the shopper&apos;s browser. Leave the ID blank and no Meta
          script is loaded at all.
        </p>
        <label className="mt-4 block">
          <span className={label}>Pixel ID</span>
          <input
            name="pixelId"
            defaultValue={config.pixelId}
            inputMode="numeric"
            placeholder="1234567890123456"
            className={field}
          />
        </label>
      </section>

      <section className="rounded-joba-lg border border-line bg-white p-6">
        <h2 className="font-serif text-xl font-semibold">Conversions API</h2>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          Sends the same events from the server, so ad blockers and iOS
          privacy settings do not lose them. Each event carries a shared ID,
          which is what stops Meta counting it twice.
        </p>

        <label className="mt-4 block">
          <span className={label}>
            Access token{" "}
            {config.hasToken && (
              <span className="font-normal text-olive">· stored</span>
            )}
          </span>
          <input
            name="capiToken"
            type="password"
            autoComplete="off"
            placeholder={
              config.hasToken
                ? "Leave blank to keep the current token"
                : "EAAG…"
            }
            className={field}
          />
          {/* The stored token is never sent to this page, so it cannot
              be read out of the HTML or the network response. */}
          <span className="mt-1.5 block text-[12.5px] text-ink-soft">
            Held server-side only and never returned to the browser.
          </span>
        </label>

        {config.hasToken && (
          <label className="mt-3 flex items-center gap-2 text-[13.5px]">
            <input type="checkbox" name="clearToken" className="size-4" />
            Remove the stored token
          </label>
        )}

        <label className="mt-4 block">
          <span className={label}>
            Test event code <span className="font-normal">(optional)</span>
          </span>
          <input
            name="testEventCode"
            defaultValue={config.testEventCode}
            placeholder="TEST12345"
            className={field}
          />
          <span className="mt-1.5 block text-[12.5px] text-ink-soft">
            Set this while checking Events Manager → Test Events, then clear
            it. Live traffic should not carry a test code.
          </span>
        </label>
      </section>

      <section className="rounded-joba-lg border border-line bg-white p-6">
        <h2 className="font-serif text-xl font-semibold">Events</h2>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          Applies to both the pixel and the server.
        </p>
        <div className="mt-4 space-y-2.5">
          {META_EVENTS.map((event) => (
            <label
              key={event}
              className="flex items-center gap-2.5 text-[14px]"
            >
              <input
                type="checkbox"
                name={`event_${event}`}
                defaultChecked={config.events[event] !== false}
                className="size-4"
              />
              {event}
            </label>
          ))}
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-joba border border-hibiscus bg-blush px-4 py-3 text-[14px] text-maroon"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-hibiscus px-7 py-3 font-semibold text-white transition-colors hover:bg-maroon disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {saved && (
          <span role="status" className="text-[13.5px] text-olive">
            Saved
          </span>
        )}
        <Link
          href="/admin/settings/logs"
          className="ml-auto text-[13.5px] text-ink-soft underline underline-offset-4 hover:text-hibiscus"
        >
          View event logs →
        </Link>
      </div>
    </form>
  );
}
