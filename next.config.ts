import type { NextConfig } from "next";

const defaultR2Host = "photo.akin.love";
const r2PublicUrl = process.env.R2_PUBLIC_URL;
const r2RemoteHost = (() => {
  if (!r2PublicUrl) {
    return defaultR2Host;
  }
  try {
    return new URL(r2PublicUrl).hostname;
  } catch (error) {
    console.warn(
      "[next.config] Invalid R2_PUBLIC_URL provided, falling back to default hostname:",
      r2PublicUrl,
      error,
    );
    return defaultR2Host;
  }
})();

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@prisma/client", "@prisma/engines"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: r2RemoteHost,
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
