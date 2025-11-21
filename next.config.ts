import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Include submodule directories in serverless function bundles
  // This ensures LocalFetcher can access files at runtime on Vercel
  outputFileTracingIncludes: {
    '/': [
      'tools/**/*',
      'external-marketplaces/**/*'
    ],
  },
};

export default nextConfig;
