import type { NextConfig } from "next";

// Product photos are served from whichever Supabase this build points
// at (db.shopjoba.com in production), so allow that host rather than a
// hardcoded project ref that breaks every image after a move.
const supabaseHost = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://localhost",
).hostname;

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image Coolify builds.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
