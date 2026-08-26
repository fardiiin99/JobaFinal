"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

interface TrackOptions {
  customData?: Record<string, unknown>;
  /** Only sent server-side, hashed there. Never given to the pixel. */
  email?: string;
  phone?: string;
}

/**
 * Fire one conversion event down both paths.
 *
 * The same event_id goes to the browser pixel and to the Conversions
 * API, which is what tells Meta they are one event rather than two.
 * Without it, every conversion counts twice and the reported ROAS is
 * meaningless.
 */
export function trackMetaEvent(
  eventName: MetaEventName,
  options: TrackOptions = {},
): void {
  if (typeof window === "undefined") return;

  const eventId = `${eventName}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  // Browser pixel. Absent when no Pixel ID is configured, or when an
  // ad blocker has removed it — which is exactly why CAPI also runs.
  try {
    window.fbq?.("track", eventName, options.customData ?? {}, {
      eventID: eventId,
    });
  } catch {
    // A blocked or broken pixel must never interrupt the page.
  }

  // Server side. Fire-and-forget: tracking is not worth failing a
  // checkout over, and every attempt is recorded in capi_logs anyway.
  void fetch("/api/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      email: options.email,
      phone: options.phone,
      customData: options.customData ?? {},
    }),
    keepalive: true,
  }).catch(() => {});
}
