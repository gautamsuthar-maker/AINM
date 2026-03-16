import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['google-ads-api', 'google-auth-library', 'google-gax', 'grpc-js'],
};

export default nextConfig;
