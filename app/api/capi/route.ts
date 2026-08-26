import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Meta Conversions API relay.
 *
 * Browser pixels are blocked by ad blockers, ITP and iOS privacy
 * settings often enough that browser-only tracking undercounts badly.
 * Meta's answer is to send the same event server-side with a shared
 * event_id so the two are deduplicated rather than double-counted.
 *
 * The access token never leaves this file: it is read from
 * integration_secrets with the service role, a table no browser
 * session can reach.
 */

const API_VERSION = "v21.0";

/** Meta requires user identifiers to be SHA-256 of normalised values. */
function hash(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalised = value.trim().toLowerCase();
  if (!normalised) return undefined;
  return createHash("sha256").update(normalised).digest("hex");
}

/** Phone numbers hash without punctuation or a leading zero. */
function hashPhone(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return undefined;
  return createHash("sha256").update(digits).digest("hex");
}

interface CapiRequest {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  email?: string;
  phone?: string;
  customData?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  let body: CapiRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { eventName, eventId } = body;
  if (!eventName || !eventId) {
    return NextResponse.json(
      { error: "eventName and eventId are required" },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  const [{ data: settings }, { data: secrets }] = await Promise.all([
    service.from("settings").select("meta_pixel_id, meta_events").maybeSingle(),
    service
      .from("integration_secrets")
      .select("meta_capi_token, meta_test_event_code")
      .maybeSingle(),
  ]);

  const pixelId = settings?.meta_pixel_id;
  const token = secrets?.meta_capi_token;

  // Not configured yet is a normal state, not an error worth logging.
  if (!pixelId || !token) {
    return NextResponse.json({ skipped: "not configured" }, { status: 200 });
  }

  const enabled = (settings?.meta_events ?? {}) as Record<string, boolean>;
  if (enabled[eventName] === false) {
    return NextResponse.json({ skipped: "event disabled" }, { status: 200 });
  }

  const userData: Record<string, unknown> = {
    em: hash(body.email),
    ph: hashPhone(body.phone),
    // Meta uses these to improve matching; they are not hashed.
    client_ip_address:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      undefined,
    client_user_agent: request.headers.get("user-agent") ?? undefined,
  };
  for (const key of Object.keys(userData)) {
    if (userData[key] === undefined) delete userData[key];
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        // Seconds, not milliseconds — Meta rejects the latter.
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: body.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: body.customData ?? {},
      },
    ],
  };
  if (secrets?.meta_test_event_code) {
    payload.test_event_code = secrets.meta_test_event_code;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;

  /* Log the payload we built, never the URL — that carries the token. */
  const logBase = {
    event_name: eventName,
    event_id: eventId,
    request_payload: payload,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json().catch(() => null);

    await service.from("capi_logs").insert({
      ...logBase,
      status: response.ok ? "success" : "error",
      http_status: response.status,
      response_body: responseBody,
      error_message: response.ok
        ? null
        : (responseBody?.error?.message ?? `HTTP ${response.status}`),
    });

    return NextResponse.json(
      { ok: response.ok },
      { status: response.ok ? 200 : 502 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await service.from("capi_logs").insert({
      ...logBase,
      status: "error",
      http_status: null,
      response_body: null,
      error_message: message,
    });

    // Tracking must never break a checkout, so this answers 200.
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
