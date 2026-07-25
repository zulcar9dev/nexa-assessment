import type { NextConfig } from "next";
import packageJson from './package.json';

const nextConfig: NextConfig = {
  // Enable standalone output only for production/Docker deployment, but NOT on Vercel
  output: (process.env.NODE_ENV === 'production' && !process.env.VERCEL) ? 'standalone' : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  env: {
    APP_VERSION: packageJson.version,
  },
};

export default nextConfig;
