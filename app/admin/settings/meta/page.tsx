import { MetaSettingsForm } from "@/components/admin/MetaSettingsForm";
import { getMetaConfig } from "./actions";

export const metadata = { title: "Meta Pixel and CAPI Settings" };

export default async function MetaSettingsPage() {
  const config = await getMetaConfig();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold -tracking-[0.02em]">
        Meta Pixel and CAPI Settings
      </h1>
      <p className="mb-8 mt-1.5 max-w-2xl text-ink-soft">
        Conversion tracking for Facebook and Instagram ads. Every server event
        is recorded under Logs, which is the only way to see why a conversion
        did or did not reach Meta.
      </p>
      <MetaSettingsForm config={config} />
    </>
  );
}
