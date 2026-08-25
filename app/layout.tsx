import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

/* Both faces are variable fonts, so no `weight` — next/font ships the
   full axis range, matching the legacy Google Fonts import which pulled
   Fraunces 400/600/700 and Outfit 300–700. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobafinal.vercel.app";

/* The legacy site shipped no description, canonical, or OG tags on any
   page, so every social share rendered blank. These are the defaults;
   product and category pages override them via generateMetadata. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "House of Joba — Handwoven Sarees",
    template: "%s — House of Joba",
  },
  description:
    "Handwoven sarees from Narayanganj since 1994. Indigo dabu, Chanderi, mul cotton and Kota Doria, made by hand and sold direct.",
  openGraph: {
    type: "website",
    siteName: "House of Joba",
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
