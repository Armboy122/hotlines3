import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@prisma/client", "@prisma/engines"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "photo.akin.love",
        port: "",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: "default",
    loaderFile: "",
    unoptimized: false,
  },
  turbopack: {
    rules: {
      "*.prisma": {
        loaders: ["raw-loader"],
      },
    },
  },
  // Only use webpack config when not using turbopack
  webpack: (config, { isServer, dev }) => {
    // Skip webpack config when using turbopack
    if (dev && process.env.TURBOPACK) {
      return config;
    }

    if (isServer) {
      config.externals.push("@prisma/client");
    }
    return config;
  },
};

export default nextConfig;
