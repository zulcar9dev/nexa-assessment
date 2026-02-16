import type { NextConfig } from "next";
import packageJson from './package.json';

const nextConfig: NextConfig = {
  // Enable standalone output only for production/Docker deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  env: {
    APP_VERSION: packageJson.version,
  },
};

export default nextConfig;
