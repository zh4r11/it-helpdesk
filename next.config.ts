import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Seluruh halaman panel bergantung pada sesi & data terbaru, jadi
  // dirender per-request (tanpa Cache Components / Partial Prefetching).
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Upload foto profil maksimal 2 MB.
      bodySizeLimit: "3mb",
    },
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
