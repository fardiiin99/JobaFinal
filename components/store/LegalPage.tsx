import { Breadcrumb } from "./Breadcrumb";

/** Shared shell for the policy and help pages linked from the footer. */
export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  /** Shown on policy pages, where currency matters. */
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { label: title }]} />

      <h1 className="font-serif text-[clamp(28px,3.6vw,40px)] font-semibold -tracking-[0.02em]">
        {title}
      </h1>
      {intro && <p className="mt-4 text-[16px] text-ink-soft">{intro}</p>}
      {updated && (
        <p className="mt-2 text-[13px] text-ink-soft">Last updated {updated}</p>
      )}

      <div className="mt-10 space-y-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_li]:text-[15px] [&_li]:leading-relaxed [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-ink-soft [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-ink-soft">
        {children}
      </div>
    </main>
  );
}
