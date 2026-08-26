import Link from "next/link";
import { getCapiLogs } from "@/lib/admin-queries";

export const metadata = { title: "Logs" };

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default async function LogsPage() {
  const logs = await getCapiLogs();
  const failures = logs.filter((l) => l.status === "error").length;

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        Logs
      </h1>
      <p className="mb-8 mt-1.5 max-w-2xl text-ink-soft">
        Every Conversions API event, with what was sent and what Meta replied.
        {failures > 0 && (
          <>
            {" "}
            <strong className="text-maroon">
              {failures} of the last {logs.length} failed.
            </strong>
          </>
        )}
      </p>

      {logs.length === 0 ? (
        <div className="rounded-joba-lg border border-line bg-white px-6 py-16 text-center">
          <h2 className="font-serif text-xl font-semibold">No events yet</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            Events appear once a Pixel ID and access token are saved under{" "}
            <Link
              href="/admin/settings/meta"
              className="underline underline-offset-4 hover:text-hibiscus"
            >
              Meta Pixel and CAPI Settings
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <details
              key={log.id}
              className="rounded-joba-lg border border-line bg-white"
            >
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 text-[14px]">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                    log.status === "success"
                      ? "bg-[#e6f2ec] text-[#2f7d5b]"
                      : "bg-blush text-maroon"
                  }`}
                >
                  {log.status === "success" ? "Sent" : "Failed"}
                </span>
                <strong>{log.eventName}</strong>
                {log.httpStatus && (
                  <span className="text-[12.5px] text-ink-soft">
                    HTTP {log.httpStatus}
                  </span>
                )}
                {log.errorMessage && (
                  <span className="text-[12.5px] text-maroon">
                    {log.errorMessage}
                  </span>
                )}
                <span className="ml-auto text-[12.5px] text-ink-soft">
                  {dateFmt.format(new Date(log.createdAt))}
                </span>
              </summary>

              <div className="grid gap-4 border-t border-line px-4 py-4 lg:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Sent
                  </p>
                  {/* The access token travels in the URL, which is never
                      logged — only this payload is. */}
                  <pre className="max-h-72 overflow-auto rounded-joba bg-ivory p-3 text-[11.5px] leading-relaxed">
                    {JSON.stringify(log.requestPayload, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Meta replied
                  </p>
                  <pre className="max-h-72 overflow-auto rounded-joba bg-ivory p-3 text-[11.5px] leading-relaxed">
                    {log.responseBody
                      ? JSON.stringify(log.responseBody, null, 2)
                      : "—"}
                  </pre>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
