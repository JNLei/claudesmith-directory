import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Include marketplace directories in serverless function bundles
  // This ensures LocalFetcher can access marketplace.json files at runtime on Vercel
  outputFileTracingIncludes: {
    '/': [
      'tools/**/*',
      'external-marketplaces/**/*',
      'third-party/**/*'
    ],
  },
};

export default nextConfig;
