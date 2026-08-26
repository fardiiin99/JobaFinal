"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackMetaEvent } from "@/lib/meta-events";

/**
 * Loads the Meta pixel and reports page views.
 *
 * Renders nothing at all until a Pixel ID is configured in
 * Settings → Meta Pixel and CAPI, so an unconfigured store ships no
 * third-party script and no tracking request.
 */
export function MetaPixel({
  pixelId,
  pageViewEnabled,
}: {
  pixelId: string | null;
  pageViewEnabled: boolean;
}) {
  const pathname = usePathname();
  const ready = useRef(false);

  useEffect(() => {
    if (!pixelId || !pageViewEnabled) return;
    // The snippet fires the first PageView itself; this covers client
    // navigations, which do not reload the script.
    if (!ready.current) {
      ready.current = true;
      return;
    }
    trackMetaEvent("PageView");
  }, [pathname, pixelId, pageViewEnabled]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');${pageViewEnabled ? "fbq('track','PageView');" : ""}`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
