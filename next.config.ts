import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image Coolify builds.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pzqpikrtidegfnrbsomq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
