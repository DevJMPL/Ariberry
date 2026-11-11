import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Las fotos vienen del almacenamiento de Supabase.
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
    ],
    qualities: [75],
    formats: ["image/avif", "image/webp"],
    // Las fotos no cambian (cada foto nueva tiene otro nombre), así que se guardan 31 días.
    minimumCacheTTL: 2678400,
  },
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
