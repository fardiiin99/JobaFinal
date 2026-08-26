/* Shared Meta constants.
   These cannot live in the "use server" actions module: Next requires
   every export of a server-action file to be an async function, so a
   plain const array there fails at build time (tsc does not catch it —
   it is a framework constraint, not a type error). */

export const META_EVENTS = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
] as const;

export interface MetaConfigView {
  pixelId: string;
  events: Record<string, boolean>;
  /** Never the token itself — only whether one is stored. */
  hasToken: boolean;
  testEventCode: string;
}
