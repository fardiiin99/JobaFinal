"use server";

import { revalidatePath } from "next/cache";
import { META_EVENTS, type MetaConfigView } from "@/lib/meta-config";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/* Only async functions may be exported from a "use server" module, so
   META_EVENTS and MetaConfigView live in lib/meta-config.ts. */
type ActionResult = { ok: true } | { ok: false; error: string };

/** Confirm the caller is signed in before touching the service role. */
async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

/**
 * Read the Meta configuration for the settings screen.
 *
 * The access token is deliberately never returned — the form only
 * learns whether one exists. A token that round-trips to the browser
 * to populate an input is a token in the page source.
 */
export async function getMetaConfig(): Promise<MetaConfigView> {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("meta_pixel_id, meta_events")
    .maybeSingle();

  const service = createServiceClient();
  const { data: secrets } = await service
    .from("integration_secrets")
    .select("meta_capi_token, meta_test_event_code")
    .maybeSingle();

  return {
    pixelId: settings?.meta_pixel_id ?? "",
    events: (settings?.meta_events as Record<string, boolean>) ?? {},
    hasToken: Boolean(secrets?.meta_capi_token),
    testEventCode: secrets?.meta_test_event_code ?? "",
  };
}

export async function saveMetaConfig(
  formData: FormData,
): Promise<ActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Not signed in." };
  }

  const pixelId = String(formData.get("pixelId") ?? "").trim();
  if (pixelId && !/^\d{6,20}$/.test(pixelId)) {
    return { ok: false, error: "A Pixel ID is 6–20 digits." };
  }

  const events: Record<string, boolean> = {};
  for (const name of META_EVENTS) {
    events[name] = formData.get(`event_${name}`) === "on";
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ meta_pixel_id: pixelId || null, meta_events: events })
    .eq("id", true);

  if (error) return { ok: false, error: error.message };

  /* Secrets go through the service role: integration_secrets has RLS
     enabled with no policies at all, so it is unreachable from any
     browser session, signed in or not. */
  const token = String(formData.get("capiToken") ?? "").trim();
  const testCode = String(formData.get("testEventCode") ?? "").trim();

  const patch: Record<string, unknown> = {
    meta_test_event_code: testCode || null,
  };
  // Blank means "leave the stored token alone", not "erase it" —
  // otherwise saving any other field would silently wipe it.
  if (token) patch.meta_capi_token = token;
  if (formData.get("clearToken") === "on") patch.meta_capi_token = null;

  const service = createServiceClient();
  const { error: secretError } = await service
    .from("integration_secrets")
    .update(patch)
    .eq("id", true);

  if (secretError) return { ok: false, error: secretError.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/meta");
  return { ok: true };
}
