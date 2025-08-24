import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  experimental: {
    turbo: {
      rules: {
        '*.prisma': {
          loaders: ['raw-loader'],
        },
      },
    },
  },
  // Only use webpack config when not using turbopack
  webpack: (config, { isServer, dev }) => {
    // Skip webpack config when using turbopack
    if (dev && process.env.TURBOPACK) {
      return config
    }
    
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  }
};

export default nextConfig;
