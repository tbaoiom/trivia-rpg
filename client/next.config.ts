import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Skip ESLint (and thus TS lint) errors during production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
